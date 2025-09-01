import { supabase } from '../lib/supabase';
import { LoginData, RegisterData, User } from '../types/auth';

export class AuthService {
  // Login com telefone e senha
  static async login(data: LoginData): Promise<User> {
    try {
      // Converter telefone para email format para usar com Supabase Auth
      const emailFromPhone = `${data.telefone.replace(/\D/g, '')}@confraria.local`;
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: emailFromPhone,
        password: data.senha
      });

      if (error) {
        throw new Error(this.getErrorMessage(error.message));
      }

      if (!authData.user) {
        throw new Error('Erro ao fazer login');
      }

      // Buscar dados do usuário na tabela de membros
      const userData = await this.getUserData(authData.user.id);
      
      return {
        id: authData.user.id,
        email: authData.user.email || '',
        telefone: data.telefone,
        nome: userData?.nome,
        role: userData?.role || 'membro',
        created_at: authData.user.created_at || ''
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  // Registro de novo usuário
  static async register(data: RegisterData): Promise<User> {
    try {
      if (data.senha !== data.confirmarSenha) {
        throw new Error('As senhas não coincidem');
      }

      if (data.senha.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }

      // Converter telefone para email format
      const emailFromPhone = `${data.telefone.replace(/\D/g, '')}@confraria.local`;
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: emailFromPhone,
        password: data.senha,
        options: {
          data: {
            nome: data.nome,
            telefone: data.telefone
          }
        }
      });

      if (error) {
        throw new Error(this.getErrorMessage(error.message));
      }

      if (!authData.user) {
        throw new Error('Erro ao criar conta');
      }

      // Criar registro na tabela de membros
      await this.createUserProfile(authData.user.id, data);

      return {
        id: authData.user.id,
        email: authData.user.email || '',
        telefone: data.telefone,
        nome: data.nome,
        role: 'membro',
        created_at: authData.user.created_at || ''
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error('Erro ao fazer logout');
      }
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  }

  // Verificar usuário atual
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      const userData = await this.getUserData(user.id);
      
      return {
        id: user.id,
        email: user.email || '',
        telefone: userData?.telefone,
        nome: userData?.nome,
        role: userData?.role || 'membro',
        created_at: user.created_at || ''
      };
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      return null;
    }
  }

  // Buscar dados do usuário
  private static async getUserData(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('membros')
        .select('nome, telefone')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar dados do usuário:', error);
      }

      return {
        nome: data?.nome,
        telefone: data?.telefone,
        role: 'admin' // Por enquanto todos são admin, depois implementar roles
      };
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  }

  // Criar perfil do usuário
  private static async createUserProfile(userId: string, data: RegisterData): Promise<void> {
    try {
      const { error } = await supabase
        .from('membros')
        .insert([{
          id: userId,
          nome: data.nome,
          telefone: data.telefone,
          status_membro: 'PRE_CADASTRO'
        }]);

      if (error) {
        console.error('Erro ao criar perfil:', error);
      }
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
    }
  }

  // Traduzir mensagens de erro
  private static getErrorMessage(errorMessage: string): string {
    const errorMap: { [key: string]: string } = {
      'Invalid login credentials': 'Telefone ou senha incorretos',
      'Email not confirmed': 'Email não confirmado',
      'User already registered': 'Usuário já cadastrado',
      'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
      'Unable to validate email address: invalid format': 'Formato de email inválido',
      'Signup is disabled': 'Cadastro desabilitado',
      'Email rate limit exceeded': 'Muitas tentativas. Tente novamente mais tarde'
    };

    return errorMap[errorMessage] || 'Erro de autenticação. Tente novamente.';
  }

  // Formatar telefone
  static formatTelefone(telefone: string): string {
    const numbers = telefone.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  }

  // Validar telefone
  static validarTelefone(telefone: string): boolean {
    const numbers = telefone.replace(/\D/g, '');
    return numbers.length === 11 && /^[1-9]\d{10}$/.test(numbers);
  }
}