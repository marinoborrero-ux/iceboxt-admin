import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Obtener fecha de hace 7 días para filtrar órdenes muy antiguas
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Obtener órdenes con estado 'PENDING'
        const availableOrders = await prisma.order.findMany({
            where: {
                status: 'PENDING',
                deliveryPersonId: null, // No asignadas a ningún driver
                createdAt: {
                    gte: sevenDaysAgo // Solo órdenes de los últimos 7 días
                }
            },
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

        // Formatear las órdenes para la app driver
        const formattedOrders = availableOrders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            customer: {
                name: `${order.customer.firstName} ${order.customer.lastName}`,
                phone: order.customer.phone,
                email: order.customer.email,
            },
            deliveryAddress: order.deliveryAddress,
            items: order.items.map(item => ({
                id: item.id,
                productName: item.product.name,
                quantity: item.quantity,
                price: parseFloat(item.price.toString()),
                categoryId: item.product.categoryId,
            })),
            totalAmount: parseFloat(order.total.toString()),
            status: order.status,
            createdAt: order.createdAt,
            notes: order.notes,
        }));

        return NextResponse.json({
            success: true,
            orders: formattedOrders,
            totalOrders: formattedOrders.length
        });

    } catch (error) {
        console.error('Error fetching available orders:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error fetching available orders',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}