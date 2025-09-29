
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatsCardsProps {
  stats: {
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    totalRevenue: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const [animatedStats, setAnimatedStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // Animate the numbers
    const animationDuration = 1500; // 1.5 seconds
    const steps = 50;
    const stepDuration = animationDuration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedStats({
        totalOrders: Math.floor(stats?.totalOrders * progress) || 0,
        totalCustomers: Math.floor(stats?.totalCustomers * progress) || 0,
        totalProducts: Math.floor(stats?.totalProducts * progress) || 0,
        totalRevenue: Math.floor(stats?.totalRevenue * progress) || 0,
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats({
          totalOrders: stats?.totalOrders || 0,
          totalCustomers: stats?.totalCustomers || 0,
          totalProducts: stats?.totalProducts || 0,
          totalRevenue: stats?.totalRevenue || 0,
        });
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [stats]);

  const cards = [
    {
      title: 'Total Orders',
      value: animatedStats.totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      format: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Total Customers',
      value: animatedStats.totalCustomers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      format: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Total Products',
      value: animatedStats.totalProducts,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      format: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Total Revenue',
      value: animatedStats.totalRevenue,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      format: (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden group hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`${card.bgColor} ${card.color} rounded-lg p-2`}>
              <card.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {card.format(card.value)}
            </div>
            <p className="text-xs text-gray-500 flex items-center">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              Growth trending upward
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
