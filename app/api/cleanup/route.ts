import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        console.log('🧹 Starting database cleanup...');

        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Find and clean orphan order items (items without valid products)
        console.log('🔍 Looking for orphan order items...');

        const orphanItemsResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "order_items" 
      WHERE "product_id" NOT IN (SELECT "id" FROM "products")
    ` as any[];

        const orphanItemsCount = Number(orphanItemsResult[0]?.count || 0);
        console.log(`Found ${orphanItemsCount} orphan order items`);

        const deletedItems = await prisma.$executeRaw`
      DELETE FROM "order_items" 
      WHERE "product_id" NOT IN (SELECT "id" FROM "products")
    `;

        console.log(`✅ Deleted ${deletedItems} orphan order items`);

        // 2. Find orders with no items
        console.log('🔍 Looking for empty orders...');

        const emptyOrders = await prisma.order.findMany({
            where: {
                items: {
                    none: {},
                },
            },
            select: {
                id: true,
                orderNumber: true,
            },
        });

        console.log(`Found ${emptyOrders.length} empty orders`);

        // Optional: Clean up empty orders (commented out for safety)
        // const deletedOrders = await prisma.order.deleteMany({
        //   where: {
        //     id: {
        //       in: emptyOrders.map(order => order.id),
        //     },
        //   },
        // });

        // 3. Get summary statistics
        const stats = {
            totalOrders: await prisma.order.count(),
            totalOrderItems: await prisma.orderItem.count(),
            totalProducts: await prisma.product.count(),
            totalCustomers: await prisma.customer.count(),
        };

        const cleanupResult = {
            success: true,
            timestamp: new Date().toISOString(),
            actions: {
                deletedOrphanItems: deletedItems,
                foundEmptyOrders: emptyOrders.length,
                // deletedEmptyOrders: 0, // Uncomment when needed
            },
            emptyOrdersList: emptyOrders,
            databaseStats: stats,
            message: 'Database cleanup completed successfully',
        };

        console.log('✅ Database cleanup completed:', cleanupResult);

        return NextResponse.json(cleanupResult);

    } catch (error) {
        console.error('❌ Database cleanup failed:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Database cleanup failed',
                details: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Just check for orphan data without cleaning
        const orphanItems = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "order_items" 
      WHERE "product_id" NOT IN (SELECT "id" FROM "products")
    ` as any[];

        const emptyOrders = await prisma.order.findMany({
            where: {
                items: {
                    none: {},
                },
            },
            select: {
                id: true,
                orderNumber: true,
                createdAt: true,
            },
        });

        const stats = {
            totalOrders: await prisma.order.count(),
            totalOrderItems: await prisma.orderItem.count(),
            totalProducts: await prisma.product.count(),
            totalCustomers: await prisma.customer.count(),
            orphanItems: Number(orphanItems[0]?.count || 0),
            emptyOrders: emptyOrders.length,
        };

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            databaseHealth: stats,
            issues: {
                orphanItems: stats.orphanItems > 0,
                emptyOrders: stats.emptyOrders > 0,
            },
            recommendations: stats.orphanItems > 0 || stats.emptyOrders > 0
                ? ['Run POST /api/cleanup to clean orphan data']
                : ['Database is clean'],
        });

    } catch (error) {
        console.error('❌ Database health check failed:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Database health check failed',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}