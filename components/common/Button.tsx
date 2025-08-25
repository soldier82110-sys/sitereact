import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseClasses = 'px-6 py-2.5 rounded-lg font-semibold shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-navy-gray-dark';
  
  const variantClasses = {
    primary: 'bg-turquoise text-white hover:bg-turquoise-light dark:bg-turquoise-light dark:text-navy-gray-dark dark:hover:bg-turquoise focus:ring-turquoise',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-navy-gray-light dark:text-gray-200 dark:hover:bg-navy-gray focus:ring-gray-400',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
