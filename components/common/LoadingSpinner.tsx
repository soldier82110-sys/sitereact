import React from 'react';
import { SpinnerIcon } from '../icons';

interface LoadingSpinnerProps {
  fullPage?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullPage = false, message = 'در حال بارگذاری...' }) => {
  if (fullPage) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-off-white/80 dark:bg-navy-gray-dark/80 z-50">
        <SpinnerIcon className="w-12 h-12 text-turquoise" />
        <p className="mt-4 text-lg font-semibold">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 p-8">
      <SpinnerIcon className="w-6 h-6 text-turquoise" />
      <span>{message}</span>
    </div>
  );
};

export default LoadingSpinner;