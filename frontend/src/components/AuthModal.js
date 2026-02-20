import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import * as DialogPrimitive from '@radix-ui/react-dialog';

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
    <DialogPrimitive.Root open={open} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
          data-testid="auth-modal"
        >
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <DialogPrimitive.Title className="text-2xl font-heading text-primary font-semibold">
              Welcome to Mithila Sutra
            </DialogPrimitive.Title>
          </div>

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
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default AuthModal;