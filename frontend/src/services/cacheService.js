// Serviço de Cache Avançado - EvolveYou
import React from 'react';

class CacheService {
  constructor() {
    this.cache = new Map();
    this.cacheConfig = {
      // Configurações de TTL por tipo de dados (em milissegundos)
      profile: 5 * 60 * 1000,        // 5 minutos
      metrics: 2 * 60 * 1000,        // 2 minutos
      workouts: 10 * 60 * 1000,      // 10 minutos
      nutrition: 5 * 60 * 1000,      // 5 minutos
      chat: 30 * 60 * 1000,          // 30 minutos
      anamnese: 60 * 60 * 1000,      // 1 hora
      recommendations: 15 * 60 * 1000, // 15 minutos
      default: 5 * 60 * 1000         // 5 minutos padrão
    };
    
    // Configurar limpeza automática
    this.setupAutoCleanup();
  }

  setupAutoCleanup() {
    // Limpar cache expirado a cada 2 minutos
    setInterval(() => {
      this.cleanExpiredEntries();
    }, 2 * 60 * 1000);
  }

  // Gerar chave de cache
  generateKey(type, identifier, params = {}) {
    const paramString = Object.keys(params).length > 0 
      ? JSON.stringify(params) 
      : '';
    return `${type}:${identifier}:${paramString}`;
  }

  // Definir item no cache
  set(type, identifier, data, customTTL = null, params = {}) {
    const key = this.generateKey(type, identifier, params);
    const ttl = customTTL || this.cacheConfig[type] || this.cacheConfig.default;
    const expiresAt = Date.now() + ttl;

    const cacheEntry = {
      data,
      type,
      identifier,
      params,
      createdAt: Date.now(),
      expiresAt,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    this.cache.set(key, cacheEntry);
    
    console.log(`📦 Cache SET: ${key} (TTL: ${ttl}ms)`);
    return key;
  }

  // Obter item do cache
  get(type, identifier, params = {}) {
    const key = this.generateKey(type, identifier, params);
    const entry = this.cache.get(key);

    if (!entry) {
      console.log(`📦 Cache MISS: ${key}`);
      return null;
    }

    // Verificar se expirou
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      console.log(`📦 Cache EXPIRED: ${key}`);
      return null;
    }

    // Atualizar estatísticas de acesso
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    console.log(`📦 Cache HIT: ${key} (acessos: ${entry.accessCount})`);
    return entry.data;
  }

