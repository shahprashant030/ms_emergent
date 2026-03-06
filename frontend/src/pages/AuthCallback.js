import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      window.opener?.postMessage({ type: 'GOOGLE_AUTH_ERROR', error }, window.location.origin);
      window.close();
      return;
    }

    if (code) {
      // For now, we'll send a mock session_id
      // In production, this code would be exchanged for tokens on the backend
      const session_id = code;
      
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_SUCCESS',
        session_id
      }, window.location.origin);
      
      window.close();
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-foreground/70">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
