import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, FolderOpen, ShoppingCart, Users, UserCog, LogOut, Image, Ticket } from 'lucide-react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_nepal-heritage-shop/artifacts/y8zofolg_Mithila%20Sutra%20Final.png';

export const AdminNavbar = ({ currentTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'carousel', label: 'Carousel', icon: Image },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'admins', label: 'Admins', icon: UserCog },
  ];

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <img src={LOGO_URL} alt="Mithila Sutra" className="h-10 w-auto" />
            <span className="text-xl font-heading font-semibold text-primary">Admin Panel</span>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm text-foreground/70">
              {user?.name || user?.phone}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden pb-4 pt-2 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                  currentTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-muted text-foreground'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
