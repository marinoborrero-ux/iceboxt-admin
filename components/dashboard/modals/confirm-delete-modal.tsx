
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName: string;
  loading?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  loading = false
}: ConfirmDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-left">{title}</DialogTitle>
              <DialogDescription className="text-left mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          <p className="text-sm text-gray-600">
            You are about to delete: <span className="font-semibold">{itemName}</span>
          </p>
          <p className="text-sm text-red-600 mt-2">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
