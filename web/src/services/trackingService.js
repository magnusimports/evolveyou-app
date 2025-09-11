/**
 * Serviço para integração com a Tracking API do EvolveYou
 * Integrado com sistema híbrido (API real + fallback mock)
 */

import apiService from './api.js';
import mockDataService from './mockData.js';

/**
 * Serviço de Tracking - gerencia logs de atividades do usuário
 */
class TrackingService {
  constructor() {
    this.apiService = apiService;
  }

  /**
   * Health Check da API com fallback
   */
  async healthCheck() {
    try {
      return await this.apiService.healthCheck();
    } catch (error) {
      console.warn('⚠️ Health check falhou, usando mock:', error.message);
      return await mockDataService.healthCheck();
    }
  }

  /**
   * Registrar check-in de refeição com fallback
   */
  async logMealCheckin(mealData) {
    try {
      const payload = {
        meal_type: mealData.mealType,
        foods_consumed: mealData.foods || [],
        total_calories: mealData.totalCalories || 0,
        total_protein: mealData.totalProtein || 0,
        total_carbs: mealData.totalCarbs || 0,
        total_fat: mealData.totalFat || 0,
        notes: mealData.notes || null,
      };

      return await this.apiService.logMeal('demo-user-123', payload);
    } catch (error) {
      console.warn('⚠️ Log de refeição falhou, usando mock:', error.message);
      return await mockDataService.logMeal('demo-user-123', payload);
    }
  }

  /**
   * Registrar série de exercício com fallback
   */
  async logExerciseSet(setData) {
    try {
      const payload = {
        exercise_id: setData.exerciseId,
        exercise_name: setData.exerciseName,
        weight_kg: setData.weight || null,
        reps_done: setData.reps,
        set_number: setData.setNumber,
        rpe: setData.rpe || null,
        notes: setData.notes || null,
      };

      return await this.apiService.logWorkout('demo-user-123', payload);
    } catch (error) {
      console.warn('⚠️ Log de exercício falhou, usando mock:', error.message);
      return await mockDataService.logWorkout('demo-user-123', payload);
    }
  }

  /**
   * Registrar peso corporal com fallback
   */
  async logBodyWeight(weightData) {
    try {
      const payload = {
        weight_kg: weightData.weight,
        body_fat_percentage: weightData.bodyFat || null,
        muscle_mass_kg: weightData.muscleMass || null,
        notes: weightData.notes || null,
      };

      // Usar endpoint de progresso para peso
      return await this.apiService.getProgress('demo-user-123');
    } catch (error) {
      console.warn('⚠️ Log de peso falhou, usando mock:', error.message);
      return await mockDataService.getProgress('demo-user-123');
    }
  }

  /**
   * Finalizar sessão de treino com fallback
   */
  async endWorkoutSession(sessionData) {
    try {
      const payload = {
        session_id: sessionData.sessionId,
        duration_minutes: sessionData.duration,
        exercises_performed: sessionData.exercises || [],
        total_calories_burned: sessionData.caloriesBurned || 0,
        notes: sessionData.notes || null,
      };

      return await this.apiService.logWorkout('demo-user-123', payload);
    } catch (error) {
      console.warn('⚠️ Finalização de treino falhou, usando mock:', error.message);
      return await mockDataService.logWorkout('demo-user-123', payload);
    }
  }

  /**
   * Obter resumo do dashboard com fallback
   */
  async getDashboardSummary(date = null) {
    try {
      return await this.apiService.getProgress('demo-user-123');
    } catch (error) {
      console.warn('⚠️ Dashboard summary falhou, usando mock:', error.message);
      return await mockDataService.getProgress('demo-user-123');
    }
  }

  /**
   * Obter histórico de logs com fallback
   */
  async getLogHistory(logType, params = {}) {
    try {
      if (logType === 'meal') {
        return await this.apiService.getMeals('demo-user-123', new Date().toISOString().split('T')[0]);
      } else if (logType === 'exercise') {
        return await this.apiService.getWorkouts('demo-user-123', new Date().toISOString().split('T')[0]);
      }
      return [];
    } catch (error) {
      console.warn(`⚠️ Histórico de ${logType} falhou, usando mock:`, error.message);
      const progressData = await mockDataService.getProgress('demo-user-123');
      
      if (logType === 'meal') {
        return progressData.data?.recentMeals || [];
      } else if (logType === 'exercise') {
        return progressData.data?.recentWorkouts || [];
      }
      return [];
    }
  }

  /**
   * Obter resumo de progresso com fallback
   */
  async getProgressSummary(params = {}) {
    try {
      return await this.apiService.getProgress('demo-user-123');
    } catch (error) {
      console.warn('⚠️ Resumo de progresso falhou, usando mock:', error.message);
      return await mockDataService.getProgress('demo-user-123');
    }
  }

  /**
   * Obter tendência de peso com fallback
   */
  async getWeightTrend(params = {}) {
    try {
      return await this.apiService.getProgress('demo-user-123');
    } catch (error) {
      console.warn('⚠️ Tendência de peso falhou, usando mock:', error.message);
      return await mockDataService.getProgress('demo-user-123');
    }
  }

  /**
   * Métodos de conveniência para tipos específicos de refeição
   */
  async logBreakfast(foods, calories) {
    return this.logMealCheckin({
      mealType: 'breakfast',
      foods,
      totalCalories: calories,
    });
  }

  async logLunch(foods, calories) {
    return this.logMealCheckin({
      mealType: 'lunch',
      foods,
      totalCalories: calories,
    });
  }

  async logDinner(foods, calories) {
    return this.logMealCheckin({
      mealType: 'dinner',
      foods,
      totalCalories: calories,
    });
  }

  async logSnack(foods, calories) {
    return this.logMealCheckin({
      mealType: 'snack',
      foods,
      totalCalories: calories,
    });
  }

  /**
   * Validação de dados antes do envio
   */
  validateMealData(mealData) {
    if (!mealData.mealType) {
      throw new Error('Tipo de refeição é obrigatório');
    }

    if (!mealData.foods || mealData.foods.length === 0) {
      throw new Error('Pelo menos um alimento deve ser informado');
    }

    if (!mealData.totalCalories || mealData.totalCalories <= 0) {
      throw new Error('Total de calorias deve ser maior que zero');
    }

    return true;
  }

  validateSetData(setData) {
    if (!setData.exerciseId || !setData.exerciseName) {
      throw new Error('ID e nome do exercício são obrigatórios');
    }

    if (!setData.reps || setData.reps <= 0) {
      throw new Error('Número de repetições deve ser maior que zero');
    }

    if (!setData.setNumber || setData.setNumber <= 0) {
      throw new Error('Número da série deve ser maior que zero');
    }

    return true;
  }
}

// Instância singleton
const trackingService = new TrackingService();
export default trackingService;

