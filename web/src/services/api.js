/**
 * Serviço de API centralizado para EvolveYou
 * Integração com API Gateway e Firebase Auth
 */

import { auth } from '../config/firebase';
import mockDataService from './mockData';

// Configuração da API
const API_CONFIG = {
  // URL base da API Gateway
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.evolveyou.com' 
    : 'http://localhost:8080',
  
  // Timeout padrão para requisições
  TIMEOUT: 5000, // Reduzido para fallback mais rápido
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

/**
 * Classe para gerenciar requisições HTTP
 */
class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
  }

  /**
   * Método com fallback inteligente para mock data
   */
  async requestWithFallback(endpoint, options = {}, mockMethod = null) {
    try {
      // Tentar requisição real primeiro
      console.log(`🌐 Tentando API real: ${options.method || 'GET'} ${endpoint}`);
      const result = await this.request(endpoint, options);
      console.log(`✅ API real funcionou: ${endpoint}`);
      return result;
    } catch (error) {
      console.warn(`⚠️ API real falhou: ${error.message}`);
      
      // Fallback para dados mock se método fornecido
      if (mockMethod && typeof mockDataService[mockMethod] === 'function') {
        console.log(`🔄 Usando fallback mock: ${mockMethod}`);
        try {
          const mockResult = await mockDataService[mockMethod](...(options.mockParams || []));
          console.log(`✅ Mock funcionou: ${mockMethod}`);
          return mockResult;
        } catch (mockError) {
          console.error(`❌ Mock também falhou: ${mockError.message}`);
          throw new Error(`API e mock falharam: ${error.message}`);
        }
      }
      
      // Se não há fallback, propagar erro original
      throw error;
    }
  }
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    // Adicionar token de autenticação Firebase se disponível
    const token = await this.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log(`🌐 API Request: ${config.method} ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      let responseData;
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = { message: await response.text() };
      }

      console.log(`✅ API Response: ${config.method} ${url}`, responseData);
      return responseData;

    } catch (error) {
      console.error(`❌ API Error: ${config.method} ${url}`, error);
      
      if (error.name === 'AbortError') {
        throw new Error('Timeout: A requisição demorou muito para responder');
      }
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Erro de conexão: Verifique se o servidor está online');
      }
      
      throw error;
    }
  }

  /**
   * Métodos de conveniência para diferentes tipos de requisição
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * Obtém token de autenticação do Firebase
   */
  async getAuthToken() {
    try {
      if (auth.currentUser) {
        return await auth.currentUser.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter token Firebase:', error);
      return null;
    }
  }

  /**
   * Verificar se o usuário está autenticado
   */
  isAuthenticated() {
    return !!auth.currentUser;
  }

  // === MÉTODOS ESPECÍFICOS PARA API GATEWAY ===

  // Health Check
  async healthCheck() {
    return this.requestWithFallback('/health', { method: 'GET' }, 'healthCheck');
  }

  // Usuários
  async getUserProfile(userId) {
    return this.requestWithFallback(
      `/users/profile/${userId}`, 
      { method: 'GET', mockParams: [userId] }, 
      'getUserProfile'
    );
  }

  async updateUserProfile(userId, profileData) {
    return this.requestWithFallback(
      `/users/profile/${userId}`, 
      { method: 'PUT', data: profileData, mockParams: [userId, profileData] }, 
      'getUserProfile' // Retorna perfil atualizado
    );
  }

  async getUserStats(userId) {
    return this.requestWithFallback(
      `/users/stats/${userId}`, 
      { method: 'GET', mockParams: [userId] }, 
      'getUserProfile'
    );
  }

  // Planos
  async getUserPlan(userId) {
    return this.requestWithFallback(
      `/plans/user/${userId}`, 
      { method: 'GET', mockParams: [userId] }, 
      'getUserPlan'
    );
  }

  async generateNewPlan(userId, preferences) {
    return this.requestWithFallback(
      `/plans/generate/${userId}`, 
      { method: 'POST', data: preferences, mockParams: [userId, preferences] }, 
      'getUserPlan'
    );
  }

  // Tracking
  async getProgress(userId) {
    return this.requestWithFallback(
      `/tracking/progress/${userId}`, 
      { method: 'GET', mockParams: [userId] }, 
      'getProgress'
    );
  }

  async logMeal(userId, mealData) {
    return this.requestWithFallback(
      `/tracking/meals/${userId}`, 
      { method: 'POST', data: mealData, mockParams: [userId, mealData] }, 
      'logMeal'
    );
  }

  async logWorkout(userId, workoutData) {
    return this.requestWithFallback(
      `/tracking/workouts/${userId}`, 
      { method: 'POST', data: workoutData, mockParams: [userId, workoutData] }, 
      'logWorkout'
    );
  }

  async getMeals(userId, date) {
    return this.requestWithFallback(
      `/tracking/meals/${userId}?date=${date}`, 
      { method: 'GET', mockParams: [userId, date] }, 
      'getProgress' // Usa dados de progresso que incluem refeições
    );
  }

  async getWorkouts(userId, date) {
    return this.requestWithFallback(
      `/tracking/workouts/${userId}?date=${date}`, 
      { method: 'GET', mockParams: [userId, date] }, 
      'getProgress' // Usa dados de progresso que incluem treinos
    );
  }

  // Coach EVO
  async sendMessageToEVO(userId, message) {
    return this.requestWithFallback(
      `/evo/chat/${userId}`, 
      { method: 'POST', data: { message }, mockParams: [userId, message] }, 
      'sendMessageToEVO'
    );
  }

  async getEVOHistory(userId) {
    return this.requestWithFallback(
      `/evo/history/${userId}`, 
      { method: 'GET', mockParams: [userId] }, 
      'getEVOHistory'
    );
  }

  // Conteúdo
  async getArticles(category = null) {
    const endpoint = category ? `/content/articles?category=${category}` : '/content/articles';
    return this.requestWithFallback(
      endpoint, 
      { method: 'GET', mockParams: [category] }, 
      'getArticles'
    );
  }

  async getVideos(category = null) {
    const endpoint = category ? `/content/videos?category=${category}` : '/content/videos';
    return this.requestWithFallback(
      endpoint, 
      { method: 'GET', mockParams: [category] }, 
      'getArticles' // Usa mesmo método de artigos
    );
  }
}

// Instância singleton do serviço de API
export const apiService = new ApiService();

export default apiService;

