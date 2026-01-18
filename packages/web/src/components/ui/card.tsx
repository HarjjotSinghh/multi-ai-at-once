'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-none border border-white/10 bg-cyber-dark/80 backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-neon-green/30',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6 border-b border-white/5 bg-cyber-black/50', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: CardProps) {
  return (
    <h3
      className={cn('text-sm font-display font-bold leading-none tracking-widest uppercase text-cyber-text', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: CardProps) {
  return (
    <div className={cn('p-6 pt-6', className)} {...props} />
  );
}
