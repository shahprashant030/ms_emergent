import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    categories: '',
    price: '',
    stock: '',
    images: '',
    is_featured: false,
    is_new: false,
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...productForm,
        categories: productForm.categories.split(',').map((c) => c.trim()),
        images: productForm.images.split(',').map((img) => img.trim()),
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
      };

      await axios.post(`${API}/products`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Product created successfully');
      setShowProductForm(false);
      setProductForm({
        name: '',
        slug: '',
        description: '',
        short_description: '',
        categories: '',
        price: '',
        stock: '',
        images: '',
        is_featured: false,
        is_new: false,
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create product:', error);
      toast.error('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(
        `${API}/admin/orders/${orderId}/status?new_status=${status}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Order status updated');
      fetchData();
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  if (!user || user.role !== 'admin') return null;

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl text-foreground/60">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" data-testid="admin-dashboard">
      <Navbar />

      <div className="flex-grow py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h1 className="text-4xl md:text-5xl font-heading font-semibold text-primary mb-12">Admin Dashboard</h1>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl border border-border/50" data-testid="stat-products">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-foreground/60">Total Products</div>
                    <div className="text-3xl font-bold text-primary mt-2">{stats.total_products}</div>
                  </div>
                  <Package className="h-12 w-12 text-primary/20" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-border/50" data-testid="stat-orders">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-foreground/60">Total Orders</div>
                    <div className="text-3xl font-bold text-primary mt-2">{stats.total_orders}</div>
                  </div>
                  <ShoppingCart className="h-12 w-12 text-primary/20" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-border/50" data-testid="stat-users">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-foreground/60">Total Users</div>
                    <div className="text-3xl font-bold text-primary mt-2">{stats.total_users}</div>
                  </div>
                  <Users className="h-12 w-12 text-primary/20" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-border/50" data-testid="stat-revenue">
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

          {/* Create Product Button */}
          <div className="mb-8">
            <Button
              onClick={() => setShowProductForm(!showProductForm)}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
              data-testid="toggle-product-form"
            >
              {showProductForm ? 'Cancel' : 'Create New Product'}
            </Button>
          </div>

          {/* Product Form */}
          {showProductForm && (
            <div className="bg-white p-8 rounded-xl border border-border/50 mb-12">
              <h2 className="text-2xl font-heading font-semibold text-primary mb-6">Create New Product</h2>
              <form onSubmit={handleCreateProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                      className="rounded-lg mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={productForm.slug}
                      onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                      required
                      className="rounded-lg mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="short_description">Short Description</Label>
                  <Input
                    id="short_description"
                    value={productForm.short_description}
                    onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })}
                    className="rounded-lg mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    required
                    rows={4}
                    className="rounded-lg mt-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="price">Price (NPR) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                      className="rounded-lg mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      required
                      className="rounded-lg mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="categories">Categories (comma-separated)</Label>
                  <Input
                    id="categories"
                    value={productForm.categories}
                    onChange={(e) => setProductForm({ ...productForm, categories: e.target.value })}
                    placeholder="sweets, groceries"
                    className="rounded-lg mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="images">Image URLs (comma-separated) *</Label>
                  <Textarea
                    id="images"
                    value={productForm.images}
                    onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                    required
                    rows={3}
                    className="rounded-lg mt-2"
                  />
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={productForm.is_featured}
                      onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                      className="rounded"
                    />
                    <span>Featured Product</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={productForm.is_new}
                      onChange={(e) => setProductForm({ ...productForm, is_new: e.target.checked })}
                      className="rounded"
                    />
                    <span>New Arrival</span>
                  </label>
                </div>

                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white rounded-full px-8" data-testid="create-product-button">
                  {loading ? 'Creating...' : 'Create Product'}
                </Button>
              </form>
            </div>
          )}

          {/* Orders Management */}
          <div className="bg-white p-8 rounded-xl border border-border/50">
            <h2 className="text-2xl font-heading font-semibold text-primary mb-6">Recent Orders</h2>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-foreground/60">No orders yet</div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="p-6 border border-border/50 rounded-lg space-y-4" data-testid={`admin-order-${order.id}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-foreground">Order #{order.order_number}</div>
                        <div className="text-sm text-foreground/60">{order.name} - {order.phone}</div>
                        <div className="text-sm text-foreground/60 mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
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
                        <Select
                          value={order.order_status}
                          onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-[180px] rounded-lg" data-testid={`status-select-${order.id}`}>
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
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;