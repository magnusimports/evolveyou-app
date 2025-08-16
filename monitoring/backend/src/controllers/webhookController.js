const crypto = require('crypto');
const { githubService } = require('../services/githubService');
const { progressService } = require('../services/progressService');
const { notificationService } = require('../services/notificationService');

class WebhookController {
  constructor(io) {
    this.io = io;
  }

  // Verificar assinatura do webhook GitHub
  verifyGitHubSignature(payload, signature) {
    if (!process.env.GITHUB_WEBHOOK_SECRET) {
      console.warn('⚠️ GITHUB_WEBHOOK_SECRET não configurado');
      return true; // Permitir em desenvolvimento
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    const actualSignature = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(actualSignature, 'hex')
    );
  }

  // Webhook principal do GitHub
  async handleGitHubWebhook(req, res) {
    try {
      const signature = req.headers['x-hub-signature-256'];
      const event = req.headers['x-github-event'];
      const payload = JSON.stringify(req.body);

      // Verificar assinatura
      if (!this.verifyGitHubSignature(payload, signature)) {
        console.error('❌ Assinatura do webhook inválida');
        return res.status(401).json({ error: 'Assinatura inválida' });
      }

      console.log(`🎯 Webhook recebido: ${event}`);

      // Processar diferentes tipos de eventos
      switch (event) {
        case 'push':
          await this.handlePushEvent(req.body);
          break;
        case 'pull_request':
          await this.handlePullRequestEvent(req.body);
          break;
        case 'issues':
          await this.handleIssuesEvent(req.body);
          break;
        case 'release':
          await this.handleReleaseEvent(req.body);
          break;
        case 'workflow_run':
          await this.handleWorkflowEvent(req.body);
          break;
        default:
          console.log(`📝 Evento não processado: ${event}`);
      }

      res.status(200).json({ message: 'Webhook processado com sucesso' });

    } catch (error) {
      console.error('❌ Erro no webhook:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Processar evento de push
  async handlePushEvent(payload) {
    try {
      const { repository, commits, pusher, ref } = payload;
      const repoName = repository.name;
      const branch = ref.replace('refs/heads/', '');

      console.log(`📤 Push em ${repoName}/${branch}: ${commits.length} commits`);

      // Analisar commits
      const commitAnalysis = await this.analyzeCommits(commits);
      
      // Atualizar métricas de progresso
      await this.updateProgressMetrics(repoName, commitAnalysis);

      // Detectar marcos baseados nos commits
      const milestones = await this.detectMilestones(commits, repoName);

      // Emitir eventos via WebSocket
      this.io.emit('progress_update', {
        type: 'push',
        repository: repoName,
        branch,
        commits: commits.length,
        analysis: commitAnalysis,
        milestones,
        timestamp: new Date().toISOString()
      });

      // Criar notificações se necessário
      if (milestones.length > 0) {
        await this.createMilestoneNotifications(milestones, repoName);
      }

    } catch (error) {
      console.error('❌ Erro ao processar push:', error);
    }
  }

  // Processar evento de pull request
  async handlePullRequestEvent(payload) {
    try {
      const { action, pull_request, repository } = payload;
      const repoName = repository.name;
      const prNumber = pull_request.number;
      const prTitle = pull_request.title;

      console.log(`🔀 PR #${prNumber} ${action} em ${repoName}: ${prTitle}`);

      // Atualizar métricas baseadas na ação
      const progressUpdate = await this.calculatePRProgress(action, pull_request);

      // Emitir evento via WebSocket
      this.io.emit('progress_update', {
        type: 'pull_request',
        action,
        repository: repoName,
        pr: {
          number: prNumber,
          title: prTitle,
          state: pull_request.state
        },
        progress: progressUpdate,
        timestamp: new Date().toISOString()
      });

      // Notificar sobre PRs importantes
      if (action === 'opened' || action === 'closed') {
        await this.createPRNotification(action, pull_request, repoName);
      }

    } catch (error) {
      console.error('❌ Erro ao processar PR:', error);
    }
  }

  // Processar evento de issues
  async handleIssuesEvent(payload) {
    try {
      const { action, issue, repository } = payload;
      const repoName = repository.name;
      const issueNumber = issue.number;
      const issueTitle = issue.title;

      console.log(`🐛 Issue #${issueNumber} ${action} em ${repoName}: ${issueTitle}`);

      // Atualizar métricas de issues
      const progressUpdate = await this.calculateIssueProgress(action, issue);

      // Emitir evento via WebSocket
      this.io.emit('progress_update', {
        type: 'issues',
        action,
        repository: repoName,
        issue: {
          number: issueNumber,
          title: issueTitle,
          state: issue.state,
          labels: issue.labels.map(label => label.name)
        },
        progress: progressUpdate,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Erro ao processar issue:', error);
    }
  }

  // Processar evento de release
  async handleReleaseEvent(payload) {
    try {
      const { action, release, repository } = payload;
      const repoName = repository.name;
      const tagName = release.tag_name;

      console.log(`🚀 Release ${tagName} ${action} em ${repoName}`);

      if (action === 'published') {
        // Marco importante: nova release
        const milestone = {
          type: 'release',
          title: `Release ${tagName}`,
          repository: repoName,
          description: release.body || 'Nova versão publicada',
          date: new Date().toISOString()
        };

        // Emitir evento via WebSocket
        this.io.emit('milestone_achieved', {
          milestone,
          repository: repoName,
          timestamp: new Date().toISOString()
        });

        // Criar notificação
        await this.createReleaseNotification(release, repoName);
      }

    } catch (error) {
      console.error('❌ Erro ao processar release:', error);
    }
  }

  // Processar evento de workflow (CI/CD)
  async handleWorkflowEvent(payload) {
    try {
      const { action, workflow_run, repository } = payload;
      const repoName = repository.name;
      const workflowName = workflow_run.name;
      const conclusion = workflow_run.conclusion;

      console.log(`⚙️ Workflow "${workflowName}" ${action} em ${repoName}: ${conclusion}`);

      // Emitir evento via WebSocket
      this.io.emit('workflow_update', {
        repository: repoName,
        workflow: workflowName,
        status: workflow_run.status,
        conclusion,
        timestamp: new Date().toISOString()
      });

      // Notificar sobre falhas de CI/CD
      if (conclusion === 'failure') {
        await this.createWorkflowFailureNotification(workflow_run, repoName);
      }

    } catch (error) {
      console.error('❌ Erro ao processar workflow:', error);
    }
  }

  // Analisar commits para extrair insights
  async analyzeCommits(commits) {
    const analysis = {
      total: commits.length,
      types: {},
      authors: {},
      files: {
        added: 0,
        modified: 0,
        removed: 0
      }
    };

    commits.forEach(commit => {
      // Analisar tipo do commit
      const type = this.extractCommitType(commit.message);
      analysis.types[type] = (analysis.types[type] || 0) + 1;

      // Analisar autor
      const author = commit.author.name;
      analysis.authors[author] = (analysis.authors[author] || 0) + 1;

      // Analisar arquivos
      analysis.files.added += commit.added || 0;
      analysis.files.modified += commit.modified || 0;
      analysis.files.removed += commit.removed || 0;
    });

    return analysis;
  }

  // Extrair tipo do commit baseado na mensagem
  extractCommitType(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.startsWith('feat:') || lowerMessage.includes('feature')) return 'feature';
    if (lowerMessage.startsWith('fix:') || lowerMessage.includes('bug')) return 'fix';
    if (lowerMessage.startsWith('docs:') || lowerMessage.includes('documentation')) return 'docs';
    if (lowerMessage.startsWith('style:') || lowerMessage.includes('formatting')) return 'style';
    if (lowerMessage.startsWith('refactor:') || lowerMessage.includes('refactor')) return 'refactor';
    if (lowerMessage.startsWith('test:') || lowerMessage.includes('test')) return 'test';
    if (lowerMessage.startsWith('chore:') || lowerMessage.includes('maintenance')) return 'chore';
    
    return 'other';
  }

  // Detectar marcos baseados nos commits
  async detectMilestones(commits, repository) {
    const milestones = [];

    commits.forEach(commit => {
      const message = commit.message.toLowerCase();
      
      // Detectar marcos comuns
      if (message.includes('sprint') && message.includes('complete')) {
        milestones.push({
          type: 'sprint_completion',
          title: 'Sprint Completado',
          repository,
          commit: commit.id,
          date: commit.timestamp
        });
      }
      
      if (message.includes('mvp') || message.includes('minimum viable product')) {
        milestones.push({
          type: 'mvp',
          title: 'MVP Atingido',
          repository,
          commit: commit.id,
          date: commit.timestamp
        });
      }
      
      if (message.includes('deploy') && message.includes('production')) {
        milestones.push({
          type: 'production_deploy',
          title: 'Deploy em Produção',
          repository,
          commit: commit.id,
          date: commit.timestamp
        });
      }
    });

    return milestones;
  }

  // Atualizar métricas de progresso
  async updateProgressMetrics(repository, analysis) {
    try {
      // Calcular impacto no progresso baseado na análise
      const progressImpact = this.calculateProgressImpact(analysis);
      
      // Atualizar métricas no serviço de progresso
      await progressService.updateRepositoryProgress(repository, progressImpact);
      
    } catch (error) {
      console.error('❌ Erro ao atualizar métricas:', error);
    }
  }

  // Calcular impacto no progresso
  calculateProgressImpact(analysis) {
    let impact = 0;
    
    // Peso por tipo de commit
    const typeWeights = {
      feature: 3,
      fix: 2,
      refactor: 2,
      docs: 1,
      test: 1.5,
      style: 0.5,
      chore: 0.5,
      other: 1
    };
    
    Object.entries(analysis.types).forEach(([type, count]) => {
      impact += (typeWeights[type] || 1) * count;
    });
    
    // Considerar arquivos modificados
    impact += (analysis.files.added + analysis.files.modified) * 0.1;
    
    return Math.min(impact, 10); // Máximo 10 pontos por push
  }

  // Calcular progresso baseado em PR
  async calculatePRProgress(action, pullRequest) {
    let progress = 0;
    
    switch (action) {
      case 'opened':
        progress = 1; // Início de trabalho
        break;
      case 'closed':
        progress = pullRequest.merged ? 5 : -1; // Merged = progresso, closed = rollback
        break;
      case 'review_requested':
        progress = 0.5;
        break;
    }
    
    return progress;
  }

  // Calcular progresso baseado em issue
  async calculateIssueProgress(action, issue) {
    let progress = 0;
    
    switch (action) {
      case 'opened':
        progress = -0.5; // Nova issue = trabalho adicional
        break;
      case 'closed':
        progress = 2; // Issue resolvida = progresso
        break;
    }
    
    return progress;
  }

  // Criar notificações para marcos
  async createMilestoneNotifications(milestones, repository) {
    for (const milestone of milestones) {
      await notificationService.create({
        type: 'milestone',
        title: `Marco Atingido: ${milestone.title}`,
        message: `${repository}: ${milestone.title}`,
        repository,
        data: milestone
      });
    }
  }

  // Criar notificação para PR
  async createPRNotification(action, pullRequest, repository) {
    if (action === 'opened') {
      await notificationService.create({
        type: 'pull_request',
        title: 'Novo Pull Request',
        message: `${repository}: PR #${pullRequest.number} - ${pullRequest.title}`,
        repository,
        data: { pr: pullRequest.number, action }
      });
    }
  }

  // Criar notificação para release
  async createReleaseNotification(release, repository) {
    await notificationService.create({
      type: 'release',
      title: 'Nova Release Publicada',
      message: `${repository}: ${release.tag_name}`,
      repository,
      data: { tag: release.tag_name, name: release.name }
    });
  }

  // Criar notificação para falha de workflow
  async createWorkflowFailureNotification(workflowRun, repository) {
    await notificationService.create({
      type: 'workflow_failure',
      title: 'Falha no CI/CD',
      message: `${repository}: Workflow "${workflowRun.name}" falhou`,
      repository,
      data: { workflow: workflowRun.name, run_id: workflowRun.id },
      priority: 'high'
    });
  }

  // Endpoint para testar webhook
  async testWebhook(req, res) {
    try {
      console.log('🧪 Teste de webhook recebido');
      
      // Simular evento de push
      const testEvent = {
        type: 'test',
        repository: 'test-repo',
        message: 'Teste de webhook funcionando',
        timestamp: new Date().toISOString()
      };

      // Emitir via WebSocket
      this.io.emit('webhook_test', testEvent);

      res.json({
        success: true,
        message: 'Webhook de teste processado',
        event: testEvent
      });

    } catch (error) {
      console.error('❌ Erro no teste de webhook:', error);
      res.status(500).json({ error: 'Erro no teste' });
    }
  }
}

module.exports = WebhookController;

