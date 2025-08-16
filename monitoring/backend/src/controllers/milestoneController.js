const express = require('express');
const { milestoneService } = require('../services/milestoneService');
const router = express.Router();

// GET /api/milestones - Listar marcos
router.get('/', async (req, res) => {
  try {
    const options = {
      repository: req.query.repository,
      status: req.query.status,
      type: req.query.type,
      priority: req.query.priority,
      overdue: req.query.overdue === 'true',
      limit: parseInt(req.query.limit) || 100
    };

    const result = await milestoneService.list(options);
    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao listar marcos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/milestones/stats - Obter estatísticas
router.get('/stats', async (req, res) => {
  try {
    const stats = await milestoneService.getStats();
    res.json(stats);

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/milestones/timeline - Obter timeline
router.get('/timeline', async (req, res) => {
  try {
    const options = {
      repository: req.query.repository
    };

    const timeline = await milestoneService.getTimeline(options);
    res.json(timeline);

  } catch (error) {
    console.error('❌ Erro ao obter timeline:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/milestones/:id - Obter marco por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const milestone = await milestoneService.getById(id);
    res.json(milestone);

  } catch (error) {
    console.error('❌ Erro ao obter marco:', error);
    if (error.message === 'Marco não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/milestones - Criar marco
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      repository,
      type,
      priority,
      dueDate,
      targetValue,
      tags
    } = req.body;

    if (!title || !repository) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: title, repository' 
      });
    }

    const milestone = await milestoneService.create({
      title,
      description,
      repository,
      type,
      priority,
      dueDate,
      targetValue,
      tags
    });

    res.status(201).json(milestone);

  } catch (error) {
    console.error('❌ Erro ao criar marco:', error);
    if (error.message.includes('obrigatórios') || error.message.includes('passado')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/milestones/:id - Atualizar marco
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const milestone = await milestoneService.update(id, updates);
    res.json(milestone);

  } catch (error) {
    console.error('❌ Erro ao atualizar marco:', error);
    if (error.message === 'Marco não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('passado')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/milestones/:id/progress - Atualizar progresso
router.put('/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({ 
        error: 'Progresso deve ser um número entre 0 e 100' 
      });
    }

    const milestone = await milestoneService.update(id, { progress });
    res.json(milestone);

  } catch (error) {
    console.error('❌ Erro ao atualizar progresso:', error);
    if (error.message === 'Marco não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/milestones/:id/status - Atualizar status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Status deve ser um dos: ${validStatuses.join(', ')}` 
      });
    }

    const milestone = await milestoneService.update(id, { status });
    res.json(milestone);

  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);
    if (error.message === 'Marco não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/milestones/:id - Deletar marco
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const milestone = await milestoneService.delete(id);
    res.json(milestone);

  } catch (error) {
    console.error('❌ Erro ao deletar marco:', error);
    if (error.message === 'Marco não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/milestones/check-overdue - Verificar marcos vencidos
router.post('/check-overdue', async (req, res) => {
  try {
    const overdueMilestones = await milestoneService.checkOverdueMilestones();
    res.json({
      count: overdueMilestones.length,
      milestones: overdueMilestones
    });

  } catch (error) {
    console.error('❌ Erro ao verificar marcos vencidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/milestones/update-progress/:repository - Atualizar progresso automático
router.post('/update-progress/:repository', async (req, res) => {
  try {
    const { repository } = req.params;
    const progressData = req.body;

    await milestoneService.updateProgress(repository, progressData);
    
    res.json({ 
      success: true, 
      message: `Progresso atualizado para ${repository}` 
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar progresso automático:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/milestones/repository/:repository - Marcos por repositório
router.get('/repository/:repository', async (req, res) => {
  try {
    const { repository } = req.params;
    const options = {
      repository,
      status: req.query.status,
      type: req.query.type,
      priority: req.query.priority
    };

    const result = await milestoneService.list(options);
    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao obter marcos do repositório:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/milestones/bulk-update - Atualização em lote
router.post('/bulk-update', async (req, res) => {
  try {
    const { milestoneIds, updates } = req.body;

    if (!Array.isArray(milestoneIds) || !updates) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: milestoneIds (array), updates (object)' 
      });
    }

    const results = [];
    for (const id of milestoneIds) {
      try {
        const milestone = await milestoneService.update(id, updates);
        results.push({ id, success: true, milestone });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }

    res.json({
      total: milestoneIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    });

  } catch (error) {
    console.error('❌ Erro na atualização em lote:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

