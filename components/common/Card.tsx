import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/70 dark:bg-navy-gray/70 backdrop-blur-xl rounded-2xl shadow-lg dark:shadow-2xl p-8 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
