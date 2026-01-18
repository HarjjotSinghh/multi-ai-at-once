'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store';
import { Zap, UserPlus, Mail, Lock, User } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/get-session');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    checkAuth();
  }, [router, setUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('PASSWORD_MISMATCH');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('PASSWORD_COMPLEXITY_ERROR: MIN 8 CHARS');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'REGISTRATION_FAILED');
        return;
      }

      setUser(data.user);
      router.push('/dashboard');
    } catch (error) {
      setError('SYSTEM_ERROR: TRY AGAIN');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cyber-black bg-cyber-grid relative">
      {/* Background Glows */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-neon-pink/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-neon-blue/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-md w-full space-y-8 glass-panel p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-neon-pink/30 rounded-tr-3xl"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-neon-green/30 rounded-bl-3xl"></div>

        <div className="text-center relative z-10">
          <div className="flex justify-center mb-4">
             <div className="p-3 bg-cyber-black border border-neon-pink rounded-full shadow-[0_0_15px_rgba(255,0,85,0.3)]">
                <Zap className="w-8 h-8 text-neon-pink" />
             </div>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-widest uppercase mb-2">
            NEW_OPERATOR
          </h1>
          <p className="text-xs font-mono text-cyber-text-muted uppercase tracking-wider">
            INITIALIZE REGISTRATION SEQUENCE
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 relative z-10">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">OPERATOR_ID</Label>
              <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-cyber-text-muted" />
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-cyber-dark border border-white/10 rounded-none focus:outline-none focus:border-neon-pink text-white font-mono text-sm placeholder:text-cyber-text-muted/30"
                    placeholder="ENTER_NAME"
                  />
              </div>
            </div>

            <div>
              <Label htmlFor="email">CONTACT_UPLINK</Label>
              <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-cyber-text-muted" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-cyber-dark border border-white/10 rounded-none focus:outline-none focus:border-neon-pink text-white font-mono text-sm placeholder:text-cyber-text-muted/30"
                    placeholder="OPERATOR@NEXUS.AI"
                  />
              </div>
            </div>

            <div>
              <Label htmlFor="password">ACCESS_CODE</Label>
              <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-cyber-text-muted" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-cyber-dark border border-white/10 rounded-none focus:outline-none focus:border-neon-pink text-white font-mono text-sm placeholder:text-cyber-text-muted/30"
                    placeholder="••••••••"
                  />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">VERIFY_CODE</Label>
              <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-cyber-text-muted" />
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-cyber-dark border border-white/10 rounded-none focus:outline-none focus:border-neon-pink text-white font-mono text-sm placeholder:text-cyber-text-muted/30"
                    placeholder="••••••••"
                  />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 border border-neon-pink/50 bg-neon-pink/10 text-neon-pink text-xs font-mono uppercase tracking-wide">
                &gt; ERROR: {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-white hover:shadow-[0_0_20px_rgba(255,0,85,0.4)]"
            variant="outline"
          >
            {isLoading ? 'REGISTERING...' : 'CONFIRM_REGISTRATION'}
          </Button>
        </form>

        <div className="text-center relative z-10 space-y-4">
            <p className="text-xs font-mono text-cyber-text-muted uppercase tracking-wide">
            EXISTING_OPERATOR?{' '}
            <Link
                href="/auth/sign-in"
                className="text-neon-pink hover:text-white underline decoration-1 underline-offset-4 transition-colors"
            >
                ACCESS_PORTAL
            </Link>
            </p>

            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <div className="pt-4 border-t border-white/5">
                <Button
                type="button"
                variant="outline"
                onClick={() => {
                    window.location.href = '/api/auth/sign-up/social';
                }}
                className="w-full text-xs"
                >
                OAUTH_PROVIDER: GOOGLE
                </Button>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}
