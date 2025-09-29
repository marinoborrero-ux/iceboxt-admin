import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Add CORS headers to all responses
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Email',
};

export async function GET(request: NextRequest) {
    console.log('📊 Mobile API stats - fetching order statistics');

    try {
        // Get order counts by status
        const orderStats = await prisma.order.groupBy({
            by: ['status'],
            _count: {
                id: true
            }
        });

        // Get total orders count
        const totalOrders = await prisma.order.count();

        // Get orders created in the last 24 hours
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);

        const recentOrders = await prisma.order.count({
            where: {
                createdAt: {
                    gte: last24Hours
                }
            }
        });

        // Get total revenue
        const totalRevenue = await prisma.order.aggregate({
            _sum: {
                total: true
            }
        });

        // Get top customers by order count
        const topCustomers = await prisma.customer.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                _count: {
                    select: {
                        orders: true
                    }
                }
            },
            orderBy: {
                orders: {
                    _count: 'desc'
                }
            },
            take: 5
        });

        // Get recent orders with customer info
        const recentOrdersList = await prisma.order.findMany({
            take: 10,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        console.log(`📊 Stats: ${totalOrders} total orders, ${recentOrders} in last 24h`);

        return NextResponse.json({
            success: true,
            message: 'Order statistics retrieved successfully',
            endpoint: '/api/orders/mobile/stats',
            timestamp: new Date().toISOString(),
            stats: {
                totalOrders,
                recentOrders: recentOrders,
                totalRevenue: Number(totalRevenue._sum.total || 0),
                ordersByStatus: orderStats.reduce((acc, stat) => {
                    acc[stat.status] = stat._count.id;
                    return acc;
                }, {} as Record<string, number>),
                topCustomers: topCustomers.map(customer => ({
                    id: customer.id,
                    name: `${customer.firstName} ${customer.lastName}`,
                    email: customer.email,
                    orderCount: customer._count.orders
                })),
                recentOrdersList: recentOrdersList.map(order => ({
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    total: Number(order.total),
                    customerName: `${order.customer.firstName} ${order.customer.lastName}`,
                    customerEmail: order.customer.email,
                    createdAt: order.createdAt
                }))
            }
        }, {
            status: 200,
            headers: corsHeaders
        });

    } catch (error) {
        console.error('📊 Error fetching order statistics:', error);
        return NextResponse.json({
            success: false,
            message: 'Error fetching order statistics',
            error: error instanceof Error ? error.message : 'Unknown error',
            endpoint: '/api/orders/mobile/stats',
            timestamp: new Date().toISOString()
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