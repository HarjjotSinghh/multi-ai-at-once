'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-none border border-white/10 bg-cyber-dark/80 px-4 py-3 text-sm font-mono text-neon-green placeholder:text-cyber-text-muted/40 focus:outline-none focus:border-neon-green focus:shadow-[0_0_15px_rgba(0,255,157,0.15)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 backdrop-blur-sm',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
