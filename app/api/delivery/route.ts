
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
    const all = searchParams.get('all') === 'true';

    if (all) {
      // Return all active delivery persons for dropdowns
      const deliveryPersons = await prisma.deliveryPerson.findMany({
        where: { isActive: true },
        orderBy: { firstName: 'asc' },
        select: { id: true, firstName: true, lastName: true }
      });
      return NextResponse.json(deliveryPersons);
    }

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

    const [deliveryPersons, total] = await Promise.all([
      prisma.deliveryPerson.findMany({
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
      prisma.deliveryPerson.count({ where }),
    ]);

    const deliveryPersonsWithOrderCount = deliveryPersons.map(person => ({
      ...person,
      orderCount: person._count.orders
    }));

    return NextResponse.json({
      deliveryPersons: deliveryPersonsWithOrderCount,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Delivery persons fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery persons' },
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

    const { firstName, lastName, email, phone, isActive } = await request.json();

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const deliveryPerson = await prisma.deliveryPerson.create({
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
    console.error('Delivery person creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create delivery person' },
      { status: 500 }
    );
  }
}
