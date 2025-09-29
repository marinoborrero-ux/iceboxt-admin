

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { orders: true }
        },
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          }
        }
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...customer,
      orderCount: customer._count.orders,
      createdAt: customer.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Customer fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { firstName, lastName, email, phone, address, city, zipCode, isActive } = await request.json();

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Check if email already exists for other customers
    const existingCustomer = await prisma.customer.findFirst({
      where: { 
        email,
        id: { not: params.id }
      }
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        address: address || null,
        city: city || null,
        zipCode: zipCode || null,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({
      ...customer,
      createdAt: customer.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Customer update error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if customer has orders
    const ordersCount = await prisma.order.count({
      where: { customerId: params.id }
    });

    if (ordersCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing orders. Please remove or reassign orders first.' },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Customer deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
