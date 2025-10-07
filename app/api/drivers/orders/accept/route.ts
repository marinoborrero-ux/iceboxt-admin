import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId } = body;

        // Validar que se proporcione el orderId
        if (!orderId) {
            return NextResponse.json(
                { message: 'Order ID is required' },
                { status: 400 }
            );
        }

        // Obtener el token del header Authorization
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Authorization token required' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);

        // Verificar el token
        let driverId;
        try {
            const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
            driverId = decoded.driverId;
        } catch (error) {
            return NextResponse.json(
                { message: 'Invalid token' },
                { status: 401 }
            );
        }

        // Verificar que la orden existe y está disponible
        const order = await prisma.order.findUnique({
            where: { id: orderId },
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
                { message: 'Order not found' },
                { status: 404 }
            );
        }

        if (order.status !== 'PENDING') {
            return NextResponse.json(
                { message: 'Order is no longer available' },
                { status: 400 }
            );
        }

        if (order.deliveryPersonId) {
            return NextResponse.json(
                { message: 'Order is already assigned to another driver' },
                { status: 400 }
            );
        }

        // Asignar la orden al driver y cambiar el estado a IN_PROGRESS
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                deliveryPersonId: driverId,
                status: 'IN_PROGRESS',
                updatedAt: new Date()
            },
            include: {
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        phone: true,
                        email: true,
                    }
                },
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                price: true,
                            }
                        }
                    }
                }
            }
        });

        // Formatear la respuesta
        const formattedOrder = {
            id: updatedOrder.id,
            orderNumber: updatedOrder.orderNumber,
            customer: {
                name: `${updatedOrder.customer.firstName} ${updatedOrder.customer.lastName}`,
                phone: updatedOrder.customer.phone,
                email: updatedOrder.customer.email,
            },
            deliveryAddress: updatedOrder.deliveryAddress,
            items: updatedOrder.items.map(item => ({
                productName: item.product.name,
                quantity: item.quantity,
                price: parseFloat(item.price.toString()),
            })),
            totalAmount: parseFloat(updatedOrder.total.toString()),
            status: updatedOrder.status,
            notes: updatedOrder.notes,
            createdAt: updatedOrder.createdAt,
        };

        return NextResponse.json({
            success: true,
            message: 'Order accepted successfully',
            order: formattedOrder
        });

    } catch (error) {
        console.error('Error accepting order:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error accepting order',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}