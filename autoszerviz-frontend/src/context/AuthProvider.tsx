import { useState, useEffect, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await localStorage.getItem("token");
      if (storedToken) {
        setTokenState(storedToken);
      }
    };

    loadToken();
  }, []);

  const setToken = async (newToken: string | null) => {
    if (newToken) {
      await localStorage.setItem("token", newToken);
    } else {
      await localStorage.removeItem("token");
    }

    setTokenState(newToken);
  };

  const logout = async () => {
    await localStorage.removeItem("token");
    setTokenState(null);
  };

  return (
    <AuthContext.Provider value={{ token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
