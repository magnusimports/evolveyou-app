/**
 * AppContext - Estado Global do EvolveYou
 * Gerencia estado unificado do usuário, anamnese e dados do aplicativo
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Criar contexto
const AppContext = createContext();

// Estados iniciais
const initialState = {
  // Estado do usuário
  user: {
    id: null,
    name: '',
    email: '',
    isGuest: false,
    isAuthenticated: false,
    avatar: null
  },
  
  // Estado da anamnese
  anamnese: {
    completed: false,
    currentQuestion: 1,
    totalQuestions: 22,
    answers: {},
    progress: 0,
    score: null,
    recommendations: null
  },
  
  // Perfil calculado baseado na anamnese
  profile: {
    // Dados básicos
    age: null,
    gender: null,
    height: null,
    weight: null,
    goal: null,
    targetWeight: null,
    
    // Métricas calculadas
    bmr: null,
    dailyCalories: null,
    macros: {
      protein: null,
      carbs: null,
      fat: null
    },
    
    // Preferências
    activityLevel: null,
    exercisePreferences: [],
    dietaryRestrictions: [],
    availableTime: null,
    
    // Saúde
    healthConditions: [],
    medications: null,
    
    // Estilo de vida
    sleepHours: null,
    sleepQuality: null,
    stressLevel: null,
    waterIntake: null,
    
    // Motivação
    motivationFactors: [],
    fitnessExperience: null
  },
  
  // Prescrições geradas
  prescriptions: {
    workout: null,
    nutrition: null,
    hydration: null
  },
  
  // Dados das telas
  dashboard: {
    activityRings: {
      movement: { current: 0, goal: 1300, percentage: 0 },
      exercise: { current: 0, goal: 90, percentage: 0 },
      standing: { current: 0, goal: 8, percentage: 0 }
    },
    metrics: {
      steps: 0,
      distance: 0,
      calories: 0,
      activeMinutes: 0
    },
    charts: {
      steps: [],
      distance: [],
      weight: []
    }
  },
  
  // Estado da aplicação
  app: {
    loading: false,
    error: null,
    currentScreen: 'auth',
    lastSync: null,
    isOnline: true
  }
};

// Reducer para gerenciar estado
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        app: { ...state.app, loading: action.payload }
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        app: { ...state.app, error: action.payload }
      };
      
    case 'SET_CURRENT_SCREEN':
      return {
        ...state,
        app: { ...state.app, currentScreen: action.payload }
      };
      
    case 'LOGIN_USER':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
          isAuthenticated: true
        }
      };
      
    case 'LOGOUT_USER':
      return {
        ...initialState,
        app: { ...state.app, currentScreen: 'auth' }
      };
      
    case 'UPDATE_ANAMNESE_PROGRESS':
      return {
        ...state,
        anamnese: {
          ...state.anamnese,
          currentQuestion: action.payload.currentQuestion,
          progress: (action.payload.currentQuestion / state.anamnese.totalQuestions) * 100
        }
      };
      
    case 'ADD_ANAMNESE_ANSWER':
      return {
        ...state,
        anamnese: {
          ...state.anamnese,
          answers: {
            ...state.anamnese.answers,
            [action.payload.questionId]: action.payload.answer
          }
        }
      };
      
    case 'COMPLETE_ANAMNESE':
      return {
        ...state,
        anamnese: {
          ...state.anamnese,
          completed: true,
          score: action.payload.score,
          recommendations: action.payload.recommendations
        },
        profile: {
          ...state.profile,
          ...action.payload.profile
        },
        prescriptions: {
          ...state.prescriptions,
          ...action.payload.prescriptions
        }
      };
      
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload
        }
      };
      
    case 'UPDATE_DASHBOARD_DATA':
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          ...action.payload
        }
      };
      
    case 'UPDATE_ACTIVITY_RINGS':
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          activityRings: {
            ...state.dashboard.activityRings,
            ...action.payload
          }
        }
      };
      
    case 'UPDATE_METRICS':
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          metrics: {
            ...state.dashboard.metrics,
            ...action.payload
          }
        }
      };
      
    case 'SET_PRESCRIPTIONS':
      return {
        ...state,
        prescriptions: {
          ...state.prescriptions,
          ...action.payload
        }
      };
      
    case 'SYNC_DATA':
      return {
        ...state,
        app: {
          ...state.app,
          lastSync: new Date().toISOString()
        }
      };
      
    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        app: {
          ...state.app,
          isOnline: action.payload
        }
      };
      
    case 'HYDRATE_STATE':
      return {
        ...state,
        ...action.payload
      };
      
    default:
      return state;
  }
}

// Provider do contexto
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Carregar estado do localStorage na inicialização
  useEffect(() => {
    const savedState = localStorage.getItem('evolveyou_state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'HYDRATE_STATE', payload: parsedState });
      } catch (error) {
        console.error('Erro ao carregar estado salvo:', error);
      }
    }
  }, []);
  
  // Salvar estado no localStorage quando houver mudanças
  useEffect(() => {
    const stateToSave = {
      user: state.user,
      anamnese: state.anamnese,
      profile: state.profile,
      prescriptions: state.prescriptions
    };
    localStorage.setItem('evolveyou_state', JSON.stringify(stateToSave));
  }, [state.user, state.anamnese, state.profile, state.prescriptions]);
  
  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false });
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Actions para facilitar o uso
  const actions = {
    // Autenticação
    loginUser: (userData) => {
      dispatch({ type: 'LOGIN_USER', payload: userData });
    },
    
    logoutUser: () => {
      localStorage.removeItem('evolveyou_state');
      dispatch({ type: 'LOGOUT_USER' });
    },
    
    // Navegação
    setCurrentScreen: (screen) => {
      dispatch({ type: 'SET_CURRENT_SCREEN', payload: screen });
    },
    
    // Anamnese
    updateAnamneseProgress: (currentQuestion) => {
      dispatch({ type: 'UPDATE_ANAMNESE_PROGRESS', payload: { currentQuestion } });
    },
    
    addAnamneseAnswer: (questionId, answer) => {
      dispatch({ type: 'ADD_ANAMNESE_ANSWER', payload: { questionId, answer } });
    },
    
    completeAnamnese: (data) => {
      dispatch({ type: 'COMPLETE_ANAMNESE', payload: data });
      dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'dashboard' });
    },
    
    // Perfil
    updateProfile: (profileData) => {
      dispatch({ type: 'UPDATE_PROFILE', payload: profileData });
    },
    
    // Dashboard
    updateDashboardData: (data) => {
      dispatch({ type: 'UPDATE_DASHBOARD_DATA', payload: data });
    },
    
    updateActivityRings: (rings) => {
      dispatch({ type: 'UPDATE_ACTIVITY_RINGS', payload: rings });
    },
    
    updateMetrics: (metrics) => {
      dispatch({ type: 'UPDATE_METRICS', payload: metrics });
    },
    
    // Prescrições
    setPrescriptions: (prescriptions) => {
      dispatch({ type: 'SET_PRESCRIPTIONS', payload: prescriptions });
    },
    
    // Estado da aplicação
    setLoading: (loading) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },
    
    setError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },
    
    syncData: () => {
      dispatch({ type: 'SYNC_DATA' });
    }
  };
  
  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook para usar o contexto
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}

// Seletores para facilitar acesso aos dados
export const selectors = {
  // Usuário
  getUser: (state) => state.user,
  isAuthenticated: (state) => state.user.isAuthenticated,
  isGuest: (state) => state.user.isGuest,
  
  // Anamnese
  getAnamneseProgress: (state) => state.anamnese.progress,
  isAnamneseCompleted: (state) => state.anamnese.completed,
  getAnamneseAnswers: (state) => state.anamnese.answers,
  
  // Perfil
  getProfile: (state) => state.profile,
  getDailyCalories: (state) => state.profile.dailyCalories,
  getMacros: (state) => state.profile.macros,
  
  // Dashboard
  getActivityRings: (state) => state.dashboard.activityRings,
  getMetrics: (state) => state.dashboard.metrics,
  getCharts: (state) => state.dashboard.charts,
  
  // Prescrições
  getWorkoutPlan: (state) => state.prescriptions.workout,
  getNutritionPlan: (state) => state.prescriptions.nutrition,
  getHydrationPlan: (state) => state.prescriptions.hydration,
  
  // Estado da aplicação
  getCurrentScreen: (state) => state.app.currentScreen,
  isLoading: (state) => state.app.loading,
  getError: (state) => state.app.error,
  isOnline: (state) => state.app.isOnline
};

export default AppContext;

