import React, { useState, useEffect } from 'react';
import trackingService from '../../services/trackingService.js';
import './ExerciseLogger.css';

/**
 * Componente para registrar exercícios e séries
 */
const ExerciseLogger = ({ onExerciseLogged, workoutSession = null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [exerciseData, setExerciseData] = useState({
    exerciseId: '',
    exerciseName: '',
    weight: '',
    reps: '',
    setNumber: 1,
    rpe: '',
    notes: ''
  });

  const [sessionData, setSessionData] = useState({
    sessionId: workoutSession?.id || `session_${Date.now()}`,
    duration: '',
    exercises: [],
    intensity: 'medium',
    notes: ''
  });

  const [isSessionActive, setIsSessionActive] = useState(!!workoutSession);
  const [sessionStartTime, setSessionStartTime] = useState(workoutSession?.startTime || Date.now());

  const exerciseTypes = [
    { id: 'push_up', name: 'Flexão de Braço', category: 'Peito', icon: '💪' },
    { id: 'squat', name: 'Agachamento', category: 'Pernas', icon: '🦵' },
    { id: 'plank', name: 'Prancha', category: 'Core', icon: '🏋️' },
    { id: 'pull_up', name: 'Barra Fixa', category: 'Costas', icon: '🤸' },
    { id: 'deadlift', name: 'Levantamento Terra', category: 'Costas', icon: '🏋️‍♂️' },
    { id: 'bench_press', name: 'Supino', category: 'Peito', icon: '🏋️‍♀️' },
    { id: 'shoulder_press', name: 'Desenvolvimento', category: 'Ombros', icon: '💪' },
    { id: 'bicep_curl', name: 'Rosca Bíceps', category: 'Braços', icon: '💪' },
    { id: 'tricep_dip', name: 'Mergulho Tríceps', category: 'Braços', icon: '💪' },
    { id: 'lunge', name: 'Afundo', category: 'Pernas', icon: '🦵' },
    { id: 'running', name: 'Corrida', category: 'Cardio', icon: '🏃' },
    { id: 'cycling', name: 'Ciclismo', category: 'Cardio', icon: '🚴' },
    { id: 'swimming', name: 'Natação', category: 'Cardio', icon: '🏊' },
    { id: 'walking', name: 'Caminhada', category: 'Cardio', icon: '🚶' }
  ];

  const intensityLevels = [
    { value: 'low', label: 'Baixa', color: '#10b981', icon: '😌' },
    { value: 'medium', label: 'Média', color: '#f59e0b', icon: '😊' },
    { value: 'high', label: 'Alta', color: '#ef4444', icon: '😤' },
    { value: 'extreme', label: 'Extrema', color: '#7c2d12', icon: '🔥' }
  ];

  // Limpa mensagens após 3 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Atualiza duração da sessão
  useEffect(() => {
    if (isSessionActive) {
      const interval = setInterval(() => {
        const duration = Math.floor((Date.now() - sessionStartTime) / 1000 / 60);
        setSessionData(prev => ({ ...prev, duration }));
      }, 60000); // Atualiza a cada minuto

      return () => clearInterval(interval);
    }
  }, [isSessionActive, sessionStartTime]);

  const handleExerciseChange = (field, value) => {
    setExerciseData(prev => ({
      ...prev,
      [field]: value
    }));

    // Se mudou o exercício, atualiza o ID e nome
    if (field === 'exerciseName') {
      const exercise = exerciseTypes.find(ex => ex.name === value);
      if (exercise) {
        setExerciseData(prev => ({
          ...prev,
          exerciseId: exercise.id,
          exerciseName: exercise.name
        }));
      }
    }
  };

  const startSession = () => {
    setIsSessionActive(true);
    setSessionStartTime(Date.now());
    setSessionData(prev => ({
      ...prev,
      sessionId: `session_${Date.now()}`
    }));
  };

  const logSet = async () => {
    if (!exerciseData.exerciseName.trim()) {
      setError('Selecione um exercício');
      return;
    }

    if (!exerciseData.reps || parseInt(exerciseData.reps) <= 0) {
      setError('Número de repetições deve ser maior que zero');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await trackingService.logExerciseSet(exerciseData);
      
      setSuccess(true);
      
      // Adiciona à lista de exercícios da sessão
      const exerciseInfo = exerciseTypes.find(ex => ex.id === exerciseData.exerciseId);
      const newExercise = {
        ...exerciseData,
        id: result.id || Date.now(),
        timestamp: new Date().toISOString(),
        category: exerciseInfo?.category || 'Outros',
        icon: exerciseInfo?.icon || '💪'
      };

      setSessionData(prev => ({
        ...prev,
        exercises: [...prev.exercises, newExercise]
      }));

      // Incrementa número da série para próxima
      setExerciseData(prev => ({
        ...prev,
        setNumber: prev.setNumber + 1,
        weight: '',
        reps: '',
        rpe: '',
        notes: ''
      }));

      // Callback para componente pai
      if (onExerciseLogged) {
        onExerciseLogged(result);
      }

    } catch (err) {
      setError(err.message || 'Erro ao registrar série');
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    if (sessionData.exercises.length === 0) {
      setError('Registre pelo menos uma série antes de finalizar');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const finalDuration = Math.floor((Date.now() - sessionStartTime) / 1000 / 60);
      const sessionToEnd = {
        ...sessionData,
        duration: finalDuration
      };

      const result = await trackingService.endWorkoutSession(sessionToEnd);
      
      setSuccess(true);
      setIsSessionActive(false);
      
      // Reset session
      setSessionData({
        sessionId: '',
        duration: '',
        exercises: [],
        intensity: 'medium',
        notes: ''
      });

      setExerciseData({
        exerciseId: '',
        exerciseName: '',
        weight: '',
        reps: '',
        setNumber: 1,
        rpe: '',
        notes: ''
      });

      // Callback para componente pai
      if (onExerciseLogged) {
        onExerciseLogged(result);
      }

    } catch (err) {
      setError(err.message || 'Erro ao finalizar treino');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedExercise = exerciseTypes.find(ex => ex.name === exerciseData.exerciseName);
  const currentIntensity = intensityLevels.find(level => level.value === sessionData.intensity);

  return (
    <div className="exercise-logger">
      <div className="exercise-logger-header">
        <h3>
          🏋️‍♂️ Registrar Exercícios
        </h3>
        <p>Acompanhe suas séries e progresso</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          {isSessionActive ? 'Série registrada com sucesso!' : 'Treino finalizado com sucesso!'}
        </div>
      )}

      {/* Status da Sessão */}
      <div className="session-status">
        {isSessionActive ? (
          <div className="session-active">
            <div className="session-info">
              <span className="session-indicator">🟢</span>
              <div>
                <strong>Treino em Andamento</strong>
                <p>Duração: {sessionData.duration} minutos</p>
              </div>
            </div>
            <button
              onClick={endSession}
              disabled={isLoading || sessionData.exercises.length === 0}
              className="btn btn-danger btn-small"
            >
              🏁 Finalizar Treino
            </button>
          </div>
        ) : (
          <div className="session-inactive">
            <p>Nenhum treino ativo</p>
            <button
              onClick={startSession}
              className="btn btn-primary btn-small"
            >
              ▶️ Iniciar Treino
            </button>
          </div>
        )}
      </div>

      {isSessionActive && (
        <div className="exercise-form">
          {/* Seleção do Exercício */}
          <div className="form-group">
            <label htmlFor="exerciseName">Exercício</label>
            <select
              id="exerciseName"
              value={exerciseData.exerciseName}
              onChange={(e) => handleExerciseChange('exerciseName', e.target.value)}
              className="form-select"
            >
              <option value="">Selecione um exercício</option>
              {exerciseTypes.map(exercise => (
                <option key={exercise.id} value={exercise.name}>
                  {exercise.icon} {exercise.name} ({exercise.category})
                </option>
              ))}
            </select>
          </div>

          {selectedExercise && (
            <div className="exercise-info">
              <span className="exercise-icon">{selectedExercise.icon}</span>
              <div>
                <strong>{selectedExercise.name}</strong>
                <span className="exercise-category">{selectedExercise.category}</span>
              </div>
            </div>
          )}

          {/* Dados da Série */}
          <div className="set-input-grid">
            <div className="form-group">
              <label htmlFor="setNumber">Série Nº</label>
              <input
                id="setNumber"
                type="number"
                min="1"
                value={exerciseData.setNumber}
                onChange={(e) => handleExerciseChange('setNumber', e.target.value)}
                className="form-input"
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="reps">Repetições</label>
              <input
                id="reps"
                type="number"
                min="1"
                value={exerciseData.reps}
                onChange={(e) => handleExerciseChange('reps', e.target.value)}
                placeholder="12"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">Peso (kg)</label>
              <input
                id="weight"
                type="number"
                step="0.5"
                min="0"
                value={exerciseData.weight}
                onChange={(e) => handleExerciseChange('weight', e.target.value)}
                placeholder="20"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="rpe">RPE (1-10)</label>
              <input
                id="rpe"
                type="number"
                min="1"
                max="10"
                value={exerciseData.rpe}
                onChange={(e) => handleExerciseChange('rpe', e.target.value)}
                placeholder="7"
                className="form-input"
                title="Rate of Perceived Exertion (1=muito fácil, 10=máximo esforço)"
              />
            </div>
          </div>

          {/* Observações da Série */}
          <div className="form-group">
            <label htmlFor="setNotes">Observações da Série</label>
            <input
              id="setNotes"
              type="text"
              value={exerciseData.notes}
              onChange={(e) => handleExerciseChange('notes', e.target.value)}
              placeholder="Como foi a execução? Alguma dificuldade?"
              className="form-input"
            />
          </div>

          {/* Botão para registrar série */}
          <button
            onClick={logSet}
            disabled={isLoading || !exerciseData.exerciseName || !exerciseData.reps}
            className="btn btn-primary btn-full"
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Registrando...
              </>
            ) : (
              <>
                ➕ Registrar Série
              </>
            )}
          </button>

          {/* Lista de Exercícios da Sessão */}
          {sessionData.exercises.length > 0 && (
            <div className="session-exercises">
              <h4>Exercícios da Sessão</h4>
              <div className="exercises-list">
                {sessionData.exercises.map((exercise, index) => (
                  <div key={index} className="exercise-item">
                    <div className="exercise-header">
                      <span className="exercise-icon">{exercise.icon}</span>
                      <div>
                        <strong>{exercise.exerciseName}</strong>
                        <span className="exercise-time">
                          {new Date(exercise.timestamp).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="exercise-details">
                      <span>Série {exercise.setNumber}</span>
                      <span>{exercise.reps} reps</span>
                      {exercise.weight && <span>{exercise.weight}kg</span>}
                      {exercise.rpe && <span>RPE {exercise.rpe}</span>}
                    </div>
                    {exercise.notes && (
                      <div className="exercise-notes">
                        💭 {exercise.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configurações da Sessão */}
          <div className="session-config">
            <h4>Configurações do Treino</h4>
            
            <div className="form-group">
              <label htmlFor="intensity">Intensidade Geral</label>
              <div className="intensity-selector">
                {intensityLevels.map(level => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setSessionData(prev => ({ ...prev, intensity: level.value }))}
                    className={`intensity-btn ${sessionData.intensity === level.value ? 'active' : ''}`}
                    style={{ '--intensity-color': level.color }}
                  >
                    <span className="intensity-icon">{level.icon}</span>
                    <span className="intensity-label">{level.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sessionNotes">Observações do Treino</label>
              <textarea
                id="sessionNotes"
                value={sessionData.notes}
                onChange={(e) => setSessionData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Como foi o treino? Como você se sentiu?"
                className="form-textarea"
                rows="3"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseLogger;

