import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User } from '../types';
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '../services/apiService';

interface UserContextType {
  user: User;
  deductToken: () => void;
  addToken: (amount: number) => void;
  updateUser: (newDetails: Partial<User>) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: User = { name: 'شما', email: '', tokenBalance: 0 };

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User>('currentUser', defaultUser);

  // This query runs only on load if a token exists, to sync server state with local state.
  const { data: serverUser, isSuccess, isError } = useQuery({
    queryKey: ['validateUser'],
    queryFn: fetchCurrentUser,
    enabled: !!localStorage.getItem('authToken'),
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isSuccess && serverUser) {
      setUser(serverUser);
    }
  }, [isSuccess, serverUser, setUser]);

  useEffect(() => {
    if (isError) {
      // If the token is invalid, log the user out.
      localStorage.removeItem('authToken');
      setUser(defaultUser);
    }
  }, [isError, setUser]);


  const deductToken = () => {
    setUser(prevUser => ({
      ...prevUser,
      tokenBalance: prevUser.tokenBalance > 0 ? prevUser.tokenBalance - 1 : 0,
    }));
    // In a real app, this would be a mutation:
    // updateUserTokensMutation.mutate(-1);
  };

  const addToken = (amount: number) => {
    setUser(prevUser => ({
      ...prevUser,
      tokenBalance: prevUser.tokenBalance + amount,
    }));
     // In a real app, this would be a mutation:
    // updateUserTokensMutation.mutate(amount);
  };
  
  const updateUser = (newDetails: Partial<User>) => {
    setUser(prevUser => ({
      ...prevUser,
      ...newDetails
    }));
     // In a real app, this would be a mutation:
    // updateUserProfileMutation.mutate(newDetails);
  };

  const logout = () => {
      localStorage.removeItem('authToken');
      setUser(defaultUser);
  };

  return (
    <UserContext.Provider value={{ user, deductToken, addToken, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};