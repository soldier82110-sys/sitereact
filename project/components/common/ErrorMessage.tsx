import React from 'react';
import { XCircleIcon } from '../icons';
import Button from './Button';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message = 'خطا در دریافت اطلاعات.', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center text-red-500 dark:text-red-400">
      <XCircleIcon className="w-16 h-16" />
      <h3 className="text-xl font-semibold">اوه! مشکلی پیش آمد</h3>
      <p>{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" className="!text-red-500">
          تلاش مجدد
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;