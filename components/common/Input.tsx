import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ className = '', icon, ...props }) => {
  return (
    <div className="relative">
      <input
        className={`w-full bg-off-white/50 dark:bg-navy-gray-dark/50 border border-gray-300 dark:border-navy-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise dark:focus:border-turquoise text-right transition-colors duration-300 ${icon ? 'pr-10' : 'px-4'} py-2.5 ${className}`}
        {...props}
      />
      {icon && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
          {icon}
        </div>
      )}
    </div>
  );
};

export default Input;