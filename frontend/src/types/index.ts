
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}
