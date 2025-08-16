class MilestoneService {
  constructor() {
    this.milestones = [];
    this.subscribers = new Set();
    this.initializeWithSampleData();
  }

  // Criar novo marco
  async create(milestone) {
    try {
      const newMilestone = {
        id: this.generateId(),
        ...milestone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: milestone.status || 'pending',
        progress: milestone.progress || 0,
        type: milestone.type || 'custom'
      };

      // Validar dados obrigatórios
      if (!newMilestone.title || !newMilestone.repository) {
        throw new Error('Título e repositório são obrigatórios');
      }

      // Validar data de vencimento
      if (newMilestone.dueDate && new Date(newMilestone.dueDate) < new Date()) {
        throw new Error('Data de vencimento não pode ser no passado');
      }

      this.milestones.push(newMilestone);
      
      console.log(`🎯 Novo marco criado: ${newMilestone.title}`);

      // Notificar subscribers
      this.notifySubscribers('milestone_created', newMilestone);

      return newMilestone;

    } catch (error) {
      console.error('❌ Erro ao criar marco:', error);
      throw error;
    }
  }

  // Listar marcos
  async list(options = {}) {
    try {
      let filtered = [...this.milestones];

      // Filtrar por repositório
      if (options.repository) {
        filtered = filtered.filter(m => m.repository === options.repository);
      }

      // Filtrar por status
      if (options.status) {
        filtered = filtered.filter(m => m.status === options.status);
      }

      // Filtrar por tipo
      if (options.type) {
        filtered = filtered.filter(m => m.type === options.type);
      }

      // Filtrar por prioridade
      if (options.priority) {
        filtered = filtered.filter(m => m.priority === options.priority);
      }

      // Filtrar marcos vencidos
      if (options.overdue === true) {
        const now = new Date();
        filtered = filtered.filter(m => 
          m.dueDate && 
          new Date(m.dueDate) < now && 
          m.status !== 'completed'
        );
      }

      // Ordenar por data de vencimento
      filtered.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });

      // Limitar quantidade
      const limit = options.limit || 100;
      filtered = filtered.slice(0, limit);

      return {
        milestones: filtered,
        total: this.milestones.length,
        pending: this.milestones.filter(m => m.status === 'pending').length,
        inProgress: this.milestones.filter(m => m.status === 'in_progress').length,
        completed: this.milestones.filter(m => m.status === 'completed').length,
        overdue: this.milestones.filter(m => 
          m.dueDate && 
          new Date(m.dueDate) < new Date() && 
          m.status !== 'completed'
        ).length
      };

    } catch (error) {
      console.error('❌ Erro ao listar marcos:', error);
      throw error;
    }
  }

  // Obter marco por ID
  async getById(milestoneId) {
    try {
      const milestone = this.milestones.find(m => m.id === milestoneId);
      
      if (!milestone) {
        throw new Error('Marco não encontrado');
      }

      return milestone;

    } catch (error) {
      console.error('❌ Erro ao obter marco:', error);
      throw error;
    }
  }

  // Atualizar marco
  async update(milestoneId, updates) {
    try {
      const milestone = this.milestones.find(m => m.id === milestoneId);
      
      if (!milestone) {
        throw new Error('Marco não encontrado');
      }

      // Validar atualizações
      if (updates.dueDate && new Date(updates.dueDate) < new Date()) {
        throw new Error('Data de vencimento não pode ser no passado');
      }

      if (updates.progress !== undefined) {
        updates.progress = Math.max(0, Math.min(100, updates.progress));
      }

      // Aplicar atualizações
      Object.assign(milestone, updates, {
        updatedAt: new Date().toISOString()
      });

      // Verificar se marco foi completado
      if (updates.status === 'completed' || updates.progress === 100) {
        milestone.status = 'completed';
        milestone.progress = 100;
        milestone.completedAt = new Date().toISOString();
        
        console.log(`🎉 Marco completado: ${milestone.title}`);
        this.notifySubscribers('milestone_completed', milestone);
      }

      this.notifySubscribers('milestone_updated', milestone);

      return milestone;

    } catch (error) {
      console.error('❌ Erro ao atualizar marco:', error);
      throw error;
    }
  }

  // Deletar marco
  async delete(milestoneId) {
    try {
      const index = this.milestones.findIndex(m => m.id === milestoneId);
      
      if (index === -1) {
        throw new Error('Marco não encontrado');
      }

      const deleted = this.milestones.splice(index, 1)[0];

      this.notifySubscribers('milestone_deleted', deleted);

      return deleted;

    } catch (error) {
      console.error('❌ Erro ao deletar marco:', error);
      throw error;
    }
  }

  // Atualizar progresso automaticamente
  async updateProgress(repository, progressData) {
    try {
      const repositoryMilestones = this.milestones.filter(m => 
        m.repository === repository && 
        m.status !== 'completed'
      );

      for (const milestone of repositoryMilestones) {
        const newProgress = this.calculateMilestoneProgress(milestone, progressData);
        
        if (newProgress !== milestone.progress) {
          await this.update(milestone.id, { progress: newProgress });
        }
      }

    } catch (error) {
      console.error('❌ Erro ao atualizar progresso automático:', error);
    }
  }

  // Calcular progresso do marco baseado em dados
  calculateMilestoneProgress(milestone, progressData) {
    switch (milestone.type) {
      case 'commits':
        return Math.min(100, (progressData.totalCommits / milestone.targetValue) * 100);
      
      case 'features':
        return Math.min(100, (progressData.completedFeatures / milestone.targetValue) * 100);
      
      case 'coverage':
        return progressData.testCoverage || 0;
      
      case 'performance':
        return progressData.performanceScore || 0;
      
      case 'sprint':
        return progressData.sprintProgress || 0;
      
      default:
        return milestone.progress; // Manter progresso atual para tipos customizados
    }
  }

  // Verificar marcos vencidos
  async checkOverdueMilestones() {
    try {
      const now = new Date();
      const overdueMilestones = this.milestones.filter(m => 
        m.dueDate && 
        new Date(m.dueDate) < now && 
        m.status !== 'completed' &&
        !m.overdueNotified
      );

      for (const milestone of overdueMilestones) {
        milestone.overdueNotified = true;
        this.notifySubscribers('milestone_overdue', milestone);
        
        console.log(`⚠️ Marco vencido: ${milestone.title}`);
      }

      return overdueMilestones;

    } catch (error) {
      console.error('❌ Erro ao verificar marcos vencidos:', error);
      throw error;
    }
  }

  // Obter estatísticas
  async getStats() {
    try {
      const now = new Date();
      
      const stats = {
        total: this.milestones.length,
        pending: this.milestones.filter(m => m.status === 'pending').length,
        inProgress: this.milestones.filter(m => m.status === 'in_progress').length,
        completed: this.milestones.filter(m => m.status === 'completed').length,
        overdue: this.milestones.filter(m => 
          m.dueDate && 
          new Date(m.dueDate) < now && 
          m.status !== 'completed'
        ).length,
        byRepository: {},
        byType: {},
        byPriority: {},
        avgProgress: 0,
        completionRate: 0
      };

      // Agrupar por repositório, tipo e prioridade
      this.milestones.forEach(m => {
        stats.byRepository[m.repository] = (stats.byRepository[m.repository] || 0) + 1;
        stats.byType[m.type] = (stats.byType[m.type] || 0) + 1;
        stats.byPriority[m.priority || 'medium'] = (stats.byPriority[m.priority || 'medium'] || 0) + 1;
      });

      // Calcular progresso médio
      if (this.milestones.length > 0) {
        stats.avgProgress = Math.round(
          this.milestones.reduce((sum, m) => sum + m.progress, 0) / this.milestones.length
        );
        stats.completionRate = Math.round((stats.completed / this.milestones.length) * 100);
      }

      return stats;

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  // Obter timeline de marcos
  async getTimeline(options = {}) {
    try {
      let milestones = [...this.milestones];

      // Filtrar por repositório se especificado
      if (options.repository) {
        milestones = milestones.filter(m => m.repository === options.repository);
      }

      // Ordenar por data de vencimento
      milestones.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return new Date(b.createdAt) - new Date(a.createdAt);
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });

      // Agrupar por mês
      const timeline = {};
      milestones.forEach(milestone => {
        const date = milestone.dueDate || milestone.createdAt;
        const monthKey = new Date(date).toISOString().substring(0, 7); // YYYY-MM
        
        if (!timeline[monthKey]) {
          timeline[monthKey] = [];
        }
        timeline[monthKey].push(milestone);
      });

      return timeline;

    } catch (error) {
      console.error('❌ Erro ao obter timeline:', error);
      throw error;
    }
  }

  // Subscrever a eventos
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

  // Inicializar com dados de exemplo
  initializeWithSampleData() {
    const sampleMilestones = [
      {
        title: 'Dashboard MVP Completo',
        description: 'Finalizar todas as funcionalidades básicas do dashboard',
        repository: 'evolveyou-dashboard',
        type: 'sprint',
        priority: 'high',
        status: 'in_progress',
        progress: 75,
        targetValue: 100,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
        tags: ['mvp', 'dashboard', 'sprint-3']
      },
      {
        title: 'Base TACO Implementada',
        description: '✅ 16 alimentos brasileiros carregados com sucesso em produção',
        repository: 'evolveyou-backend',
        type: 'features',
        priority: 'high',
        status: 'completed',
        progress: 100,
        targetValue: 16,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 dias
        completedAt: new Date().toISOString(),
        tags: ['taco', 'database', 'nutrition', 'completed']
      },
      {
        title: 'Cobertura de Testes 80%',
        description: 'Atingir 80% de cobertura de testes no backend',
        repository: 'evolveyou-backend',
        type: 'coverage',
        priority: 'medium',
        status: 'in_progress',
        progress: 45,
        targetValue: 80,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 dias
        tags: ['testing', 'quality', 'backend']
      },
      {
        title: 'Deploy em Produção',
        description: 'Primeira versão do dashboard em produção',
        repository: 'evolveyou-dashboard',
        type: 'deployment',
        priority: 'high',
        status: 'pending',
        progress: 20,
        targetValue: 100,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 dias
        tags: ['deploy', 'production', 'release']
      },
      {
        title: 'Sistema Full-time',
        description: 'Implementar rebalanceamento automático de dietas',
        repository: 'evolveyou-backend',
        type: 'features',
        priority: 'high',
        status: 'pending',
        progress: 5,
        targetValue: 100,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        tags: ['full-time', 'algorithm', 'innovation']
      }
    ];

    sampleMilestones.forEach(milestone => {
      this.milestones.push({
        id: this.generateId(),
        ...milestone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    console.log(`🎯 ${sampleMilestones.length} marcos de exemplo criados`);
  }
}

// Singleton instance
const milestoneService = new MilestoneService();

module.exports = { milestoneService, MilestoneService };

