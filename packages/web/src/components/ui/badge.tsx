'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'error' | 'warning';
}

const badgeStyles = {
  variant: {
    default: 'bg-cyber-gray border border-cyber-muted text-cyber-text',
    success: 'bg-neon-green/10 text-neon-green border border-neon-green shadow-[0_0_5px_rgba(0,255,157,0.2)]',
    error: 'bg-neon-pink/10 text-neon-pink border border-neon-pink shadow-[0_0_5px_rgba(255,0,85,0.2)]',
    warning: 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow shadow-[0_0_5px_rgba(250,255,0,0.2)]',
  },
};

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest',
        badgeStyles.variant[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
