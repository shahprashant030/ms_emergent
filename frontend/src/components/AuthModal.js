import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthModal = ({ open, onClose }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [displayOtp, setDisplayOtp] = useState('');
  const { login } = useAuth();

  const sendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/send-otp`, { phone });
      setDisplayOtp(response.data.otp);
      setStep('otp');
      toast.success('OTP sent successfully');
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/verify-otp`, { phone, otp });
      login(response.data.token, response.data.user);
      toast.success('Login successful!');
      onClose();
      resetForm();
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPhone('');
    setOtp('');
    setStep('phone');
    setDisplayOtp('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="auth-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-primary">Welcome to Mithila Sutra</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 'phone' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9812345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-lg"
                  data-testid="phone-input"
                />
              </div>
              <Button
                onClick={sendOtp}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6"
                data-testid="send-otp-button"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="rounded-lg"
                  maxLength={6}
                  data-testid="otp-input"
                />
                {displayOtp && (
                  <p className="text-sm text-muted-foreground" data-testid="otp-display">
                    Your OTP: <span className="font-bold text-primary">{displayOtp}</span>
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <Button
                  onClick={verifyOtp}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6"
                  data-testid="verify-otp-button"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Button
                  onClick={() => setStep('phone')}
                  variant="ghost"
                  className="w-full"
                  data-testid="back-button"
                >
                  Back to Phone Number
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;