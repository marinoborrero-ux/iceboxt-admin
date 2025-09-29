
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

interface DashboardChartsProps {
  ordersByStatus: Array<{ status: string; _count: { status: number } }>;
  topProducts: Array<{ productName: string; _sum: { quantity: number } }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
}

export default function DashboardCharts({ ordersByStatus, topProducts, monthlyRevenue }: DashboardChartsProps) {
  // Prepare order status data for pie chart
  const statusColors = {
    PENDING: '#FF9149',
    IN_PROGRESS: '#60B5FF', 
    DELIVERED: '#72BF78',
    CANCELLED: '#FF6363'
  };

  const orderStatusData = ordersByStatus?.map(item => ({
    name: item.status.replace('_', ' '),
    value: item._count.status,
    color: statusColors[item.status as keyof typeof statusColors] || '#A19AD3'
  })) || [];

  // Prepare top products data for bar chart
  const topProductsData = topProducts?.slice(0, 5).map(item => ({
    name: item.productName?.length > 15 ? `${item.productName.substring(0, 15)}...` : item.productName,
    quantity: item._sum?.quantity || 0
  })) || [];

  // Prepare monthly revenue data for line chart
  const monthlyRevenueData = monthlyRevenue?.map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    revenue: item.revenue
  })) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Order Status Distribution */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Order Status Distribution
          </CardTitle>
          <CardDescription>
            Current breakdown of order statuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend 
                  verticalAlign="top"
                  wrapperStyle={{ fontSize: 11 }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Selling Products */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Top Selling Products
          </CardTitle>
          <CardDescription>
            Most popular items by quantity sold
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <XAxis 
                  dataKey="name" 
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Quantity', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
                />
                <Bar dataKey="quantity" fill="#60B5FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Revenue Trend */}
      <Card className="shadow-sm lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Revenue Trend (Last 6 Months)
          </CardTitle>
          <CardDescription>
            Monthly revenue performance excluding cancelled orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis 
                  dataKey="month" 
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#72BF78" 
                  strokeWidth={3}
                  dot={{ fill: '#72BF78', r: 6 }}
                  activeDot={{ r: 8, fill: '#72BF78' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
