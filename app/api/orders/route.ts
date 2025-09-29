

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
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { 
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          deliveryPerson: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const ordersWithDetails = orders.map(order => ({
      ...order,
      total: Number(order.total),
      itemCount: order.items.length,
      createdAt: order.createdAt.toISOString(),
    }));

    return NextResponse.json({
      orders: ordersWithDetails,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
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

    const { customerId, deliveryAddress, notes, items, deliveryPersonId } = await request.json();

    if (!customerId || !deliveryAddress || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer, delivery address, and items are required' },
        { status: 400 }
      );
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 400 }
      );
    }

    // Verify products exist and calculate total
    let total = 0;
    const validItems: { productId: string; quantity: number; price: number; }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product with ID ${item.productId} not found` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${product.name}` },
          { status: 400 }
        );
      }

      const itemTotal = Number(product.price) * item.quantity;
      total += itemTotal;

      validItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(product.price),
      });
    }

    // Generate order number
    const orderCount = await prisma.order.count();
    const orderNumber = `ORD-${(orderCount + 1).toString().padStart(6, '0')}`;

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          deliveryAddress,
          notes: notes || null,
          total,
          deliveryPersonId: deliveryPersonId || null,
          status: 'PENDING',
          items: {
            create: validItems,
          },
        },
        include: {
          customer: true,
          deliveryPerson: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update product stock
      for (const item of validItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      ...order,
      total: Number(order.total),
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
