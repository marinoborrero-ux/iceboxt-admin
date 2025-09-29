

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Package, Search, Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import ProductModal from '@/components/dashboard/modals/product-modal';
import ConfirmDeleteModal from '@/components/dashboard/modals/confirm-delete-modal';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  isActive: boolean;
  salesCount: number;
  categoryId: string;
  category: {
    name: string;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { toast } = useToast();

  const fetchProducts = async (page = 1, search = searchTerm) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search: search,
      });

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      setProducts(data.products);
      setTotalPages(data.pages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts(1, searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setModalMode('create');
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setShowProductModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Product deleted successfully.',
        });
        fetchProducts(currentPage);
        setShowDeleteModal(false);
        setSelectedProduct(null);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete product.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product.',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleModalSave = () => {
    fetchProducts(currentPage);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            Product Management
          </h1>
          <p className="text-gray-600 mt-1">Manage your product catalog and inventory</p>
        </div>
        
        <Button onClick={handleCreateProduct} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Products Found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first product'}
          </p>
          {!searchTerm && (
            <Button onClick={handleCreateProduct} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-100 rounded-t-lg relative overflow-hidden">
                  {product.image ? (
                    <div className="relative w-full h-full bg-muted">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        ${product.price}
                      </span>
                      <Badge variant="outline">
                        Stock: {product.stock}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{product.category.name}</span>
                      <span>{product.salesCount} sold</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProduct(product)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
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
            onClick={() => fetchProducts(currentPage - 1)}
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
                    onClick={() => fetchProducts(page)}
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
            onClick={() => fetchProducts(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSave={handleModalSave}
        product={selectedProduct}
        mode={modalMode}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This will permanently remove it from your inventory."
        itemName={selectedProduct?.name || ''}
        loading={deleteLoading}
      />
    </div>
  );
}
