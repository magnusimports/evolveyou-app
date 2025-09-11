/**
 * Serviço de API centralizado para EvolveYou
 * Integração com API Gateway e Firebase Auth
 */

import { auth } from '../config/firebase';

// Configuração da API
const API_CONFIG = {
  // URL base da API Gateway
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.evolveyou.com' 
    : 'http://localhost:8080',
  
  // Timeout padrão para requisições
  TIMEOUT: 30000,
  
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
   * Método genérico para fazer requisições HTTP
   */
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
    return this.get('/health');
  }

  // Usuários
  async getUserProfile(userId) {
    return this.get(`/users/profile/${userId}`);
  }

  async updateUserProfile(userId, profileData) {
    return this.put(`/users/profile/${userId}`, profileData);
  }

  async getUserStats(userId) {
    return this.get(`/users/stats/${userId}`);
  }

  // Planos
  async getUserPlan(userId) {
    return this.get(`/plans/user/${userId}`);
  }

  async generateNewPlan(userId, preferences) {
    return this.post(`/plans/generate/${userId}`, preferences);
  }

  // Tracking
  async getProgress(userId) {
    return this.get(`/tracking/progress/${userId}`);
  }

  async logMeal(userId, mealData) {
    return this.post(`/tracking/meals/${userId}`, mealData);
  }

  async logWorkout(userId, workoutData) {
    return this.post(`/tracking/workouts/${userId}`, workoutData);
  }

  async getMeals(userId, date) {
    return this.get(`/tracking/meals/${userId}?date=${date}`);
  }

  async getWorkouts(userId, date) {
    return this.get(`/tracking/workouts/${userId}?date=${date}`);
  }

  // Coach EVO
  async sendMessageToEVO(userId, message) {
    return this.post(`/evo/chat/${userId}`, { message });
  }

  async getEVOHistory(userId) {
    return this.get(`/evo/history/${userId}`);
  }

  // Conteúdo
  async getArticles(category = null) {
    const endpoint = category ? `/content/articles?category=${category}` : '/content/articles';
    return this.get(endpoint);
  }

  async getVideos(category = null) {
    const endpoint = category ? `/content/videos?category=${category}` : '/content/videos';
    return this.get(endpoint);
  }
}

// Instância singleton do serviço de API
export const apiService = new ApiService();

export default apiService;

