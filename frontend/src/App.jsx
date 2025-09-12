import React, { useEffect } from 'react';
import { AppProvider, useApp, selectors } from './contexts/AppContext.jsx';
import dataService from './services/dataService.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Utensils, Dumbbell, MessageCircle } from 'lucide-react';
import AuthScreen from './components/AuthScreen.jsx';
import AnamneseScreen from './components/AnamneseScreen.jsx';
import ResumoScreen from './components/ResumoScreen.jsx';
import NutricaoScreen from './components/NutricaoScreen.jsx';
import TreinoScreen from './components/TreinoScreen.jsx';
import CoachScreen from './components/CoachScreen.jsx';
import './App.css';

// Componente principal da aplicação
function AppContent() {
  const { state, actions } = useApp();
  const currentScreen = selectors.getCurrentScreen(state);
  const isAuthenticated = selectors.isAuthenticated(state);
  const isAnamneseCompleted = selectors.isAnamneseCompleted(state);
  const isLoading = selectors.isLoading(state);

  // Inicialização da aplicação
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      actions.setLoading(true);
      
      // Verificar se há dados salvos
      const savedProfile = dataService.getFromLocalStorage('user_profile');
      const savedUser = dataService.getFromLocalStorage('evolveyou_user');
      
      if (savedUser) {
        actions.loginUser(savedUser);
      }
      
      if (savedProfile) {
        actions.updateProfile(savedProfile);
        
        if (savedProfile.anamnese_completed) {
          actions.completeAnamnese({
            profile: savedProfile,
            score: savedProfile?.anamnese_score || {},
            recommendations: savedProfile?.recommendations || {},
            prescriptions: {
              workout: savedProfile?.workout_plan,
              nutrition: savedProfile?.nutrition_plan,
              hydration: savedProfile?.hydration_plan
            }
          });
        }
      }
      
      // Determinar tela inicial
      if (savedUser) {
        if (savedProfile?.anamnese_completed) {
          actions.setCurrentScreen('dashboard');
          await loadDashboardData();
        } else {
          actions.setCurrentScreen('anamnese');
        }
      } else {
        actions.setCurrentScreen('auth');
      }
      
    } catch (error) {
      console.error('Erro na inicialização:', error);
      actions.setError('Erro ao inicializar aplicativo');
    } finally {
      actions.setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const userId = state.user.id || 'guest_user';
      
      // Carregar dados do dashboard em paralelo
      const [metrics, activityRings] = await Promise.all([
        dataService.loadDashboardMetrics(userId),
        dataService.loadActivityRings(userId)
      ]);
      
      if (metrics) {
        actions.updateMetrics(metrics);
      }
      
      if (activityRings) {
        actions.updateActivityRings(activityRings);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  };

  const handleLogin = async (userData) => {
    try {
      actions.setLoading(true);
      actions.loginUser(userData);
      
      // Salvar no localStorage
      dataService.saveToLocalStorage('evolveyou_user', userData);
      
      // Verificar se precisa fazer anamnese
      const profile = dataService.getFromLocalStorage('user_profile');
      
      if (profile && profile.anamnese_completed) {
        actions.updateProfile(profile);
        actions.setCurrentScreen('dashboard');
        await loadDashboardData();
      } else {
        actions.setCurrentScreen('anamnese');
      }
      
    } catch (error) {
      console.error('Erro no login:', error);
      actions.setError('Erro ao fazer login');
    } finally {
      actions.setLoading(false);
    }
  };

  const handleAnamneseComplete = async (anamneseData) => {
    try {
      actions.setLoading(true);
      
      // Submeter anamnese e obter perfil
      const result = await dataService.submitAnamnese(anamneseData.answers);
      
      if (result.success && result.profile) {
        // Calcular dados derivados
        const enhancedProfile = dataService.calculateDerivedData(result.profile);
        
        // Atualizar estado global
        actions.completeAnamnese({
          profile: enhancedProfile,
          score: enhancedProfile.anamnese_score || {},
          recommendations: enhancedProfile.recommendations || {},
          prescriptions: {
            workout: enhancedProfile.workout_plan,
            nutrition: enhancedProfile.nutrition_plan,
            hydration: enhancedProfile.hydration_plan
          }
        });
        
        // Carregar dados do dashboard
        await loadDashboardData();
        
        actions.setCurrentScreen('dashboard');
      } else {
        throw new Error(result.message || 'Erro ao processar anamnese');
      }
      
    } catch (error) {
      console.error('Erro ao completar anamnese:', error);
      actions.setError('Erro ao processar anamnese. Tente novamente.');
    } finally {
      actions.setLoading(false);
    }
  };

  const handleLogout = () => {
    dataService.clearAllData();
    actions.logoutUser();
  };

  // Renderizar tela de loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando EvolveYou...</p>
        </div>
      </div>
    );
  }

  // Renderizar tela baseada no estado atual
  switch (currentScreen) {
    case 'auth':
      return <AuthScreen onLogin={handleLogin} />;
      
    case 'anamnese':
      return <AnamneseScreen onComplete={handleAnamneseComplete} />;
      
    case 'dashboard':
      return <DashboardApp onLogout={handleLogout} />;
      
    default:
      return <AuthScreen onLogin={handleLogin} />;
  }
}

