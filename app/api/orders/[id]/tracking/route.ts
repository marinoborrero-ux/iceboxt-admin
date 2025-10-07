import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { message: 'Order ID is required' },
                { 
                    status: 400,
                    headers: {
                        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                        'Surrogate-Control': 'no-store'
                    }
                }
            );
        }

        console.log('🔍 Tracking request for order:', id);

        // Buscar la orden básica primero
        const order = await prisma.order.findUnique({
            where: { id },
            select: {
                id: true,
                orderNumber: true,
                status: true,
                deliveryAddress: true,
                notes: true,
                createdAt: true,
                deliveryPersonId: true,
                customerId: true
            }
        });

        if (!order) {
            return NextResponse.json(
                { message: 'Order not found' },
                { 
                    status: 404,
                    headers: {
                        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                        'Surrogate-Control': 'no-store'
                    }
                }
            );
        }

        // Buscar el driver si está asignado
        let driver = null;
        if (order.deliveryPersonId) {
            const deliveryPerson = await prisma.deliveryPerson.findUnique({
                where: { id: order.deliveryPersonId },
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
            });

            if (deliveryPerson) {
                driver = {
                    id: deliveryPerson.id,
                    name: `${deliveryPerson.firstName} ${deliveryPerson.lastName}`,
                    phone: deliveryPerson.phone,
                    vehicle: {
                        type: deliveryPerson.vehicleType,
                        licensePlate: deliveryPerson.licensePlate,
                        color: deliveryPerson.vehicleColor
                    },
                    rating: parseFloat(deliveryPerson.rating.toString()),
                    isOnline: deliveryPerson.isOnline,
                    location: {
                        latitude: 25.7617, // Default Miami location for now
                        longitude: -80.1918,
                        lastUpdate: new Date()
                    }
                };
                console.log('📍 Driver info:', {
                    name: driver.name,
                    phone: driver.phone,
                    isOnline: driver.isOnline,
                    vehicle: driver.vehicle
                });
            }
        }

        // Buscar información del cliente
        const customer = await prisma.customer.findUnique({
            where: { id: order.customerId },
            select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true
            }
        });

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
            driver: driver,
            customer: customer ? {
                name: `${customer.firstName} ${customer.lastName}`,
                phone: customer.phone,
                email: customer.email
            } : null
        };

        const response = NextResponse.json({
            success: true,
            ...trackingInfo
        });

        // Set anti-cache headers
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Surrogate-Control', 'no-store');

        return response;

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