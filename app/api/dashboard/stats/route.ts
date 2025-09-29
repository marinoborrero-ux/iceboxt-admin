
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total counts
    const [
      totalOrders,
      totalCustomers, 
      totalProducts,
      totalRevenue,
      recentOrders,
      ordersByStatus,
      topProducts,
      deliveryStats
    ] = await Promise.all([
      prisma.order.count(),
      prisma.customer.count(),
      prisma.product.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } }
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { firstName: true, lastName: true } },
          deliveryPerson: { select: { firstName: true, lastName: true } }
        }
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        _count: { productId: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),
      prisma.deliveryPerson.findMany({
        include: {
          _count: {
            select: { orders: true }
          }
        }
      })
    ]);

    // Get product details for top products
    const topProductDetails = await prisma.product.findMany({
      where: {
        id: { in: topProducts.map(p => p.productId) }
      },
      select: { id: true, name: true, price: true }
    });

    const topProductsWithDetails = topProducts.map(item => {
      const product = topProductDetails.find(p => p.id === item.productId);
      return {
        ...item,
        productName: product?.name || 'Unknown',
        price: product?.price ? Number(product.price) : 0
      };
    });

    // Calculate revenue by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await prisma.order.groupBy({
      by: ['createdAt'],
      _sum: { total: true },
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: { not: 'CANCELLED' }
      }
    });

    // Process monthly revenue data
    const revenueByMonth = monthlyRevenue.reduce((acc: any[], order) => {
      const month = order.createdAt.toISOString().substring(0, 7); // YYYY-MM format
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.revenue += Number(order._sum.total || 0);
      } else {
        acc.push({ month, revenue: Number(order._sum.total || 0) });
      }
      return acc;
    }, []);

    const stats = {
      totalOrders,
      totalCustomers,
      totalProducts,
      totalRevenue: Number(totalRevenue._sum.total || 0),
      recentOrders: recentOrders.map(order => ({
        ...order,
        total: Number(order.total)
      })),
      ordersByStatus,
      topProducts: topProductsWithDetails,
      deliveryStats: deliveryStats.map(person => ({
        ...person,
        orderCount: person._count.orders
      })),
      monthlyRevenue: revenueByMonth
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
