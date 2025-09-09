/**
 * Serviço base para comunicação com as APIs do EvolveYou
 */

// Configuração da API
const API_CONFIG = {
  // URL base da API (será atualizada para produção)
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.evolveyou.com' 
    : 'https://8001-i42asipgh0xtnp57t2oxl-2090996d.manusvm.computer',
  
  // Timeout padrão para requisições
  TIMEOUT: 10000,
  
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

    // Adicionar token de autenticação se disponível
    const token = this.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
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
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Requisição cancelada por timeout');
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
   * Gerenciamento de token de autenticação
   */
  setAuthToken(token) {
    localStorage.setItem('evolveyou_auth_token', token);
  }

  getAuthToken() {
    return localStorage.getItem('evolveyou_auth_token');
  }

  removeAuthToken() {
    localStorage.removeItem('evolveyou_auth_token');
  }

  /**
   * Verificar se o usuário está autenticado
   */
  isAuthenticated() {
    const token = this.getAuthToken();
    if (!token) return false;

    try {
      // Decodificar JWT para verificar expiração
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      return payload.exp > now;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return false;
    }
  }
}

// Instância singleton do serviço de API
export const apiService = new ApiService();

// Interceptor para lidar com erros de autenticação
const originalRequest = apiService.request.bind(apiService);
apiService.request = async function(endpoint, options = {}) {
  try {
    return await originalRequest(endpoint, options);
  } catch (error) {
    if (error.message.includes('401')) {
      // Token expirado ou inválido
      this.removeAuthToken();
      window.location.href = '/login';
    }
    throw error;
  }
};

export default apiService;

