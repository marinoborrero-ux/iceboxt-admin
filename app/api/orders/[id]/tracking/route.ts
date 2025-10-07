import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { message: 'Order ID is required' },
                { status: 400 }
            );
        }

        // Buscar la orden con el driver asignado
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                deliveryPerson: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        vehicleType: true,
                        licensePlate: true,
                        vehicleColor: true,
                        rating: true,
                        isOnline: true
                    }
                },
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        phone: true,
                        email: true
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

        if (!order.deliveryPerson) {
            return NextResponse.json({
                success: true,
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    deliveryAddress: order.deliveryAddress,
                    notes: order.notes,
                    createdAt: order.createdAt
                },
                driver: null,
                message: 'No driver assigned yet'
            });
        }

        // Formatear la respuesta
        const trackingInfo = {
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                deliveryAddress: order.deliveryAddress,
                notes: order.notes,
                createdAt: order.createdAt
            },
            driver: {
                id: order.deliveryPerson.id,
                name: `${order.deliveryPerson.firstName} ${order.deliveryPerson.lastName}`,
                phone: order.deliveryPerson.phone,
                vehicle: {
                    type: order.deliveryPerson.vehicleType,
                    licensePlate: order.deliveryPerson.licensePlate,
                    color: order.deliveryPerson.vehicleColor
                },
                rating: parseFloat(order.deliveryPerson.rating.toString()),
                isOnline: order.deliveryPerson.isOnline
            },
            customer: {
                name: `${order.customer.firstName} ${order.customer.lastName}`,
                phone: order.customer.phone,
                email: order.customer.email
            }
        };

        return NextResponse.json({
            success: true,
            ...trackingInfo
        });

    } catch (error) {
        console.error('Error fetching order tracking info:', error);
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