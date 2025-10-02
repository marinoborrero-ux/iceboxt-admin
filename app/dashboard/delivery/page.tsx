

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Truck, Search, Plus, Edit, Trash2, Mail, Phone, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DeliveryModal from '@/components/dashboard/modals/delivery-modal';
import ConfirmDeleteModal from '@/components/dashboard/modals/confirm-delete-modal';

interface DeliveryPerson {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  orderCount: number;
  createdAt: string;
}

export default function DeliveryPage() {
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { toast } = useToast();

  const fetchDeliveryPersons = async (page = 1, search = searchTerm) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search: search,
      });

      const response = await fetch(`/api/delivery?${params}`);
      if (!response.ok) throw new Error('Failed to fetch delivery persons');

      const data = await response.json();
      setDeliveryPersons(data.deliveryPersons);
      setTotalPages(data.pages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error('Error fetching delivery persons:', error);
      toast({
        title: 'Error',
        description: 'Failed to load delivery personnel.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryPersons();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchDeliveryPersons(1, searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCreateDeliveryPerson = () => {
    setSelectedDeliveryPerson(null);
    setModalMode('create');
    setShowDeliveryModal(true);
  };

  const handleEditDeliveryPerson = (deliveryPerson: DeliveryPerson) => {
    setSelectedDeliveryPerson(deliveryPerson);
    setModalMode('edit');
    setShowDeliveryModal(true);
  };

  const handleDeleteDeliveryPerson = (deliveryPerson: DeliveryPerson) => {
    setSelectedDeliveryPerson(deliveryPerson);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedDeliveryPerson) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/delivery/${selectedDeliveryPerson.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Delivery person deleted successfully.',
        });
        fetchDeliveryPersons(currentPage);
        setShowDeleteModal(false);
        setSelectedDeliveryPerson(null);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete delivery person.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete delivery person.',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleModalSave = () => {
    fetchDeliveryPersons(currentPage);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            Delivery Personnel
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your delivery team and assignments</p>
        </div>

        <Button onClick={handleCreateDeliveryPerson} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Delivery Person
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search delivery personnel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} variant="outline" className="w-full sm:w-auto">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Persons Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(9)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : deliveryPersons.length === 0 ? (
        <Card className="p-12 text-center">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Delivery Personnel Found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first delivery person'}
          </p>
          {!searchTerm && (
            <Button onClick={handleCreateDeliveryPerson} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Delivery Person
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliveryPersons.map((person) => (
            <Card key={person.id} className="group hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-green-600" />
                  </div>
                  <Badge variant={person.isActive ? "default" : "secondary"}>
                    {person.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {person.firstName} {person.lastName}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{person.email}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{person.phone}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Package className="w-4 h-4" />
                      <span>{person.orderCount} deliveries</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    Joined {new Date(person.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEditDeliveryPerson(person)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteDeliveryPerson(person)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={person.orderCount > 0}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {person.orderCount > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Cannot delete - has assigned orders
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchDeliveryPersons(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
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
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => fetchDeliveryPersons(page)}
                    disabled={isLoading}
                  >
                    {page}
                  </Button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2">...</span>;
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => fetchDeliveryPersons(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      <DeliveryModal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        onSave={handleModalSave}
        deliveryPerson={selectedDeliveryPerson}
        mode={modalMode}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedDeliveryPerson(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Delivery Person"
        description="Are you sure you want to delete this delivery person? This action cannot be undone."
        itemName={selectedDeliveryPerson ? `${selectedDeliveryPerson.firstName} ${selectedDeliveryPerson.lastName}` : ''}
        loading={deleteLoading}
      />
    </div>
  );
}
