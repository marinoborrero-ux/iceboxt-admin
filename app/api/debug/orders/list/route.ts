import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 Debug: Listing all orders...');

        // Get all orders with basic info
        const orders = await prisma.order.findMany({
            select: {
                id: true,
                orderNumber: true,
                status: true,
                deliveryAddress: true,
                createdAt: true,
                deliveryPersonId: true,
                customerId: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20 // Limit to last 20 orders
        });

        console.log('📊 Found orders:', orders.length);

        return NextResponse.json({
            success: true,
            count: orders.length,
            orders: orders.map(order => ({
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                deliveryAddress: order.deliveryAddress,
                createdAt: order.createdAt,
                hasDriver: !!order.deliveryPersonId,
                trackingUrl: `/api/orders/${order.id}/tracking`
            }))
        });

    } catch (error) {
        console.error('❌ Error listing orders:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}