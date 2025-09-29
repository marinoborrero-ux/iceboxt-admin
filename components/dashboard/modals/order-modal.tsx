
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus } from 'lucide-react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface DeliveryPerson {
  id: string;
  firstName: string;
  lastName: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  mode: 'create';
}

export default function OrderModal({ isOpen, onClose, onSave, mode }: OrderModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  
  const [customerId, setCustomerId] = useState('');
  const [deliveryPersonId, setDeliveryPersonId] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([{ productId: '', quantity: 1 }]);
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setCustomerId('');
    setDeliveryPersonId('');
    setDeliveryAddress('');
    setNotes('');
    setItems([{ productId: '', quantity: 1 }]);
  };

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      
      const [customersRes, productsRes, deliveryRes] = await Promise.all([
        fetch('/api/customers?limit=100'),
        fetch('/api/products?limit=100'),
        fetch('/api/delivery?all=true')
      ]);

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData.customers);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products);
      }

      if (deliveryRes.ok) {
        const deliveryData = await deliveryRes.json();
        setDeliveryPersons(deliveryData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load form data.',
        variant: 'destructive',
      });
    } finally {
      setLoadingData(false);
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId || !deliveryAddress || items.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Customer, delivery address, and at least one item are required.',
        variant: 'destructive',
      });
      return;
    }

    // Validate all items have products and quantities
    const invalidItems = items.filter(item => !item.productId || item.quantity <= 0);
    if (invalidItems.length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all item details with valid quantities.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          deliveryPersonId: deliveryPersonId || null,
          deliveryAddress,
          notes,
          items,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Order created successfully.',
        });
        onSave();
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to create order.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create order.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName} ({customer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryPerson">Delivery Person</Label>
              <Select value={deliveryPersonId} onValueChange={setDeliveryPersonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery person (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No assignment</SelectItem>
                  {deliveryPersons.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.firstName} {person.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Delivery Address *</Label>
            <Textarea
              id="deliveryAddress"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter delivery address"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Order Items *</Label>
              <Button type="button" onClick={handleAddItem} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-6">
                      <Label>Product</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(value) => handleItemChange(index, 'productId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - ${product.price} (Stock: {product.stock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-3">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        placeholder="Qty"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>Subtotal</Label>
                      <div className="text-sm font-medium">
                        ${((products.find(p => p.id === item.productId)?.price || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    <div className="col-span-1">
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-right">
              <div className="text-lg font-semibold">
                Total: <Badge variant="secondary" className="ml-2 text-lg px-3 py-1">
                  ${calculateTotal().toFixed(2)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter order notes (optional)"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
