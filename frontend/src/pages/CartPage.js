import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, cartTotal } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
  }, [cart]);

  const fetchProductDetails = async () => {
    if (!cart.items || cart.items.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const productPromises = cart.items.map((item) => axios.get(`${API}/products/${item.product_id}`));
      const responses = await Promise.all(productPromises);
      setProducts(responses.map((r) => r.data));
    } catch (error) {
      console.error('Failed to fetch product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductDetails = (productId) => {
    return products.find((p) => p.id === productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl text-foreground/60">Loading cart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" data-testid="cart-page">
      <Navbar />

      <div className="flex-grow py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h1 className="text-4xl md:text-5xl font-heading font-semibold text-primary mb-12">Shopping Cart</h1>

          {!cart.items || cart.items.length === 0 ? (
            <div className="text-center py-20 space-y-6" data-testid="empty-cart">
              <ShoppingBag className="h-24 w-24 mx-auto text-foreground/20" />
              <div className="text-2xl font-heading text-foreground/60">Your cart is empty</div>
              <Link to="/products">
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6" data-testid="browse-products-button">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6" data-testid="cart-items">
                {cart.items.map((item) => {
                  const product = getProductDetails(item.product_id);
                  if (!product) return null;

                  return (
                    <div
                      key={item.product_id}
                      className="flex gap-6 p-6 bg-white rounded-xl border border-border/50"
                      data-testid={`cart-item-${item.product_id}`}
                    >
                      <Link to={`/product/${product.id}`} className="flex-shrink-0">
                        <img
                          src={product.images[0] || 'https://via.placeholder.com/150'}
                          alt={product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </Link>

                      <div className="flex-grow space-y-2">
                        <Link to={`/product/${product.id}`}>
                          <h3 className="text-xl font-medium text-foreground hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-foreground/60 text-sm line-clamp-2">{product.short_description}</p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="space-y-1">
                            <div className="text-xl font-bold text-primary">NPR {item.price * item.quantity}</div>
                            <div className="text-sm text-foreground/60">NPR {item.price} × {item.quantity}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            data-testid={`remove-item-${item.product_id}`}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-muted p-8 rounded-xl border border-border/50 sticky top-24 space-y-6" data-testid="order-summary">
                  <h2 className="text-2xl font-heading font-semibold text-primary">Order Summary</h2>

                  <div className="space-y-3">
                    <div className="flex justify-between text-foreground/70">
                      <span>Subtotal</span>
                      <span data-testid="cart-subtotal">NPR {cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-foreground/70">
                      <span>Shipping</span>
                      <span className="text-accent font-medium">Free</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between text-xl font-bold text-primary">
                      <span>Total</span>
                      <span data-testid="cart-total">NPR {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                    data-testid="proceed-to-checkout-button"
                  >
                    Proceed to Checkout
                  </Button>

                  <Link to="/products" className="block">
                    <Button variant="ghost" className="w-full" data-testid="continue-shopping-button">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;