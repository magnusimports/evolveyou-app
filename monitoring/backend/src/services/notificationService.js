class NotificationService {
  constructor() {
    this.notifications = [];
    this.subscribers = new Set();
  }

  // Criar nova notificação
  async create(notification) {
    try {
      const newNotification = {
        id: this.generateId(),
        ...notification,
        createdAt: new Date().toISOString(),
        read: false,
        priority: notification.priority || 'normal'
      };

      this.notifications.unshift(newNotification);
      
      // Manter apenas as últimas 100 notificações
      if (this.notifications.length > 100) {
        this.notifications = this.notifications.slice(0, 100);
      }

      console.log(`📢 Nova notificação: ${newNotification.title}`);

      // Notificar subscribers
      this.notifySubscribers('notification_created', newNotification);

      return newNotification;

    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error);
      throw error;
    }
  }

  // Listar notificações
  async list(options = {}) {
    try {
      let filtered = [...this.notifications];

      // Filtrar por tipo
      if (options.type) {
        filtered = filtered.filter(n => n.type === options.type);
      }

      // Filtrar por repository
      if (options.repository) {
        filtered = filtered.filter(n => n.repository === options.repository);
      }

      // Filtrar por lidas/não lidas
      if (options.unread !== undefined) {
        filtered = filtered.filter(n => n.read !== options.unread);
      }

      // Filtrar por prioridade
      if (options.priority) {
        filtered = filtered.filter(n => n.priority === options.priority);
      }

      // Limitar quantidade
      const limit = options.limit || 50;
      filtered = filtered.slice(0, limit);

      return {
        notifications: filtered,
        total: this.notifications.length,
        unread: this.notifications.filter(n => !n.read).length
      };

    } catch (error) {
      console.error('❌ Erro ao listar notificações:', error);
      throw error;
    }
  }

  // Marcar como lida
  async markAsRead(notificationId) {
    try {
      const notification = this.notifications.find(n => n.id === notificationId);
      
      if (!notification) {
        throw new Error('Notificação não encontrada');
      }

      notification.read = true;
      notification.readAt = new Date().toISOString();

      this.notifySubscribers('notification_read', notification);

      return notification;

    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
      throw error;
    }
  }

  // Marcar todas como lidas
  async markAllAsRead(options = {}) {
    try {
      let toMarkAsRead = this.notifications.filter(n => !n.read);

      // Filtrar por tipo se especificado
      if (options.type) {
        toMarkAsRead = toMarkAsRead.filter(n => n.type === options.type);
      }

      // Filtrar por repository se especificado
      if (options.repository) {
        toMarkAsRead = toMarkAsRead.filter(n => n.repository === options.repository);
      }

      const readAt = new Date().toISOString();
      toMarkAsRead.forEach(notification => {
        notification.read = true;
        notification.readAt = readAt;
      });

      this.notifySubscribers('notifications_bulk_read', {
        count: toMarkAsRead.length,
        filters: options
      });

      return {
        marked: toMarkAsRead.length,
        total: this.notifications.length
      };

    } catch (error) {
      console.error('❌ Erro ao marcar todas como lidas:', error);
      throw error;
    }
  }

  // Deletar notificação
  async delete(notificationId) {
    try {
      const index = this.notifications.findIndex(n => n.id === notificationId);
      
      if (index === -1) {
        throw new Error('Notificação não encontrada');
      }

      const deleted = this.notifications.splice(index, 1)[0];

      this.notifySubscribers('notification_deleted', deleted);

      return deleted;

    } catch (error) {
      console.error('❌ Erro ao deletar notificação:', error);
      throw error;
    }
  }

  // Limpar notificações antigas
  async cleanup(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const initialCount = this.notifications.length;
      this.notifications = this.notifications.filter(n => 
        new Date(n.createdAt) > cutoffDate
      );

      const deletedCount = initialCount - this.notifications.length;

      if (deletedCount > 0) {
        console.log(`🧹 Limpeza: ${deletedCount} notificações antigas removidas`);
        this.notifySubscribers('notifications_cleaned', { deletedCount });
      }

      return { deletedCount, remaining: this.notifications.length };

    } catch (error) {
      console.error('❌ Erro na limpeza de notificações:', error);
      throw error;
    }
  }

  // Obter estatísticas
  async getStats() {
    try {
      const stats = {
        total: this.notifications.length,
        unread: this.notifications.filter(n => !n.read).length,
        byType: {},
        byPriority: {},
        byRepository: {},
        recent: this.notifications.filter(n => {
          const notificationDate = new Date(n.createdAt);
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          return notificationDate > oneDayAgo;
        }).length
      };

      // Agrupar por tipo
      this.notifications.forEach(n => {
        stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
        stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1;
        if (n.repository) {
          stats.byRepository[n.repository] = (stats.byRepository[n.repository] || 0) + 1;
        }
      });

      return stats;

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  // Criar notificações de sistema
  async createSystemNotification(type, data) {
    const systemNotifications = {
      milestone_achieved: {
        title: '🎯 Marco Atingido!',
        message: `Marco "${data.milestone}" foi alcançado no projeto ${data.repository}`,
        priority: 'high'
      },
      deployment_success: {
        title: '🚀 Deploy Realizado',
        message: `Deploy bem-sucedido em ${data.environment} para ${data.repository}`,
        priority: 'normal'
      },
      deployment_failure: {
        title: '❌ Falha no Deploy',
        message: `Deploy falhou em ${data.environment} para ${data.repository}`,
        priority: 'high'
      },
      performance_alert: {
        title: '⚠️ Alerta de Performance',
        message: `Performance degradada detectada: ${data.metric}`,
        priority: 'medium'
      },
      security_alert: {
        title: '🔒 Alerta de Segurança',
        message: `Possível problema de segurança detectado: ${data.issue}`,
        priority: 'high'
      }
    };

    const template = systemNotifications[type];
    if (!template) {
      throw new Error(`Tipo de notificação de sistema desconhecido: ${type}`);
    }

    return await this.create({
      type: `system_${type}`,
      title: template.title,
      message: template.message,
      priority: template.priority,
      data,
      repository: data.repository
    });
  }

  // Subscrever a notificações
  subscribe(callback) {
    this.subscribers.add(callback);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Notificar subscribers
  notifySubscribers(event, data) {
    this.subscribers.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('❌ Erro ao notificar subscriber:', error);
      }
    });
  }

  // Gerar ID único
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Inicializar com notificações de exemplo
  async initializeWithSampleData() {
    const sampleNotifications = [
      {
        type: 'milestone',
        title: '🎯 Sprint 2 Completado',
        message: 'evolveyou-dashboard: Funcionalidades core implementadas',
        repository: 'evolveyou-dashboard',
        priority: 'high'
      },
      {
        type: 'pull_request',
        title: '🔀 Novo Pull Request',
        message: 'evolveyou-backend: PR #15 - Implementar algoritmo de rebalanceamento',
        repository: 'evolveyou-backend',
        priority: 'normal'
      },
      {
        type: 'workflow_failure',
        title: '❌ Falha no CI/CD',
        message: 'evolveyou-frontend: Testes unitários falharam',
        repository: 'evolveyou-frontend',
        priority: 'high'
      },
      {
        type: 'release',
        title: '🚀 Nova Release',
        message: 'evolveyou-dashboard: v1.2.0 publicada',
        repository: 'evolveyou-dashboard',
        priority: 'medium'
      }
    ];

    for (const notification of sampleNotifications) {
      await this.create(notification);
    }

    console.log(`📢 ${sampleNotifications.length} notificações de exemplo criadas`);
  }
}

// Singleton instance
const notificationService = new NotificationService();

module.exports = { notificationService, NotificationService };

