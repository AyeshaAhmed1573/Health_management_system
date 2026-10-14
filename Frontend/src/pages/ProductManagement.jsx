import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

export default function ProductManagement() {
  const { user, token } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: '',
    subcategory: '',
    description: '',
    manufacturer: '',
    price: '',
    mrp: '',
    discountPercent: '',
    stock: '',
    lowStockThreshold: '',
    batchNumber: '',
    expiryDate: '',
    prescriptionRequired: false,
    dosageForm: '',
    strength: '',
    storageConditions: '',
    sideEffects: '',
  });

  const categories = [
    'Medicines',
    'Supplements',
    'Medical Devices',
    'Personal Care',
    'Baby Care',
    'First Aid',
    'Other',
  ];

  const dosageForms = [
    'tablet',
    'capsule',
    'syrup',
    'injection',
    'cream',
    'ointment',
    'drops',
    'inhaler',
    'other',
  ];

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);

      const response = await fetch(
        `http://localhost:5000/api/products?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setProducts(data.data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create/update product
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'images') {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Add images if any
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((image, index) => {
        formDataToSend.append('productImage', image);
      });
    }

    try {
      const url = editingProduct
        ? `http://localhost:5000/api/products/${editingProduct._id}`
        : 'http://localhost:5000/api/products';

      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        alert(editingProduct ? 'Product updated successfully' : 'Product created successfully');
        setShowAddForm(false);
        setEditingProduct(null);
        resetForm();
        fetchProducts();
      } else {
        alert(data.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product');
    }
  };

  // Delete product
  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Product deleted successfully');
        fetchProducts();
      } else {
        alert(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      genericName: product.genericName || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      description: product.description || '',
      manufacturer: product.manufacturer || '',
      price: product.price || '',
      mrp: product.mrp || '',
      discountPercent: product.discountPercent || '',
      stock: product.stock || '',
      lowStockThreshold: product.lowStockThreshold || '',
      batchNumber: product.batchNumber || '',
      expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
      prescriptionRequired: product.prescriptionRequired || false,
      dosageForm: product.dosageForm || '',
      strength: product.strength || '',
      storageConditions: product.storageConditions || '',
      sideEffects: product.sideEffects?.join(', ') || '',
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      genericName: '',
      category: '',
      subcategory: '',
      description: '',
      manufacturer: '',
      price: '',
      mrp: '',
      discountPercent: '',
      stock: '',
      lowStockThreshold: '',
      batchNumber: '',
      expiryDate: '',
      prescriptionRequired: false,
      dosageForm: '',
      strength: '',
      storageConditions: '',
      sideEffects: '',
    });
  };

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Button onClick={() => { setShowAddForm(true); resetForm(); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchProducts}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Generic Name</Label>
                  <Input
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subcategory</Label>
                  <Input
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Manufacturer</Label>
                  <Input
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Dosage Form</Label>
                  <Select
                    value={formData.dosageForm}
                    onValueChange={(value) => setFormData({ ...formData, dosageForm: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select form" />
                    </SelectTrigger>
                    <SelectContent>
                      {dosageForms.map(form => (
                        <SelectItem key={form} value={form}>{form}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>MRP</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Discount %</Label>
                  <Input
                    type="number"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Stock *</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Low Stock Threshold</Label>
                  <Input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Batch Number</Label>
                  <Input
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Strength</Label>
                  <Input
                    value={formData.strength}
                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    placeholder="e.g., 500mg"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="prescriptionRequired"
                  checked={formData.prescriptionRequired}
                  onChange={(e) => setFormData({ ...formData, prescriptionRequired: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="prescriptionRequired">Prescription Required</Label>
              </div>

              <div>
                <Label>Storage Conditions</Label>
                <Input
                  value={formData.storageConditions}
                  onChange={(e) => setFormData({ ...formData, storageConditions: e.target.value })}
                  placeholder="e.g., Store in cool dry place"
                />
              </div>

              <div>
                <Label>Side Effects (comma-separated)</Label>
                <Input
                  value={formData.sideEffects}
                  onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
                  placeholder="e.g., Nausea, Dizziness, Headache"
                />
              </div>

              <div>
                <Label>Product Images (max 5)</Label>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setFormData({ ...formData, images: files });
                  }}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); setEditingProduct(null); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No products found. Click "Add Product" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.genericName || 'No generic name'}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-gray-500">Category: {product.category}</span>
                      <span className="text-gray-500">Stock: {product.stock}</span>
                      <span className="text-gray-500">Price: ${product.price}</span>
                      {product.stock <= product.lowStockThreshold && (
                        <span className="text-orange-500 font-semibold">Low Stock!</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(product._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
