'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import AuthRedirect from '@/components/ui/AuthRedirect';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { signUp, signInWithGoogleProvider } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    
    try {
      const result = await signUp(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Failed to create an account');
      console.error(err);
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    
    try {
      const result = await signInWithGoogleProvider();
      if (result.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Failed to sign in with Google');
      console.error(err);
    }
    
    setGoogleLoading(false);
  };

  return (
    <AuthRedirect redirectAuthenticated="/dashboard">
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-dark">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 shadow-md border border-border">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary">BeAI</h1>
            <p className="mt-2 text-sm text-secondary">Create your account</p>
          </div>
          
          {error && (
            <div className="rounded-md bg-red-900/20 p-4 border border-red-800">
              <div className="text-sm text-red-400">{error}</div>
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-border bg-dark px-3 py-2 text-primary shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-primary">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-border bg-dark px-3 py-2 text-primary shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-border bg-dark px-3 py-2 text-primary shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-accent px-4 py-2 text-dark shadow-sm hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-dark disabled:opacity-75"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </div>
          </form>
          
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-secondary">Or continue with</span>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="flex w-full items-center justify-center rounded-md border border-border bg-dark px-4 py-2 text-sm font-medium text-primary shadow-sm hover:bg-dark/80 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-dark disabled:opacity-75"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" width="24" height="24">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              {googleLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
          
          <div className="mt-4 text-center text-sm">
            <p className="text-secondary">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-accent hover:text-accent/80">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthRedirect>
  );
} 