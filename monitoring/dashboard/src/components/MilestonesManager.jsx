import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MilestonesManager = () => {
  const [milestones, setMilestones] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [filter, setFilter] = useState('all');

  // Carregar marcos
  useEffect(() => {
    fetchMilestones();
    fetchStats();
  }, []);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/milestones');
      const data = await response.json();
      setMilestones(data.milestones || []);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar marcos');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/milestones/stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  // Filtrar marcos
  const filteredMilestones = milestones.filter(milestone => {
    if (filter === 'all') return true;
    if (filter === 'pending') return milestone.status === 'pending';
    if (filter === 'in_progress') return milestone.status === 'in_progress';
    if (filter === 'completed') return milestone.status === 'completed';
    if (filter === 'overdue') {
      return milestone.dueDate && 
             new Date(milestone.dueDate) < new Date() && 
             milestone.status !== 'completed';
    }
    return true;
  });

  // Atualizar progresso
  const updateProgress = async (milestoneId, progress) => {
    try {
      const response = await fetch(`http://localhost:3001/api/milestones/${milestoneId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress })
      });
      
      if (response.ok) {
        await fetchMilestones();
        await fetchStats();
      }
    } catch (err) {
      console.error('Erro ao atualizar progresso:', err);
    }
  };

  // Atualizar status
  const updateStatus = async (milestoneId, status) => {
    try {
      const response = await fetch(`http://localhost:3001/api/milestones/${milestoneId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        await fetchMilestones();
        await fetchStats();
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  // Deletar marco
  const deleteMilestone = async (milestoneId) => {
    if (!confirm('Tem certeza que deseja deletar este marco?')) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/milestones/${milestoneId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchMilestones();
        await fetchStats();
      }
    } catch (err) {
      console.error('Erro ao deletar marco:', err);
    }
  };

  // Obter cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obter cor da prioridade
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Verificar se está vencido
  const isOverdue = (milestone) => {
    return milestone.dueDate && 
           new Date(milestone.dueDate) < new Date() && 
           milestone.status !== 'completed';
  };

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Sem prazo';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Marcos do Projeto</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Novo Marco
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-800">{stats.pending || 0}</div>
            <div className="text-sm text-yellow-600">Pendentes</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-800">{stats.inProgress || 0}</div>
            <div className="text-sm text-blue-600">Em Progresso</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-800">{stats.completed || 0}</div>
            <div className="text-sm text-green-600">Completos</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-800">{stats.overdue || 0}</div>
            <div className="text-sm text-red-600">Vencidos</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'in_progress', 'completed', 'overdue'].map(filterOption => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter === filterOption
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption === 'all' && 'Todos'}
              {filterOption === 'pending' && 'Pendentes'}
              {filterOption === 'in_progress' && 'Em Progresso'}
              {filterOption === 'completed' && 'Completos'}
              {filterOption === 'overdue' && 'Vencidos'}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Marcos */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredMilestones.map(milestone => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`bg-white rounded-lg shadow-sm border p-6 ${
                isOverdue(milestone) ? 'border-red-200 bg-red-50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {milestone.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                      {milestone.status === 'pending' && 'Pendente'}
                      {milestone.status === 'in_progress' && 'Em Progresso'}
                      {milestone.status === 'completed' && 'Completo'}
                      {milestone.status === 'cancelled' && 'Cancelado'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(milestone.priority)}`}>
                      {milestone.priority === 'high' && 'Alta'}
                      {milestone.priority === 'medium' && 'Média'}
                      {milestone.priority === 'low' && 'Baixa'}
                    </span>
                    {isOverdue(milestone) && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Vencido
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{milestone.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📁 {milestone.repository}</span>
                    <span>📅 {formatDate(milestone.dueDate)}</span>
                    <span>🏷️ {milestone.type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingMilestone(milestone)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteMilestone(milestone.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Deletar"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progresso</span>
                  <span className="text-sm font-medium text-gray-900">{milestone.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${milestone.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Controles de Progresso e Status */}
              <div className="flex flex-wrap gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={milestone.progress}
                  onChange={(e) => updateProgress(milestone.id, parseInt(e.target.value))}
                  className="flex-1 min-w-32"
                />
                
                <select
                  value={milestone.status}
                  onChange={(e) => updateStatus(milestone.id, e.target.value)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="pending">Pendente</option>
                  <option value="in_progress">Em Progresso</option>
                  <option value="completed">Completo</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              {/* Tags */}
              {milestone.tags && milestone.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {milestone.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredMilestones.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🎯</div>
            <div className="text-lg font-medium mb-2">Nenhum marco encontrado</div>
            <div className="text-sm">
              {filter === 'all' 
                ? 'Adicione seu primeiro marco para começar'
                : `Nenhum marco ${filter === 'pending' ? 'pendente' : filter === 'in_progress' ? 'em progresso' : filter === 'completed' ? 'completo' : 'vencido'} encontrado`
              }
            </div>
          </div>
        )}
      </div>

      {/* Modal de Adicionar Marco */}
      {showAddForm && (
        <AddMilestoneModal
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchMilestones();
            fetchStats();
          }}
        />
      )}

      {/* Modal de Editar Marco */}
      {editingMilestone && (
        <EditMilestoneModal
          milestone={editingMilestone}
          onClose={() => setEditingMilestone(null)}
          onSuccess={() => {
            setEditingMilestone(null);
            fetchMilestones();
            fetchStats();
          }}
        />
      )}
    </div>
  );
};

// Modal para Adicionar Marco
const AddMilestoneModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    repository: 'evolveyou-dashboard',
    type: 'custom',
    priority: 'medium',
    dueDate: '',
    targetValue: 100,
    tags: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await fetch('http://localhost:3001/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao criar marco');
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao criar marco');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Novo Marco</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded px-3 py-2 h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Repositório *</label>
            <select
              value={formData.repository}
              onChange={(e) => setFormData({...formData, repository: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="evolveyou-dashboard">evolveyou-dashboard</option>
              <option value="evolveyou-backend">evolveyou-backend</option>
              <option value="evolveyou-frontend">evolveyou-frontend</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="custom">Customizado</option>
                <option value="sprint">Sprint</option>
                <option value="features">Funcionalidades</option>
                <option value="coverage">Cobertura</option>
                <option value="deployment">Deploy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prioridade</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Data de Vencimento</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags (separadas por vírgula)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="mvp, dashboard, sprint-3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Criar Marco
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para Editar Marco (similar ao AddMilestoneModal)
const EditMilestoneModal = ({ milestone, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: milestone.title || '',
    description: milestone.description || '',
    repository: milestone.repository || 'evolveyou-dashboard',
    type: milestone.type || 'custom',
    priority: milestone.priority || 'medium',
    dueDate: milestone.dueDate ? milestone.dueDate.split('T')[0] : '',
    targetValue: milestone.targetValue || 100,
    tags: milestone.tags ? milestone.tags.join(', ') : ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await fetch(`http://localhost:3001/api/milestones/${milestone.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao atualizar marco');
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao atualizar marco');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Editar Marco</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded px-3 py-2 h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Repositório *</label>
            <select
              value={formData.repository}
              onChange={(e) => setFormData({...formData, repository: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="evolveyou-dashboard">evolveyou-dashboard</option>
              <option value="evolveyou-backend">evolveyou-backend</option>
              <option value="evolveyou-frontend">evolveyou-frontend</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="custom">Customizado</option>
                <option value="sprint">Sprint</option>
                <option value="features">Funcionalidades</option>
                <option value="coverage">Cobertura</option>
                <option value="deployment">Deploy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prioridade</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Data de Vencimento</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags (separadas por vírgula)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="mvp, dashboard, sprint-3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MilestonesManager;

