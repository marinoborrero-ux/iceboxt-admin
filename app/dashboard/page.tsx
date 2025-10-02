
'use client';

import { useEffect, useState } from 'react';
import StatsCards from '@/components/dashboard/stats-cards';
import DashboardCharts from '@/components/dashboard/dashboard-charts';
import RecentOrders from '@/components/dashboard/recent-orders';
import DeliverySummary from '@/components/dashboard/delivery-summary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalRevenue: number;
  recentOrders: Array<any>;
  ordersByStatus: Array<any>;
  topProducts: Array<any>;
  deliveryStats: Array<any>;
  monthlyRevenue: Array<any>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dashboard/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    fetchStats();
    toast({
      title: 'Refreshed',
      description: 'Dashboard data has been updated.',
    });
  };

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Welcome to your IceBoxT administration dashboard
          </p>
          {lastUpdated && (
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {stats ? (
        <>
          {/* Statistics Cards */}
          <StatsCards stats={stats} />

          {/* Charts Section */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">Analytics & Insights</h2>
            <DashboardCharts
              ordersByStatus={stats.ordersByStatus}
              topProducts={stats.topProducts}
              monthlyRevenue={stats.monthlyRevenue}
            />
          </div>

          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentOrders orders={stats.recentOrders} />
            <DeliverySummary deliveryStats={stats.deliveryStats} />
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>
              Unable to load dashboard statistics. Please try refreshing the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
