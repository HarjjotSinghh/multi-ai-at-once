'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { Sparkles, History, Settings, Zap, LogOut, LogIn, User, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store';

const navItems = [
  { href: '/', label: 'NEXUS', icon: Zap },
  { href: '/history', label: 'ARCHIVES', icon: History },
  { href: '/settings', label: 'SYSTEM', icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    router.push('/');
  };

  return (
    <header className="border-b border-white/5 bg-cyber-black/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="relative">
                <div className="absolute inset-0 bg-neon-blue blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <Zap className="w-6 h-6 text-neon-blue relative z-10" />
            </div>
            <Link href="/">
              <h1 className="text-xl md:text-2xl font-display font-bold text-white tracking-widest uppercase select-none group-hover:text-glow-green transition-all duration-300">
                MULTI_AI<span className="text-neon-blue">_NEXUS</span>
              </h1>
            </Link>
          </div>

          <nav className="flex items-center gap-1 md:gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 border-b-2',
                    isActive
                      ? 'text-neon-green border-neon-green bg-neon-green/5 shadow-[0_0_15px_rgba(0,255,157,0.1)]'
                      : 'text-cyber-text-muted border-transparent hover:text-neon-blue hover:border-neon-blue/50 hover:bg-neon-blue/5'
                  )}
                >
                  <Icon className={cn("w-3 h-3", isActive ? "text-neon-green" : "text-cyber-text-muted group-hover:text-neon-blue")} />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* Auth Section */}
            <div className="relative">
              {isAuthenticated && user ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 border-b-2 text-neon-green border-neon-green/50 hover:border-neon-green"
                  >
                    <User className="w-3 h-3" />
                    <span className="hidden md:inline">{user.email.split('@')[0]}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-black border border-neon-green/30 rounded shadow-lg">
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm font-medium text-white">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/auth/sign-in"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 border-b-2 text-cyber-text-muted border-transparent hover:text-neon-green hover:border-neon-green/50 hover:bg-neon-green/5"
                >
                  <LogIn className="w-3 h-3" />
                  <span className="hidden md:inline">Sign In</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
