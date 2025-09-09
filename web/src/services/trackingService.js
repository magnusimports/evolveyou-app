/**
 * Serviço para integração com a Tracking API do EvolveYou
 */

import { apiService } from './api.js';

/**
 * Serviço de Tracking - gerencia logs de atividades do usuário
 */
class TrackingService {
  constructor() {
    this.apiService = apiService;
  }

  /**
   * Health Check da API
   */
  async healthCheck() {
    try {
      return await this.apiService.get('/health');
    } catch (error) {
      console.error('Erro no health check:', error);
      throw error;
    }
  }

  /**
   * Registrar check-in de refeição
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

      return await this.apiService.post('/log/meal-checkin', payload);
    } catch (error) {
      console.error('Erro ao registrar refeição:', error);
      throw error;
    }
  }

  /**
   * Registrar série de exercício
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

      return await this.apiService.post('/log/set', payload);
    } catch (error) {
      console.error('Erro ao registrar série:', error);
      throw error;
    }
  }

  /**
   * Registrar peso corporal
   */
  async logBodyWeight(weightData) {
    try {
      const payload = {
        weight_kg: weightData.weight,
        body_fat_percentage: weightData.bodyFat || null,
        muscle_mass_kg: weightData.muscleMass || null,
        notes: weightData.notes || null,
      };

      return await this.apiService.post('/log/body-weight', payload);
    } catch (error) {
      console.error('Erro ao registrar peso:', error);
      throw error;
    }
  }

  /**
   * Finalizar sessão de treino
   */
  async endWorkoutSession(sessionData) {
    try {
      const payload = {
        session_id: sessionData.sessionId,
        duration_minutes: sessionData.duration,
        exercises_performed: sessionData.exercises || [],
        perceived_intensity: sessionData.intensity || null,
        notes: sessionData.notes || null,
      };

      return await this.apiService.post('/log/workout-session/end', payload);
    } catch (error) {
      console.error('Erro ao finalizar treino:', error);
      throw error;
    }
  }

  /**
   * Obter resumo do dashboard
   */
  async getDashboardSummary(date = null) {
    try {
      const params = date ? { date } : {};
      return await this.apiService.get('/dashboard/summary', params);
    } catch (error) {
      console.error('Erro ao obter dashboard:', error);
      throw error;
    }
  }

  /**
   * Obter histórico de logs
   */
  async getLogHistory(logType, params = {}) {
    try {
      const endpoint = `/log/history/${logType}`;
      return await this.apiService.get(endpoint, params);
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      throw error;
    }
  }

  /**
   * Obter resumo de progresso
   */
  async getProgressSummary(params = {}) {
    try {
      return await this.apiService.get('/progress/summary', params);
    } catch (error) {
      console.error('Erro ao obter progresso:', error);
      throw error;
    }
  }

  /**
   * Obter tendência de peso
   */
  async getWeightTrend(params = {}) {
    try {
      return await this.apiService.get('/progress/weight-trend', params);
    } catch (error) {
      console.error('Erro ao obter tendência de peso:', error);
      throw error;
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

// Instância singleton do serviço de tracking
export const trackingService = new TrackingService();

export default trackingService;

