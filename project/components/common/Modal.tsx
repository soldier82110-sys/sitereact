import React, { ReactNode } from 'react';
import { CloseIcon } from '../icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className={`bg-off-white dark:bg-navy-gray-dark rounded-2xl shadow-2xl w-full m-4 p-6 relative ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-navy-gray-light">
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-navy-gray-light" aria-label="بستن مودال">
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;