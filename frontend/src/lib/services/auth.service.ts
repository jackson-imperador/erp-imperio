import { api } from '../axios';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    activeCompanyId: string | null;
    role: string | null;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  correlationId: string;
}

export const authService = {
  /**
   * Autentica o usuário na API real e retorna os tokens e dados do usuário
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  /**
   * Efetua o logout na API invalidando a sessão
   */
  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken });
  }
};
