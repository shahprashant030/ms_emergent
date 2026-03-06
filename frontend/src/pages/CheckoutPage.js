import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import axios from 'axios';
import AuthModal from '@/components/AuthModal';
import { CreditCard, Wallet, Banknote, Truck } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Payment method configurations (ready for credential integration)
const PAYMENT_METHODS = [
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when you receive the order',
    icon: Truck,
    enabled: true,
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, AMEX',
    icon: CreditCard,
    enabled: true, // Ready for Stripe/Other integration
  },
  {
    id: 'khalti',
    name: 'Khalti',
    description: 'Pay with Khalti wallet',
    icon: Wallet,
    enabled: true, // Ready for Khalti integration
    logo: 'https://web.khalti.com/static/img/khalti-logo.svg',
  },
  {
    id: 'esewa',
    name: 'eSewa',
    description: 'Pay with eSewa wallet',
    icon: Wallet,
    enabled: true, // Ready for eSewa integration
    logo: 'https://esewa.com.np/common/images/esewa-logo.png',
  },
  {
    id: 'imepay',
    name: 'IME Pay',
    description: 'Pay with IME Pay',
    icon: Wallet,
    enabled: true, // Ready for IME Pay integration
    logo: 'https://www.imepay.com.np/images/logo.png',
  },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
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
        email: user.email || '',
        address: user.address || '',
      }));
    }

    fetchProductDetails();
  }, [user, cart, navigate]);

  const fetchProductDetails = async () => {
    try {
      const productPromises = cart.items.map((item) => axios.get(`${API}/products/${item.product_id}`));
      const responses = await Promise.all(productPromises);
      setProducts(responses.map((r) => r.data));
    } catch (error) {
      console.error('Failed to fetch product details:', error);
    }
  };

  // Payment processing functions (ready for integration)
  const processCardPayment = async (orderData) => {
    // TODO: Integrate with Stripe or other card processor
    // const stripe = await loadStripe(process.env.REACT_APP_STRIPE_KEY);
    // Create payment intent, handle 3D secure, etc.
    toast.info('Card payment integration coming soon. Please use COD for now.');
    return null;
  };

  const processKhaltiPayment = async (orderData) => {
    // TODO: Integrate with Khalti SDK
    // KhaltiCheckout.show({
    //   publicKey: process.env.REACT_APP_KHALTI_PUBLIC_KEY,
    //   productIdentity: orderData.order_number,
    //   productName: 'Mithila Sutra Order',
    //   productUrl: window.location.href,
    //   amount: orderData.total * 100, // paisa
    //   eventHandler: { onSuccess, onError, onClose }
    // });
    toast.info('Khalti payment integration coming soon. Please use COD for now.');
    return null;
  };

  const processEsewaPayment = async (orderData) => {
    // TODO: Integrate with eSewa
    // Form POST to eSewa payment URL with merchant_id, success_url, failure_url, etc.
    toast.info('eSewa payment integration coming soon. Please use COD for now.');
    return null;
  };

  const processIMEPayPayment = async (orderData) => {
    // TODO: Integrate with IME Pay API
    toast.info('IME Pay integration coming soon. Please use COD for now.');
    return null;
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
        shipping_address: `${formData.address}${formData.city ? ', ' + formData.city : ''}`,
        phone: formData.phone,
        name: formData.name,
        email: formData.email || null,
        notes: formData.notes || null,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'awaiting_payment',
      };

      // Process payment based on method
      if (paymentMethod === 'card') {
        const paymentResult = await processCardPayment(orderData);
        if (!paymentResult) {
          setLoading(false);
          return;
        }
      } else if (paymentMethod === 'khalti') {
        const paymentResult = await processKhaltiPayment(orderData);
        if (!paymentResult) {
          setLoading(false);
          return;
        }
      } else if (paymentMethod === 'esewa') {
        const paymentResult = await processEsewaPayment(orderData);
        if (!paymentResult) {
          setLoading(false);
          return;
        }
      } else if (paymentMethod === 'imepay') {
        const paymentResult = await processIMEPayPayment(orderData);
        if (!paymentResult) {
          setLoading(false);
          return;
        }
      }

      // For COD, directly create order
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

  const shippingFee = 0; // Free shipping
  const totalWithShipping = cartTotal + shippingFee;

  return (
    <div className="min-h-screen flex flex-col bg-muted" data-testid="checkout-page">
      <Navbar />

      <div className="flex-grow py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h1 className="text-4xl md:text-5xl font-heading font-semibold text-primary mb-12">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Shipping Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-xl border border-border/50 shadow-sm space-y-6">
                  <h2 className="text-xl font-heading font-semibold text-primary">Shipping Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="rounded-lg mt-2"
                        placeholder="Ram Bahadur"
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
                        placeholder="98XXXXXXXX"
                        data-testid="phone-input"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded-lg mt-2"
                        placeholder="your@email.com"
                        data-testid="email-input"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                        rows={3}
                        className="rounded-lg mt-2"
                        placeholder="House no, Street name, Landmark"
                        data-testid="address-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="rounded-lg mt-2"
                        placeholder="Kathmandu"
                        data-testid="city-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="rounded-lg mt-2"
                        placeholder="Special instructions"
                        data-testid="notes-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white p-8 rounded-xl border border-border/50 shadow-sm space-y-6">
                  <h2 className="text-xl font-heading font-semibold text-primary">Payment Method</h2>

                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    {PAYMENT_METHODS.filter(m => m.enabled).map((method) => (
                      <div
                        key={method.id}
                        className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          paymentMethod === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border/50 hover:border-primary/30'
                        }`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        <RadioGroupItem value={method.id} id={method.id} className="text-primary" />
                        <div className="flex items-center gap-4 flex-grow">
                          {method.logo ? (
                            <img src={method.logo} alt={method.name} className="h-8 w-auto object-contain" onError={(e) => e.target.style.display = 'none'} />
                          ) : (
                            <method.icon className="h-6 w-6 text-primary" />
                          )}
                          <div>
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-foreground/60">{method.description}</div>
                          </div>
                        </div>
                        {method.id !== 'cod' && (
                          <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">Coming Soon</span>
                        )}
                      </div>
                    ))}
                  </RadioGroup>

                  {paymentMethod !== 'cod' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
                      <strong>Note:</strong> Online payment integration is coming soon. For now, please select Cash on Delivery.
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl border border-border/50 shadow-sm space-y-6 sticky top-24" data-testid="order-summary">
                  <h2 className="text-xl font-heading font-semibold text-primary">Order Summary</h2>

                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {cart.items.map((item) => {
                      const product = getProductDetails(item.product_id);
                      if (!product) return null;

                      return (
                        <div key={item.product_id} className="flex gap-3">
                          <img
                            src={product.images?.[0] || 'https://via.placeholder.com/60'}
                            alt={product.name}
                            className="w-14 h-14 object-cover rounded-lg"
                          />
                          <div className="flex-grow">
                            <div className="font-medium text-sm line-clamp-1">{product.name}</div>
                            <div className="text-xs text-foreground/60">Qty: {item.quantity}</div>
                            <div className="text-sm font-medium text-primary">NPR {(item.price * item.quantity).toFixed(0)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-foreground/70">
                      <span>Subtotal</span>
                      <span>NPR {cartTotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-foreground/70">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t">
                      <span>Total</span>
                      <span data-testid="total-amount">NPR {totalWithShipping.toFixed(0)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || (paymentMethod !== 'cod')}
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                    data-testid="place-order-button"
                  >
                    {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay & Order'}
                  </Button>

                  <p className="text-xs text-center text-foreground/50">
                    By placing this order, you agree to our Terms & Conditions
                  </p>
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
