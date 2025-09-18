import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  Utensils, 
  Dumbbell, 
  Calendar, 
  TrendingUp,
  Settings,
  UserCircle,
  KeyRound,
  Gem,
  MessageSquare,
  LogOut,
  ChevronRight
} from 'lucide-react';

const Configuracoes = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    meals: true,
    workouts: true,
    messages: false
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const toggleNotification = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={checked}
        onChange={onChange}
      />
      <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
    </label>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white pb-20">
      {/* Header */}
      <header className="p-5 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
        <h1 className="text-xl font-bold text-white text-center">Configurações</h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-4">
        
        {/* Seção: Conta */}
        <div className="section-title text-sm font-semibold text-gray-400 uppercase pt-6 pb-3 px-5">
          Conta
        </div>
        <div className="rounded-xl overflow-hidden">
          <Link to="/perfil" className="setting-item bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700 hover:bg-gray-700 transition-colors">
            <div className="flex items-center">
              <UserCircle className="w-5 h-5 mr-3 text-purple-400" />
              <span>Editar Perfil</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
          <button className="setting-item bg-gray-800 p-4 flex justify-between items-center w-full hover:bg-gray-700 transition-colors">
            <div className="flex items-center">
              <KeyRound className="w-5 h-5 mr-3 text-purple-400" />
              <span>Alterar Senha</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Seção: Assinatura */}
        <div className="section-title text-sm font-semibold text-gray-400 uppercase pt-6 pb-3 px-5">
          Assinatura
        </div>
        <div className="rounded-xl overflow-hidden">
          <button className="setting-item bg-gray-800 p-4 flex justify-between items-center w-full hover:bg-gray-700 transition-colors">
            <div className="flex items-center">
              <Gem className="w-5 h-5 mr-3 text-yellow-400" />
              <span>Gerenciar Assinatura Premium</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Seção: Notificações */}
        <div className="section-title text-sm font-semibold text-gray-400 uppercase pt-6 pb-3 px-5">
          Notificações
        </div>
        <div className="rounded-xl overflow-hidden">
          <div className="setting-item bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
            <div className="flex items-center">
              <Utensils className="w-5 h-5 mr-3 text-green-400" />
              <span>Lembretes de Refeições</span>
            </div>
            <ToggleSwitch 
              checked={notifications.meals}
              onChange={() => toggleNotification('meals')}
            />
          </div>
          <div className="setting-item bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
            <div className="flex items-center">
              <Dumbbell className="w-5 h-5 mr-3 text-purple-400" />
              <span>Lembretes de Treino</span>
            </div>
            <ToggleSwitch 
              checked={notifications.workouts}
              onChange={() => toggleNotification('workouts')}
            />
          </div>
          <div className="setting-item bg-gray-800 p-4 flex justify-between items-center">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-3 text-blue-400" />
              <span>Mensagens do EVO</span>
            </div>
            <ToggleSwitch 
              checked={notifications.messages}
              onChange={() => toggleNotification('messages')}
            />
          </div>
        </div>

        {/* Seção: Ações */}
        <div className="section-title text-sm font-semibold text-gray-400 uppercase pt-6 pb-3 px-5">
          Ações
        </div>
        <div className="rounded-xl overflow-hidden">
          <button 
            onClick={handleLogout}
            className="setting-item bg-gray-800 p-4 flex justify-between items-center w-full hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center text-red-400">
              <LogOut className="w-5 h-5 mr-3" />
              <span>Sair</span>
            </div>
          </button>
        </div>

        {/* Informações do Usuário */}
        {user && (
          <div className="mt-8 p-4 bg-gray-800 rounded-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCircle className="w-8 h-8 text-white" />
              </div>
              <p className="text-white font-medium">{user.displayName || user.email}</p>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>
        )}
      </main>

      {/* Barra de Navegação Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gray-800 border-t border-gray-700">
        <div className="flex justify-around">
          <Link to="/dashboard" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
            <Home className="w-6 h-6" />
            <span className="text-xs">Hoje</span>
          </Link>
          <Link to="/dieta" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
            <Utensils className="w-6 h-6" />
            <span className="text-xs">Dieta</span>
          </Link>
          <Link to="/treino" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
            <Dumbbell className="w-6 h-6" />
            <span className="text-xs">Treino</span>
          </Link>
          <Link to="/plano" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Plano</span>
          </Link>
          <Link to="/configuracoes" className="flex flex-col items-center justify-center p-3 text-green-400 w-1/5">
            <Settings className="w-6 h-6" />
            <span className="text-xs">Ajustes</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Configuracoes;

