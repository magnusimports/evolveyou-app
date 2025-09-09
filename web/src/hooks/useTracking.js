/**
 * Hook personalizado para gerenciar funcionalidades de tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { trackingService } from '../services/trackingService.js';

/**
 * Hook para gerenciar dados de tracking
 */
export const useTracking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  /**
   * Função genérica para executar operações de tracking
   */
  const executeTrackingOperation = useCallback(async (operation, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation(...args);
      return result;
    } catch (err) {
      setError(err.message || 'Erro desconhecido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carregar dados do dashboard
   */
  const loadDashboard = useCallback(async (date = null) => {
    const data = await executeTrackingOperation(
      trackingService.getDashboardSummary.bind(trackingService),
      date
    );
    setDashboardData(data);
    return data;
  }, [executeTrackingOperation]);

  /**
   * Registrar refeição
   */
  const logMeal = useCallback(async (mealData) => {
    return executeTrackingOperation(
      trackingService.logMealCheckin.bind(trackingService),
      mealData
    );
  }, [executeTrackingOperation]);

  /**
   * Registrar série de exercício
   */
  const logSet = useCallback(async (setData) => {
    return executeTrackingOperation(
      trackingService.logExerciseSet.bind(trackingService),
      setData
    );
  }, [executeTrackingOperation]);

  /**
   * Registrar peso corporal
   */
  const logWeight = useCallback(async (weightData) => {
    return executeTrackingOperation(
      trackingService.logBodyWeight.bind(trackingService),
      weightData
    );
  }, [executeTrackingOperation]);

  /**
   * Finalizar sessão de treino
   */
  const endWorkout = useCallback(async (sessionData) => {
    return executeTrackingOperation(
      trackingService.endWorkoutSession.bind(trackingService),
      sessionData
    );
  }, [executeTrackingOperation]);

  /**
   * Obter histórico de logs
   */
  const getHistory = useCallback(async (logType, params = {}) => {
    return executeTrackingOperation(
      trackingService.getLogHistory.bind(trackingService),
      logType,
      params
    );
  }, [executeTrackingOperation]);

  /**
   * Verificar saúde da API
   */
  const checkApiHealth = useCallback(async () => {
    return executeTrackingOperation(
      trackingService.healthCheck.bind(trackingService)
    );
  }, [executeTrackingOperation]);

  /**
   * Limpar erro
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    loading,
    error,
    dashboardData,

    // Ações
    loadDashboard,
    logMeal,
    logSet,
    logWeight,
    endWorkout,
    getHistory,
    checkApiHealth,
    clearError,
  };
};

/**
 * Hook específico para dashboard
 */
export const useDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dashboardData = await trackingService.getDashboardSummary();
      setData(dashboardData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return {
    data,
    loading,
    error,
    refresh: refreshDashboard,
  };
};

/**
 * Hook para gerenciar logs de refeições
 */
export const useMealLogging = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addMeal = useCallback(async (mealData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await trackingService.logMealCheckin(mealData);
      
      // Adicionar à lista local
      setMeals(prev => [...prev, {
        ...mealData,
        id: result.log_id,
        timestamp: result.timestamp,
      }]);

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMealHistory = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const history = await trackingService.getLogHistory('meal_checkin', params);
      setMeals(history.logs || []);
      return history;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    meals,
    loading,
    error,
    addMeal,
    loadMealHistory,
  };
};

/**
 * Hook para gerenciar logs de treino
 */
export const useWorkoutLogging = () => {
  const [currentSession, setCurrentSession] = useState(null);
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startSession = useCallback((sessionId = null) => {
    const session = {
      id: sessionId || `session_${Date.now()}`,
      startTime: new Date(),
      exercises: [],
    };
    
    setCurrentSession(session);
    setSets([]);
  }, []);

  const addSet = useCallback(async (setData) => {
    if (!currentSession) {
      throw new Error('Nenhuma sessão de treino ativa');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await trackingService.logExerciseSet(setData);
      
      setSets(prev => [...prev, {
        ...setData,
        id: result.log_id,
        timestamp: result.timestamp,
      }]);

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const endSession = useCallback(async (notes = null) => {
    if (!currentSession) {
      throw new Error('Nenhuma sessão de treino ativa');
    }

    setLoading(true);
    setError(null);

    try {
      const duration = Math.floor((Date.now() - currentSession.startTime.getTime()) / 60000);
      const exercises = [...new Set(sets.map(set => set.exerciseId))];

      const sessionData = {
        sessionId: currentSession.id,
        duration,
        exercises,
        notes,
      };

      const result = await trackingService.endWorkoutSession(sessionData);
      
      // Limpar sessão atual
      setCurrentSession(null);
      setSets([]);

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession, sets]);

  return {
    currentSession,
    sets,
    loading,
    error,
    startSession,
    addSet,
    endSession,
  };
};

export default useTracking;

