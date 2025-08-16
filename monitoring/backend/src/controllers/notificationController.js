const express = require('express');
const { notificationService } = require('../services/notificationService');
const router = express.Router();

// GET /api/notifications - Listar notificações
router.get('/', async (req, res) => {
  try {
    const options = {
      type: req.query.type,
      repository: req.query.repository,
      unread: req.query.unread === 'true',
      priority: req.query.priority,
      limit: parseInt(req.query.limit) || 50
    };

    const result = await notificationService.list(options);
    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao listar notificações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/notifications/stats - Obter estatísticas
router.get('/stats', async (req, res) => {
  try {
    const stats = await notificationService.getStats();
    res.json(stats);

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/notifications - Criar notificação
router.post('/', async (req, res) => {
  try {
    const { type, title, message, repository, priority, data } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: type, title, message' 
      });
    }

    const notification = await notificationService.create({
      type,
      title,
      message,
      repository,
      priority,
      data
    });

    res.status(201).json(notification);

  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/notifications/system - Criar notificação de sistema
router.post('/system', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (!type || !data) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: type, data' 
      });
    }

    const notification = await notificationService.createSystemNotification(type, data);
    res.status(201).json(notification);

  } catch (error) {
    console.error('❌ Erro ao criar notificação de sistema:', error);
    if (error.message.includes('Tipo de notificação de sistema desconhecido')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/notifications/:id/read - Marcar como lida
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id);
    res.json(notification);

  } catch (error) {
    console.error('❌ Erro ao marcar notificação como lida:', error);
    if (error.message === 'Notificação não encontrada') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/notifications/read-all - Marcar todas como lidas
router.put('/read-all', async (req, res) => {
  try {
    const options = {
      type: req.body.type,
      repository: req.body.repository
    };

    const result = await notificationService.markAllAsRead(options);
    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao marcar todas como lidas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/notifications/:id - Deletar notificação
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.delete(id);
    res.json(notification);

  } catch (error) {
    console.error('❌ Erro ao deletar notificação:', error);
    if (error.message === 'Notificação não encontrada') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/notifications/cleanup - Limpeza de notificações antigas
router.post('/cleanup', async (req, res) => {
  try {
    const daysOld = parseInt(req.body.days) || 30;
    const result = await notificationService.cleanup(daysOld);
    res.json(result);

  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

