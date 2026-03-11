import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary:
    'bg-coral-500 text-white hover:bg-coral-600 active:bg-coral-700 shadow-sm',
  secondary:
    'bg-white text-warm-700 border border-warm-200 hover:bg-warm-50 active:bg-warm-100 dark:bg-warm-800 dark:text-warm-200 dark:border-warm-600 dark:hover:bg-warm-700',
  ghost:
    'text-warm-600 hover:bg-warm-100 active:bg-warm-200 dark:text-warm-300 dark:hover:bg-warm-800',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  success:
    'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
