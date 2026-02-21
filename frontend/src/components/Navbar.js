import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_nepal-heritage-shop/artifacts/y8zofolg_Mithila%20Sutra%20Final.png';

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [showAuth, setShowAuth] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav className="backdrop-blur-md bg-background/80 border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-24">
            <Link to="/" className="flex items-center space-x-3">
              <img src={LOGO_URL} alt="Mithila Sutra Logo" className="h-14 w-auto" />
            </Link>

            {/* Desktop Search - Made bigger */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-12">
              <form onSubmit={handleSearch} className="w-full flex gap-3">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl h-14 text-lg px-6 border-2 border-border/60 focus:border-primary"
                  data-testid="search-input-desktop"
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-xl h-14 w-14 p-0" data-testid="search-button-desktop">
                  <Search className="h-6 w-6" />
                </Button>
              </form>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
                className="md:hidden"
              >
                <Search className="h-5 w-5" />
              </Button>

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
                  {user.role === 'admin' && (
                    <Link to="/admin">
                      <Button variant="ghost" className="hidden md:inline-flex" data-testid="admin-link">
                        Admin
                      </Button>
                    </Link>
                  )}
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

              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)} data-testid="mobile-menu-button">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Search - Made bigger */}
          {showSearch && (
            <div className="md:hidden pb-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl h-12 text-base px-4"
                  data-testid="search-input-mobile"
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 w-12 p-0" data-testid="search-button-mobile">
                  <Search className="h-5 w-5" />
                </Button>
              </form>
            </div>
          )}

          {/* Mobile Menu - Simplified without categories */}
          {mobileMenu && (
            <div className="md:hidden py-4 space-y-3 border-t border-border/50">
              <Link to="/products" className="block py-2 text-foreground hover:text-primary transition-colors font-medium" onClick={() => setMobileMenu(false)}>
                All Products
              </Link>
              {user && user.role === 'admin' && (
                <Link to="/admin" className="block py-2 text-foreground hover:text-primary transition-colors font-medium" onClick={() => setMobileMenu(false)}>
                  Admin Dashboard
                </Link>
              )}
              {!user && (
                <Button onClick={() => { setShowAuth(true); setMobileMenu(false); }} className="w-full bg-primary text-white rounded-full">
                  Login
                </Button>
              )}
              {user && (
                <Button onClick={() => { logout(); setMobileMenu(false); }} className="w-full bg-destructive text-white rounded-full">
                  Logout
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
