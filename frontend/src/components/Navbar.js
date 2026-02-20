import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import AuthModal from './AuthModal';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [showAuth, setShowAuth] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <>
      <nav className="backdrop-blur-md bg-background/80 border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center space-x-3">
              <div className="text-3xl font-heading font-bold text-primary tracking-tight">Mithila Sutra</div>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/products" className="text-foreground hover:text-primary transition-colors duration-300 font-medium">
                Products
              </Link>
              <Link to="/products?category=sweets" className="text-foreground hover:text-primary transition-colors duration-300 font-medium">
                Sweets
              </Link>
              <Link to="/products?category=groceries" className="text-foreground hover:text-primary transition-colors duration-300 font-medium">
                Groceries
              </Link>
              <Link to="/products?category=clothing" className="text-foreground hover:text-primary transition-colors duration-300 font-medium">
                Clothing
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/cart" className="relative" data-testid="cart-icon">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" data-testid="cart-count">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/orders">
                    <Button variant="ghost" size="icon" data-testid="profile-icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={logout} className="hidden md:inline-flex" data-testid="logout-button">
                    Logout
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowAuth(true)} className="hidden md:inline-flex bg-primary hover:bg-primary/90 text-white rounded-full px-6" data-testid="login-button">
                  Login
                </Button>
              )}

              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {mobileMenu && (
            <div className="md:hidden py-4 space-y-3 border-t border-border/50">
              <Link to="/products" className="block py-2 text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenu(false)}>
                Products
              </Link>
              <Link to="/products?category=sweets" className="block py-2 text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenu(false)}>
                Sweets
              </Link>
              <Link to="/products?category=groceries" className="block py-2 text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenu(false)}>
                Groceries
              </Link>
              <Link to="/products?category=clothing" className="block py-2 text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenu(false)}>
                Clothing
              </Link>
              {!user && (
                <Button onClick={() => { setShowAuth(true); setMobileMenu(false); }} className="w-full bg-primary text-white rounded-full">
                  Login
                </Button>
              )}
            </div>
          )}
        </div>
      </nav>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
};