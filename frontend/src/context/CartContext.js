import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('session_id');
    if (!id) {
      id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('session_id', id);
    }
    return id;
  });

  useEffect(() => {
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = token ? {} : { session_id: sessionId };
      const response = await axios.get(`${API}/cart`, { headers, params });
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const addToCart = async (productId, quantity = 1, variantName = null) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = token ? {} : { session_id: sessionId };
      await axios.post(
        `${API}/cart/add`,
        { product_id: productId, quantity, variant_name: variantName },
        { headers, params }
      );
      await fetchCart();
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = token ? {} : { session_id: sessionId };
      await axios.delete(`${API}/cart/item/${productId}`, { headers, params });
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  const clearCart = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = token ? {} : { session_id: sessionId };
      await axios.delete(`${API}/cart/clear`, { headers, params });
      await fetchCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, fetchCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);