import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Phone, Mail, X } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = "614791950966-7krrc5peh48hdh26nh5ov5e3ql98egbh.apps.googleusercontent.com";
const REDIRECT_URI = `${window.location.origin}/auth/callback`;

const AuthModal = ({ open, onClose }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('choose'); // 'choose', 'phone', 'otp'
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

  const handleGoogleLogin = () => {
    // Generate state for security
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('google_auth_state', state);
    
    // Construct Google OAuth URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('state', state);
    googleAuthUrl.searchParams.set('prompt', 'select_account');
    
    // Open Google OAuth in a popup
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      googleAuthUrl.toString(),
      'Google Sign In',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for message from popup
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        const { session_id } = event.data;
        
        try {
          setLoading(true);
          const response = await axios.post(`${API}/auth/google/session`, null, {
            params: { session_id }
          });
          
          login(response.data.token, response.data.user);
          toast.success('Login successful!');
          onClose();
          resetForm();
        } catch (error) {
          console.error('Google auth error:', error);
          toast.error('Google login failed. Please try again.');
        } finally {
          setLoading(false);
        }
        
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);
  };

  const resetForm = () => {
    setPhone('');
    setOtp('');
    setStep('choose');
    setDisplayOtp('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-xl"
          data-testid="auth-modal"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col space-y-1.5 text-center">
            <DialogPrimitive.Title className="text-2xl font-heading text-primary font-semibold">
              Welcome to Mithila Sutra
            </DialogPrimitive.Title>
            <p className="text-sm text-foreground/60">
              Sign in to continue shopping
            </p>
          </div>

          <div className="space-y-4 py-4">
            {step === 'choose' && (
              <>
                {/* Google Sign In */}
                <Button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  variant="outline"
                  className="w-full py-6 rounded-xl flex items-center justify-center gap-3 hover:bg-muted"
                  data-testid="google-login-button"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                {/* Phone Sign In */}
                <Button
                  onClick={() => setStep('phone')}
                  variant="outline"
                  className="w-full py-6 rounded-xl flex items-center justify-center gap-3 hover:bg-muted"
                  data-testid="phone-login-button"
                >
                  <Phone className="h-5 w-5" />
                  Continue with Phone
                </Button>
              </>
            )}

            {step === 'phone' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl h-12"
                    data-testid="phone-input"
                  />
                </div>
                <Button
                  onClick={sendOtp}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6"
                  data-testid="send-otp-button"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>
                <Button
                  onClick={() => setStep('choose')}
                  variant="ghost"
                  className="w-full"
                >
                  Back to login options
                </Button>
              </>
            )}

            {step === 'otp' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP sent to {phone}</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="rounded-xl h-12 text-center text-xl tracking-widest"
                    maxLength={6}
                    data-testid="otp-input"
                  />
                  {displayOtp && (
                    <p className="text-sm text-muted-foreground text-center" data-testid="otp-display">
                      Your OTP: <span className="font-bold text-primary">{displayOtp}</span>
                    </p>
                  )}
                </div>
                <Button
                  onClick={verifyOtp}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6"
                  data-testid="verify-otp-button"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Button
                  onClick={() => setStep('phone')}
                  variant="ghost"
                  className="w-full"
                >
                  Change phone number
                </Button>
              </>
            )}
          </div>

          <p className="text-xs text-center text-foreground/50">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-primary hover:underline">Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default AuthModal;
