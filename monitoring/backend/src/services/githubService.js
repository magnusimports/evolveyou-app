const { Octokit } = require('@octokit/rest');

class GitHubService {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    this.owner = process.env.GITHUB_OWNER || 'magnusimports';
  }

  async getRepositories() {
    try {
      const { data } = await this.octokit.rest.repos.listForOwner({
        owner: this.owner,
        type: 'private',
        sort: 'updated',
        per_page: 10
      });
      
      return data.map(repo => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        updated_at: repo.updated_at,
        language: repo.language,
        size: repo.size,
        open_issues: repo.open_issues_count
      }));
    } catch (error) {
      console.error('Erro ao obter repositórios:', error);
      throw error;
    }
  }

  async getRecentCommits(repoName, limit = 10) {
    try {
      const { data } = await this.octokit.rest.repos.listCommits({
        owner: this.owner,
        repo: repoName,
        per_page: limit
      });
      
      return data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date
        },
        url: commit.html_url,
        stats: commit.stats
      }));
    } catch (error) {
      console.error(`Erro ao obter commits do ${repoName}:`, error);
      throw error;
    }
  }

  async analyzeRepository(repoName) {
    try {
      // Get repository info
      const { data: repo } = await this.octokit.rest.repos.get({
        owner: this.owner,
        repo: repoName
      });
      
      // Get recent commits
      const commits = await this.getRecentCommits(repoName, 20);
      
      // Get languages
      const { data: languages } = await this.octokit.rest.repos.listLanguages({
        owner: this.owner,
        repo: repoName
      });
      
      // Get contributors
      const { data: contributors } = await this.octokit.rest.repos.listContributors({
        owner: this.owner,
        repo: repoName
      });
      
      // Analyze commit patterns
      const commitAnalysis = this.analyzeCommitPatterns(commits);
      
      return {
        repository: {
          name: repo.name,
          description: repo.description,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          size: repo.size,
          language: repo.language,
          open_issues: repo.open_issues_count
        },
        languages,
        contributors: contributors.length,
        commits: {
          total: commits.length,
          analysis: commitAnalysis
        },
        activity: this.calculateActivityScore(commits),
        health: this.calculateHealthScore(repo, commits)
      };
    } catch (error) {
      console.error(`Erro ao analisar repositório ${repoName}:`, error);
      throw error;
    }
  }

  analyzeCommitPatterns(commits) {
    const patterns = {
      features: 0,
      fixes: 0,
      refactors: 0,
      docs: 0,
      tests: 0
    };
    
    const authors = new Set();
    const dailyCommits = {};
    
    commits.forEach(commit => {
      const message = commit.message.toLowerCase();
      const date = commit.author.date.split('T')[0];
      
      // Categorize commits
      if (message.includes('feat') || message.includes('add') || message.includes('implement')) {
        patterns.features++;
      } else if (message.includes('fix') || message.includes('bug')) {
        patterns.fixes++;
      } else if (message.includes('refactor') || message.includes('improve')) {
        patterns.refactors++;
      } else if (message.includes('doc') || message.includes('readme')) {
        patterns.docs++;
      } else if (message.includes('test') || message.includes('spec')) {
        patterns.tests++;
      }
      
      // Track authors
      authors.add(commit.author.name);
      
      // Track daily activity
      dailyCommits[date] = (dailyCommits[date] || 0) + 1;
    });
    
    return {
      patterns,
      uniqueAuthors: authors.size,
      dailyActivity: dailyCommits,
      averageCommitsPerDay: Object.values(dailyCommits).reduce((a, b) => a + b, 0) / Object.keys(dailyCommits).length
    };
  }

  calculateActivityScore(commits) {
    if (commits.length === 0) return 0;
    
    const now = new Date();
    const recentCommits = commits.filter(commit => {
      const commitDate = new Date(commit.author.date);
      const daysDiff = (now - commitDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7; // Last 7 days
    });
    
    // Score based on recent activity
    return Math.min(recentCommits.length * 10, 100);
  }

  calculateHealthScore(repo, commits) {
    let score = 50; // Base score
    
    // Recent activity bonus
    if (commits.length > 0) {
      const lastCommit = new Date(commits[0].author.date);
      const daysSinceLastCommit = (new Date() - lastCommit) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastCommit <= 1) score += 30;
      else if (daysSinceLastCommit <= 7) score += 20;
      else if (daysSinceLastCommit <= 30) score += 10;
    }
    
    // Issues management
    if (repo.open_issues_count === 0) score += 10;
    else if (repo.open_issues_count <= 5) score += 5;
    
    // Repository size (indicates development)
    if (repo.size > 1000) score += 10;
    else if (repo.size > 100) score += 5;
    
    return Math.min(score, 100);
  }

  async createWebhook(repoName, webhookUrl) {
    try {
      const { data } = await this.octokit.rest.repos.createWebhook({
        owner: this.owner,
        repo: repoName,
        config: {
          url: webhookUrl,
          content_type: 'json',
          secret: process.env.WEBHOOK_SECRET
        },
        events: ['push', 'pull_request', 'workflow_run']
      });
      
      return data;
    } catch (error) {
      console.error(`Erro ao criar webhook para ${repoName}:`, error);
      throw error;
    }
  }
}

module.exports = new GitHubService();

