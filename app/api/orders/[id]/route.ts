

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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
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

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...order,
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
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

    const { status, deliveryPersonId, notes } = await request.json();

    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    if (deliveryPersonId !== undefined) {
      updateData.deliveryPersonId = deliveryPersonId;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json({
      ...order,
      total: Number(order.total),
    });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
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

    // Get order details to restore stock
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only allow deletion of pending orders
    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending orders can be deleted' },
        { status: 400 }
      );
    }

    // Delete order and restore stock in transaction
    await prisma.$transaction(async (tx) => {
      // Restore product stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Delete the order (items will be deleted due to cascade)
      await tx.order.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Order deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
