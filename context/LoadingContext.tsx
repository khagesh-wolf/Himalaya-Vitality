
import React, { createContext, useContext, useState } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  setIsLoading: (loading: boolean, message?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setLoadingState] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');

  const setIsLoading = (loading: boolean, message: string = 'Processing...') => {
    setLoadingState(loading);
    setLoadingMessage(message);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, loadingMessage, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useLoading must be used within LoadingProvider');
  return context;
};
