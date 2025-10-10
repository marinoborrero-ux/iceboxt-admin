

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Orders API: Starting request');
    
    // Verificar conexión a la base de datos
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);
    console.log('🔐 Session check:', session ? 'Valid' : 'Invalid');
    
    if (!session || session.user.role !== 'admin') {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    console.log('📋 Query params:', { page, limit, search, status });

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

    console.log('🔍 Database query where clause:', JSON.stringify(where, null, 2));

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

    console.log(`📊 Found ${orders.length} orders out of ${total} total`);

    const ordersWithDetails = orders.map(order => ({
      ...order,
      total: Number(order.total),
      itemCount: order.items.length,
      createdAt: order.createdAt.toISOString(),
    }));

    console.log('✅ Orders processed successfully');

    return NextResponse.json({
      orders: ordersWithDetails,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('❌ Orders fetch error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Más detalles del error para debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : 'UNKNOWN';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch orders',
        details: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString()
      },
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
