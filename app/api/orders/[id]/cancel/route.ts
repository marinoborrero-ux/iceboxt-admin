import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Add CORS headers for mobile access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-User-Email, X-API-Key',
};

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📱 Cancel order request for ID:', params.id);

    const body = await request.json();
    const { customerEmail, reason } = body;

    // Validate required fields
    if (!customerEmail) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Customer email is required' 
        },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Find the order with customer information
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Order not found' 
        },
        { 
          status: 404,
          headers: corsHeaders
        }
      );
    }

    // Verify that the customer email matches the order owner
    if (order.customer.email !== customerEmail) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized: You can only cancel your own orders' 
        },
        { 
          status: 403,
          headers: corsHeaders
        }
      );
    }

    // Check if order can be cancelled (not already delivered or cancelled)
    if (order.status === 'DELIVERED') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Cannot cancel order: Order has already been delivered' 
        },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    if (order.status === 'CANCELLED') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Order is already cancelled' 
        },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Update order status to CANCELLED in a transaction
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: params.id },
        data: {
          status: 'CANCELLED',
          notes: reason ? `${order.notes || ''}\n\nCANCELLED BY CUSTOMER: ${reason}`.trim() : `${order.notes || ''}\n\nCANCELLED BY CUSTOMER`.trim()
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Restore product stock for cancelled items
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }

      return updatedOrder;
    });

    console.log('✅ Order cancelled successfully:', cancelledOrder.id);

    // Format response
    const response = {
      success: true,
      message: 'Order cancelled successfully',
      order: {
        id: cancelledOrder.id,
        orderNumber: cancelledOrder.orderNumber,
        status: cancelledOrder.status,
        total: Number(cancelledOrder.total),
        deliveryAddress: cancelledOrder.deliveryAddress,
        notes: cancelledOrder.notes,
        createdAt: cancelledOrder.createdAt,
        updatedAt: cancelledOrder.updatedAt,
        customer: {
          id: cancelledOrder.customer.id,
          name: `${cancelledOrder.customer.firstName} ${cancelledOrder.customer.lastName}`,
          email: cancelledOrder.customer.email
        },
        items: cancelledOrder.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: Number(item.price),
          product: {
            id: item.product.id,
            name: item.product.name,
            description: item.product.description
          }
        }))
      }
    };

    return NextResponse.json(response, {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('❌ Error cancelling order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
}