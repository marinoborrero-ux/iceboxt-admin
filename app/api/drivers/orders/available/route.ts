import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Forzar que esta ruta no use caché
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 [AVAILABLE ORDERS] API call received at:', new Date().toISOString());
        
        // Obtener fecha de hace 7 días para filtrar órdenes muy antiguas
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        console.log('📅 Filtering orders newer than:', sevenDaysAgo.toISOString());

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

        console.log(`📦 Found ${availableOrders.length} available orders in database`);
        
        // Debug: mostrar IDs y status de todas las órdenes encontradas
        availableOrders.forEach((order, index) => {
            console.log(`   ${index + 1}. Order ${order.orderNumber} (${order.id}) - Status: ${order.status} - Driver: ${order.deliveryPersonId || 'none'}`);
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

        console.log(`✅ Returning ${formattedOrders.length} formatted orders to driver app`);

        const response = NextResponse.json({
            success: true,
            orders: formattedOrders,
            totalOrders: formattedOrders.length
        });

        // Agregar headers para evitar caché
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Surrogate-Control', 'no-store');

        return response;

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