'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [alreadyVerified, setAlreadyVerified] = useState(false);

  // Password form
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setError('No verification token provided');
      setLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const res = await fetch(`/api/auth/verify?token=${token}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();

      if (data.success) {
        setEmail(data.email);
        setAlreadyVerified(data.alreadyVerified);
      } else {
        setError(data.error || 'Invalid token');
      }
    } catch (err) {
      setError('Failed to validate link');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      console.log('[VERIFY PAGE] Submitting password...');
      
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ token, password }),
        cache: 'no-store',
      });

      const data = await res.json();
      console.log('[VERIFY PAGE] Response:', data);

      if (data.success) {
        // Store session token
        const sessionToken = data.sessionToken;
        console.log('[VERIFY PAGE] Session token received:', sessionToken?.substring(0, 10) + '...');
        
        if (!sessionToken) {
          console.error('[VERIFY PAGE] No session token in response!');
          setError('Server error: No session token received');
          return;
        }

        // Store in localStorage
        localStorage.setItem('jeffy_session', sessionToken);
        
        // Verify it was stored
        const storedToken = localStorage.getItem('jeffy_session');
        console.log('[VERIFY PAGE] Token stored:', storedToken?.substring(0, 10) + '...');
        console.log('[VERIFY PAGE] Token match:', storedToken === sessionToken);
        
        if (storedToken !== sessionToken) {
          console.error('[VERIFY PAGE] Token storage mismatch!');
          setError('Failed to save session. Please try again.');
          return;
        }

        setDebugInfo(data.debug);
        setSuccess(true);
        
        // Redirect to my-wants after a moment
        console.log('[VERIFY PAGE] Will redirect in 2 seconds...');
        setTimeout(() => {
          // Double-check token is still there before redirect
          const finalCheck = localStorage.getItem('jeffy_session');
          console.log('[VERIFY PAGE] Final token check before redirect:', !!finalCheck);
          router.push('/my-wants');
        }, 2000);
      } else {
        setError(data.error || 'Failed to set password');
      }
    } catch (err: any) {
      console.error('[VERIFY PAGE] Error:', err);
      setError('Server error: ' + (err.message || 'Unknown'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error && !email) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href="/login" className="text-orange-600 font-medium hover:underline">
            Go to Login →
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Verified! 🎉</h1>
          <p className="text-gray-500 mb-4">Redirecting to your dashboard...</p>
          <Loader2 className="h-6 w-6 animate-spin text-orange-500 mx-auto" />
          
          {/* Debug info */}
          {debugInfo && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-left text-gray-600">
              <p>Session created: {debugInfo.sessionCreated ? '✓' : '✗'}</p>
              <p>Session verified: {debugInfo.sessionVerified ? '✓' : '✗'}</p>
              <p>Token length: {debugInfo.tokenLength}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (alreadyVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Already Verified</h1>
          <p className="text-gray-500 mb-6">Your email ({email}) is already verified. You can login now.</p>
          <Link 
            href="/login"
            className="inline-block bg-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-orange-600"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Set Your Password</h1>
          <p className="text-gray-500">
            For <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Type it again"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Create Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
