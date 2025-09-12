/**
 * DataService - Serviço Centralizado de Dados
 * Gerencia sincronização entre frontend, backend e localStorage
 */

import { apiService } from './api.js';

class DataService {
  constructor() {
    this.cache = new Map();
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.lastSync = null;
    
    // Monitorar status de conexão
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }
  
  // ==========================================
  // MÉTODOS DE CACHE E SINCRONIZAÇÃO
  // ==========================================
  
  /**
   * Obtém dados com cache inteligente
   */
  async getData(key, fetcher, options = {}) {
    const { 
      cacheTime = 5 * 60 * 1000, // 5 minutos
      forceRefresh = false,
      fallbackToCache = true 
    } = options;
    
    // Verificar cache primeiro
    if (!forceRefresh && this.cache.has(key)) {
      const cached = this.cache.get(key);
      const isExpired = Date.now() - cached.timestamp > cacheTime;
      
      if (!isExpired) {
        return cached.data;
      }
    }
    
    try {
      // Tentar buscar dados atualizados
      const data = await fetcher();
      
      // Atualizar cache
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
      
      // Salvar no localStorage para persistência
      this.saveToLocalStorage(key, data);
      
      return data;
      
    } catch (error) {
      console.error(`Erro ao buscar dados para ${key}:`, error);
      
      // Fallback para cache ou localStorage
      if (fallbackToCache) {
        const cached = this.cache.get(key);
        if (cached) {
          return cached.data;
        }
        
        const stored = this.getFromLocalStorage(key);
        if (stored) {
          return stored;
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Salva dados com sincronização automática
   */
  async setData(key, data, options = {}) {
    const { syncToServer = true, immediate = false } = options;
    
    try {
      // Atualizar cache local
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
      
      // Salvar no localStorage
      this.saveToLocalStorage(key, data);
      
      // Sincronizar com servidor se online
      if (syncToServer && this.isOnline) {
        if (immediate) {
          await this.syncToServer(key, data);
        } else {
          this.queueForSync(key, data);
        }
      } else if (syncToServer) {
        // Adicionar à fila para sincronizar quando voltar online
        this.queueForSync(key, data);
      }
      
      return data;
      
    } catch (error) {
      console.error(`Erro ao salvar dados para ${key}:`, error);
      throw error;
    }
  }
  
  /**
   * Adiciona item à fila de sincronização
   */
  queueForSync(key, data) {
    const existingIndex = this.syncQueue.findIndex(item => item.key === key);
    
    if (existingIndex >= 0) {
      // Atualizar item existente
      this.syncQueue[existingIndex] = { key, data, timestamp: Date.now() };
    } else {
      // Adicionar novo item
      this.syncQueue.push({ key, data, timestamp: Date.now() });
    }
  }
  
  /**
   * Processa fila de sincronização
   */
  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }
    
    const queue = [...this.syncQueue];
    this.syncQueue = [];
    
    for (const item of queue) {
      try {
        await this.syncToServer(item.key, item.data);
      } catch (error) {
        console.error(`Erro ao sincronizar ${item.key}:`, error);
        // Recolocar na fila em caso de erro
        this.queueForSync(item.key, item.data);
      }
    }
  }
  
  /**
   * Sincroniza dados com o servidor
   */
  async syncToServer(key, data) {
    // Implementar lógica específica baseada no tipo de dados
    switch (key) {
      case 'user_profile':
        return await apiService.updateProfile(data);
      case 'anamnese_answers':
        return await apiService.submitAnamnese(data);
      case 'daily_metrics':
        return await apiService.updateMetrics(data);
      default:
        console.warn(`Sincronização não implementada para ${key}`);
    }
  }
  
  // ==========================================
  // MÉTODOS DE LOCALSTORAGE
  // ==========================================
  
  saveToLocalStorage(key, data) {
    try {
      const item = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(`evolveyou_${key}`, JSON.stringify(item));
    } catch (error) {
      console.error(`Erro ao salvar no localStorage: ${key}`, error);
    }
  }
  
  getFromLocalStorage(key) {
    try {
      const item = localStorage.getItem(`evolveyou_${key}`);
      if (item) {
        const parsed = JSON.parse(item);
        return parsed.data;
      }
    } catch (error) {
      console.error(`Erro ao ler do localStorage: ${key}`, error);
    }
    return null;
  }
  
  removeFromLocalStorage(key) {
    try {
      localStorage.removeItem(`evolveyou_${key}`);
      this.cache.delete(key);
    } catch (error) {
      console.error(`Erro ao remover do localStorage: ${key}`, error);
    }
  }
  
  // ==========================================
  // MÉTODOS ESPECÍFICOS DO EVOLVEYOU
  // ==========================================
  
  /**
   * Carrega perfil do usuário
   */
  async loadUserProfile(userId) {
    return await this.getData(
      'user_profile',
      () => apiService.getUserProfile(userId),
      { cacheTime: 10 * 60 * 1000 } // 10 minutos
    );
  }
  
  /**
   * Salva perfil do usuário
   */
  async saveUserProfile(profileData) {
    return await this.setData('user_profile', profileData, {
      syncToServer: true,
      immediate: true
    });
  }
  
  /**
   * Carrega dados da anamnese
   */
  async loadAnamneseData() {
    return await this.getData(
      'anamnese_data',
      () => apiService.getAnamneseQuestions(),
      { cacheTime: 60 * 60 * 1000 } // 1 hora
    );
  }
  
  /**
   * Salva respostas da anamnese
   */
  async saveAnamneseAnswers(answers) {
    return await this.setData('anamnese_answers', answers, {
      syncToServer: true,
      immediate: false
    });
  }
  
  /**
   * Submete anamnese completa
   */
  async submitAnamnese(answers) {
    try {
      const result = await apiService.submitAnamnese({ answers });
      
      // Salvar perfil gerado
      if (result.profile) {
        await this.setData('user_profile', result.profile, {
          syncToServer: false // Já foi salvo no servidor
        });
      }
      
      // Salvar prescrições
      if (result.profile.workout_plan) {
        await this.setData('workout_plan', result.profile.workout_plan);
      }
      
      if (result.profile.nutrition_plan) {
        await this.setData('nutrition_plan', result.profile.nutrition_plan);
      }
      
      if (result.profile.hydration_plan) {
        await this.setData('hydration_plan', result.profile.hydration_plan);
      }
      
      return result;
      
    } catch (error) {
      console.error('Erro ao submeter anamnese:', error);
      throw error;
    }
  }
  
  /**
   * Carrega métricas do dashboard
   */
  async loadDashboardMetrics(userId) {
    return await this.getData(
      'dashboard_metrics',
      () => apiService.getDashboardMetrics(userId),
      { cacheTime: 2 * 60 * 1000 } // 2 minutos
    );
  }
  
  /**
   * Atualiza métricas diárias
   */
  async updateDailyMetrics(metrics) {
    return await this.setData('daily_metrics', metrics, {
      syncToServer: true,
      immediate: false
    });
  }
  
  /**
   * Carrega círculos de atividade
   */
  async loadActivityRings(userId) {
    return await this.getData(
      'activity_rings',
      () => apiService.getActivityRings(userId),
      { cacheTime: 1 * 60 * 1000 } // 1 minuto
    );
  }
  
  /**
   * Carrega plano de treino
   */
  async loadWorkoutPlan(userId) {
    return await this.getData(
      'workout_plan',
      () => apiService.getWorkoutPlan(userId),
      { cacheTime: 30 * 60 * 1000 } // 30 minutos
    );
  }
  
  /**
   * Carrega plano nutricional
   */
  async loadNutritionPlan(userId) {
    return await this.getData(
      'nutrition_plan',
      () => apiService.getNutritionPlan(userId),
      { cacheTime: 30 * 60 * 1000 } // 30 minutos
    );
  }
  
  /**
   * Carrega histórico de chat
   */
  async loadChatHistory(userId) {
    return await this.getData(
      'chat_history',
      () => apiService.getChatHistory(userId),
      { cacheTime: 5 * 60 * 1000 } // 5 minutos
    );
  }
  
  /**
   * Salva mensagem do chat
   */
  async saveChatMessage(message) {
    const history = await this.loadChatHistory() || [];
    history.push(message);
    
    return await this.setData('chat_history', history, {
      syncToServer: true,
      immediate: false
    });
  }
  
  // ==========================================
  // MÉTODOS DE UTILIDADE
  // ==========================================
  
  /**
   * Limpa todos os dados do cache e localStorage
   */
  clearAllData() {
    this.cache.clear();
    this.syncQueue = [];
    
    // Limpar localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('evolveyou_')) {
        localStorage.removeItem(key);
      }
    });
  }
  
  /**
   * Força sincronização de todos os dados
   */
  async forceSync() {
    await this.processSyncQueue();
    this.lastSync = new Date().toISOString();
  }
  
  /**
   * Obtém estatísticas do cache
   */
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      syncQueueSize: this.syncQueue.length,
      isOnline: this.isOnline,
      lastSync: this.lastSync
    };
  }
  
  /**
   * Calcula dados derivados do perfil
   */
  calculateDerivedData(profile) {
    if (!profile.weight || !profile.height || !profile.age) {
      return profile;
    }
    
    // Calcular IMC
    const heightInMeters = profile.height / 100;
    const bmi = profile.weight / (heightInMeters * heightInMeters);
    
    // Calcular peso ideal (fórmula de Devine)
    let idealWeight;
    if (profile.gender === 'masculino') {
      idealWeight = 50 + 2.3 * ((profile.height / 2.54) - 60);
    } else {
      idealWeight = 45.5 + 2.3 * ((profile.height / 2.54) - 60);
    }
    
    // Calcular percentual de gordura estimado (fórmula de Deurenberg)
    let bodyFatPercentage;
    if (profile.gender === 'masculino') {
      bodyFatPercentage = (1.20 * bmi) + (0.23 * profile.age) - 16.2;
    } else {
      bodyFatPercentage = (1.20 * bmi) + (0.23 * profile.age) - 5.4;
    }
    
    return {
      ...profile,
      bmi: Math.round(bmi * 10) / 10,
      idealWeight: Math.round(idealWeight),
      bodyFatPercentage: Math.max(0, Math.round(bodyFatPercentage * 10) / 10)
    };
  }
}

// Instância singleton
export const dataService = new DataService();

export default dataService;

