import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Forzar que esta ruta no use caché
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const orderId = params.id;
        
        console.log(`🔍 [DEBUG ORDER] Checking order ${orderId} at:`, new Date().toISOString());
        
        // Buscar la orden en la base de datos
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                customer: true,
                items: {
                    include: {
                        product: true
                    }
                },
                deliveryPerson: true
            }
        });

        if (!order) {
            return NextResponse.json({
                success: false,
                message: 'Order not found',
                orderId: orderId
            }, { status: 404 });
        }

        console.log(`📦 Order ${orderId} found:`);
        console.log(`   - Status: ${order.status}`);
        console.log(`   - DeliveryPersonId: ${order.deliveryPersonId}`);
        console.log(`   - CreatedAt: ${order.createdAt}`);
        console.log(`   - UpdatedAt: ${order.updatedAt}`);

        // Verificar si aparecería en available orders
        const wouldAppearInAvailable = order.status === 'PENDING' && order.deliveryPersonId === null;
        
        const response = NextResponse.json({
            success: true,
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                deliveryPersonId: order.deliveryPersonId,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                wouldAppearInAvailableOrders: wouldAppearInAvailable,
                customer: {
                    name: `${order.customer.firstName} ${order.customer.lastName}`,
                    email: order.customer.email
                },
                deliveryPerson: order.deliveryPerson ? {
                    id: order.deliveryPerson.id,
                    name: `${order.deliveryPerson.firstName} ${order.deliveryPerson.lastName}`,
                    email: order.deliveryPerson.email
                } : null
            },
            timestamp: new Date().toISOString()
        });

        // Headers anti-caché
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');

        return response;

    } catch (error) {
        console.error('❌ Error in debug order endpoint:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error checking order',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}