import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<any | null>(null);

  useEffect(() => {
    const loadAuth = async () => {
      const storedToken = await localStorage.getItem("token");
      const storedUser = await localStorage.getItem("user");
      if (storedToken) {
        setTokenState(storedToken);
      }
      if (storedUser) {
        try {
          setUserState(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("user");
        }
      }
    };
    loadAuth();
  }, []);

  const setToken = async (newToken: string | null) => {
    if (newToken) {
      await localStorage.setItem("token", newToken);
    } else {
      await localStorage.removeItem("token");
    }
    setTokenState(newToken);
  };

  const setUser = async (newUser: any | null) => {
    if (newUser) {
      await localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      await localStorage.removeItem("user");
    }
    setUserState(newUser);
  };

  const logout = async () => {
    await localStorage.removeItem("token");
    await localStorage.removeItem("user");
    setTokenState(null);
    setUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, setToken, setUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
