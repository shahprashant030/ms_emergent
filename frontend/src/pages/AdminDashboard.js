import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminNavbar } from '@/components/AdminNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Package, ShoppingCart, Users, DollarSign, Edit, Trash2, Plus, Upload, X, Image } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, token, loading: authLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Product Form
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    categories: '',
    price: '',
    discount_price: '',
    stock: '',
    is_featured: false,
    is_new: false,
  });

  // Category Form
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
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

  // Product image upload
  const handleProductImageUpload = async (e) => {
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

        // Backend now returns full URL
        uploadedUrls.push(response.data.url);
      }

      setProductImages([...productImages, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Category image upload
  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Backend now returns full URL
      setCategoryImage(response.data.url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeProductImage = (index) => {
    const newImages = productImages.filter((_, i) => i !== index);
    setProductImages(newImages);
  };

  const moveImageUp = (index) => {
    if (index === 0) return;
    const newImages = [...productImages];
    [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
    setProductImages(newImages);
  };

  const moveImageDown = (index) => {
    if (index === productImages.length - 1) return;
    const newImages = [...productImages];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    setProductImages(newImages);
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
        is_featured: product.is_featured,
        is_new: product.is_new,
      });
      setProductImages(product.images || []);
    } else {
      setEditingProduct(null);
      resetProductForm();
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
      is_featured: false,
      is_new: false,
    });
    setProductImages([]);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    
    if (productImages.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: productForm.name,
        slug: productForm.slug,
        description: productForm.description,
        short_description: productForm.short_description || null,
        categories: productForm.categories.split(',').map((c) => c.trim()).filter(c => c),
        images: productImages,
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
    console.log('Delete clicked - productId:', productId, 'productName:', productName);
    
    if (!productId) {
      console.error('No product ID provided');
      toast.error('Cannot delete: Product ID missing');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      console.log('User cancelled deletion');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending DELETE request to:', `${API}/products/${productId}`);
      await axios.delete(`${API}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Product deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product: ' + (error.response?.data?.detail || error.message));
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
      });
      setCategoryImage(category.image || null);
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', slug: '', description: '' });
      setCategoryImage(null);
    }
    setShowCategoryDialog(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    
    if (!categoryImage) {
      toast.error('Please upload a category image');
      return;
    }

    setLoading(true);

    try {
      const categoryData = {
        ...categoryForm,
        image: categoryImage,
      };

      if (editingCategory) {
        await axios.put(`${API}/categories/${editingCategory.id}`, categoryData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Category updated successfully');
      } else {
        await axios.post(`${API}/categories`, categoryData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Category created successfully');
      }

      setShowCategoryDialog(false);
      setCategoryForm({ name: '', slug: '', description: '' });
      setCategoryImage(null);
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
    console.log('handleDeleteCategory called - categoryId:', categoryId, 'categoryName:', categoryName);
    
    if (!categoryId) {
      console.error('No category ID provided');
      toast.error('Cannot delete: Category ID missing');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      console.log('User cancelled category deletion');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending DELETE request to:', `${API}/categories/${categoryId}`);
      await axios.delete(`${API}/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Category deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getCategoryProductCount = (categorySlug) => {
    return products.filter(p => p.categories.includes(categorySlug)).length;
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
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-xl text-foreground/60">Loading Admin Dashboard...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-muted">
      <AdminNavbar currentTab={currentTab} onTabChange={setCurrentTab} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {currentTab === 'dashboard' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-heading font-semibold text-primary">Dashboard Overview</h1>
            
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-border/50 shadow-sm">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-foreground/60">Total Products</div>
                      <Package className="h-8 w-8 text-primary/20" />
                    </div>
                    <div className="text-2xl font-bold text-primary">{products.length}</div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-border/50 shadow-sm">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-foreground/60">Total Orders</div>
                      <ShoppingCart className="h-8 w-8 text-primary/20" />
                    </div>
                    <div className="text-2xl font-bold text-primary">{stats.total_orders}</div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-border/50 shadow-sm">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-foreground/60">Total Users</div>
                      <Users className="h-8 w-8 text-primary/20" />
                    </div>
                    <div className="text-2xl font-bold text-primary">{customers.length}</div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-border/50 shadow-sm">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-foreground/60">Our Team</div>
                      <Users className="h-8 w-8 text-secondary/20" />
                    </div>
                    <div className="text-2xl font-bold text-primary">{admins.length}</div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-border/50 shadow-sm">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-foreground/60">Total Revenue</div>
                      <DollarSign className="h-8 w-8 text-primary/20" />
                    </div>
                    <div className="text-2xl font-bold text-primary">NPR {stats.total_revenue.toFixed(0)}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-border/50 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex justify-between items-center py-2 border-b border-border/30">
                      <div>
                        <div className="font-medium">Order #{order.order_number}</div>
                        <div className="text-sm text-foreground/60">{order.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">NPR {order.total.toFixed(2)}</div>
                        <div className="text-xs text-foreground/60">{order.order_status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-border/50 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Categories Overview</h3>
                <div className="space-y-3">
                  {categories.slice(0, 5).map((category) => (
                    <div key={category.id} className="flex justify-between items-center py-2 border-b border-border/30">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-foreground/60">{getCategoryProductCount(category.slug)} products</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab - Continue in next file due to length */}
        {currentTab === 'products' && (
          <ProductsTab 
            products={products}
            openProductDialog={openProductDialog}
            handleDeleteProduct={handleDeleteProduct}
          />
        )}

        {/* Categories Tab */}
        {currentTab === 'categories' && (
          <CategoriesTab 
            categories={categories}
            getCategoryProductCount={getCategoryProductCount}
            openCategoryDialog={openCategoryDialog}
            handleDeleteCategory={handleDeleteCategory}
          />
        )}

        {/* Orders Tab */}
        {currentTab === 'orders' && (
          <OrdersTab 
            orders={orders}
            handleUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {/* Customers Tab */}
        {currentTab === 'customers' && (
          <CustomersTab customers={customers} />
        )}

        {/* Admins Tab */}
        {currentTab === 'admins' && (
          <AdminsTab admins={admins} />
        )}
      </div>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading text-primary">
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm 
            productForm={productForm}
            setProductForm={setProductForm}
            productImages={productImages}
            uploadingImage={uploadingImage}
            handleProductImageUpload={handleProductImageUpload}
            removeProductImage={removeProductImage}
            moveImageUp={moveImageUp}
            moveImageDown={moveImageDown}
            handleSaveProduct={handleSaveProduct}
            loading={loading}
            editingProduct={editingProduct}
            onCancel={() => setShowProductDialog(false)}
          />
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
          <CategoryForm 
            categoryForm={categoryForm}
            setCategoryForm={setCategoryForm}
            categoryImage={categoryImage}
            uploadingImage={uploadingImage}
            handleCategoryImageUpload={handleCategoryImageUpload}
            handleSaveCategory={handleSaveCategory}
            loading={loading}
            editingCategory={editingCategory}
            onCancel={() => setShowCategoryDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Sub-components
const ProductsTab = ({ products, openProductDialog, handleDeleteProduct }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-heading font-semibold text-primary">Products Management</h1>
      <Button onClick={() => openProductDialog()} className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">
        <Plus className="h-4 w-4 mr-2" /> Add Product
      </Button>
    </div>

    <div className="bg-white rounded-xl border border-border/50 shadow-sm">
      <div className="p-6 space-y-3">
        {products.map((product) => (
          <div key={product.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-4">
              <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded" />
              <div>
                <div className="font-semibold">{product.name}</div>
                <div className="text-sm text-foreground/60">NPR {product.discount_price || product.price} | Stock: {product.stock}</div>
                <div className="text-xs text-foreground/50">{product.categories.join(', ')}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => openProductDialog(product)} data-testid={`edit-product-${product.id}`}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-lg text-destructive hover:bg-destructive/10" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Delete button clicked for product:', product.id, product.name);
                  handleDeleteProduct(product.id, product.name);
                }}
                data-testid={`delete-product-${product.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CategoriesTab = ({ categories, getCategoryProductCount, openCategoryDialog, handleDeleteCategory }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-heading font-semibold text-primary">Categories Management</h1>
      <Button onClick={() => openCategoryDialog()} className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">
        <Plus className="h-4 w-4 mr-2" /> Add Category
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map((category) => (
        <div key={category.id} className="bg-white p-6 rounded-xl border border-border/50 shadow-sm hover:border-primary/30 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {category.image && <img src={category.image} alt={category.name} className="w-12 h-12 object-cover rounded" />}
                <div>
                  <div className="font-semibold text-lg">{category.name}</div>
                  <div className="text-sm text-primary font-medium">Total Products: {getCategoryProductCount(category.slug)}</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => openCategoryDialog(category)} data-testid={`edit-category-${category.id}`}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-lg text-destructive hover:bg-destructive/10" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Delete button clicked for category:', category.id, category.name);
                  handleDeleteCategory(category.id, category.name);
                }}
                data-testid={`delete-category-${category.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const OrdersTab = ({ orders, handleUpdateOrderStatus }) => (
  <div className="space-y-6">
    <h1 className="text-3xl font-heading font-semibold text-primary">Orders Management</h1>
    <div className="bg-white rounded-xl border border-border/50 shadow-sm p-6 space-y-4">
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
        ))
      )}
    </div>
  </div>
);

const CustomersTab = ({ customers }) => (
  <div className="space-y-6">
    <h1 className="text-3xl font-heading font-semibold text-primary">Customers ({customers.length})</h1>
    <div className="bg-white rounded-xl border border-border/50 shadow-sm p-6 space-y-3">
      {customers.length === 0 ? (
        <div className="text-center py-12 text-foreground/60">No customers yet</div>
      ) : (
        customers.map((customer) => (
          <div key={customer.id} className="p-4 border border-border rounded-lg">
            <div className="font-semibold">{customer.name || 'Unnamed Customer'}</div>
            <div className="text-sm text-foreground/60">Phone: {customer.phone}</div>
            {customer.email && <div className="text-sm text-foreground/60">Email: {customer.email}</div>}
            {customer.address && <div className="text-sm text-foreground/60">Address: {customer.address}</div>}
            <div className="text-xs text-foreground/50 mt-1">Joined: {new Date(customer.created_at).toLocaleDateString()}</div>
          </div>
        ))
      )}
    </div>
  </div>
);

const AdminsTab = ({ admins }) => (
  <div className="space-y-6">
    <h1 className="text-3xl font-heading font-semibold text-primary">Admin Team ({admins.length})</h1>
    <div className="bg-white rounded-xl border border-border/50 shadow-sm p-6 space-y-3">
      {admins.map((admin) => (
        <div key={admin.id} className="p-4 border border-primary/20 rounded-lg bg-primary/5">
          <div className="font-semibold flex items-center gap-2">
            {admin.name || 'Unnamed Admin'}
            <span className="text-xs bg-primary text-white px-2 py-1 rounded">ADMIN</span>
          </div>
          <div className="text-sm text-foreground/60">Phone: {admin.phone}</div>
          {admin.email && <div className="text-sm text-foreground/60">Email: {admin.email}</div>}
          <div className="text-xs text-foreground/50 mt-1">Joined: {new Date(admin.created_at).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  </div>
);

const ProductForm = ({ productForm, setProductForm, productImages, uploadingImage, handleProductImageUpload, removeProductImage, moveImageUp, moveImageDown, handleSaveProduct, loading, editingProduct, onCancel }) => (
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
        <div className="text-xs text-foreground/60 mt-1">
          Available categories: You must create categories first from the Categories tab before adding them here.
        </div>
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
      <Label>Product Images *</Label>
      <div className="mt-2 space-y-3">
        <div className="flex items-center gap-3">
          <Input type="file" accept="image/*" multiple onChange={handleProductImageUpload} disabled={uploadingImage} className="flex-1" />
          {uploadingImage && <span className="text-sm text-foreground/60">Uploading...</span>}
        </div>
        <div className="text-xs text-foreground/60">First image will be the main display image. Drag to reorder.</div>
        {productImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {productImages.map((img, idx) => (
              <div key={idx} className="relative border border-border rounded-lg p-2">
                <img src={img} alt={`Product ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                <div className="absolute top-1 right-1 flex gap-1">
                  <button type="button" onClick={() => removeProductImage(idx)} className="bg-destructive text-white rounded-full p-1 text-xs">
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex gap-1 mt-2">
                  <button type="button" onClick={() => moveImageUp(idx)} disabled={idx === 0} className="flex-1 bg-muted text-xs py-1 rounded disabled:opacity-30">
                    ↑
                  </button>
                  <button type="button" onClick={() => moveImageDown(idx)} disabled={idx === productImages.length - 1} className="flex-1 bg-muted text-xs py-1 rounded disabled:opacity-30">
                    ↓
                  </button>
                </div>
                <div className="text-xs text-center mt-1 text-foreground/60">{idx === 0 ? 'Main' : `#${idx + 1}`}</div>
              </div>
            ))}
          </div>
        )}
      </div>
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
      <Button type="button" variant="outline" onClick={onCancel} className="rounded-full px-8">Cancel</Button>
    </div>
  </form>
);

const CategoryForm = ({ categoryForm, setCategoryForm, categoryImage, uploadingImage, handleCategoryImageUpload, handleSaveCategory, loading, editingCategory, onCancel }) => (
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
      <Label>Category Image *</Label>
      <div className="mt-2 space-y-3">
        <div className="flex items-center gap-3">
          <Input type="file" accept="image/*" onChange={handleCategoryImageUpload} disabled={uploadingImage} className="flex-1" />
          {uploadingImage && <span className="text-sm text-foreground/60">Uploading...</span>}
        </div>
        {categoryImage && (
          <img src={categoryImage} alt="Category preview" className="w-32 h-32 object-cover rounded border border-border" />
        )}
      </div>
    </div>
    <div className="flex gap-3 pt-4">
      <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
        {loading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
      </Button>
      <Button type="button" variant="outline" onClick={onCancel} className="rounded-full px-8">Cancel</Button>
    </div>
  </form>
);

export default AdminDashboard;