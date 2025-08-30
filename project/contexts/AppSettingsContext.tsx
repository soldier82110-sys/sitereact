import React, { createContext, useContext, ReactNode } from 'react';
import { AppSettings } from '../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAppSettings, updateAppSettings as apiUpdateSettings } from '../services/apiService';
import { LoadingSpinner, ErrorMessage } from '../components/common';

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, isError, error, refetch } = useQuery<AppSettings>({
    queryKey: ['appSettings'],
    queryFn: fetchAppSettings,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const mutation = useMutation({
      mutationFn: apiUpdateSettings,
      onSuccess: (data) => {
          // Optimistically update the settings in the cache
          queryClient.setQueryData(['appSettings'], (oldData: AppSettings | undefined) => oldData ? {...oldData, ...data} : data);
          // Or, for a full refresh:
          // queryClient.invalidateQueries({ queryKey: ['appSettings'] });
      },
      onError: (error: Error) => {
          // In a real app, you might show a toast notification here
          console.error("Error saving settings:", error.message);
      },
  });

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    mutation.mutate(newSettings);
  };
  
  if (isLoading) {
    return <LoadingSpinner fullPage message="در حال بارگذاری تنظیمات برنامه..." />;
  }

  if (isError || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-off-white dark:bg-navy-gray-dark">
        <ErrorMessage 
          message={`خطا در بارگذاری تنظیمات اصلی برنامه. (${error?.message})`} 
          onRetry={refetch} 
        />
      </div>
    );
  }
  
  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = (): AppSettingsContextType => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};