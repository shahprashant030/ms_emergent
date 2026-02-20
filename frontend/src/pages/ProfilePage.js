import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    setFormData({
      name: user.name || '',
      email: user.email || '',
      address: user.address || '',
    });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        `${API}/auth/profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: formData,
        }
      );
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col" data-testid="profile-page">
      <Navbar />

      <div className="flex-grow py-12 md:py-20">
        <div className="max-w-2xl mx-auto px-6 md:px-12">
          <h1 className="text-4xl md:text-5xl font-heading font-semibold text-primary mb-12">My Profile</h1>

          <div className="bg-white p-8 rounded-xl border border-border/50 space-y-6">
            <div className="pb-6 border-b border-border">
              <div className="text-sm text-foreground/60">Phone Number</div>
              <div className="text-xl font-medium text-foreground" data-testid="user-phone">{user.phone}</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-lg mt-2"
                  data-testid="name-input"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-lg mt-2"
                  data-testid="email-input"
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="rounded-lg mt-2"
                  data-testid="address-input"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 text-lg font-medium"
                data-testid="update-profile-button"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>

            <div className="pt-6 border-t border-border space-y-3">
              <Button
                onClick={() => navigate('/orders')}
                variant="outline"
                className="w-full rounded-full py-6"
                data-testid="view-orders-button"
              >
                View My Orders
              </Button>
              <Button
                onClick={logout}
                variant="ghost"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full py-6"
                data-testid="logout-button"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;