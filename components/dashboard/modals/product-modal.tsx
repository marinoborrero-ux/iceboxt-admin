
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  categoryId: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  product?: Product | null;
  mode: 'create' | 'edit';
}

export default function ProductModal({ isOpen, onClose, onSave, product, mode }: ProductModalProps) {
  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image: '',
    categoryId: '',
    isActive: true,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (mode === 'edit' && product) {
        setFormData({
          name: product.name,
          description: product.description || '',
          price: product.price,
          stock: product.stock,
          image: product.image || '',
          categoryId: product.categoryId,
          isActive: product.isActive,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          price: 0,
          stock: 0,
          image: '',
          categoryId: '',
          isActive: true,
        });
      }
    }
  }, [isOpen, mode, product]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch('/api/categories?all=true');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.categoryId || formData.price <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields with valid values.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const url = mode === 'create' ? '/api/products' : `/api/products/${product?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Product ${mode === 'create' ? 'created' : 'updated'} successfully.`,
        });
        onSave();
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || `Failed to ${mode} product.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${mode} product.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Product' : 'Edit Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => handleChange('categoryId', value)}
                disabled={loadingCategories}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingCategories ? "Loading..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => handleChange('image', e.target.value)}
              placeholder="https://wpmanageninja.com/wp-content/uploads/2023/03/Editor-Fluentform-19.png"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange('isActive', checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Update Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
