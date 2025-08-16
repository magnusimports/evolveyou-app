const express = require('express');
const router = express.Router();
const githubService = require('../services/githubService');
const progressService = require('../services/progressService');

// POST /api/github/webhook - GitHub webhook handler
router.post('/webhook', async (req, res) => {
  try {
    const event = req.headers['x-github-event'];
    const payload = req.body;
    
    console.log(`Received GitHub webhook: ${event}`);
    
    switch(event) {
      case 'push':
        await handlePushEvent(payload);
        break;
      case 'pull_request':
        await handlePullRequestEvent(payload);
        break;
      case 'workflow_run':
        await handleWorkflowEvent(payload);
        break;
      default:
        console.log(`Unhandled event: ${event}`);
    }
    
    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Erro no webhook do GitHub:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/github/repos - Listar repositórios
router.get('/repos', async (req, res) => {
  try {
    const repos = await githubService.getRepositories();
    res.json(repos);
  } catch (error) {
    console.error('Erro ao obter repositórios:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/github/commits/:repo - Obter commits de um repositório
router.get('/commits/:repo', async (req, res) => {
  try {
    const { repo } = req.params;
    const commits = await githubService.getRecentCommits(repo);
    res.json(commits);
  } catch (error) {
    console.error('Erro ao obter commits:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/github/analysis/:repo - Análise de progresso do repositório
router.get('/analysis/:repo', async (req, res) => {
  try {
    const { repo } = req.params;
    const analysis = await githubService.analyzeRepository(repo);
    res.json(analysis);
  } catch (error) {
    console.error('Erro ao analisar repositório:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

async function handlePushEvent(payload) {
  const { commits, repository } = payload;
  
  for (const commit of commits) {
    const analysis = await analyzeCommit(commit);
    await progressService.updateProgress(repository.name, analysis.progressDelta);
    
    // Emit via WebSocket
    const { io } = require('../server');
    io.emit('progress_update', {
      repo: repository.name,
      progress: analysis.progressDelta,
      message: commit.message,
      author: commit.author.name,
      timestamp: commit.timestamp
    });
  }
}

async function handlePullRequestEvent(payload) {
  const { action, pull_request, repository } = payload;
  
  if (action === 'closed' && pull_request.merged) {
    // PR merged - significant progress
    await progressService.updateProgress(repository.name, 10, {
      type: 'pr_merged',
      title: pull_request.title
    });
  }
}

async function handleWorkflowEvent(payload) {
  const { workflow_run, repository } = payload;
  
  if (workflow_run.conclusion === 'success') {
    // Successful build/deploy
    const { io } = require('../server');
    io.emit('build_status', {
      repo: repository.name,
      status: 'success',
      workflow: workflow_run.name,
      timestamp: workflow_run.updated_at
    });
  }
}

async function analyzeCommit(commit) {
  const message = commit.message.toLowerCase();
  let progressDelta = 0;
  const features = [];
  
  // Heuristics for progress calculation
  if (message.includes('implement') || message.includes('add')) {
    progressDelta += 5;
  }
  if (message.includes('fix') || message.includes('bug')) {
    progressDelta += 2;
  }
  if (message.includes('complete') || message.includes('finish')) {
    progressDelta += 10;
  }
  if (message.includes('refactor') || message.includes('improve')) {
    progressDelta += 3;
  }
  
  // Feature detection
  if (message.includes('taco')) features.push('Base TACO');
  if (message.includes('anamnese')) features.push('Anamnese');
  if (message.includes('full-time')) features.push('Sistema Full-time');
  if (message.includes('dashboard')) features.push('Dashboard');
  
  return {
    progressDelta: Math.min(progressDelta, 15), // Cap at 15% per commit
    featuresDetected: [...new Set(features)],
    impact: calculateImpact(commit)
  };
}

function calculateImpact(commit) {
  const additions = commit.stats?.additions || 0;
  const deletions = commit.stats?.deletions || 0;
  
  if (additions > 100) return 'high';
  if (additions > 50) return 'medium';
  return 'low';
}

module.exports = router;

