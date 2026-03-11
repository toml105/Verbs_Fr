import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'coral' | 'amber' | 'emerald' | 'violet' | 'red';
  size?: 'sm' | 'md';
}

const variantStyles = {
  default: 'bg-warm-100 text-warm-600 dark:bg-warm-700 dark:text-warm-300',
  coral: 'bg-coral-50 text-coral-600 dark:bg-coral-900/30 dark:text-coral-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
}
