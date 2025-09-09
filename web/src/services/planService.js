/**
 * Serviço para integração com a API de Planos do EvolveYou
 */

import { apiService } from './api.js';

class PlanService {
  constructor() {
    this.apiService = apiService;
  }

  /**
   * Gerar um novo plano de treino e dieta
   */
  async generatePlan(onboardingData) {
    try {
      // Simulação de resposta da API para geração de plano
      console.log("Simulando geração de plano com dados:", onboardingData);
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            message: "Plano gerado com sucesso (simulado)!",
            plan_id: "mock-plan-123",
            workout_plan: {
              goal: "Ganho de Massa Muscular",
              frequency: "4x por semana",
              exercises: [
                { name: "Supino Reto", sets: 4, reps: 8 },
                { name: "Agachamento", sets: 4, reps: 10 },
                { name: "Remada Curvada", sets: 3, reps: 12 },
              ],
            },
            diet_plan: {
              daily_calories: 2500,
              macros: { protein: 180, carbs: 250, fat: 70 },
              meals: [
                { name: "Café da Manhã", description: "Ovos mexidos com aveia e frutas" },
                { name: "Almoço", description: "Frango grelhado, arroz integral e vegetais" },
                { name: "Jantar", description: "Salmão assado com batata doce e salada" },
              ],
            },
            generated_at: new Date().toISOString(),
          });
        }, 1000);
      });
    } catch (error) {
      console.error("Erro ao gerar plano:", error);
      throw error;
    }
  }

  /**
   * Obter o plano atual do usuário
   */
  async getCurrentPlan() {
    try {
      // Simulação de resposta da API para obter plano atual
      console.log("Simulando obtenção do plano atual...");
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            message: "Plano atual obtido com sucesso (simulado)!",
            plan_id: "mock-plan-456",
            workout_plan: {
              goal: "Perda de Peso",
              frequency: "3x por semana",
              exercises: [
                { name: "Corrida", sets: 1, reps: "30 minutos" },
                { name: "Prancha", sets: 3, reps: "60 segundos" },
                { name: "Flexões", sets: 3, reps: 15 },
              ],
            },
            diet_plan: {
              daily_calories: 1800,
              macros: { protein: 120, carbs: 180, fat: 50 },
              meals: [
                { name: "Café da Manhã", description: "Iogurte com granola e frutas vermelhas" },
                { name: "Almoço", description: "Salada de frango com folhas verdes" },
                { name: "Jantar", description: "Sopa de legumes e peito de peru" },
              ],
            },
            generated_at: new Date().toISOString(),
          });
        }, 1000);
      });
    } catch (error) {
      console.error("Erro ao obter plano atual:", error);
      throw error;
    }
  }

  /**
   * Obter um plano específico pelo ID
   */
  async getPlanById(planId) {
    try {
      // Simulação de resposta da API para obter plano por ID
      console.log(`Simulando obtenção do plano ${planId}...`);
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            message: `Plano ${planId} obtido com sucesso (simulado)!`,
            plan_id: planId,
            workout_plan: {
              goal: "Manutenção",
              frequency: "5x por semana",
              exercises: [
                { name: "Natação", sets: 1, reps: "45 minutos" },
                { name: "Yoga", sets: 1, reps: "60 minutos" },
              ],
            },
            diet_plan: {
              daily_calories: 2200,
              macros: { protein: 150, carbs: 220, fat: 60 },
              meals: [
                { name: "Café da Manhã", description: "Smoothie de frutas e proteína" },
                { name: "Almoço", description: "Wrap integral com vegetais e atum" },
                { name: "Jantar", description: "Omelete com queijo e salada" },
              ],
            },
            generated_at: new Date().toISOString(),
          });
        }, 1000);
      });
    } catch (error) {
      console.error(`Erro ao obter plano ${planId}:`, error);
      throw error;
    }
  }
}

export const planService = new PlanService();
export default planService;


