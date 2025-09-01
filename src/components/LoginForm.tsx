import React, { useState } from 'react';
import { Phone, Lock, Eye, EyeOff, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { LoginData, RegisterData } from '../types/auth';
import { AuthService } from '../services/authService';

interface LoginFormProps {
  onLogin: (data: LoginData) => Promise<void>;
  onRegister: (data: RegisterData) => Promise<void>;
  isLoading: boolean;
}

export function LoginForm({ onLogin, onRegister, isLoading }: LoginFormProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState<LoginData>({
    telefone: '',
    senha: ''
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    nome: '',
    telefone: '',
    senha: '',
    confirmarSenha: ''
  });

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!AuthService.validarTelefone(loginData.telefone)) {
      setError('Telefone inválido. Use o formato (00) 00000-0000');
      return;
    }

    if (!loginData.senha) {
      setError('Senha é obrigatória');
      return;
    }

    try {
      await onLogin(loginData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao fazer login');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!registerData.nome.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (!AuthService.validarTelefone(registerData.telefone)) {
      setError('Telefone inválido. Use o formato (00) 00000-0000');
      return;
    }

    if (registerData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (registerData.senha !== registerData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      await onRegister(registerData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar conta');
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setLoginData({ telefone: '', senha: '' });
    setRegisterData({ nome: '', telefone: '', senha: '', confirmarSenha: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 to-gold-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full p-4 inline-block shadow-lg mb-4">
            <img 
              src="/LogoPreto.png" 
              alt="Logo" 
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Confraria Pedra Branca
          </h1>
          <p className="text-gray-600">
            {isLoginMode ? 'Faça login para acessar o sistema' : 'Crie sua conta para começar'}
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 text-center">
              {isLoginMode ? 'Entrar' : 'Criar Conta'}
            </h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {isLoginMode ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telefone
                </label>
                <input
                  type="text"
                  value={loginData.telefone}
                  onChange={(e) => setLoginData(prev => ({ 
                    ...prev, 
                    telefone: formatTelefone(e.target.value) 
                  }))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  required
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.senha}
                    onChange={(e) => setLoginData(prev => ({ 
                      ...prev, 
                      senha: e.target.value 
                    }))}
                    placeholder="Digite sua senha"
                    className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botão de Login */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gold-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </div>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={registerData.nome}
                  onChange={(e) => setRegisterData(prev => ({ 
                    ...prev, 
                    nome: e.target.value 
                  }))}
                  placeholder="Digite seu nome completo"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  required
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telefone
                </label>
                <input
                  type="text"
                  value={registerData.telefone}
                  onChange={(e) => setRegisterData(prev => ({ 
                    ...prev, 
                    telefone: formatTelefone(e.target.value) 
                  }))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  required
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerData.senha}
                    onChange={(e) => setRegisterData(prev => ({ 
                      ...prev, 
                      senha: e.target.value 
                    }))}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={registerData.confirmarSenha}
                    onChange={(e) => setRegisterData(prev => ({ 
                      ...prev, 
                      confirmarSenha: e.target.value 
                    }))}
                    placeholder="Digite a senha novamente"
                    className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botão de Registro */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gold-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando conta...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Criar Conta
                  </div>
                )}
              </button>
            </form>
          )}

          {/* Toggle entre Login e Registro */}
          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-gold-600 hover:text-gold-700 font-medium"
            >
              {isLoginMode 
                ? 'Não tem uma conta? Criar conta' 
                : 'Já tem uma conta? Fazer login'
              }
            </button>
          </div>

          {/* Informações de Ajuda */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 text-center">
              {isLoginMode 
                ? 'Use seu telefone cadastrado e senha para acessar o sistema'
                : 'Após criar sua conta, você poderá acessar o sistema de consórcio'
              }
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2024 Confraria Pedra Branca. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}