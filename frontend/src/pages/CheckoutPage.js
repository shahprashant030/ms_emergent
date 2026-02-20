import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import axios from 'axios';
import AuthModal from '@/components/AuthModal';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    if (!cart.items || cart.items.length === 0) {
      navigate('/cart');
      return;
    }

    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
      }));
    }

    fetchProductDetails();
  }, [user, cart]);

  const fetchProductDetails = async () => {
    try {
      const productPromises = cart.items.map((item) => axios.get(`${API}/products/${item.product_id}`));
      const responses = await Promise.all(productPromises);
      setProducts(responses.map((r) => r.data));
    } catch (error) {
      console.error('Failed to fetch product details:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setShowAuth(true);
      toast.error('Please login to place order');
      return;
    }

    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const orderItems = cart.items.map((item) => {
        const product = products.find((p) => p.id === item.product_id);
        return {
          product_id: item.product_id,
          product_name: product?.name || 'Product',
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        };
      });

      const orderData = {
        items: orderItems,
        total: cartTotal,
        shipping_address: formData.address,
        phone: formData.phone,
        name: formData.name,
        notes: formData.notes || null,
      };

      const response = await axios.post(`${API}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Order placed successfully!');
      await clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProductDetails = (productId) => {
    return products.find((p) => p.id === productId);
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid="checkout-page">
      <Navbar />

      <div className="flex-grow py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h1 className="text-4xl md:text-5xl font-heading font-semibold text-primary mb-12">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Shipping Details */}
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-xl border border-border/50 space-y-6">
                  <h2 className="text-2xl font-heading font-semibold text-primary">Shipping Details</h2>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="rounded-lg mt-2"
                        data-testid="name-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="rounded-lg mt-2"
                        data-testid="phone-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Shipping Address *</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                        rows={4}
                        className="rounded-lg mt-2"
                        data-testid="address-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="rounded-lg mt-2"
                        placeholder="Any special instructions for delivery..."
                        data-testid="notes-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                <div className="bg-muted p-8 rounded-xl border border-border/50 space-y-6" data-testid="order-summary">
                  <h2 className="text-2xl font-heading font-semibold text-primary">Order Summary</h2>

                  <div className="space-y-4">
                    {cart.items.map((item) => {
                      const product = getProductDetails(item.product_id);
                      if (!product) return null;

                      return (
                        <div key={item.product_id} className="flex justify-between text-foreground">
                          <div className="flex-grow">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-foreground/60">Qty: {item.quantity}</div>
                          </div>
                          <div className="font-medium">NPR {(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex justify-between text-foreground/70">
                      <span>Subtotal</span>
                      <span>NPR {cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-foreground/70">
                      <span>Shipping</span>
                      <span className="text-accent font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-primary">
                      <span>Total</span>
                      <span data-testid="total-amount">NPR {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-border/50">
                      <div className="font-medium text-foreground mb-2">Payment Method</div>
                      <div className="text-foreground/70">Cash on Delivery (COD)</div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                      data-testid="place-order-button"
                    >
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
};

export default CheckoutPage;