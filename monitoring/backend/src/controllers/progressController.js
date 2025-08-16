const express = require('express');
const router = express.Router();
const progressService = require('../services/progressService');

// GET /api/progress - Obter progresso geral
router.get('/', async (req, res) => {
  try {
    const progress = await progressService.getCurrentProgress();
    res.json(progress);
  } catch (error) {
    console.error('Erro ao obter progresso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/progress/backend - Progresso do backend
router.get('/backend', async (req, res) => {
  try {
    const backendProgress = await progressService.getBackendProgress();
    res.json(backendProgress);
  } catch (error) {
    console.error('Erro ao obter progresso do backend:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/progress/frontend - Progresso do frontend
router.get('/frontend', async (req, res) => {
  try {
    const frontendProgress = await progressService.getFrontendProgress();
    res.json(frontendProgress);
  } catch (error) {
    console.error('Erro ao obter progresso do frontend:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/progress/features - Progresso das funcionalidades
router.get('/features', async (req, res) => {
  try {
    const featuresProgress = await progressService.getFeaturesProgress();
    res.json(featuresProgress);
  } catch (error) {
    console.error('Erro ao obter progresso das funcionalidades:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/progress/timeline - Timeline de progresso
router.get('/timeline', async (req, res) => {
  try {
    const timeline = await progressService.getProgressTimeline();
    res.json(timeline);
  } catch (error) {
    console.error('Erro ao obter timeline:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/progress/services - Status dos serviços
router.get('/services', async (req, res) => {
  try {
    const servicesStatus = await progressService.getServicesStatus();
    res.json(servicesStatus);
  } catch (error) {
    console.error('Erro ao obter status dos serviços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/progress/activity - Atividade recente
router.get('/activity', async (req, res) => {
  try {
    const activity = await progressService.getRecentActivity();
    res.json(activity);
  } catch (error) {
    console.error('Erro ao obter atividade recente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/progress/update - Atualizar progresso manualmente
router.post('/update', async (req, res) => {
  try {
    const { component, progress, details } = req.body;
    const result = await progressService.updateProgress(component, progress, details);
    
    // Emit update via WebSocket
    const { io } = require('../server');
    io.emit('progress_update', result);
    
    res.json(result);
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

