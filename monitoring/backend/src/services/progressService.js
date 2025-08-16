const githubService = require('./githubService');

class ProgressService {
  constructor() {
    this.currentProgress = {
      backend: { progress: 85, status: 'in_progress', tasks: 12, completed: 10 },
      frontend: { progress: 60, status: 'in_progress', tasks: 15, completed: 9 },
      features: { progress: 65, status: 'success', tasks: 20, completed: 13 }
    };
    
    this.featuresData = [
      { name: 'Base TACO', progress: 100, priority: 'critical', status: 'completed' },
      { name: 'Sistema Full-time', progress: 0, priority: 'critical', status: 'pending' },
      { name: 'Anamnese', progress: 20, priority: 'high', status: 'in_progress' },
      { name: 'Integração APIs', progress: 25, priority: 'critical', status: 'in_progress' },
      { name: 'Ciclos 45 dias', progress: 0, priority: 'high', status: 'pending' },
      { name: 'Lista Compras', progress: 0, priority: 'medium', status: 'pending' }
    ];
    
    this.servicesStatus = [
      { name: 'Plans Service', status: 'healthy', uptime: '99.9%', response: '120ms' },
      { name: 'Users Service', status: 'healthy', uptime: '99.8%', response: '95ms' },
      { name: 'Content Service', status: 'healthy', uptime: '100%', response: '85ms' },
      { name: 'Tracking Service', status: 'healthy', uptime: '99.7%', response: '110ms' }
    ];
    
    this.recentActivity = [
      { 
        type: 'milestone', 
        message: '🎉 Base TACO EvolveYou - 100% Funcional em Produção!', 
        time: 'Agora', 
        author: 'Agente Manus',
        timestamp: new Date()
      },
      { 
        type: 'deploy', 
        message: 'Deploy do content-service com 16 alimentos brasileiros', 
        time: '5min atrás', 
        author: 'CI/CD',
        timestamp: new Date(Date.now() - 5 * 60 * 1000)
      },
      { 
        type: 'commit', 
        message: 'Implementado algoritmo de geração de dieta', 
        time: '2h atrás', 
        author: 'Agente Manus',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      { 
        type: 'deploy', 
        message: 'Deploy do plans-service realizado', 
        time: '4h atrás', 
        author: 'CI/CD',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      { 
        type: 'milestone', 
        message: 'Marco "Backend Core" atingido', 
        time: '1d atrás', 
        author: 'Sistema',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      { 
        type: 'alert', 
        message: 'Base de dados TACO precisa ser populada', 
        time: '2d atrás', 
        author: 'Sistema',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000)
      }
    ];
  }

  async getCurrentProgress() {
    return {
      overall: this.calculateOverallProgress(),
      components: this.currentProgress,
      lastUpdated: new Date().toISOString(),
      daysRemaining: 20,
      activeTasks: 8,
      completedTasks: 27,
      blockedTasks: 2
    };
  }

  calculateOverallProgress() {
    const { backend, frontend, features } = this.currentProgress;
    return Math.round((backend.progress + frontend.progress + features.progress) / 3);
  }

  async getBackendProgress() {
    return {
      ...this.currentProgress.backend,
      services: this.servicesStatus,
      details: {
        'Plans Service': 90,
        'Users Service': 85,
        'Content Service': 40,
        'Tracking Service': 70,
        'Health Check': 100
      }
    };
  }

  async getFrontendProgress() {
    return {
      ...this.currentProgress.frontend,
      screens: {
        'Authentication': 90,
        'Onboarding': 20,
        'Navigation': 95,
        'Dashboard': 80,
        'Features': 10
      }
    };
  }

  async getFeaturesProgress() {
    return this.featuresData;
  }

  async getProgressTimeline() {
    return [
      { week: 'Sem 1', planned: 25, actual: 30 },
      { week: 'Sem 2', planned: 50, actual: 45 },
      { week: 'Sem 3', planned: 75, actual: 65 },
      { week: 'Sem 4', planned: 100, actual: 85 }
    ];
  }

  async getServicesStatus() {
    return this.servicesStatus;
  }

  async getRecentActivity() {
    return this.recentActivity.sort((a, b) => b.timestamp - a.timestamp);
  }

  async updateProgress(component, progress, details = {}) {
    if (this.currentProgress[component]) {
      this.currentProgress[component].progress = progress;
      this.currentProgress[component].lastUpdated = new Date().toISOString();
      
      if (details.status) {
        this.currentProgress[component].status = details.status;
      }
      
      if (details.completed) {
        this.currentProgress[component].completed = details.completed;
      }
    }

    // Add to activity log
    this.recentActivity.unshift({
      type: 'update',
      message: `${component} atualizado para ${progress}%`,
      time: 'agora',
      author: 'Sistema',
      timestamp: new Date()
    });

    return {
      component,
      progress,
      overall: this.calculateOverallProgress(),
      timestamp: new Date().toISOString()
    };
  }

  async analyzeGitHubProgress(repos) {
    try {
      const results = {};
      
      for (const repo of repos) {
        const commits = await githubService.getRecentCommits(repo);
        const analysis = this.analyzeCommits(commits);
        results[repo] = analysis;
      }
      
      return results;
    } catch (error) {
      console.error('Erro ao analisar progresso do GitHub:', error);
      return {};
    }
  }

  analyzeCommits(commits) {
    let progressDelta = 0;
    const features = [];
    
    commits.forEach(commit => {
      const message = commit.commit.message.toLowerCase();
      
      // Simple heuristics for progress detection
      if (message.includes('implement') || message.includes('add')) {
        progressDelta += 5;
      }
      if (message.includes('fix') || message.includes('bug')) {
        progressDelta += 2;
      }
      if (message.includes('complete') || message.includes('finish')) {
        progressDelta += 10;
      }
      
      // Feature detection
      if (message.includes('taco')) features.push('Base TACO');
      if (message.includes('anamnese')) features.push('Anamnese');
      if (message.includes('full-time')) features.push('Sistema Full-time');
    });
    
    return {
      progressDelta: Math.min(progressDelta, 25), // Cap at 25%
      featuresDetected: [...new Set(features)],
      commitsAnalyzed: commits.length
    };
  }
}

module.exports = new ProgressService();

