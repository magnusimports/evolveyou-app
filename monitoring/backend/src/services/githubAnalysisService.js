const axios = require('axios');

class GitHubAnalysisService {
  constructor() {
    this.token = process.env.GITHUB_TOKEN;
    this.baseURL = 'https://api.github.com';
    this.repositories = [
      'magnusimports/evolveyou-backend',
      'magnusimports/evolveyou-frontend', 
      'magnusimports/evolveyou-dashboard-frontend',
      'magnusimports/evolveyou-dashboard-backend',
      'magnusimports/evolveyou-docs'
    ];
  }

  async getRepositoryCommits(repo, since = null) {
    try {
      const params = {
        per_page: 100,
        page: 1
      };
      
      if (since) {
        params.since = since;
      }

      const response = await axios.get(`${this.baseURL}/repos/${repo}/commits`, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params
      });

      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar commits de ${repo}:`, error.message);
      return [];
    }
  }

  async analyzeCommitPatterns(commits) {
    const analysis = {
      totalCommits: commits.length,
      commitsByDay: {},
      commitsByHour: {},
      commitsByAuthor: {},
      commitTypes: {
        feature: 0,
        fix: 0,
        docs: 0,
        style: 0,
        refactor: 0,
        test: 0,
        chore: 0,
        other: 0
      },
      productivity: {
        averageCommitsPerDay: 0,
        mostActiveDay: null,
        mostActiveHour: null,
        velocity: []
      }
    };

    commits.forEach(commit => {
      const date = new Date(commit.commit.author.date);
      const day = date.toISOString().split('T')[0];
      const hour = date.getHours();
      const author = commit.commit.author.name;
      const message = commit.commit.message.toLowerCase();

      // Commits por dia
      analysis.commitsByDay[day] = (analysis.commitsByDay[day] || 0) + 1;

      // Commits por hora
      analysis.commitsByHour[hour] = (analysis.commitsByHour[hour] || 0) + 1;

      // Commits por autor
      analysis.commitsByAuthor[author] = (analysis.commitsByAuthor[author] || 0) + 1;

      // Análise de tipos de commit
      if (message.includes('feat') || message.includes('feature') || message.includes('add')) {
        analysis.commitTypes.feature++;
      } else if (message.includes('fix') || message.includes('bug')) {
        analysis.commitTypes.fix++;
      } else if (message.includes('doc') || message.includes('readme')) {
        analysis.commitTypes.docs++;
      } else if (message.includes('style') || message.includes('format')) {
        analysis.commitTypes.style++;
      } else if (message.includes('refactor') || message.includes('clean')) {
        analysis.commitTypes.refactor++;
      } else if (message.includes('test')) {
        analysis.commitTypes.test++;
      } else if (message.includes('chore') || message.includes('update')) {
        analysis.commitTypes.chore++;
      } else {
        analysis.commitTypes.other++;
      }
    });

    // Calcular métricas de produtividade
    const days = Object.keys(analysis.commitsByDay);
    if (days.length > 0) {
      analysis.productivity.averageCommitsPerDay = analysis.totalCommits / days.length;
      
      // Dia mais ativo
      const mostActiveDay = Object.entries(analysis.commitsByDay)
        .reduce((a, b) => a[1] > b[1] ? a : b);
      analysis.productivity.mostActiveDay = {
        date: mostActiveDay[0],
        commits: mostActiveDay[1]
      };

      // Hora mais ativa
      const mostActiveHour = Object.entries(analysis.commitsByHour)
        .reduce((a, b) => a[1] > b[1] ? a : b);
      analysis.productivity.mostActiveHour = {
        hour: parseInt(mostActiveHour[0]),
        commits: mostActiveHour[1]
      };

      // Velocity (commits por dia nos últimos 7 dias)
      const last7Days = days.slice(-7);
      analysis.productivity.velocity = last7Days.map(day => ({
        date: day,
        commits: analysis.commitsByDay[day]
      }));
    }

    return analysis;
  }

  async detectMilestones(commits) {
    const milestones = [];
    
    commits.forEach(commit => {
      const message = commit.commit.message.toLowerCase();
      
      // Detectar marcos importantes
      if (message.includes('sprint') || message.includes('milestone') || 
          message.includes('release') || message.includes('deploy') ||
          message.includes('complete') || message.includes('finish')) {
        
        milestones.push({
          sha: commit.sha,
          date: commit.commit.author.date,
          message: commit.commit.message,
          author: commit.commit.author.name,
          type: this.getMilestoneType(message),
          url: commit.html_url
        });
      }
    });

    return milestones.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getMilestoneType(message) {
    if (message.includes('sprint')) return 'sprint';
    if (message.includes('release')) return 'release';
    if (message.includes('deploy')) return 'deploy';
    if (message.includes('complete') || message.includes('finish')) return 'completion';
    return 'milestone';
  }

  async calculateProgress(repo) {
    try {
      const commits = await this.getRepositoryCommits(repo);
      const analysis = await this.analyzeCommitPatterns(commits);
      const milestones = await this.detectMilestones(commits);

      // Calcular progresso baseado em commits e marcos
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      const recentCommits = commits.filter(commit => 
        new Date(commit.commit.author.date) > thirtyDaysAgo
      );

      const progressScore = Math.min(100, Math.round(
        (recentCommits.length * 2) + 
        (milestones.length * 10) + 
        (analysis.productivity.averageCommitsPerDay * 5)
      ));

      return {
        repository: repo,
        progress: progressScore,
        analysis,
        milestones: milestones.slice(0, 5), // Últimos 5 marcos
        lastUpdate: now.toISOString(),
        metrics: {
          totalCommits: commits.length,
          recentCommits: recentCommits.length,
          milestonesCount: milestones.length,
          velocity: analysis.productivity.velocity
        }
      };
    } catch (error) {
      console.error(`Erro ao calcular progresso de ${repo}:`, error.message);
      return {
        repository: repo,
        progress: 0,
        error: error.message,
        lastUpdate: new Date().toISOString()
      };
    }
  }

  async analyzeAllRepositories() {
    const results = [];
    
    for (const repo of this.repositories) {
      console.log(`📊 Analisando repositório: ${repo}`);
      const progress = await this.calculateProgress(repo);
      results.push(progress);
      
      // Delay para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      repositories: results,
      summary: this.generateSummary(results),
      lastAnalysis: new Date().toISOString()
    };
  }

  generateSummary(results) {
    const validResults = results.filter(r => !r.error);
    
    if (validResults.length === 0) {
      return {
        totalRepositories: results.length,
        averageProgress: 0,
        totalCommits: 0,
        totalMilestones: 0,
        mostActiveRepo: null
      };
    }

    const totalCommits = validResults.reduce((sum, r) => sum + (r.metrics?.totalCommits || 0), 0);
    const totalMilestones = validResults.reduce((sum, r) => sum + (r.metrics?.milestonesCount || 0), 0);
    const averageProgress = validResults.reduce((sum, r) => sum + r.progress, 0) / validResults.length;
    
    const mostActiveRepo = validResults.reduce((most, current) => 
      (current.metrics?.recentCommits || 0) > (most.metrics?.recentCommits || 0) ? current : most
    );

    return {
      totalRepositories: results.length,
      averageProgress: Math.round(averageProgress),
      totalCommits,
      totalMilestones,
      mostActiveRepo: mostActiveRepo.repository,
      analysisDate: new Date().toISOString()
    };
  }

  async getVelocityData(days = 14) {
    const allCommits = [];
    
    for (const repo of this.repositories) {
      const commits = await this.getRepositoryCommits(repo);
      allCommits.push(...commits.map(c => ({ ...c, repository: repo })));
    }

    // Agrupar commits por dia
    const velocityData = {};
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      velocityData[dateStr] = 0;
    }

    allCommits.forEach(commit => {
      const date = commit.commit.author.date.split('T')[0];
      if (velocityData.hasOwnProperty(date)) {
        velocityData[date]++;
      }
    });

    return Object.entries(velocityData)
      .map(([date, commits]) => ({ date, commits }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }
}

module.exports = new GitHubAnalysisService();

