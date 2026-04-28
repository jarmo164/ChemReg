import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  error?: string;
  helperText?: string;
}

const Input = ({ label, id, className = '', error, helperText, ...props }: InputProps) => {
  const describedBy = helperText || error ? `${id}-help` : undefined;

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${id}-help`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-help`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default Input;