  // Verificar se existe no cache
  has(type, identifier, params = {}) {
    const key = this.generateKey(type, identifier, params);
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    
    // Verificar se expirou
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Invalidar cache específico
  invalidate(type, identifier = null, params = {}) {
    if (identifier) {
      // Invalidar entrada específica
      const key = this.generateKey(type, identifier, params);
      const deleted = this.cache.delete(key);
      console.log(`📦 Cache INVALIDATE: ${key} (${deleted ? 'removido' : 'não encontrado'})`);
      return deleted;
    } else {
      // Invalidar todas as entradas do tipo
      let deletedCount = 0;
      for (const [key, entry] of this.cache.entries()) {
        if (entry.type === type) {
          this.cache.delete(key);
          deletedCount++;
        }
      }
      console.log(`📦 Cache INVALIDATE TYPE: ${type} (${deletedCount} entradas removidas)`);
      return deletedCount;
    }
  }

  // Invalidar cache por padrão
  invalidatePattern(pattern) {
    let deletedCount = 0;
    const regex = new RegExp(pattern);
    
    for (const [key] of this.cache.entries()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    console.log(`📦 Cache INVALIDATE PATTERN: ${pattern} (${deletedCount} entradas removidas)`);
    return deletedCount;
  }

  // Limpar entradas expiradas
  cleanExpiredEntries() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`📦 Cache CLEANUP: ${cleanedCount} entradas expiradas removidas`);
    }
  }

  // Limpar todo o cache
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`📦 Cache CLEAR: ${size} entradas removidas`);
  }

  // Obter estatísticas do cache
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    
    const stats = {
      totalEntries: entries.length,
      expiredEntries: entries.filter(e => now > e.expiresAt).length,
      byType: {},
      memoryUsage: this.estimateMemoryUsage(),
      oldestEntry: null,
      newestEntry: null,
      mostAccessed: null
    };

    // Estatísticas por tipo
    entries.forEach(entry => {
      if (!stats.byType[entry.type]) {
        stats.byType[entry.type] = {
          count: 0,
          totalAccess: 0,
          avgAccess: 0
        };
      }
      stats.byType[entry.type].count++;
      stats.byType[entry.type].totalAccess += entry.accessCount;
    });

    // Calcular médias
    Object.keys(stats.byType).forEach(type => {
      const typeStats = stats.byType[type];
      typeStats.avgAccess = typeStats.totalAccess / typeStats.count;
    });

    // Encontrar entradas especiais
    if (entries.length > 0) {
      stats.oldestEntry = entries.reduce((oldest, current) => 
        current.createdAt < oldest.createdAt ? current : oldest
      );
      
      stats.newestEntry = entries.reduce((newest, current) => 
        current.createdAt > newest.createdAt ? current : newest
      );
      
      stats.mostAccessed = entries.reduce((most, current) => 
        current.accessCount > most.accessCount ? current : most
      );
    }

    return stats;
  }

  // Estimar uso de memória
  estimateMemoryUsage() {
    let totalSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      // Estimar tamanho da chave
      totalSize += key.length * 2; // UTF-16
      
      // Estimar tamanho dos dados
      try {
        const dataString = JSON.stringify(entry.data);
        totalSize += dataString.length * 2;
      } catch {
        // Se não conseguir serializar, usar estimativa
        totalSize += 1000; // 1KB estimado
      }
      
      // Metadados da entrada
      totalSize += 200; // Estimativa para metadados
    }
    
    return {
      bytes: totalSize,
      kb: Math.round(totalSize / 1024),
      mb: Math.round(totalSize / (1024 * 1024) * 100) / 100
    };
  }

  // Métodos específicos para tipos de dados do EvolveYou

  // Cache de perfil do usuário
  setProfile(userId, profileData, ttl = null) {
    return this.set('profile', userId, profileData, ttl);
  }

  getProfile(userId) {
    return this.get('profile', userId);
  }

  invalidateProfile(userId) {
    return this.invalidate('profile', userId);
  }

  // Cache de métricas
  setMetrics(userId, metricsData, ttl = null) {
    return this.set('metrics', userId, metricsData, ttl);
  }

  getMetrics(userId) {
    return this.get('metrics', userId);
  }

  invalidateMetrics(userId) {
    return this.invalidate('metrics', userId);
  }

  // Cache de treinos
  setWorkouts(userId, workoutsData, ttl = null) {
    return this.set('workouts', userId, workoutsData, ttl);
  }

  getWorkouts(userId) {
    return this.get('workouts', userId);
  }

  invalidateWorkouts(userId) {
    return this.invalidate('workouts', userId);
  }

  // Cache de nutrição
  setNutrition(userId, nutritionData, ttl = null) {
    return this.set('nutrition', userId, nutritionData, ttl);
  }

  getNutrition(userId) {
    return this.get('nutrition', userId);
  }

  invalidateNutrition(userId) {
    return this.invalidate('nutrition', userId);
  }

  // Cache de chat
  setChatHistory(userId, chatData, ttl = null) {
    return this.set('chat', userId, chatData, ttl);
  }

  getChatHistory(userId) {
    return this.get('chat', userId);
  }

  invalidateChat(userId) {
    return this.invalidate('chat', userId);
  }

  // Cache de anamnese
  setAnamneseData(userId, anamneseData, ttl = null) {
    return this.set('anamnese', userId, anamneseData, ttl);
  }

  getAnamneseData(userId) {
    return this.get('anamnese', userId);
  }

  invalidateAnamnese(userId) {
    return this.invalidate('anamnese', userId);
  }

  // Cache de recomendações
  setRecommendations(userId, recommendationsData, ttl = null) {
    return this.set('recommendations', userId, recommendationsData, ttl);
  }

  getRecommendations(userId) {
    return this.get('recommendations', userId);
  }

  invalidateRecommendations(userId) {
    return this.invalidate('recommendations', userId);
  }

  // Invalidar todos os dados de um usuário
  invalidateUser(userId) {
    const types = ['profile', 'metrics', 'workouts', 'nutrition', 'chat', 'anamnese', 'recommendations'];
    let totalDeleted = 0;
    
    types.forEach(type => {
      totalDeleted += this.invalidate(type, userId);
    });
    
    console.log(`📦 Cache INVALIDATE USER: ${userId} (${totalDeleted} entradas removidas)`);
    return totalDeleted;
  }

  // Pré-carregar dados críticos
  async preloadCriticalData(userId, dataService) {
    const criticalData = [
      { type: 'profile', loader: () => dataService.loadUserProfile(userId) },
      { type: 'metrics', loader: () => dataService.loadUserMetrics(userId) },
      { type: 'anamnese', loader: () => dataService.loadAnamneseData(userId) }
    ];

    const results = await Promise.allSettled(
      criticalData.map(async ({ type, loader }) => {
        try {
          const data = await loader();
          if (data) {
            this.set(type, userId, data);
            return { type, success: true };
          }
          return { type, success: false, reason: 'no data' };
        } catch (error) {
          return { type, success: false, reason: error.message };
        }
      })
    );

    const successful = results.filter(r => r.value?.success).length;
    console.log(`📦 Cache PRELOAD: ${successful}/${criticalData.length} dados críticos carregados`);
    
    return results;
  }
}

// Instância singleton
export const cacheService = new CacheService();

// Hook React para usar o serviço de cache
export const useCacheService = () => {
  const [cacheStats, setCacheStats] = React.useState(cacheService.getStats());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCacheStats(cacheService.getStats());
    }, 10000); // Atualizar stats a cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  return {
    cacheStats,
    setProfile: cacheService.setProfile.bind(cacheService),
    getProfile: cacheService.getProfile.bind(cacheService),
    setMetrics: cacheService.setMetrics.bind(cacheService),
    getMetrics: cacheService.getMetrics.bind(cacheService),
    setWorkouts: cacheService.setWorkouts.bind(cacheService),
    getWorkouts: cacheService.getWorkouts.bind(cacheService),
    setNutrition: cacheService.setNutrition.bind(cacheService),
    getNutrition: cacheService.getNutrition.bind(cacheService),
    setChatHistory: cacheService.setChatHistory.bind(cacheService),
    getChatHistory: cacheService.getChatHistory.bind(cacheService),
    invalidateUser: cacheService.invalidateUser.bind(cacheService),
    clear: cacheService.clear.bind(cacheService)
  };
};

