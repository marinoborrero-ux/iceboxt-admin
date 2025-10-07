import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        console.log('📦 Order delivery request received');
        console.log('📦 Full params object:', params);

        const orderId = params.id;
        console.log('📦 Order ID from params:', orderId);

        if (!orderId) {
            return NextResponse.json(
                { message: 'Order ID is required' },
                { status: 400 }
            );
        }

        // Obtener el token del header Authorization
        const authHeader = request.headers.get('authorization');
        console.log('🔑 Auth header:', authHeader ? 'Present' : 'Missing');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ Invalid or missing authorization header');
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
            console.log('✅ Token verified, driver ID:', driverId);
        } catch (error) {
            console.log('❌ Token verification failed:', error);
            return NextResponse.json(
                { message: 'Invalid token' },
                { status: 401 }
            );
        }

        // Verificar que la orden existe y está asignada al driver
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true
                    }
                },
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                price: true
                            }
                        }
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

        // Verificar que la orden está asignada al driver que hace la petición
        if (order.deliveryPersonId !== driverId) {
            return NextResponse.json(
                { message: 'Order is not assigned to this driver' },
                { status: 403 }
            );
        }

        // Verificar que la orden no está ya entregada
        if (order.status === 'DELIVERED') {
            return NextResponse.json(
                { message: 'Order is already delivered' },
                { status: 400 }
            );
        }

        // Actualizar la orden como entregada
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'DELIVERED',
                updatedAt: new Date()
            },
            include: {
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true
                    }
                },
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                price: true
                            }
                        }
                    }
                },
                deliveryPerson: {
                    select: {
                        firstName: true,
                        lastName: true,
                        phone: true
                    }
                }
            }
        });

        console.log(`✅ Order ${orderId} marked as delivered by driver ${driverId}`);

        // Formatear la respuesta
        const orderResponse = {
            id: updatedOrder.id,
            orderNumber: updatedOrder.orderNumber,
            status: updatedOrder.status,
            totalAmount: parseFloat(updatedOrder.total.toString()),
            deliveryAddress: updatedOrder.deliveryAddress,
            notes: updatedOrder.notes,
            customer: {
                name: `${updatedOrder.customer.firstName} ${updatedOrder.customer.lastName}`,
                email: updatedOrder.customer.email,
                phone: updatedOrder.customer.phone
            },
            items: updatedOrder.items.map(item => ({
                id: item.id,
                productName: item.product.name,
                quantity: item.quantity,
                price: parseFloat(item.price.toString())
            })),
            deliveredAt: updatedOrder.updatedAt,
            createdAt: updatedOrder.createdAt
        };

        return NextResponse.json({
            success: true,
            message: 'Order marked as delivered successfully',
            order: orderResponse
        });

    } catch (error) {
        console.error('❌ Error marking order as delivered:', error);
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