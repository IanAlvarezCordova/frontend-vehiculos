// context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  roles: string[];
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [roles, setRoles] = useState<string[]>(authService.getRoles());

  const login = () => {
    setIsAuthenticated(true);
    setRoles(authService.getRoles());
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setRoles([]);
  };

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    setRoles(authService.getRoles());
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, roles, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};