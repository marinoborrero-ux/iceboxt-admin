
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Truck } from 'lucide-react';
import { format } from 'date-fns';

interface RecentOrdersProps {
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    customer: {
      firstName: string;
      lastName: string;
    };
    deliveryPerson: {
      firstName: string;
      lastName: string;
    } | null;
  }>;
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ');
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Orders
        </CardTitle>
        <CardDescription>
          Latest orders placed by customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders?.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{order.orderNumber}</span>
                    <Badge className={getStatusColor(order.status)} variant="outline">
                      {formatStatus(order.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {order.customer?.firstName} {order.customer?.lastName}
                    </div>
                    {order.deliveryPerson && (
                      <div className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {order.deliveryPerson.firstName} {order.deliveryPerson.lastName}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">${Number(order.total).toFixed(2)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No recent orders found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
