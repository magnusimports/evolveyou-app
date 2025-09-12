/**
 * DataService Enhanced - Serviço Centralizado de Dados Aprimorado
 * Integra cache, sincronização e performance para máxima eficiência
 */

import apiService from './api.js';
import { cacheService } from './cacheService.js';
import { syncService } from './syncService.js';
import { performanceService } from './performanceService.js';

class DataServiceEnhanced {
  constructor() {
    this.isOnline = navigator.onLine;
    this.lastSync = null;
    this.requestQueue = new Map();
    this.loadingStates = new Map();
    
    // Configurar listeners de conectividade
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    // Configurar sincronização automática
    this.setupAutoSync();
  }
  
  setupAutoSync() {
    // Sincronização a cada 5 minutos quando online
    setInterval(() => {
      if (this.isOnline) {
        this.syncCriticalData();
      }
    }, 5 * 60 * 1000);
  }
  
  // ==========================================
  // MÉTODOS PRINCIPAIS DE DADOS
  // ==========================================
  
  /**
   * Obtém dados com cache inteligente e performance otimizada
   */
  async getData(type, identifier, options = {}) {
    const { 
      forceRefresh = false,
      fallbackToCache = true,
      priority = 'normal',
      timeout = 10000
    } = options;
    
    const cacheKey = `${type}:${identifier}`;
    
    // Verificar se já está carregando
    if (this.loadingStates.has(cacheKey)) {
      return this.loadingStates.get(cacheKey);
    }
    
    // Verificar cache primeiro
    if (!forceRefresh) {
      const cached = cacheService.get(type, identifier);
      if (cached) {
        console.log(`📦 Cache hit: ${cacheKey}`);
        return cached;
      }
    }
    
    // Criar promise de carregamento
    const loadingPromise = this.performDataLoad(type, identifier, options);
    this.loadingStates.set(cacheKey, loadingPromise);
    
    try {
      const result = await loadingPromise;
      this.loadingStates.delete(cacheKey);
      return result;
    } catch (error) {
      this.loadingStates.delete(cacheKey);
      
      // Fallback para cache em caso de erro
      if (fallbackToCache) {
        const cached = cacheService.get(type, identifier);
        if (cached) {
          console.warn(`⚠️ Usando cache como fallback para ${cacheKey}:`, error);
          return cached;
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Executa carregamento de dados com medição de performance
   */
  async performDataLoad(type, identifier, options) {
    const startTime = performance.now();
    const cacheKey = `${type}:${identifier}`;
    
    try {
      let data;
      
      // Determinar método de carregamento baseado no tipo
      switch (type) {
        case 'profile':
          data = await apiService.getUserProfile(identifier);
          break;
        case 'metrics':
          data = await apiService.getDashboardMetrics(identifier);
          break;
        case 'activity_rings':
          data = await apiService.getActivityRings(identifier);
          break;
        case 'workout_plan':
          data = await apiService.getWorkoutPlan(identifier);
          break;
        case 'nutrition_plan':
          data = await apiService.getNutritionPlan(identifier);
          break;
        case 'chat_history':
          data = await apiService.getChatHistory(identifier);
          break;
        case 'anamnese':
          data = await apiService.getAnamneseQuestions();
          break;
        default:
          throw new Error(`Tipo de dados não suportado: ${type}`);
      }
      
      // Salvar no cache
      cacheService.set(type, identifier, data);
      
      // Salvar no localStorage para persistência
      this.saveToLocalStorage(cacheKey, data);
      
      // Medir performance
      const loadTime = performance.now() - startTime;
      performanceService.logMetric(`Data Load: ${cacheKey}`, loadTime);
      
      console.log(`✅ Dados carregados: ${cacheKey} (${Math.round(loadTime)}ms)`);
      return data;
      
    } catch (error) {
      const loadTime = performance.now() - startTime;
      performanceService.logError(`Erro no carregamento: ${cacheKey}`, error);
      
      console.error(`❌ Erro ao carregar ${cacheKey} (${Math.round(loadTime)}ms):`, error);
      throw error;
    }
  }
  
  /**
   * Salva dados com sincronização inteligente
   */
  async setData(type, identifier, data, options = {}) {
    const { 
      syncToServer = true, 
      immediate = false,
      priority = 'normal'
    } = options;
    
    const cacheKey = `${type}:${identifier}`;
    
    try {
      // Atualizar cache imediatamente
      cacheService.set(type, identifier, data);
      
      // Salvar no localStorage
      this.saveToLocalStorage(cacheKey, data);
      
      // Sincronizar com servidor
      if (syncToServer) {
        if (this.isOnline && immediate) {
          await this.syncToServer(type, identifier, data);
        } else {
          // Adicionar à fila de sincronização
          await syncService.queueOperation({
            type: `save${type.charAt(0).toUpperCase() + type.slice(1)}`,
            userId: identifier,
            data,
            priority
          });
        }
      }
      
      console.log(`💾 Dados salvos: ${cacheKey}`);
      return data;
      
    } catch (error) {
      console.error(`❌ Erro ao salvar ${cacheKey}:`, error);
      throw error;
    }
  }
  
  // ==========================================
  // MÉTODOS ESPECÍFICOS DO EVOLVEYOU
  // ==========================================
  
  /**
   * Carrega perfil completo do usuário
   */
  async loadUserProfile(userId) {
    const profile = await this.getData('profile', userId, {
      fallbackToCache: true
    });
    
    if (profile) {
      // Calcular dados derivados
      return this.calculateDerivedData(profile);
    }
    
    return null;
  }
  
  /**
   * Salva perfil do usuário
   */
  async saveUserProfile(userId, profileData) {
    const enhancedProfile = this.calculateDerivedData(profileData);
    
    return await this.setData('profile', userId, enhancedProfile, {
      syncToServer: true,
      immediate: true,
      priority: 'high'
    });
  }
  
  /**
   * Carrega dados da anamnese
   */
  async loadAnamneseData() {
    return await this.getData('anamnese', 'questions', {
      fallbackToCache: true
    });
  }
  
  /**
   * Submete anamnese completa
   */
  async submitAnamnese(userId, answers) {
    try {
      // Medir performance da submissão
      const result = await performanceService.measureDataLoad(
        'anamnese-submission',
        () => apiService.submitAnamnese({ answers })
      );
      
      // Processar resultado
      if (result.profile) {
        // Salvar perfil gerado
        await this.setData('profile', userId, result.profile, {
          syncToServer: false // Já foi salvo no servidor
        });
        
        // Invalidar caches relacionados
        cacheService.invalidateUser(userId);
        
        // Salvar prescrições específicas
        if (result.profile.workout_plan) {
          await this.setData('workout_plan', userId, result.profile.workout_plan);
        }
        
        if (result.profile.nutrition_plan) {
          await this.setData('nutrition_plan', userId, result.profile.nutrition_plan);
        }
        
        if (result.profile.hydration_plan) {
          await this.setData('hydration_plan', userId, result.profile.hydration_plan);
        }
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
    return await this.getData('metrics', userId, {
      fallbackToCache: true
    });
  }
  
  /**
   * Atualiza métricas diárias
   */
  async updateDailyMetrics(userId, metrics) {
    return await this.setData('metrics', userId, metrics, {
      syncToServer: true,
      immediate: false,
      priority: 'normal'
    });
  }
  
  /**
   * Carrega círculos de atividade
   */
  async loadActivityRings(userId) {
    return await this.getData('activity_rings', userId, {
      fallbackToCache: true
    });
  }
  
  /**
   * Carrega plano de treino
   */
  async loadWorkoutPlan(userId) {
    return await this.getData('workout_plan', userId, {
      fallbackToCache: true
    });
  }
  
  /**
   * Carrega plano nutricional
   */
  async loadNutritionPlan(userId) {
    return await this.getData('nutrition_plan', userId, {
      fallbackToCache: true
    });
  }
  
  /**
   * Carrega histórico de chat
   */
  async loadChatHistory(userId) {
    return await this.getData('chat_history', userId, {
      fallbackToCache: true
    });
  }
  
  /**
   * Salva mensagem do chat
   */
  async saveChatMessage(userId, message) {
    // Adicionar à fila de sincronização
    await syncService.saveChatMessage(userId, message);
    
    // Atualizar cache local
    const history = cacheService.getChatHistory(userId) || [];
    history.push(message);
    cacheService.setChatHistory(userId, history);
    
    return message;
  }
  
  // ==========================================
  // MÉTODOS DE SINCRONIZAÇÃO
  // ==========================================
  
  /**
   * Sincroniza dados críticos
   */
  async syncCriticalData() {
    try {
      const userData = JSON.parse(localStorage.getItem('evolveyou_user') || '{}');
      
      if (userData.id) {
        // Sincronizar dados críticos
        await Promise.allSettled([
          this.loadUserProfile(userData.id),
          this.loadDashboardMetrics(userData.id),
          this.loadActivityRings(userData.id)
        ]);
        
        this.lastSync = new Date().toISOString();
        console.log('🔄 Sincronização crítica concluída');
      }
    } catch (error) {
      console.error('Erro na sincronização crítica:', error);
    }
  }
  
  /**
   * Sincroniza dados com o servidor
   */
  async syncToServer(type, identifier, data) {
    switch (type) {
      case 'profile':
        return await apiService.updateProfile(data);
      case 'metrics':
        return await apiService.updateMetrics(data);
      case 'chat_message':
        return await apiService.saveChatMessage(data);
      default:
        console.warn(`Sincronização não implementada para ${type}`);
    }
  }
  
  /**
   * Processa fila offline
   */
  async processOfflineQueue() {
    try {
      await syncService.forceSyncAll();
      console.log('🌐 Fila offline processada');
    } catch (error) {
      console.error('Erro ao processar fila offline:', error);
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
  
  // ==========================================
  // MÉTODOS DE UTILIDADE
  // ==========================================
  
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
    
    // Calcular percentual de gordura estimado
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
  
  /**
   * Limpa todos os dados
   */
  clearAllData() {
    cacheService.clear();
    syncService.clearLocalData();
    
    // Limpar localStorage específico
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('evolveyou_')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('🧹 Todos os dados limpos');
  }
  
  /**
   * Força sincronização completa
   */
  async forceSync() {
    await syncService.forceSyncAll();
    await this.syncCriticalData();
    this.lastSync = new Date().toISOString();
  }
  
  /**
   * Obtém estatísticas completas
   */
  getStats() {
    return {
      cache: cacheService.getStats(),
      sync: syncService.getSyncStatus(),
      performance: performanceService.getPerformanceReport(),
      isOnline: this.isOnline,
      lastSync: this.lastSync,
      loadingStates: this.loadingStates.size
    };
  }
  
  /**
   * Pré-carrega dados críticos
   */
  async preloadCriticalData(userId) {
    const criticalTypes = ['profile', 'metrics', 'activity_rings'];
    
    const results = await Promise.allSettled(
      criticalTypes.map(type => this.getData(type, userId))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`📦 Pré-carregamento: ${successful}/${criticalTypes.length} tipos carregados`);
    
    return results;
  }
}

// Instância singleton
export const dataServiceEnhanced = new DataServiceEnhanced();

export default dataServiceEnhanced;

