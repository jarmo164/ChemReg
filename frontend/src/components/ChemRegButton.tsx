import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const baseStyles = 'py-2 px-4 rounded-[var(--radius-md)] font-medium text-sm cursor-pointer transition-colors shadow-sm inline-flex items-center justify-center';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary',
  secondary: 'bg-secondary text-[var(--gpv-gray-900)] hover:bg-secondary',
  outline: 'bg-outline hover:bg-outline',
  danger: 'bg-danger text-white hover:bg-danger',
};

const ChemRegButton = ({ children, type = 'button', variant = 'primary', className = '', ...props }: ButtonProps) => {
  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default ChemRegButton;
