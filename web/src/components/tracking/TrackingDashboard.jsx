/**
 * Componente Dashboard de Tracking - Exibe resumo das atividades do usuário
 */

import React, { useEffect, useState } from 'react';
import { useDashboard } from '../../hooks/useTracking';

const TrackingDashboard = () => {
  const { data, loading, error, refresh } = useDashboard();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    // Atualizar timestamp da última atualização
    if (data) {
      setLastRefresh(new Date());
    }
  }, [data]);

  const handleRefresh = () => {
    refresh();
  };

  if (loading) {
    return (
      <div className="tracking-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tracking-dashboard error">
        <div className="error-message">
          <h3>Erro ao carregar dados</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="tracking-dashboard no-data">
        <p>Nenhum dado disponível</p>
        <button onClick={handleRefresh} className="refresh-button">
          Atualizar
        </button>
      </div>
    );
  }

  return (
    <div className="tracking-dashboard">
      <div className="dashboard-header">
        <h2>Resumo do Dia</h2>
        <div className="dashboard-actions">
          <span className="last-update">
            Atualizado: {lastRefresh.toLocaleTimeString()}
          </span>
          <button onClick={handleRefresh} className="refresh-button">
            🔄 Atualizar
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Card de Calorias */}
        <div className="dashboard-card calories">
          <div className="card-header">
            <h3>Calorias</h3>
            <span className="card-icon">🔥</span>
          </div>
          <div className="card-content">
            <div className="metric-value">
              {data.calories_consumed || 0}
            </div>
            <div className="metric-label">Consumidas</div>
            {data.calories_burned && (
              <div className="secondary-metric">
                <span>{data.calories_burned} queimadas</span>
              </div>
            )}
          </div>
        </div>

        {/* Card de Treinos */}
        <div className="dashboard-card workouts">
          <div className="card-header">
            <h3>Treinos</h3>
            <span className="card-icon">💪</span>
          </div>
          <div className="card-content">
            <div className="metric-value">
              {data.workouts_completed || 0}
            </div>
            <div className="metric-label">Completados</div>
          </div>
        </div>

        {/* Card de Peso */}
        {data.current_weight && (
          <div className="dashboard-card weight">
            <div className="card-header">
              <h3>Peso</h3>
              <span className="card-icon">⚖️</span>
            </div>
            <div className="card-content">
              <div className="metric-value">
                {data.current_weight} kg
              </div>
              <div className="metric-label">Atual</div>
            </div>
          </div>
        )}

        {/* Card de Progresso */}
        <div className="dashboard-card progress">
          <div className="card-header">
            <h3>Progresso</h3>
            <span className="card-icon">📈</span>
          </div>
          <div className="card-content">
            <div className="progress-item">
              <span>Meta Calórica</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{
                    width: `${Math.min(100, (data.calories_consumed / 2000) * 100)}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Ações Rápidas */}
      <div className="quick-actions">
        <h3>Ações Rápidas</h3>
        <div className="action-buttons">
          <button className="action-button meal">
            <span className="action-icon">🍽️</span>
            <span>Registrar Refeição</span>
          </button>
          <button className="action-button workout">
            <span className="action-icon">🏋️</span>
            <span>Iniciar Treino</span>
          </button>
          <button className="action-button weight">
            <span className="action-icon">⚖️</span>
            <span>Registrar Peso</span>
          </button>
        </div>
      </div>

      {/* Informações do Sistema */}
      <div className="system-info">
        <p>
          <strong>Data:</strong> {data.date || new Date().toLocaleDateString()}
        </p>
        <p>
          <strong>Usuário:</strong> {data.user_id || 'Demo User'}
        </p>
      </div>
    </div>
  );
};

export default TrackingDashboard;

