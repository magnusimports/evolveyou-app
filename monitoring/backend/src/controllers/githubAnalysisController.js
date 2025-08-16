const githubAnalysisService = require('../services/githubAnalysisService');

class GitHubAnalysisController {
  async getRepositoriesAnalysis(req, res) {
    try {
      console.log('🔍 Iniciando análise completa dos repositórios...');
      const analysis = await githubAnalysisService.analyzeAllRepositories();
      
      res.json({
        success: true,
        data: analysis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro na análise dos repositórios:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  async getRepositoryProgress(req, res) {
    try {
      const { repository } = req.params;
      
      if (!repository) {
        return res.status(400).json({
          success: false,
          error: 'Repositório não especificado'
        });
      }

      console.log(`📊 Analisando progresso do repositório: ${repository}`);
      const progress = await githubAnalysisService.calculateProgress(repository);
      
      res.json({
        success: true,
        data: progress,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`❌ Erro ao analisar ${req.params.repository}:`, error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  async getVelocityChart(req, res) {
    try {
      const days = parseInt(req.query.days) || 14;
      
      console.log(`📈 Gerando dados de velocity para ${days} dias`);
      const velocityData = await githubAnalysisService.getVelocityData(days);
      
      res.json({
        success: true,
        data: {
          velocity: velocityData,
          period: `${days} dias`,
          totalCommits: velocityData.reduce((sum, day) => sum + day.commits, 0)
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro ao gerar velocity chart:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  async getMilestones(req, res) {
    try {
      const { repository } = req.params;
      
      console.log(`🎯 Buscando marcos do repositório: ${repository}`);
      const commits = await githubAnalysisService.getRepositoryCommits(repository);
      const milestones = await githubAnalysisService.detectMilestones(commits);
      
      res.json({
        success: true,
        data: {
          repository,
          milestones,
          total: milestones.length
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`❌ Erro ao buscar marcos de ${req.params.repository}:`, error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  async getCommitAnalysis(req, res) {
    try {
      const { repository } = req.params;
      const since = req.query.since;
      
      console.log(`📝 Analisando commits de: ${repository}`);
      const commits = await githubAnalysisService.getRepositoryCommits(repository, since);
      const analysis = await githubAnalysisService.analyzeCommitPatterns(commits);
      
      res.json({
        success: true,
        data: {
          repository,
          analysis,
          period: since ? `desde ${since}` : 'todos os commits'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`❌ Erro ao analisar commits de ${req.params.repository}:`, error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  async getProductivityMetrics(req, res) {
    try {
      console.log('📊 Calculando métricas de produtividade...');
      const analysis = await githubAnalysisService.analyzeAllRepositories();
      
      const metrics = {
        overview: analysis.summary,
        repositories: analysis.repositories.map(repo => ({
          name: repo.repository,
          progress: repo.progress,
          velocity: repo.metrics?.velocity || [],
          recentActivity: repo.metrics?.recentCommits || 0,
          milestones: repo.metrics?.milestonesCount || 0
        })),
        trends: {
          totalCommits: analysis.summary.totalCommits,
          averageProgress: analysis.summary.averageProgress,
          mostActiveRepo: analysis.summary.mostActiveRepo
        }
      };
      
      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro ao calcular métricas de produtividade:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
}

module.exports = new GitHubAnalysisController();

