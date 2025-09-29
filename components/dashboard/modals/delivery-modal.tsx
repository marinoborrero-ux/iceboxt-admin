
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface DeliveryPerson {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
}

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  deliveryPerson?: DeliveryPerson | null;
  mode: 'create' | 'edit';
}

export default function DeliveryModal({ isOpen, onClose, onSave, deliveryPerson, mode }: DeliveryModalProps) {
  const [formData, setFormData] = useState<DeliveryPerson>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && deliveryPerson) {
        setFormData({
          firstName: deliveryPerson.firstName,
          lastName: deliveryPerson.lastName,
          email: deliveryPerson.email,
          phone: deliveryPerson.phone,
          isActive: deliveryPerson.isActive,
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          isActive: true,
        });
      }
    }
  }, [isOpen, mode, deliveryPerson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast({
        title: 'Validation Error',
        description: 'All fields are required.',
        variant: 'destructive',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const url = mode === 'create' ? '/api/delivery' : `/api/delivery/${deliveryPerson?.id}`;
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
          description: `Delivery person ${mode === 'create' ? 'created' : 'updated'} successfully.`,
        });
        onSave();
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || `Failed to ${mode} delivery person.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${mode} delivery person.`,
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Delivery Person' : 'Edit Delivery Person'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Enter phone number"
              required
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
              {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
