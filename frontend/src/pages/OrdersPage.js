import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-secondary" />;
      case 'confirmed':
      case 'packed':
        return <Package className="h-5 w-5 text-accent" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-accent" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-accent" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl text-foreground/60">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" data-testid="orders-page">
      <Navbar />

      <div className="flex-grow py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h1 className="text-4xl md:text-5xl font-heading font-semibold text-primary mb-12">My Orders</h1>

          {orders.length === 0 ? (
            <div className="text-center py-20 space-y-6" data-testid="no-orders">
              <Package className="h-24 w-24 mx-auto text-foreground/20" />
              <div className="text-2xl font-heading text-foreground/60">No orders yet</div>
              <Button
                onClick={() => navigate('/products')}
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6"
                data-testid="start-shopping-button"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6" data-testid="orders-list">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-6 md:p-8 rounded-xl border border-border/50"
                  data-testid={`order-${order.id}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                      <div className="text-2xl font-heading font-semibold text-primary" data-testid="order-number">
                        Order #{order.order_number}
                      </div>
                      <div className="text-sm text-foreground/60 mt-1">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2" data-testid="order-status">
                      {getStatusIcon(order.order_status)}
                      <span className="font-medium">{getStatusText(order.order_status)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-3 border-b border-border/30 last:border-0">
                        <div>
                          <div className="font-medium text-foreground">{item.product_name}</div>
                          <div className="text-sm text-foreground/60">Qty: {item.quantity}</div>
                        </div>
                        <div className="font-medium text-primary">NPR {item.total.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="text-sm text-foreground/60">Delivery Address</div>
                      <div className="font-medium text-foreground">{order.shipping_address}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-foreground/60">Total Amount</div>
                      <div className="text-2xl font-bold text-primary" data-testid="order-total">NPR {order.total.toFixed(2)}</div>
                      <div className="text-sm text-foreground/60 mt-1">{order.payment_method}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrdersPage;