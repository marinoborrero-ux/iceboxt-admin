

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Search, Filter, Eye, Truck, Calendar, DollarSign, Plus, Edit, Trash2, RefreshCw, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import OrderModal from '@/components/dashboard/modals/order-modal';
import ConfirmDeleteModal from '@/components/dashboard/modals/confirm-delete-modal';
import OrdersDiagnostic from '@/components/dashboard/orders-diagnostic';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  deliveryAddress: string;
  createdAt: string;
  itemCount: number;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  deliveryPerson: {
    firstName: string;
    lastName: string;
  } | null;
}

interface OrderDetails extends Order {
  notes: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      price: number;
    };
  }>;
}

const statusOptions = [
  { value: 'ALL', label: 'All Orders' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

const statusColors: Record<string, string> = {
  'PENDING': 'bg-yellow-100 text-yellow-800',
  'IN_PROGRESS': 'bg-blue-100 text-blue-800',
  'DELIVERED': 'bg-green-100 text-green-800',
  'CANCELLED': 'bg-red-100 text-red-800'
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { toast } = useToast();

  const handleRefresh = async () => {
    try {
      await fetchOrders(currentPage, searchTerm, statusFilter);
      toast({
        title: 'Success',
        description: 'Orders refreshed successfully',
      });
    } catch (error) {
      console.error('Refresh error:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh orders',
        variant: 'destructive',
      });
    }
  };

  const fetchOrders = async (page = 1, search = searchTerm, status = statusFilter) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Fetching orders with params:', { page, search, status });
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search,
        status: status,
      });

      const response = await fetch(`/api/orders?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies de sesión
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', errorData);
        
        let errorMessage = 'Failed to load orders';
        if (response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else if (response.status === 503) {
          errorMessage = 'Database connection error. Please try again later.';
        } else if (errorData.details) {
          errorMessage = `Error: ${errorData.details}`;
        }
        
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Orders data received:', data);
      
      setOrders(data.orders || []);
      setTotalPages(data.pages || 1);
      setCurrentPage(data.currentPage || 1);
      setError(null);
    } catch (error) {
      console.error('Error fetching orders:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load orders.';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // En caso de error de autenticación, redirigir al login
      if (error instanceof Error && error.message.includes('Authentication required')) {
        window.location.href = '/auth/signin';
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders(1, searchTerm, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchOrders(1, searchTerm, status);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCreateOrder = () => {
    setShowOrderModal(true);
  };

  const handleViewOrder = async (order: Order) => {
    try {
      const response = await fetch(`/api/orders/${order.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
        setShowDetailsModal(true);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load order details.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load order details.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOrder = (order: Order) => {
    if (order.status !== 'PENDING') {
      toast({
        title: 'Cannot Delete',
        description: 'Only pending orders can be deleted.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Order status updated successfully.',
        });
        fetchOrders(currentPage, searchTerm, statusFilter);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to update order status.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status.',
        variant: 'destructive',
      });
    }
  };

  const confirmDelete = async () => {
    if (!selectedOrder) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Order deleted successfully.',
        });
        fetchOrders(currentPage, searchTerm, statusFilter);
        setShowDeleteModal(false);
        setSelectedOrder(null);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete order.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete order.',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleModalSave = () => {
    fetchOrders(currentPage, searchTerm, statusFilter);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            Order Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Track and manage customer orders</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="icon"
            className="hover:bg-gray-50 flex-shrink-0"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button onClick={handleCreateOrder} className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      {/* System Diagnostic - Show when there are errors */}
      {error && (
        <>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-1">Error Loading Orders</h3>
                  <p className="text-red-700 text-sm mb-3">{error}</p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => fetchOrders(currentPage, searchTerm, statusFilter)}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    <Button 
                      onClick={() => window.location.href = '/auth/signin'}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      Login Again
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <OrdersDiagnostic />
        </>
      )}

      {/* System Diagnostic - Show when no orders and no errors */}
      {(!error && orders.length === 0 && !isLoading) && (
        <OrdersDiagnostic />
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyPress}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleSearch} variant="outline" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">No Orders Found</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
            {searchTerm || statusFilter !== 'ALL'
              ? 'Try adjusting your search criteria or filters'
              : 'Get started by creating your first order'}
          </p>
          {!searchTerm && statusFilter === 'ALL' && (
            <Button onClick={handleCreateOrder} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Order
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                      <p className="text-sm text-gray-600">
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{order.itemCount} items</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>

                      {order.deliveryPerson && (
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate">
                            {order.deliveryPerson.firstName} {order.deliveryPerson.lastName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-full sm:w-36">
                        <SelectValue>
                          <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewOrder(order)}
                        className="flex-1 sm:flex-none"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="ml-1 sm:hidden">View</span>
                      </Button>

                      {order.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteOrder(order)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="ml-1 sm:hidden">Delete</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    <strong>Delivery Address:</strong> {order.deliveryAddress}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders(currentPage - 1, searchTerm, statusFilter)}
            disabled={currentPage === 1 || isLoading}
            className="w-full sm:w-auto"
          >
            Previous
          </Button>

          <div className="flex items-center gap-1 overflow-x-auto">
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    size="sm"
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => fetchOrders(page, searchTerm, statusFilter)}
                    disabled={isLoading}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-1 sm:px-2 text-sm">...</span>;
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders(currentPage + 1, searchTerm, statusFilter)}
            disabled={currentPage === totalPages || isLoading}
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        onSave={handleModalSave}
        mode="create"
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedOrder(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Order"
        description="Are you sure you want to delete this order? This will restore product stock and cannot be undone."
        itemName={selectedOrder?.orderNumber || ''}
        loading={deleteLoading}
      />

      {/* Order Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {orderDetails?.orderNumber}</DialogTitle>
          </DialogHeader>

          {orderDetails && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Name:</strong> {orderDetails.customer.firstName} {orderDetails.customer.lastName}</p>
                  <p><strong>Email:</strong> {orderDetails.customer.email}</p>
                  <p><strong>Delivery Address:</strong> {orderDetails.deliveryAddress}</p>
                </div>
              </div>

              {/* Order Info */}
              <div>
                <h4 className="font-semibold mb-2">Order Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Order Number:</strong> {orderDetails.orderNumber}</p>
                  <p><strong>Status:</strong>
                    <Badge className={`ml-2 ${statusColors[orderDetails.status] || 'bg-gray-100 text-gray-800'}`}>
                      {orderDetails.status.replace('_', ' ')}
                    </Badge>
                  </p>
                  <p><strong>Order Date:</strong> {format(new Date(orderDetails.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                  {orderDetails.deliveryPerson && (
                    <p><strong>Delivery Person:</strong> {orderDetails.deliveryPerson.firstName} {orderDetails.deliveryPerson.lastName}</p>
                  )}
                  {orderDetails.notes && (
                    <p><strong>Notes:</strong> {orderDetails.notes}</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-2">Order Items</h4>
                <div className="space-y-2">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{item.product.name}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <div className="font-semibold">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg font-bold text-lg">
                    <span>Total</span>
                    <span>${orderDetails.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
