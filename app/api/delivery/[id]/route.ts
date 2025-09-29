

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

    const deliveryPerson = await prisma.deliveryPerson.findUnique({
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
            customer: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
    });

    if (!deliveryPerson) {
      return NextResponse.json({ error: 'Delivery person not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...deliveryPerson,
      orderCount: deliveryPerson._count.orders,
    });
  } catch (error) {
    console.error('Delivery person fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery person' },
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

    const { firstName, lastName, email, phone, isActive } = await request.json();

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if email already exists for other delivery persons
    const existingDeliveryPerson = await prisma.deliveryPerson.findFirst({
      where: { 
        email,
        id: { not: params.id }
      }
    });

    if (existingDeliveryPerson) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    const deliveryPerson = await prisma.deliveryPerson.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(deliveryPerson);
  } catch (error) {
    console.error('Delivery person update error:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery person' },
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

    // Check if delivery person has assigned orders
    const ordersCount = await prisma.order.count({
      where: { deliveryPersonId: params.id }
    });

    if (ordersCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete delivery person with assigned orders. Please reassign orders first.' },
        { status: 400 }
      );
    }

    await prisma.deliveryPerson.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Delivery person deleted successfully' });
  } catch (error) {
    console.error('Delivery person deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete delivery person' },
      { status: 500 }
    );
  }
}
