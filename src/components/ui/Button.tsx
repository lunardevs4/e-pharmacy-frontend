import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-semibold transition-all rounded-lg disabled:opacity-50 disabled:pointer-events-none';
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variants = {
    primary: 'bg-pharmacy-500 hover:bg-pharmacy-600 text-white shadow-sm hover:shadow',
    secondary: 'bg-pharmacy-100 hover:bg-pharmacy-200 text-pharmacy-800',
    outline: 'border border-pharmacy-500 text-pharmacy-700 hover:bg-pharmacy-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white',
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};