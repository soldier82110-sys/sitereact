import React, { useEffect } from 'react';
import { CloseIcon, CheckCircleIcon, XCircleIcon } from '../icons';

interface ToastProps {
  message: string;
  onClose: () => void;
  visible: boolean;
  type?: 'success' | 'error';
}

const Toast: React.FC<ToastProps> = ({ message, onClose, visible, type = 'success' }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  const typeStyles = {
    success: {
      bg: 'bg-green-500',
      icon: <CheckCircleIcon className="w-6 h-6" />,
    },
    error: {
      bg: 'bg-brick',
      icon: <XCircleIcon className="w-6 h-6" />,
    },
  };

  return (
    <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${visible ? 'animate-toast-in' : 'animate-toast-out'}`}>
        <div className={`${typeStyles[type].bg} text-white font-semibold rounded-lg shadow-2xl px-6 py-3 flex items-center gap-4`}>
            {typeStyles[type].icon}
            <span>{message}</span>
            <button onClick={onClose} aria-label="بستن اعلان" className="p-1 rounded-full hover:bg-black/10">
                <CloseIcon className="w-5 h-5" />
            </button>
        </div>
    </div>
  );
};

export default Toast;