import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseClasses = 'font-medium rounded transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    // Primary CTA per spec: baseWhite background, black text
    primary: 'bg-baseWhite text-black border border-baseWhite hover:bg-gray4 hover:text-primary hover:border-gray4',
    // Secondary CTA per spec: BG gray3, border gray4
    secondary: 'bg-gray3 text-primary border border-gray4 hover:bg-gray4',
    // Tertiary CTA per spec: BG gray2, border gray4
    ghost: 'bg-gray2 text-primary border border-gray4 hover:bg-gray3'
  } as const;
  
  const sizeClasses = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-2 px-4 text-sm',
    lg: 'py-3 px-6 text-base'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

