import '@/index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import ProfilePage from '@/pages/ProfilePage';
import OrdersPage from '@/pages/OrdersPage';
import AdminDashboard from '@/pages/AdminDashboard';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import FAQPage from '@/pages/FAQPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import AuthCallback from '@/pages/AuthCallback';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
          <Toaster position="top-center" />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
