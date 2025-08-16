const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import controllers
const progressController = require('./controllers/progressController');
const githubController = require('./controllers/githubController');
const notificationController = require('./controllers/notificationController');
const githubAnalysisController = require('./controllers/githubAnalysisController');
const milestoneController = require('./controllers/milestoneController');
const WebhookController = require('./controllers/webhookController');

// Import services
const progressService = require('./services/progressService');
const githubService = require('./services/githubService');
const { notificationService } = require('./services/notificationService');
const { milestoneService } = require('./services/milestoneService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize webhook controller with socket.io
const webhookController = new WebhookController(io);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/progress', progressController);
app.use('/api/github', githubController);
app.use('/api/notifications', notificationController);
app.use('/api/milestones', milestoneController);

// GitHub Analysis Routes
app.get('/api/analysis/repositories', githubAnalysisController.getRepositoriesAnalysis);
app.get('/api/analysis/repository/:repository', githubAnalysisController.getRepositoryProgress);
app.get('/api/analysis/velocity', githubAnalysisController.getVelocityChart);
app.get('/api/analysis/milestones/:repository', githubAnalysisController.getMilestones);
app.get('/api/analysis/commits/:repository', githubAnalysisController.getCommitAnalysis);
app.get('/api/analysis/productivity', githubAnalysisController.getProductivityMetrics);

// Webhook Routes
app.post('/api/webhooks/github', webhookController.handleGitHubWebhook.bind(webhookController));
app.post('/api/webhooks/test', webhookController.testWebhook.bind(webhookController));

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('🔗 Cliente conectado:', socket.id);
  
  // Send initial state
  socket.emit('initial_state', progressService.getCurrentProgress());
  
  // Handle subscription to progress updates
  socket.on('subscribe_progress', (repos) => {
    socket.join(repos);
    console.log(`Cliente ${socket.id} inscrito em: ${repos}`);
  });
  
  // Handle subscription to notifications
  socket.on('subscribe_notifications', () => {
    socket.join('notifications');
    console.log(`📢 Cliente ${socket.id} inscrito em notificações`);
  });
  
  // Handle subscription to milestones
  socket.on('subscribe_milestones', () => {
    socket.join('milestones');
    console.log(`🎯 Cliente ${socket.id} inscrito em marcos`);
  });
  
  socket.on('unsubscribe_notifications', () => {
    socket.leave('notifications');
    console.log(`📢 Cliente ${socket.id} desinscrito de notificações`);
  });
  
  socket.on('unsubscribe_milestones', () => {
    socket.leave('milestones');
    console.log(`🎯 Cliente ${socket.id} desinscrito de marcos`);
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

// Subscribe to notification service events
notificationService.subscribe((event, data) => {
  io.to('notifications').emit(event, data);
});

// Subscribe to milestone service events
milestoneService.subscribe((event, data) => {
  io.to('milestones').emit(event, data);
  
  // Criar notificações para eventos importantes de marcos
  if (event === 'milestone_completed') {
    notificationService.create({
      type: 'milestone',
      title: '🎉 Marco Completado!',
      message: `${data.repository}: ${data.title}`,
      repository: data.repository,
      priority: 'high',
      data: { milestoneId: data.id }
    });
  }
  
  if (event === 'milestone_overdue') {
    notificationService.create({
      type: 'milestone_overdue',
      title: '⚠️ Marco Vencido',
      message: `${data.repository}: ${data.title}`,
      repository: data.repository,
      priority: 'high',
      data: { milestoneId: data.id }
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Erro na aplicação:', err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Dashboard Backend rodando na porta ${PORT}`);
  console.log(`📊 WebSocket ativo para updates em tempo real`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 Webhooks: http://localhost:${PORT}/api/webhooks/github`);
  console.log(`🎯 Marcos: http://localhost:${PORT}/api/milestones`);
  
  // Initialize sample notifications
  await notificationService.initializeWithSampleData();
  
  console.log('✅ Servidor inicializado com sucesso!');
});

module.exports = { app, io };

