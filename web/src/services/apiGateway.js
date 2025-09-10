/**
 * Serviço para comunicação com API Gateway do EvolveYou
 */

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

class ApiGatewayService {
  constructor() {
    this.baseURL = API_GATEWAY_URL;
    this.token = localStorage.getItem('evolveyou_token');
  }

  // Configurar token de autenticação
  setToken(token) {
    this.token = token;
    localStorage.setItem('evolveyou_token', token);
  }

  // Remover token
  clearToken() {
    this.token = null;
    localStorage.removeItem('evolveyou_token');
  }

  // Headers padrão
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Método genérico para requisições
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Token expirado. Faça login novamente.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  }

  // Métodos HTTP
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Autenticação
  async login(email, password) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.access_token) {
        this.setToken(response.access_token);
      }

      return response;
    } catch (error) {
      throw new Error('Falha no login: ' + error.message);
    }
  }

  async refreshToken() {
    try {
      const response = await this.post('/auth/refresh', {});
      
      if (response.access_token) {
        this.setToken(response.access_token);
      }

      return response;
    } catch (error) {
      this.clearToken();
      throw error;
    }
  }

  // Serviços específicos

  // Users Service
  async getUser(userId) {
    return this.get(`/users/${userId}`);
  }

  async updateUser(userId, userData) {
    return this.put(`/users/${userId}`, userData);
  }

  async submitAnamnese(anamneseData) {
    return this.post('/users/anamnese', anamneseData);
  }

  // Plans Service
  async generatePlan(userId) {
    return this.post(`/plans/generate/${userId}`, {});
  }

  async getUserPlan(userId) {
    return this.get(`/plans/user/${userId}`);
  }

  // Tracking Service
  async logMeal(mealData) {
    return this.post('/tracking/log/meal-checkin', mealData);
  }

  async logExercise(exerciseData) {
    return this.post('/tracking/log/set', exerciseData);
  }

  async getDashboard(userId) {
    return this.get(`/tracking/dashboard/summary`);
  }

  async getTrackingHistory(userId, logType) {
    return this.get(`/tracking/log/history/${logType}`);
  }

  // EVO Service (Coach)
  async chatWithEVO(message) {
    return this.post('/evo/chat', { message });
  }

  async getEVOMotivation() {
    return this.post('/evo/motivation', {});
  }

  async getEVOTips() {
    return this.get('/evo/tips');
  }

  // Full-time Service
  async getFullTimeDashboard(userId) {
    return this.get(`/tracking/fulltime/dashboard/${userId}`);
  }

  async registerExtraActivity(activityData) {
    return this.post('/tracking/fulltime/register-activity', activityData);
  }

  async toggleFullTimeStatus(userId) {
    return this.post(`/tracking/fulltime/toggle-status/${userId}`, {});
  }

  // Status e Health Check
  async getGatewayStatus() {
    return this.get('/');
  }

  async getHealthCheck() {
    return this.get('/health');
  }

  async getApiStatus() {
    return this.get('/api/status');
  }

  // Verificar se está autenticado
  isAuthenticated() {
    return !!this.token;
  }

  // Decodificar token (básico)
  getTokenData() {
    if (!this.token) return null;

    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }

  // Verificar se token está expirado
  isTokenExpired() {
    const tokenData = this.getTokenData();
    if (!tokenData || !tokenData.exp) return true;

    return Date.now() >= tokenData.exp * 1000;
  }
}

// Instância singleton
const apiGateway = new ApiGatewayService();

export default apiGateway;

