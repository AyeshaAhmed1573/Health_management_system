import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/authContext';
import { useLocation } from 'wouter';

export default function Marketplace() {
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('products');
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: '',
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['marketplace-products', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`http://localhost:3000/api/marketplace/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const { data: labTestsData, isLoading: labTestsLoading } = useQuery({
    queryKey: ['marketplace-lab-tests', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`http://localhost:3000/api/marketplace/lab-tests?${params}`);
      if (!response.ok) throw new Error('Failed to fetch lab tests');
      return response.json();
    },
  });

  const addToCart = async (item) => {
    try {
      const response = await fetch('http://localhost:3000/api/marketplace/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add to cart');

      toast({
        title: 'Added to Cart',
        description: 'Item has been added to your cart',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Healthcare Marketplace</h1>
        <Button onClick={() => setLocation('/cart')}>View Cart</Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 ${activeTab === 'products' ? 'border-b-2 border-blue-600' : ''}`}
        >
          Pharmacy Products
        </button>
        <button
          onClick={() => setActiveTab('lab-tests')}
          className={`px-4 py-2 ${activeTab === 'lab-tests' ? 'border-b-2 border-blue-600' : ''}`}
        >
          Lab Tests
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-64"
        />
        <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="Pain Relief">Pain Relief</SelectItem>
            <SelectItem value="Antibiotics">Antibiotics</SelectItem>
            <SelectItem value="Diabetes">Diabetes</SelectItem>
            <SelectItem value="CBC">CBC</SelectItem>
            <SelectItem value="Lipid Profile">Lipid Profile</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          className="w-32"
        />
        <Input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          className="w-32"
        />
      </div>

      {/* Products Grid */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productsLoading ? (
            <div>Loading...</div>
          ) : (
            productsData?.data?.products?.map((product) => (
              <Card key={product._id} className="hover:shadow-lg transition">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.genericName}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Vendor:</span>
                      <span className="text-sm font-medium">{product.vendorId?.businessName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="text-lg font-bold">${product.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Stock:</span>
                      <span className="text-sm">{product.stock}</span>
                    </div>
                    {product.requiresPrescription && (
                      <Badge variant="secondary">Prescription Required</Badge>
                    )}
                    <Button
                      className="w-full"
                      onClick={() => addToCart({
                        type: 'product',
                        vendorId: product.vendorId._id,
                        productId: product._id,
                        name: product.name,
                        quantity: 1,
                        unitPrice: product.price,
                        totalPrice: product.price,
                        prescriptionRequired: product.requiresPrescription,
                      })}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Lab Tests Grid */}
      {activeTab === 'lab-tests' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {labTestsLoading ? (
            <div>Loading...</div>
          ) : (
            labTestsData?.data?.tests?.map((test) => (
              <Card key={test._id} className="hover:shadow-lg transition">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold">{test.name}</h3>
                  <p className="text-sm text-gray-600">{test.category}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Vendor:</span>
                      <span className="text-sm font-medium">{test.vendorId?.businessName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="text-lg font-bold">${test.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Turnaround:</span>
                      <span className="text-sm">{test.turnaroundHours}h</span>
                    </div>
                    {test.homeCollectionAvailable && (
                      <Badge variant="outline">Home Collection Available</Badge>
                    )}
                    <Button
                      className="w-full"
                      onClick={() => addToCart({
                        type: 'lab_test',
                        vendorId: test.vendorId._id,
                        labTestId: test._id,
                        name: test.name,
                        quantity: 1,
                        unitPrice: test.price,
                        totalPrice: test.price,
                        homeCollection: false,
                      })}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
