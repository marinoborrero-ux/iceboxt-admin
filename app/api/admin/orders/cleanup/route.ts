import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { daysOld = 7 } = await request.json();

        // Calcular fecha límite
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        console.log(`🧹 Cleaning orders older than ${daysOld} days (before ${cutoffDate.toISOString()})`);

        // Buscar órdenes antiguas pendientes
        const oldOrders = await prisma.order.findMany({
            where: {
                status: 'PENDING',
                createdAt: {
                    lt: cutoffDate
                }
            },
            select: {
                id: true,
                orderNumber: true,
                createdAt: true
            }
        });

        console.log(`📦 Found ${oldOrders.length} old pending orders to clean`);

        if (oldOrders.length > 0) {
            const orderIds = oldOrders.map(order => order.id);

            // Eliminar items de las órdenes
            await prisma.orderItem.deleteMany({
                where: {
                    orderId: {
                        in: orderIds
                    }
                }
            });

            // Eliminar las órdenes
            const deleteResult = await prisma.order.deleteMany({
                where: {
                    id: {
                        in: orderIds
                    }
                }
            });

            console.log(`✅ Cleaned ${deleteResult.count} old orders`);

            return NextResponse.json({
                success: true,
                message: `Cleaned ${deleteResult.count} old pending orders`,
                cleanedOrders: oldOrders.map(order => ({
                    id: order.id,
                    orderNumber: order.orderNumber,
                    createdAt: order.createdAt
                }))
            });
        } else {
            return NextResponse.json({
                success: true,
                message: 'No old orders to clean',
                cleanedOrders: []
            });
        }

    } catch (error) {
        console.error('❌ Error cleaning old orders:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error cleaning old orders',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}