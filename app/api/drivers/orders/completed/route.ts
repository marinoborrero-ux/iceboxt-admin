import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
    try {
        console.log('📋 Completed orders request received');

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

        // Obtener las órdenes completadas del driver
        const completedOrders = await prisma.order.findMany({
            where: {
                deliveryPersonId: driverId,
                status: 'DELIVERED'
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
                                price: true,
                                categoryId: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc' // Más recientes primero
            },
            take: 50 // Limitar a 50 órdenes más recientes
        });

        console.log(`✅ Found ${completedOrders.length} completed orders for driver ${driverId}`);

        // Formatear las órdenes para la respuesta
        const formattedOrders = completedOrders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            customerId: order.customerId,
            customerName: `${order.customer.firstName} ${order.customer.lastName}`,
            customerEmail: order.customer.email,
            customerPhone: order.customer.phone || '',
            deliveryAddress: order.deliveryAddress,
            deliveryCity: '', // No tenemos este campo en el schema actual
            deliveryNotes: order.notes,
            items: order.items.map(item => ({
                id: item.id,
                productName: item.product.name,
                quantity: item.quantity,
                price: parseFloat(item.price.toString()),
                categoryId: item.product.categoryId
            })),
            totalAmount: parseFloat(order.total.toString()),
            status: order.status.toLowerCase(), // Convertir a minúsculas para que coincida con el enum de Flutter
            notes: order.notes,
            createdAt: order.createdAt.toISOString(),
            deliveredAt: order.updatedAt.toISOString() // Usando updatedAt como fecha de entrega
        }));

        return NextResponse.json({
            success: true,
            orders: formattedOrders,
            count: completedOrders.length
        });

    } catch (error) {
        console.error('❌ Error fetching completed orders:', error);
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