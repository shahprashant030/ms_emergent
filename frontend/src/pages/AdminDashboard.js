import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminNavbar } from '@/components/AdminNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Package, ShoppingCart, Users, DollarSign, Edit, Trash2, Plus, X, Image, Ticket } from 'lucide-react';
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
  const [carousels, setCarousels] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: '', // 'product', 'category', 'carousel', 'coupon'
    id: '',
    name: '',
  });

  // Product Form
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '', slug: '', description: '', short_description: '',
    categories: '', price: '', discount_price: '', stock: '',
    is_featured: false, is_new: false,
  });

  // Category Form
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '' });

  // Carousel Form
  const [showCarouselDialog, setShowCarouselDialog] = useState(false);
  const [editingCarousel, setEditingCarousel] = useState(null);
  const [carouselImage, setCarouselImage] = useState(null);
  const [carouselForm, setCarouselForm] = useState({
    tag: '', title: '', description: '', button_text: 'Shop Now', button_link: '/products', order: 0,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { toast.error('Please login to access admin dashboard'); navigate('/'); return; }
    if (user.role !== 'admin') { toast.error('Admin access required'); navigate('/'); return; }
    fetchData();
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes, categoriesRes, customersRes, adminsRes, carouselsRes, couponsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/products`),
        axios.get(`${API}/categories`),
        axios.get(`${API}/admin/customers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/admins`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/carousels`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/coupons`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setCustomers(customersRes.data);
      setAdmins(adminsRes.data);
      setCarousels(carouselsRes.data);
      setCoupons(couponsRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  // Image upload helper
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API}/upload-image`, formData, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  };

  // Product Functions
  const handleProductImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    try {
      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(files[i]);
        uploadedUrls.push(url);
      }
      setProductImages([...productImages, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded`);
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const openProductDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name, slug: product.slug, description: product.description,
        short_description: product.short_description || '',
        categories: product.categories?.join(', ') || '',
        price: product.price, discount_price: product.discount_price || '',
        stock: product.stock, is_featured: product.is_featured, is_new: product.is_new,
      });
      setProductImages(product.images || []);
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', slug: '', description: '', short_description: '', categories: '', price: '', discount_price: '', stock: '', is_featured: false, is_new: false });
      setProductImages([]);
    }
    setShowProductDialog(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (productImages.length === 0) { toast.error('Please upload at least one image'); return; }
    setLoading(true);
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        discount_price: productForm.discount_price ? parseFloat(productForm.discount_price) : null,
        stock: parseInt(productForm.stock),
        categories: productForm.categories.split(',').map(c => c.trim()).filter(c => c),
        images: productImages,
      };
      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, productData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Product updated');
      } else {
        await axios.post(`${API}/products`, productData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Product created');
      }
      setShowProductDialog(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save product: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Category Functions
  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setCategoryImage(url);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const openCategoryDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, slug: category.slug, description: category.description || '' });
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
    if (!categoryImage) { toast.error('Please upload a category image'); return; }
    setLoading(true);
    try {
      const categoryData = { ...categoryForm, image: categoryImage };
      if (editingCategory) {
        await axios.put(`${API}/categories/${editingCategory.id}`, categoryData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Category updated');
      } else {
        await axios.post(`${API}/categories`, categoryData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Category created');
      }
      setShowCategoryDialog(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  // Carousel Functions
  const handleCarouselImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setCarouselImage(url);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const openCarouselDialog = (carousel = null) => {
    if (carousel) {
      setEditingCarousel(carousel);
      setCarouselForm({
        tag: carousel.tag || '', title: carousel.title || '', description: carousel.description || '',
        button_text: carousel.button_text || 'Shop Now', button_link: carousel.button_link || '/products',
        order: carousel.order || 0,
      });
      setCarouselImage(carousel.image || null);
    } else {
      setEditingCarousel(null);
      setCarouselForm({ tag: '', title: '', description: '', button_text: 'Shop Now', button_link: '/products', order: carousels.length });
      setCarouselImage(null);
    }
    setShowCarouselDialog(true);
  };

  const handleSaveCarousel = async (e) => {
    e.preventDefault();
    if (!carouselImage) { toast.error('Please upload a carousel image'); return; }
    if (!carouselForm.tag || !carouselForm.title || !carouselForm.description) { toast.error('Please fill all required fields'); return; }
    setLoading(true);
    try {
      const carouselData = { ...carouselForm, image: carouselImage, order: parseInt(carouselForm.order) || 0 };
      if (editingCarousel) {
        await axios.put(`${API}/carousels/${editingCarousel.id}`, carouselData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Carousel updated');
      } else {
        await axios.post(`${API}/carousels`, carouselData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Carousel created');
      }
      setShowCarouselDialog(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save carousel');
    } finally {
      setLoading(false);
    }
  };

  // DELETE FUNCTIONS - Using AlertDialog instead of window.confirm
  const openDeleteDialog = (type, id, name) => {
    setDeleteDialog({ open: true, type, id, name });
  };

  const handleConfirmDelete = async () => {
    const { type, id } = deleteDialog;
    setDeleteDialog({ ...deleteDialog, open: false });
    setLoading(true);
    
    try {
      let endpoint = '';
      if (type === 'product') endpoint = `${API}/products/${id}`;
      else if (type === 'category') endpoint = `${API}/categories/${id}`;
      else if (type === 'carousel') endpoint = `${API}/carousels/${id}`;
      
      await axios.delete(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      fetchData();
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      toast.error(`Failed to delete ${type}: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API}/admin/orders/${orderId}/status?new_status=${status}`, null, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Order status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getCategoryProductCount = (categorySlug) => products.filter(p => p.categories?.includes(categorySlug)).length;

  const removeProductImage = (idx) => setProductImages(productImages.filter((_, i) => i !== idx));
  const moveImageUp = (idx) => { if (idx > 0) { const imgs = [...productImages]; [imgs[idx-1], imgs[idx]] = [imgs[idx], imgs[idx-1]]; setProductImages(imgs); } };
  const moveImageDown = (idx) => { if (idx < productImages.length - 1) { const imgs = [...productImages]; [imgs[idx], imgs[idx+1]] = [imgs[idx+1], imgs[idx]]; setProductImages(imgs); } };

  if (authLoading || (loading && !stats)) {
    return <div className="min-h-screen flex items-center justify-center bg-muted"><div className="text-xl text-foreground/60">Loading Admin Dashboard...</div></div>;
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
                <StatCard icon={Package} label="Total Products" value={products.length} />
                <StatCard icon={ShoppingCart} label="Total Orders" value={stats.total_orders} />
                <StatCard icon={Users} label="Customers" value={customers.length} />
                <StatCard icon={Users} label="Our Team" value={admins.length} />
                <StatCard icon={DollarSign} label="Revenue" value={`NPR ${stats.total_revenue?.toFixed(0) || 0}`} />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex justify-between items-center py-2 border-b">
                      <div><div className="font-medium">Order #{order.order_number}</div><div className="text-sm text-foreground/60">{order.name}</div></div>
                      <div className="text-right"><div className="font-bold text-primary">NPR {order.total?.toFixed(2)}</div><div className="text-xs text-foreground/60">{order.order_status}</div></div>
                    </div>
                  ))}
                  {orders.length === 0 && <div className="text-center py-8 text-foreground/60">No orders yet</div>}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Categories Overview</h3>
                <div className="space-y-3">
                  {categories.slice(0, 5).map((category) => (
                    <div key={category.id} className="flex justify-between items-center py-2 border-b">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-foreground/60">{getCategoryProductCount(category.slug)} products</div>
                    </div>
                  ))}
                  {categories.length === 0 && <div className="text-center py-8 text-foreground/60">No categories yet</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {currentTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-heading font-semibold text-primary">Products Management</h1>
              <Button onClick={() => openProductDialog()} className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
            </div>
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="p-6 space-y-3">
                {products.length === 0 ? (
                  <div className="text-center py-12 text-foreground/60">No products yet. Click "Add Product" to create one.</div>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={product.images?.[0] || 'https://via.placeholder.com/64'} alt={product.name} className="w-16 h-16 object-cover rounded" />
                        <div>
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-sm text-foreground/60">NPR {product.discount_price || product.price} | Stock: {product.stock}</div>
                          <div className="text-xs text-foreground/50">{product.categories?.join(', ') || 'No category'}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openProductDialog(product)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => openDeleteDialog('product', product.id, product.name)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {currentTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-heading font-semibold text-primary">Categories Management</h1>
              <Button onClick={() => openCategoryDialog()} className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"><Plus className="h-4 w-4 mr-2" /> Add Category</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.length === 0 ? (
                <div className="col-span-2 bg-white rounded-xl border shadow-sm p-12 text-center text-foreground/60">No categories yet. Click "Add Category" to create one.</div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="bg-white p-6 rounded-xl border shadow-sm hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {category.image && <img src={category.image} alt={category.name} className="w-12 h-12 object-cover rounded" />}
                        <div>
                          <div className="font-semibold text-lg">{category.name}</div>
                          <div className="text-sm text-primary font-medium">Total Products: {getCategoryProductCount(category.slug)}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openCategoryDialog(category)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => openDeleteDialog('category', category.id, category.name)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Carousel Tab */}
        {currentTab === 'carousel' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-heading font-semibold text-primary">Carousel Management</h1>
              <Button onClick={() => openCarouselDialog()} className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"><Plus className="h-4 w-4 mr-2" /> Add Slide</Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {carousels.length === 0 ? (
                <div className="bg-white rounded-xl border shadow-sm p-12 text-center text-foreground/60">No carousel slides yet. Add your first slide to display on the homepage.</div>
              ) : (
                carousels.map((carousel) => (
                  <div key={carousel.id} className="bg-white p-6 rounded-xl border shadow-sm hover:border-primary/30 transition-colors">
                    <div className="flex items-start gap-6">
                      <img src={carousel.image} alt={carousel.title} className="w-32 h-20 object-cover rounded-lg" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs uppercase tracking-wider text-secondary font-medium bg-secondary/10 px-2 py-1 rounded">{carousel.tag}</span>
                          <span className="text-xs text-foreground/50">Order: {carousel.order}</span>
                        </div>
                        <div className="font-semibold text-lg text-primary">{carousel.title}</div>
                        <div className="text-sm text-foreground/60 mt-1 line-clamp-1">{carousel.description}</div>
                        <div className="text-xs text-foreground/50 mt-1">Button: "{carousel.button_text}" → {carousel.button_link}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openCarouselDialog(carousel)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => openDeleteDialog('carousel', carousel.id, carousel.title)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {currentTab === 'orders' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-heading font-semibold text-primary">Orders Management</h1>
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-foreground/60">No orders yet</div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="p-6 border rounded-lg space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold">Order #{order.order_number}</div>
                        <div className="text-sm text-foreground/60">{order.name} - {order.phone}</div>
                        <div className="text-sm text-foreground/60 mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">NPR {order.total?.toFixed(2)}</div>
                        <div className="text-sm text-foreground/60">{order.payment_method}</div>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-grow">
                        <div className="text-sm text-foreground/60">Items: {order.items?.length || 0}</div>
                        <div className="text-sm text-foreground/60">Address: {order.shipping_address}</div>
                      </div>
                      <Select value={order.order_status} onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}>
                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
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
        )}

        {/* Customers Tab */}
        {currentTab === 'customers' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-heading font-semibold text-primary">Customers ({customers.length})</h1>
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-3">
              {customers.length === 0 ? (
                <div className="text-center py-12 text-foreground/60">No customers yet</div>
              ) : (
                customers.map((customer) => (
                  <div key={customer.id} className="flex justify-between items-center py-3 border-b">
                    <div><div className="font-medium">{customer.name || 'No name'}</div><div className="text-sm text-foreground/60">{customer.phone}</div></div>
                    <div className="text-sm text-foreground/60">{new Date(customer.created_at).toLocaleDateString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Admins Tab */}
        {currentTab === 'admins' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-heading font-semibold text-primary">Admins ({admins.length})</h1>
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-3">
              {admins.length === 0 ? (
                <div className="text-center py-12 text-foreground/60">No admins found</div>
              ) : (
                admins.map((admin) => (
                  <div key={admin.id} className="flex justify-between items-center py-3 border-b">
                    <div><div className="font-medium">{admin.name || 'No name'}</div><div className="text-sm text-foreground/60">{admin.phone} | {admin.email}</div></div>
                    <div className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">Admin</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteDialog.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-2xl font-heading text-primary">{editingProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Product Name *</Label><Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required className="mt-2" /></div>
              <div><Label>Slug *</Label><Input value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} required className="mt-2" /></div>
              <div><Label>Price (NPR) *</Label><Input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required className="mt-2" /></div>
              <div><Label>Discount Price (NPR)</Label><Input type="number" value={productForm.discount_price} onChange={(e) => setProductForm({ ...productForm, discount_price: e.target.value })} className="mt-2" /></div>
              <div><Label>Stock *</Label><Input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required className="mt-2" /></div>
              <div><Label>Categories (comma-separated)</Label><Input value={productForm.categories} onChange={(e) => setProductForm({ ...productForm, categories: e.target.value })} placeholder="sweets, groceries" className="mt-2" /></div>
            </div>
            <div><Label>Short Description</Label><Input value={productForm.short_description} onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })} className="mt-2" /></div>
            <div><Label>Description *</Label><Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} required rows={3} className="mt-2" /></div>
            <div>
              <Label>Product Images *</Label>
              <div className="mt-2 space-y-3">
                <Input type="file" accept="image/*" multiple onChange={handleProductImageUpload} disabled={uploadingImage} />
                {uploadingImage && <span className="text-sm text-foreground/60">Uploading...</span>}
                {productImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {productImages.map((img, idx) => (
                      <div key={idx} className="relative border rounded-lg p-2">
                        <img src={img} alt={`Product ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                        <button type="button" onClick={() => removeProductImage(idx)} className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1"><X className="h-3 w-3" /></button>
                        <div className="flex gap-1 mt-2">
                          <button type="button" onClick={() => moveImageUp(idx)} disabled={idx === 0} className="flex-1 bg-muted text-xs py-1 rounded disabled:opacity-30">↑</button>
                          <button type="button" onClick={() => moveImageDown(idx)} disabled={idx === productImages.length - 1} className="flex-1 bg-muted text-xs py-1 rounded disabled:opacity-30">↓</button>
                        </div>
                        <div className="text-xs text-center mt-1 text-foreground/60">{idx === 0 ? 'Main' : `#${idx + 1}`}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2"><input type="checkbox" checked={productForm.is_featured} onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })} /><span>Featured</span></label>
              <label className="flex items-center space-x-2"><input type="checkbox" checked={productForm.is_new} onChange={(e) => setProductForm({ ...productForm, is_new: e.target.checked })} /><span>New Arrival</span></label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-primary text-white rounded-full px-8">{loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}</Button>
              <Button type="button" variant="outline" onClick={() => setShowProductDialog(false)} className="rounded-full px-8">Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-2xl font-heading text-primary">{editingCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Category Name *</Label><Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required className="mt-2" /></div>
              <div><Label>Slug *</Label><Input value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} required className="mt-2" /></div>
            </div>
            <div><Label>Description</Label><Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} rows={2} className="mt-2" /></div>
            <div>
              <Label>Category Image *</Label>
              <div className="mt-2 space-y-3">
                <Input type="file" accept="image/*" onChange={handleCategoryImageUpload} disabled={uploadingImage} />
                {uploadingImage && <span className="text-sm text-foreground/60">Uploading...</span>}
                {categoryImage && <img src={categoryImage} alt="Category preview" className="w-32 h-32 object-cover rounded border" />}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-primary text-white rounded-full px-8">{loading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}</Button>
              <Button type="button" variant="outline" onClick={() => setShowCategoryDialog(false)} className="rounded-full px-8">Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Carousel Dialog */}
      <Dialog open={showCarouselDialog} onOpenChange={setShowCarouselDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-2xl font-heading text-primary">{editingCarousel ? 'Edit Carousel Slide' : 'Create New Carousel Slide'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveCarousel} className="space-y-4">
            <div>
              <Label>Carousel Image * <span className="text-xs text-foreground/50">(Recommended: 1920x600px)</span></Label>
              <div className="mt-2 space-y-3">
                <Input type="file" accept="image/*" onChange={handleCarouselImageUpload} disabled={uploadingImage} />
                {uploadingImage && <span className="text-sm text-foreground/60">Uploading...</span>}
                {carouselImage && <img src={carouselImage} alt="Carousel preview" className="w-full h-32 object-cover rounded border" />}
              </div>
            </div>
            <div><Label>Tag * <span className="text-xs text-foreground/50">(e.g., FESTIVAL SPECIAL)</span></Label><Input value={carouselForm.tag} onChange={(e) => setCarouselForm({ ...carouselForm, tag: e.target.value })} placeholder="FESTIVAL SPECIAL" required className="mt-2" /></div>
            <div><Label>Title *</Label><Input value={carouselForm.title} onChange={(e) => setCarouselForm({ ...carouselForm, title: e.target.value })} placeholder="Flat 50% OFF" required className="mt-2" /></div>
            <div><Label>Description *</Label><Textarea value={carouselForm.description} onChange={(e) => setCarouselForm({ ...carouselForm, description: e.target.value })} placeholder="Get flat 50% off on all purchases" required rows={3} className="mt-2" /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Button Text *</Label><Input value={carouselForm.button_text} onChange={(e) => setCarouselForm({ ...carouselForm, button_text: e.target.value })} placeholder="Shop Now" required className="mt-2" /></div>
              <div><Label>Button Link</Label><Input value={carouselForm.button_link} onChange={(e) => setCarouselForm({ ...carouselForm, button_link: e.target.value })} placeholder="/products" className="mt-2" /></div>
            </div>
            <div><Label>Order <span className="text-xs text-foreground/50">(Lower numbers appear first)</span></Label><Input type="number" value={carouselForm.order} onChange={(e) => setCarouselForm({ ...carouselForm, order: e.target.value })} min="0" className="mt-2 w-24" /></div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-primary text-white rounded-full px-8">{loading ? 'Saving...' : (editingCarousel ? 'Update Slide' : 'Create Slide')}</Button>
              <Button type="button" variant="outline" onClick={() => setShowCarouselDialog(false)} className="rounded-full px-8">Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper Components
const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white p-4 rounded-xl border shadow-sm">
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-foreground/60">{label}</div>
        <Icon className="h-8 w-8 text-primary/20" />
      </div>
      <div className="text-2xl font-bold text-primary">{value}</div>
    </div>
  </div>
);

export default AdminDashboard;
