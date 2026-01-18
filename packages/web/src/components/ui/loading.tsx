'use client';

import { cn } from '@/lib/utils/cn';

export interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-2',
};

export function Loading({ className, size = 'md' }: LoadingProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-none border-neon-green/20 border-t-neon-green shadow-[0_0_10px_rgba(0,255,157,0.3)]',
        sizeStyles[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
