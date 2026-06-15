import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authLogin, authMe, authRegister, type UserDTO } from "../lib/api";
import { clearToken, getToken, setToken } from "../lib/auth";

interface AuthCtx {
  user: UserDTO | null;
  isLoading: boolean;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) {
      setIsLoading(false);
      return;
    }
    authMe()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { token, user } = await authLogin({ email, password });
    setToken(token);
    setUser(user);
    navigate("/");
  }

  async function register(name: string, email: string, password: string) {
    const { token, user } = await authRegister({ name, email, password });
    setToken(token);
    setUser(user);
    navigate("/");
  }

  function logout() {
    clearToken();
    setUser(null);
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
