import React from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onActionClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actionText, onActionClick }) => {
  return (
    <div className="text-center p-12 border-2 border-dashed border-gray-300 dark:border-navy-gray-light rounded-lg">
      <div className="mx-auto h-12 w-12 text-gray-400">{icon}</div>
      <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {actionText && onActionClick && (
        <div className="mt-6">
          <Button onClick={onActionClick}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;