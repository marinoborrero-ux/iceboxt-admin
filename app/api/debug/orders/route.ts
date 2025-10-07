import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 DEBUG: Fetching all orders from database...');

        // Obtener todas las órdenes
        const allOrders = await prisma.order.findMany({
            include: {
                customer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    }
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                categoryId: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`📊 Found ${allOrders.length} total orders in database`);

        // Separar órdenes por estado
        const pendingOrders = allOrders.filter(order => order.status === 'PENDING');
        const availableOrders = allOrders.filter(order => order.status === 'PENDING' && order.deliveryPersonId === null);

        console.log(`📦 PENDING orders: ${pendingOrders.length}`);
        console.log(`🚚 Available orders (PENDING + no driver): ${availableOrders.length}`);

        // Formatear órdenes para debug
        const debugData = {
            totalOrders: allOrders.length,
            byStatus: {
                PENDING: pendingOrders.length,
                IN_PROGRESS: allOrders.filter(o => o.status === 'IN_PROGRESS').length,
                DELIVERED: allOrders.filter(o => o.status === 'DELIVERED').length,
                CANCELLED: allOrders.filter(o => o.status === 'CANCELLED').length,
            },
            availableOrdersCount: availableOrders.length,
            availableOrders: availableOrders.map(order => ({
                id: order.id,
                orderNumber: order.orderNumber,
                customerEmail: order.customer.email,
                customerName: `${order.customer.firstName} ${order.customer.lastName}`,
                status: order.status,
                deliveryPersonId: order.deliveryPersonId,
                totalAmount: parseFloat(order.total.toString()),
                createdAt: order.createdAt,
                notes: order.notes,
                itemsCount: order.items.length,
            })),
            allOrdersSummary: allOrders.map(order => ({
                id: order.id,
                orderNumber: order.orderNumber,
                customerEmail: order.customer.email,
                status: order.status,
                deliveryPersonId: order.deliveryPersonId,
                totalAmount: parseFloat(order.total.toString()),
                createdAt: order.createdAt,
            }))
        };

        return NextResponse.json({
            success: true,
            debug: debugData
        });

    } catch (error) {
        console.error('❌ Error in debug orders endpoint:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error fetching debug orders data',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Endpoint para limpiar órdenes específicas (solo en desarrollo)
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const orderIds = searchParams.get('ids')?.split(',') || [];

        if (orderIds.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No order IDs provided'
            }, { status: 400 });
        }

        console.log(`🗑️ DEBUG: Attempting to delete orders: ${orderIds.join(', ')}`);

        // Primero eliminar los items de las órdenes
        await prisma.orderItem.deleteMany({
            where: {
                orderId: {
                    in: orderIds
                }
            }
        });

        // Luego eliminar las órdenes
        const deleteResult = await prisma.order.deleteMany({
            where: {
                id: {
                    in: orderIds
                }
            }
        });

        console.log(`✅ Deleted ${deleteResult.count} orders`);

        return NextResponse.json({
            success: true,
            deletedCount: deleteResult.count,
            deletedIds: orderIds
        });

    } catch (error) {
        console.error('❌ Error deleting orders:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error deleting orders',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}