import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ToastState {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error') => void;
  toast: ToastState;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };
  
  return (
    <ToastContext.Provider value={{ showToast, toast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
