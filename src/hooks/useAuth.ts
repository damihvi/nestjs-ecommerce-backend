import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { UserRole } from '../types/roles';

interface User {
  id: string;
  email: string;
  roles: UserRole[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    loading: true,
    error: null,
  });

  // Cargar usuario al montar el componente
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setAuthState(prev => ({ ...prev, user, loading: false }));
        } else if (authState.token) {
          const response = await adminApi.get('/auth/profile');
          const user = response.data.data;
          localStorage.setItem('user', JSON.stringify(user));
          setAuthState(prev => ({ ...prev, user, loading: false }));
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setAuthState(prev => ({ 
          ...prev, 
          error: 'Error loading user', 
          loading: false,
          user: null,
          token: null
        }));
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    };

    loadUser();
  }, [authState.token]);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const response = await adminApi.post('/auth/login', { email, password });
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuthState({
        user,
        token,
        loading: false,
        error: null
      });

      return true;
    } catch (err) {
      console.error('Login error:', err);
      setAuthState(prev => ({ 
        ...prev, 
        error: 'Invalid credentials', 
        loading: false 
      }));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      token: null,
      loading: false,
      error: null
    });
  };

  const hasRole = (role: UserRole) => {
    return authState.user?.roles.includes(role) || false;
  };

  const hasAnyRole = (roles: UserRole[]) => {
    return roles.some(role => hasRole(role));
  };

  return {
    user: authState.user,
    token: authState.token,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.token,
    hasRole,
    hasAnyRole,
    login,
    logout
  };
};
