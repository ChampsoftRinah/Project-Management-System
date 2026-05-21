import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any;
  token: string | null;
  tenant_id: string | null;
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tenant_id, setTenantId] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('jwt_token');

    if (savedToken) {
      try {
        const decoded = JSON.parse(atob(savedToken.split('.')[1]));

        setToken(savedToken);
        setUser(decoded);
        setTenantId(decoded.tenant_id || null);
        setRoles(decoded.roles || []);
      } catch (err) {
        console.error('Invalid token found in storage');
        localStorage.removeItem('jwt_token');
      }
    }

    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    setTenantId(newUser.tenant_id);
    setRoles(newUser.roles || []);

    localStorage.setItem('jwt_token', newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setTenantId(null);
    setRoles([]);

    localStorage.removeItem('jwt_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        tenant_id,
        roles,
        login,
        logout,
        isAuthenticated: !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
