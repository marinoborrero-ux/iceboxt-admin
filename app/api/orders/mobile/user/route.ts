import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Email',
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userEmail = searchParams.get('email') || request.headers.get('X-User-Email');

        console.log('📱 Mobile API: Getting orders for user:', userEmail);

        if (!userEmail) {
            return NextResponse.json({
                success: false,
                error: 'User email is required',
                message: 'Please provide user email via query parameter ?email= or X-User-Email header'
            }, {
                status: 400,
                headers: corsHeaders
            });
        }

        // Find customer by email
        const customer = await prisma.customer.findUnique({
            where: { email: userEmail },
            include: {
                orders: {
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        description: true,
                                        price: true,
                                        image: true,
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!customer) {
            console.log('📱 No customer found for email:', userEmail);
            return NextResponse.json({
                success: true,
                message: 'No orders found for this user',
                data: {
                    orders: [],
                    totalOrders: 0,
                    userEmail: userEmail
                }
            }, {
                status: 200,
                headers: corsHeaders
            });
        }

        // Transform orders to mobile-friendly format
        const mobileOrders = (customer as any).orders.map((order: any) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            total: Number(order.total),
            deliveryAddress: order.deliveryAddress,
            notes: order.notes,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
            items: order.items.map((item: any) => ({
                id: item.id,
                name: item.product.name,
                imageUrl: item.product.image || `assets/foods/${item.product.name.toLowerCase().replace(' ', '_')}.jpg`,
                price: Number(item.price),
                qty: item.quantity,
                productId: item.product.id,
                description: item.product.description
            }))
        }));

        console.log(`📱 Found ${mobileOrders.length} orders for user: ${userEmail}`);

        return NextResponse.json({
            success: true,
            message: `Found ${mobileOrders.length} orders`,
            data: {
                orders: mobileOrders,
                totalOrders: mobileOrders.length,
                userEmail: userEmail,
                customer: {
                    id: customer.id,
                    name: `${customer.firstName} ${customer.lastName}`,
                    email: customer.email,
                    address: customer.address,
                    city: customer.city
                }
            }
        }, {
            status: 200,
            headers: corsHeaders
        });

    } catch (error) {
        console.error('📱 Error fetching user orders:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch user orders',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500,
            headers: corsHeaders
        });
    }
}

export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, {
        status: 200,
        headers: corsHeaders
    });
}