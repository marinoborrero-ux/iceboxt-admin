import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
    try {
        // Obtener el token del header Authorization
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Authorization token required' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];

        // Verificar el token JWT
        let driverId: string;
        try {
            const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
            driverId = decoded.driverId;
        } catch (error) {
            return NextResponse.json(
                { message: 'Invalid token' },
                { status: 401 }
            );
        }

        // Obtener órdenes disponibles (sin asignar) y órdenes asignadas al driver
        const [availableOrders, assignedOrders] = await Promise.all([
            // Órdenes disponibles (sin driver asignado)
            prisma.order.findMany({
                where: {
                    deliveryPersonId: null,
                    status: 'PENDING'
                },
                include: {
                    customer: true,
                    items: {
                        include: {
                            product: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),

            // Órdenes asignadas al driver actual
            prisma.order.findMany({
                where: {
                    deliveryPersonId: driverId,
                    status: {
                        in: ['IN_PROGRESS']
                    }
                },
                include: {
                    customer: true,
                    items: {
                        include: {
                            product: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
        ]);

        // Formatear las órdenes para la respuesta
        const formatOrder = (order: any) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            customerId: order.customerId,
            customerName: order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Unknown Customer',
            customerEmail: order.customer?.email || '',
            customerPhone: order.customer?.phone || '',
            deliveryAddress: order.deliveryAddress || '',
            deliveryCity: order.customer?.city || '',
            deliveryZip: order.customer?.zipCode || '',
            deliveryNotes: order.notes,
            items: order.items?.map((item: any) => ({
                id: item.id,
                name: item.product?.name || 'Unknown Product',
                quantity: item.quantity,
                price: parseFloat(item.price.toString()),
                totalPrice: parseFloat(item.price.toString()) * item.quantity,
                imageUrl: item.product?.imageUrl,
            })) || [],
            totalAmount: parseFloat(order.total.toString()),
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            estimatedDistance: null, // Se puede calcular después
            estimatedTime: null, // Se puede calcular después
        });

        const formattedAvailableOrders = availableOrders.map(formatOrder);
        const formattedAssignedOrders = assignedOrders.map(formatOrder);

        return NextResponse.json(
            {
                availableOrders: formattedAvailableOrders,
                assignedOrders: formattedAssignedOrders,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Get orders error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}