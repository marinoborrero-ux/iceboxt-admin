
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Mail, Phone } from 'lucide-react';

interface DeliverySummaryProps {
  deliveryStats: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isActive: boolean;
    orderCount: number;
  }>;
}

export default function DeliverySummary({ deliveryStats }: DeliverySummaryProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Delivery Staff Summary
        </CardTitle>
        <CardDescription>
          Current delivery personnel and their order assignments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deliveryStats?.length > 0 ? (
            deliveryStats.map((person) => (
              <div key={person.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {person.firstName} {person.lastName}
                    </h3>
                    <Badge 
                      variant={person.isActive ? "default" : "secondary"}
                      className={person.isActive ? "bg-green-100 text-green-800 border-green-200" : ""}
                    >
                      {person.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      <span>{person.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      <span>{person.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{person.orderCount}</p>
                  <p className="text-xs text-gray-500">
                    {person.orderCount === 1 ? 'Order' : 'Orders'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Truck className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No delivery staff found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
