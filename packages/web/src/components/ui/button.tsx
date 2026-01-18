'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const buttonStyles = {
  variant: {
    default: 'bg-neon-green/10 text-neon-green border border-neon-green hover:bg-neon-green hover:text-black shadow-[0_0_10px_rgba(0,255,157,0.2)] hover:shadow-[0_0_20px_rgba(0,255,157,0.6)] font-mono uppercase tracking-wider font-bold',
    ghost: 'text-cyber-text-muted hover:text-neon-blue hover:bg-neon-blue/5 font-mono uppercase tracking-widest',
    outline: 'border border-cyber-muted text-cyber-text hover:border-neon-pink hover:text-neon-pink hover:bg-neon-pink/5 hover:shadow-[0_0_15px_rgba(255,0,85,0.3)] font-mono uppercase tracking-widest',
  },
  size: {
    sm: 'px-4 py-1 text-xs',
    md: 'px-6 py-2 text-sm',
    lg: 'px-8 py-4 text-base',
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'relative rounded-none transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-neon-blue active:translate-y-[1px]',
          buttonStyles.variant[variant],
          buttonStyles.size[size],
          className
        )}
        {...props}
      >
        {children}
        {/* Corner accents for decoration */}
        {variant === 'default' && (
           <>
             <span className="absolute top-0 left-0 w-1 h-1 bg-neon-green"></span>
             <span className="absolute bottom-0 right-0 w-1 h-1 bg-neon-green"></span>
           </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
