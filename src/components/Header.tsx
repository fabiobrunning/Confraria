import React, { useState } from 'react';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-6">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/LogoPreto.png" 
              alt="Logo" 
              style={{ transform: 'scale(1.9)' }}
              className="h-10 w-auto"
            />
          </div>
          
          {/* Company Name */}
          <div className="flex items-center pr-6 sm:pr-4 md:pr-6 lg:pr-10">
            <img 
              src="/Confraria preta.png" 
              alt="Confraria Pedra Branca" 
              style={{ transform: 'scale(3.3)' }}
              className="h-8 md:h-10 w-auto"
            />
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <div className="bg-gold-100 p-2 rounded-full">
                <User className="w-4 h-4 text-gold-600" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.nome || 'Usuário'}</p>
                <p className="text-xs text-gray-500">{user?.telefone}</p>
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.nome}</p>
                  <p className="text-xs text-gray-500">{user?.telefone}</p>
                  <p className="text-xs text-gold-600 font-medium">
                    {user?.role === 'admin' ? 'Administrador' : 'Membro'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay para fechar menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
}