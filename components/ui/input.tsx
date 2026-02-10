import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, fullWidth = false, ...props }, ref) => {
    const baseStyles = 'w-full px-4 py-3 bg-brand-surface border border-brand-border text-gray-300 font-tech focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    
    return (
      <div className={fullWidth ? 'w-full' : 'inline-block'}>
        {label && (
          <label className="block mb-1 text-xs font-display text-gray-500 uppercase tracking-widest ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={cn(baseStyles, error ? 'border-red-500' : '', className)}
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)'
            }}
            {...props}
          />
          {/* Decorative corner accent */}
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-brand-border pointer-events-none" 
               style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }} />
        </div>
        {error && <span className="text-red-500 text-xs mt-1 font-tech block">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
