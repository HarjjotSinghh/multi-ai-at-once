'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Sparkles, History, Settings, Zap } from 'lucide-react';

const navItems = [
  { href: '/', label: 'NEXUS', icon: Zap },
  { href: '/history', label: 'ARCHIVES', icon: History },
  { href: '/settings', label: 'SYSTEM', icon: Settings },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-white/5 bg-cyber-black/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="relative">
                <div className="absolute inset-0 bg-neon-blue blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <Zap className="w-6 h-6 text-neon-blue relative z-10" />
            </div>
            <h1 className="text-xl md:text-2xl font-display font-bold text-white tracking-widest uppercase select-none group-hover:text-glow-green transition-all duration-300">
              MULTI_AI<span className="text-neon-blue">_NEXUS</span>
            </h1>
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
          </nav>
        </div>
      </div>
    </header>
  );
}
