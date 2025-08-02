import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "@/lib/api";

type User = {
  userId: number;
  code: string;
  userType: number;
  emailId?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (emailId: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(()=>{const token = localStorage.getItem("token"); return !!token;});
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  const login = async (emailId: string, password: string) => {
    try {
      const res = await api.post("/user-master/login", { emailId, password });
      const { token } = res.data as { token: string };
      // Decode token to get user info (or get from backend response)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userObj: User = { userId: payload.userId, code: payload.code, userType: payload.userType, emailId };
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userObj));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true);
      setUser(userObj);
      return true;
    } catch (e) {
      console.error("Login error", e);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}