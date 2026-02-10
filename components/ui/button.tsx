import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-display uppercase tracking-widest font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-brand-orange text-black hover:bg-orange-500 active:scale-95 shadow-lg shadow-orange-900/20',
      secondary: 'bg-brand-surface text-gray-300 border border-brand-border hover:text-white hover:border-brand-orange active:scale-95',
      outline: 'bg-transparent border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-black active:scale-95',
      ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-brand-surface active:scale-95',
    };

    const sizes = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-xl',
    };

    const width = fullWidth ? 'w-full' : '';

    // "Machined" cut corner style using clip-path
    const clipPathStyle = {
      clipPath: variant !== 'ghost' ? 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' : 'none',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], width, className)}
        style={clipPathStyle}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
