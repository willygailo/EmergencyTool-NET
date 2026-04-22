import { useState } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { setCredentials, logout } from '../store/authSlice';
import authService from '../services/authService';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user, token } = await authService.login(email, password);
      dispatch(setCredentials({ user, token }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return { user, isAuthenticated, login, logout: handleLogout, isLoading };
};

export default useAuth;