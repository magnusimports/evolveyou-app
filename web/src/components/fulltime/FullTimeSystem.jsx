import React, { useState, useEffect } from 'react';
import './FullTimeSystem.css';

const FullTimeSystem = () => {
  const [status, setStatus] = useState(null);
  const [activities, setActivities] = useState([]);
  const [rebalances, setRebalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado do formulário de atividade
  const [activityForm, setActivityForm] = useState({
    activity_type: 'walking',
    duration_minutes: 30,
    intensity: 'moderate',
    description: ''
  });
  
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Tipos de atividades suportadas
  const activityTypes = {
    walking: '🚶 Caminhada',
    stairs: '🪜 Subir Escadas',
    housework: '🏠 Trabalho Doméstico',
    sports: '⚽ Esportes',
    cycling: '🚴 Ciclismo',
    running: '🏃 Corrida',
    dancing: '💃 Dança',
    gardening: '🌱 Jardinagem',
    cleaning: '🧹 Limpeza',
    shopping: '🛒 Compras'
  };

  const intensityLevels = {
    low: 'Baixa',
    moderate: 'Moderada',
    high: 'Alta'
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fulltime/dashboard/demo_user');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados do Sistema Full-time');
      }
      
      const data = await response.json();
      setStatus(data.status);
      setActivities(data.recent_activities || []);
      setRebalances(data.recent_rebalances || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar dashboard Full-time:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitActivity = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/fulltime/register-activity?user_id=demo_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityForm)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao registrar atividade');
      }
      
      const result = await response.json();
      
      // Mostrar mensagem de sucesso
      alert(result.message);
      
      // Resetar formulário
      setActivityForm({
        activity_type: 'walking',
        duration_minutes: 30,
        intensity: 'moderate',
        description: ''
      });
      
      setShowForm(false);
      
      // Recarregar dados
      await loadDashboardData();
      
    } catch (err) {
      alert('Erro ao registrar atividade: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFullTimeStatus = async () => {
    try {
      const response = await fetch('/api/fulltime/toggle-status/demo_user', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Erro ao alterar status');
      }
      
      const result = await response.json();
      alert(result.message);
      
      // Recarregar dados
      await loadDashboardData();
      
    } catch (err) {
      alert('Erro ao alterar status: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="fulltime-loading">
        <div className="loading-spinner"></div>
        <p>Carregando Sistema Full-time...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fulltime-error">
        <h3>⚠️ Erro no Sistema Full-time</h3>
        <p>{error}</p>
        <button onClick={loadDashboardData} className="retry-button">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="fulltime-container">
      <div className="fulltime-header">
        <h2>🔄 Sistema Full-time</h2>
        <p>Rebalanceamento automático de calorias baseado em atividades extras</p>
        
        <div className="status-toggle">
          <button 
            onClick={toggleFullTimeStatus}
            className={`status-button ${status?.is_active ? 'active' : 'inactive'}`}
          >
            {status?.is_active ? '✅ Ativo' : '⏸️ Inativo'}
          </button>
        </div>
      </div>

      {status?.is_active && (
        <>
          {/* Estatísticas do Dia */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>🔥 Calorias Extras Hoje</h3>
              <div className="stat-value">{status.daily_extra_calories}</div>
              <div className="stat-label">calorias queimadas</div>
            </div>
            
            <div className="stat-card">
              <h3>⚖️ Rebalanceamentos</h3>
              <div className="stat-value">{status.total_rebalances_today}</div>
              <div className="stat-label">ajustes hoje</div>
            </div>
            
            <div className="stat-card">
              <h3>⏰ Último Ajuste</h3>
              <div className="stat-value">
                {status.last_rebalance 
                  ? new Date(status.last_rebalance).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Nenhum'
                }
              </div>
              <div className="stat-label">horário</div>
            </div>
          </div>

          {/* Botão para Registrar Atividade */}
          <div className="action-section">
            <button 
              onClick={() => setShowForm(!showForm)}
              className="register-activity-button"
            >
              ➕ Registrar Atividade Extra
            </button>
          </div>

          {/* Formulário de Atividade */}
          {showForm && (
            <div className="activity-form-container">
              <form onSubmit={handleSubmitActivity} className="activity-form">
                <h3>📝 Nova Atividade Extra</h3>
                
                <div className="form-group">
                  <label>Tipo de Atividade:</label>
                  <select 
                    value={activityForm.activity_type}
                    onChange={(e) => setActivityForm({...activityForm, activity_type: e.target.value})}
                    required
                  >
                    {Object.entries(activityTypes).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Duração (minutos):</label>
                  <input 
                    type="number"
                    min="1"
                    max="300"
                    value={activityForm.duration_minutes}
                    onChange={(e) => setActivityForm({...activityForm, duration_minutes: parseInt(e.target.value)})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Intensidade:</label>
                  <select 
                    value={activityForm.intensity}
                    onChange={(e) => setActivityForm({...activityForm, intensity: e.target.value})}
                    required
                  >
                    {Object.entries(intensityLevels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Observações (opcional):</label>
                  <textarea 
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({...activityForm, description: e.target.value})}
                    placeholder="Descreva a atividade..."
                    rows="3"
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="submit-button"
                  >
                    {submitting ? 'Registrando...' : '✅ Registrar Atividade'}
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="cancel-button"
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Atividades Recentes */}
          {activities.length > 0 && (
            <div className="recent-section">
              <h3>📋 Atividades Recentes</h3>
              <div className="activities-list">
                {activities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {activityTypes[activity.activity.activity_type]?.split(' ')[0] || '🏃'}
                    </div>
                    <div className="activity-details">
                      <div className="activity-name">
                        {activityTypes[activity.activity.activity_type] || activity.activity.activity_type}
                      </div>
                      <div className="activity-info">
                        {activity.activity.duration_minutes} min • 
                        {intensityLevels[activity.activity.intensity]} • 
                        {activity.calories_burned} cal
                      </div>
                    </div>
                    <div className="activity-time">
                      {new Date(activity.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rebalanceamentos Recentes */}
          {rebalances.length > 0 && (
            <div className="recent-section">
              <h3>⚖️ Rebalanceamentos Recentes</h3>
              <div className="rebalances-list">
                {rebalances.map((rebalance, index) => (
                  <div key={index} className="rebalance-item">
                    <div className="rebalance-icon">⚖️</div>
                    <div className="rebalance-details">
                      <div className="rebalance-calories">
                        {rebalance.original_calories} → {rebalance.new_calorie_target} cal
                      </div>
                      <div className="rebalance-reason">
                        {rebalance.rebalance_reason}
                      </div>
                    </div>
                    <div className="rebalance-extra">
                      +{rebalance.extra_calories_burned} cal
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!status?.is_active && (
        <div className="inactive-message">
          <h3>⏸️ Sistema Full-time Inativo</h3>
          <p>Ative o sistema para começar a registrar atividades extras e receber rebalanceamentos automáticos de calorias.</p>
        </div>
      )}
    </div>
  );
};

export default FullTimeSystem;

