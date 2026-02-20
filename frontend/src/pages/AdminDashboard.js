import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Package, ShoppingCart, Users, DollarSign, Edit, Trash2, Plus, X } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, token, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  
  // Product Form
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    categories: '',
    price: '',
    discount_price: '',
    stock: '',
    images: '',
    is_featured: false,
    is_new: false,
  });

  // Category Form
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      toast.error('Please login to access admin dashboard');
      navigate('/');
      return;
    }
    
    if (user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/');
      return;
    }
    
    fetchData();
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes, categoriesRes, customersRes, adminsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/products`),
        axios.get(`${API}/categories`),
        axios.get(`${API}/admin/customers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/admins`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setCustomers(customersRes.data);
      setAdmins(adminsRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  // Image Upload Function
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const uploadedUrls = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);

        const response = await axios.post(`${API}/upload-image`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        const fullUrl = `${process.env.REACT_APP_BACKEND_URL}${response.data.url}`;
        uploadedUrls.push(fullUrl);
      }

      setUploadedImages([...uploadedImages, ...uploadedUrls]);
      
      // Add uploaded URLs to the images field
      const currentImages = productForm.images ? productForm.images.split(',').map(s => s.trim()).filter(s => s) : [];
      const newImages = [...currentImages, ...uploadedUrls];
      setProductForm({ ...productForm, images: newImages.join(', ') });

      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Product Functions
  const openProductDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        slug: product.slug,
        description: product.description,
        short_description: product.short_description || '',
        categories: product.categories.join(', '),
        price: product.price.toString(),
        discount_price: product.discount_price ? product.discount_price.toString() : '',
        stock: product.stock.toString(),
        images: product.images.join(', '),
        is_featured: product.is_featured,
        is_new: product.is_new,
      });
      setUploadedImages([]);
    } else {
      setEditingProduct(null);
      resetProductForm();
      setUploadedImages([]);
    }
    setShowProductDialog(true);
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      slug: '',
      description: '',
      short_description: '',
      categories: '',
      price: '',
      discount_price: '',
      stock: '',
      images: '',
      is_featured: false,
      is_new: false,
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: productForm.name,
        slug: productForm.slug,
        description: productForm.description,
        short_description: productForm.short_description || null,
        categories: productForm.categories.split(',').map((c) => c.trim()).filter(c => c),
        images: productForm.images.split(',').map((img) => img.trim()).filter(img => img),
        price: parseFloat(productForm.price),
        discount_price: productForm.discount_price ? parseFloat(productForm.discount_price) : null,
        stock: parseInt(productForm.stock),
        is_featured: productForm.is_featured,
        is_new: productForm.is_new,
      };

      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, productData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API}/products`, productData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Product created successfully');
      }

      setShowProductDialog(false);
      resetProductForm();
      setEditingProduct(null);
      fetchData();
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error(error.response?.data?.detail || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;

    setLoading(true);
    try {
      await axios.delete(`${API}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Product deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  // Category Functions
  const openCategoryDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || '',
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', slug: '', description: '', image: '' });
    }
    setShowCategoryDialog(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCategory) {
        await axios.put(`${API}/categories/${editingCategory.id}`, categoryForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Category updated successfully');
      } else {
        await axios.post(`${API}/categories`, categoryForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Category created successfully');
      }

      setShowCategoryDialog(false);
      setCategoryForm({ name: '', slug: '', description: '', image: '' });
      setEditingCategory(null);
      fetchData();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error(error.response?.data?.detail || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"?`)) return;

    setLoading(true);
    try {
      await axios.delete(`${API}/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Category deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(
        `${API}/admin/orders/${orderId}/status?new_status=${status}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order status updated');
      fetchData();
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  if (authLoading || (loading && !stats)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl text-foreground/60">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen flex flex-col" data-testid="admin-dashboard">
      <Navbar />

      <div className="flex-grow py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h1 className="text-4xl md:text-5xl font-heading font-semibold text-primary mb-12">Admin Dashboard</h1>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-foreground/60">Total Products</div>
                    <div className="text-3xl font-bold text-primary mt-2">{products.length}</div>
                  </div>
                  <Package className="h-12 w-12 text-primary/20" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-foreground/60">Total Orders</div>
                    <div className="text-3xl font-bold text-primary mt-2">{stats.total_orders}</div>
                  </div>
                  <ShoppingCart className="h-12 w-12 text-primary/20" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-foreground/60">Total Users</div>
                    <div className="text-3xl font-bold text-primary mt-2">{stats.total_users}</div>
                  </div>
                  <Users className="h-12 w-12 text-primary/20" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-foreground/60">Total Revenue</div>
                    <div className="text-3xl font-bold text-primary mt-2">NPR {stats.total_revenue.toFixed(0)}</div>
                  </div>
                  <DollarSign className="h-12 w-12 text-primary/20" />
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
              <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
              <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
              <TabsTrigger value="customers">Customers ({customers.length})</TabsTrigger>
              <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products">
              <div className="bg-white p-8 rounded-xl border border-border/50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-heading font-semibold text-primary">Manage Products</h2>
                  <Button
                    onClick={() => openProductDialog()}
                    className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                <div className="space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded" />
                        <div>
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-sm text-foreground/60">
                            NPR {product.discount_price || product.price} | Stock: {product.stock}
                          </div>
                          <div className="text-xs text-foreground/50">{product.categories.join(', ')}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => openProductDialog(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories">
              <div className="bg-white p-8 rounded-xl border border-border/50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-heading font-semibold text-primary">Manage Categories</h2>
                  <Button
                    onClick={() => openCategoryDialog()}
                    className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="p-4 border border-border rounded-lg hover:border-primary/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-lg">{category.name}</div>
                          <div className="text-sm text-foreground/60">{category.slug}</div>
                          {category.description && <div className="text-sm text-foreground/50 mt-1">{category.description}</div>}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg"
                            onClick={() => openCategoryDialog(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <div className="bg-white p-8 rounded-xl border border-border/50">
                <h2 className="text-2xl font-heading font-semibold text-primary mb-6">Order Management</h2>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-foreground/60">No orders yet</div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="p-6 border border-border/50 rounded-lg space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="font-semibold text-foreground">Order #{order.order_number}</div>
                            <div className="text-sm text-foreground/60">{order.name} - {order.phone}</div>
                            <div className="text-sm text-foreground/60 mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">NPR {order.total.toFixed(2)}</div>
                            <div className="text-sm text-foreground/60">{order.payment_method}</div>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-grow">
                            <div className="text-sm text-foreground/60">Items: {order.items.length}</div>
                            <div className="text-sm text-foreground/60">Address: {order.shipping_address}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Select value={order.order_status} onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}>
                              <SelectTrigger className="w-[180px] rounded-lg">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="packed">Packed</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Customers Tab */}
            <TabsContent value="customers">
              <div className="bg-white p-8 rounded-xl border border-border/50">
                <h2 className="text-2xl font-heading font-semibold text-primary mb-6">Customer Management</h2>
                <div className="space-y-3">
                  {customers.map((customer) => (
                    <div key={customer.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{customer.name || 'Unnamed'}</div>
                          <div className="text-sm text-foreground/60">Phone: {customer.phone}</div>
                          {customer.email && <div className="text-sm text-foreground/60">Email: {customer.email}</div>}
                          <div className="text-xs text-foreground/50 mt-1">
                            Role: {customer.role} | Joined: {new Date(customer.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading text-primary">
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Product Name *</Label>
                <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required className="mt-2" />
              </div>
              <div>
                <Label>Slug *</Label>
                <Input value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} required className="mt-2" />
              </div>
              <div>
                <Label>Price (NPR) *</Label>
                <Input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required className="mt-2" />
              </div>
              <div>
                <Label>Discount Price (NPR)</Label>
                <Input type="number" step="0.01" value={productForm.discount_price} onChange={(e) => setProductForm({ ...productForm, discount_price: e.target.value })} className="mt-2" />
              </div>
              <div>
                <Label>Stock *</Label>
                <Input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required className="mt-2" />
              </div>
              <div>
                <Label>Categories (comma-separated)</Label>
                <Input value={productForm.categories} onChange={(e) => setProductForm({ ...productForm, categories: e.target.value })} placeholder="food, groceries" className="mt-2" />
              </div>
            </div>
            <div>
              <Label>Short Description</Label>
              <Input value={productForm.short_description} onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })} className="mt-2" />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} required rows={3} className="mt-2" />
            </div>
            <div>
              <Label>Image URLs (comma-separated) *</Label>
              <Textarea value={productForm.images} onChange={(e) => setProductForm({ ...productForm, images: e.target.value })} required rows={2} className="mt-2" placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={productForm.is_featured} onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })} />
                <span>Featured</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={productForm.is_new} onChange={(e) => setProductForm({ ...productForm, is_new: e.target.checked })} />
                <span>New Arrival</span>
              </label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
                {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowProductDialog(false)} className="rounded-full px-8">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading text-primary">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Category Name *</Label>
                <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required className="mt-2" />
              </div>
              <div>
                <Label>Slug *</Label>
                <Input value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} required className="mt-2" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} rows={2} className="mt-2" />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={categoryForm.image} onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })} className="mt-2" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
                {loading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCategoryDialog(false)} className="rounded-full px-8">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
