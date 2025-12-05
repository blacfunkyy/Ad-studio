import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, isLoading = false, className, ...props }) => {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500 transition-all duration-300 ${className}`}
    >
      {isLoading && <Spinner className="-ml-1 mr-3 h-5 w-5 text-white" />}
      {children}
    </button>
  );
};

export default Button;