import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, LoginRequest, SignupRequest, AuthState } from '../types';
import {
  login as apiLogin,
  signup as apiSignup,
  getCurrentUser,
  setAuthToken,
  getStoredToken,
} from '../lib/api';

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Load user on mount if token exists
  useEffect(() => {
    async function loadUser() {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          setToken(storedToken);
        } catch {
          // Token invalid, clear it
          setAuthToken(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await apiLogin(data);
    setAuthToken(response.access_token);
    setToken(response.access_token);
    const userData = await getCurrentUser();
    setUser(userData);
  }, []);

  const signup = useCallback(async (data: SignupRequest) => {
    await apiSignup(data);
    // After signup, log in automatically
    await login({ email: data.email, password: data.password });
  }, [login]);

  const logout = useCallback(() => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
