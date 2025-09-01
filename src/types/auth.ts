export interface LoginData {
  telefone: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
}

export interface User {
  id: string;
  email: string;
  telefone?: string;
  nome?: string;
  role?: 'admin' | 'membro';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}