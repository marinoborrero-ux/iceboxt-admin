

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: { orders: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    const customersWithOrderCount = customers.map(customer => ({
      ...customer,
      orderCount: customer._count.orders,
      createdAt: customer.createdAt.toISOString(),
    }));

    return NextResponse.json({
      customers: customersWithOrderCount,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Customers fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Check if email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email }
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
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
    console.error('Customer creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
