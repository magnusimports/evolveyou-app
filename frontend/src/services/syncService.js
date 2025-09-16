import React from 'react';

// Serviço de Sincronização - EvolveYou
import dataServiceEnhanced from './dataService.js';

class SyncService {
  constructor() {
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 segundo
    this.listeners = new Set();
    
    // Configurar listeners de conectividade
    this.setupConnectivityListeners();
    
    // Configurar sincronização automática
    this.setupAutoSync();
  }

  setupConnectivityListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Conexão restaurada - iniciando sincronização');
      this.isOnline = true;
      this.notifyListeners('online');
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      console.log('📴 Conexão perdida - modo offline ativado');
      this.isOnline = false;
      this.notifyListeners('offline');
    });
  }

  setupAutoSync() {
    // Sincronização a cada 30 segundos quando online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncCriticalData();
      }
    }, 30000);

    // Sincronização quando a aba ganha foco
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline && !this.syncInProgress) {
        this.syncCriticalData();
      }
    });
  }

  // Adicionar listener para mudanças de conectividade
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event, data = null) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Erro no listener de sincronização:', error);
      }
    });
  }

  // Adicionar operação à fila de sincronização
  queueOperation(operation) {
    const queueItem = {
      id: Date.now() + Math.random(),
      operation,
      timestamp: new Date().toISOString(),
      attempts: 0,
      priority: operation.priority || 'normal' // high, normal, low
    };

    this.syncQueue.push(queueItem);
    
    // Ordenar por prioridade
    this.syncQueue.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Tentar processar imediatamente se online
    if (this.isOnline) {
      this.processSyncQueue();
    }

    return queueItem.id;
  }

  // Processar fila de sincronização
  async processSyncQueue() {
    if (this.syncInProgress || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    this.notifyListeners('syncStart');

    const processedItems = [];
    const failedItems = [];

    for (const item of this.syncQueue) {
      try {
        await this.executeOperation(item);
        processedItems.push(item);
        console.log(`✅ Operação sincronizada: ${item.operation.type}`);
      } catch (error) {
        item.attempts++;
        console.error(`❌ Erro na sincronização (tentativa ${item.attempts}):`, error);
        
        if (item.attempts >= this.retryAttempts) {
          failedItems.push(item);
          console.error(`🚫 Operação falhou após ${this.retryAttempts} tentativas:`, item.operation);
        } else {
          // Reagendar para retry
          setTimeout(() => {
            if (this.isOnline) {
              this.processSyncQueue();
            }
          }, this.retryDelay * item.attempts);
        }
      }
    }

    // Remover itens processados e falhados da fila
    this.syncQueue = this.syncQueue.filter(item => 
      !processedItems.includes(item) && !failedItems.includes(item)
    );

    this.syncInProgress = false;
    this.notifyListeners('syncComplete', {
      processed: processedItems.length,
      failed: failedItems.length,
      remaining: this.syncQueue.length
    });
  }

  // Executar operação específica
  async executeOperation(item) {
    const { operation } = item;

    switch (operation.type) {
      case 'saveProfile':
        return await dataServiceEnhanced.saveUserProfile(operation.userId, operation.data);
      
      case 'saveAnamneseResponse':
        return await dataServiceEnhanced.saveAnamneseResponse(operation.userId, operation.data);
      
      case 'saveChatMessage':
        return await dataServiceEnhanced.saveChatMessage(operation.userId, operation.data);
      
      case 'updateMetrics':
        return await dataServiceEnhanced.updateUserMetrics(operation.userId, operation.data);
      
      case 'saveWorkoutProgress':
        return await dataServiceEnhanced.saveWorkoutProgress(operation.userId, operation.data);
      
      case 'saveNutritionLog':
        return await dataServiceEnhanced.saveNutritionLog(operation.userId, operation.data);
      
      default:
        throw new Error(`Tipo de operação desconhecido: ${operation.type}`);
    }
  }

  // Sincronizar dados críticos
  async syncCriticalData() {
    if (!this.isOnline || this.syncInProgress) return;

    try {
      this.syncInProgress = true;
      
      // Obter dados do localStorage
      const userData = JSON.parse(localStorage.getItem('evolveyou_user') || '{}');
      const profileData = JSON.parse(localStorage.getItem('evolveyou_profile') || '{}');
      
      if (userData.id && profileData.anamnese_completed) {
        // Sincronizar perfil se houver mudanças
        const lastSync = localStorage.getItem('evolveyou_last_sync');
        const profileLastModified = localStorage.getItem('evolveyou_profile_modified');
        
        if (!lastSync || (profileLastModified && profileLastModified > lastSync)) {
          await dataServiceEnhanced.saveUserProfile(userData.id, profileData);
          localStorage.setItem('evolveyou_last_sync', new Date().toISOString());
          console.log('🔄 Perfil sincronizado com sucesso');
        }
      }
      
    } catch (error) {
      console.error('Erro na sincronização crítica:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Métodos públicos para operações específicas
  async saveProfile(userId, profileData) {
    // Salvar localmente imediatamente
    localStorage.setItem('evolveyou_profile', JSON.stringify(profileData));
    localStorage.setItem('evolveyou_profile_modified', new Date().toISOString());
    
    // Adicionar à fila de sincronização
    return this.queueOperation({
      type: 'saveProfile',
      userId,
      data: profileData,
      priority: 'high'
    });
  }

  async saveAnamneseResponse(userId, responseData) {
    // Salvar localmente
    const existingResponses = JSON.parse(localStorage.getItem('evolveyou_anamnese_responses') || '[]');
    existingResponses.push(responseData);
    localStorage.setItem('evolveyou_anamnese_responses', JSON.stringify(existingResponses));
    
    // Adicionar à fila
    return this.queueOperation({
      type: 'saveAnamneseResponse',
      userId,
      data: responseData,
      priority: 'high'
    });
  }

  async saveChatMessage(userId, messageData) {
    // Salvar localmente
    const existingMessages = JSON.parse(localStorage.getItem('evolveyou_chat_history') || '[]');
    existingMessages.push(messageData);
    localStorage.setItem('evolveyou_chat_history', JSON.stringify(existingMessages));
    
    // Adicionar à fila
    return this.queueOperation({
      type: 'saveChatMessage',
      userId,
      data: messageData,
      priority: 'normal'
    });
  }

  async updateMetrics(userId, metricsData) {
    // Salvar localmente
    localStorage.setItem('evolveyou_metrics', JSON.stringify(metricsData));
    localStorage.setItem('evolveyou_metrics_modified', new Date().toISOString());
    
    // Adicionar à fila
    return this.queueOperation({
      type: 'updateMetrics',
      userId,
      data: metricsData,
      priority: 'normal'
    });
  }

  async saveWorkoutProgress(userId, workoutData) {
    // Salvar localmente
    const existingWorkouts = JSON.parse(localStorage.getItem('evolveyou_workouts') || '[]');
    existingWorkouts.push(workoutData);
    localStorage.setItem('evolveyou_workouts', JSON.stringify(existingWorkouts));
    
    // Adicionar à fila
    return this.queueOperation({
      type: 'saveWorkoutProgress',
      userId,
      data: workoutData,
      priority: 'normal'
    });
  }

  async saveNutritionLog(userId, nutritionData) {
    // Salvar localmente
    const existingLogs = JSON.parse(localStorage.getItem('evolveyou_nutrition_logs') || '[]');
    existingLogs.push(nutritionData);
    localStorage.setItem('evolveyou_nutrition_logs', JSON.stringify(existingLogs));
    
    // Adicionar à fila
    return this.queueOperation({
      type: 'saveNutritionLog',
      userId,
      data: nutritionData,
      priority: 'low'
    });
  }

  // Forçar sincronização completa
  async forceSyncAll() {
    if (!this.isOnline) {
      throw new Error('Sincronização requer conexão com a internet');
    }

    this.notifyListeners('forceSyncStart');
    
    try {
      // Processar toda a fila
      await this.processSyncQueue();
      
      // Sincronizar dados críticos
      await this.syncCriticalData();
      
      this.notifyListeners('forceSyncComplete');
      return true;
    } catch (error) {
      this.notifyListeners('forceSyncError', error);
      throw error;
    }
  }

  // Limpar dados locais (logout)
  clearLocalData() {
    const keysToRemove = [
      'evolveyou_user',
      'evolveyou_profile',
      'evolveyou_anamnese_responses',
      'evolveyou_chat_history',
      'evolveyou_metrics',
      'evolveyou_workouts',
      'evolveyou_nutrition_logs',
      'evolveyou_last_sync',
      'evolveyou_profile_modified',
      'evolveyou_metrics_modified'
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));
    this.syncQueue = [];
    console.log('🧹 Dados locais limpos');
  }

  // Obter status da sincronização
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      queueLength: this.syncQueue.length,
      lastSync: localStorage.getItem('evolveyou_last_sync'),
      pendingOperations: this.syncQueue.map(item => ({
        type: item.operation.type,
        priority: item.priority,
        attempts: item.attempts,
        timestamp: item.timestamp
      }))
    };
  }
}

// Instância singleton
export const syncService = new SyncService();

// Hook React para usar o serviço de sincronização
export const useSyncService = () => {
  const [syncStatus, setSyncStatus] = React.useState(syncService.getSyncStatus());

  React.useEffect(() => {
    const unsubscribe = syncService.addListener(() => {
      setSyncStatus(syncService.getSyncStatus());
    });

    return unsubscribe;
  }, []);

  return {
    syncStatus,
    saveProfile: syncService.saveProfile.bind(syncService),
    saveAnamneseResponse: syncService.saveAnamneseResponse.bind(syncService),
    saveChatMessage: syncService.saveChatMessage.bind(syncService),
    updateMetrics: syncService.updateMetrics.bind(syncService),
    saveWorkoutProgress: syncService.saveWorkoutProgress.bind(syncService),
    saveNutritionLog: syncService.saveNutritionLog.bind(syncService),
    forceSyncAll: syncService.forceSyncAll.bind(syncService),
    clearLocalData: syncService.clearLocalData.bind(syncService)
  };
};

