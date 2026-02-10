import { createContext } from "react";

export interface AuthContextType {
  token: string | null;
  user: any | null;
  ready: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: any | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  ready: false,
  setToken: () => {},
  setUser: () => {},
  logout: () => {},
});