// Componente do dashboard com navegação
function DashboardApp({ onLogout }) {
  const { state, actions } = useApp();
  const [activeTab, setActiveTab] = React.useState('resumo');
  const user = selectors.getUser(state);
  const profile = selectors.getProfile(state);

  const tabs = [
    { id: 'resumo', label: 'Resumo', icon: Home, component: ResumoScreen },
    { id: 'nutricao', label: 'Nutrição', icon: Utensils, component: NutricaoScreen },
    { id: 'treino', label: 'Treino', icon: Dumbbell, component: TreinoScreen },
    { id: 'coach', label: 'Coach EVO', icon: MessageCircle, component: CoachScreen }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ResumoScreen;

  return (
    <div className="dark min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 pt-12">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {activeTab === 'resumo' && 'Resumo'}
            {activeTab === 'nutricao' && 'Nutrição'}
            {activeTab === 'treino' && 'Treino'}
            {activeTab === 'coach' && 'Coach EVO'}
          </h1>
          <p className="text-gray-400 text-sm">
            {activeTab === 'resumo' && new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
            {activeTab === 'nutricao' && 'Plano personalizado'}
            {activeTab === 'treino' && 'Seu programa de exercícios'}
            {activeTab === 'coach' && 'Seu assistente pessoal'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Status da Anamnese */}
          {profile.anamnese_completed && (
            <div className="flex items-center bg-gray-900/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-400">Anamnese Completa</span>
            </div>
          )}
          
          <div className="text-right">
            <p className="text-white text-sm font-medium">
              {profile.name || user.name || 'Usuário'}
            </p>
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-white text-xs transition-colors"
            >
              Sair
            </button>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {(profile.name || user.name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ActiveComponent user={user} userProfile={profile} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className={`p-2 rounded-full ${
                    isActive 
                      ? 'bg-green-500' 
                      : 'bg-transparent'
                  }`}
                  animate={{
                    backgroundColor: isActive ? '#10b981' : 'transparent',
                    scale: isActive ? 1.1 : 1
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon size={20} />
                </motion.div>
                <span className={`text-xs mt-1 font-medium ${
                  isActive ? 'text-white' : 'text-gray-500'
                }`}>
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Status da conexão */}
      <div className="fixed top-4 right-4 flex space-x-2 z-50">
        <div className="flex items-center bg-gray-900/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-gray-300">Firebase + Gemini AI</span>
        </div>
        
        {/* Score da Anamnese */}
        {profile.anamnese_score?.score_total && (
          <div className="flex items-center bg-gray-900/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs">
            <span className="text-blue-400">Score: {Math.round(profile.anamnese_score.score_total)}/100</span>
          </div>
        )}
      </div>
    </div>
  );
}

// App principal com Provider
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

