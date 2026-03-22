import { createContext } from "react";

export type AuthUser = {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
};

export interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  ready: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
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
