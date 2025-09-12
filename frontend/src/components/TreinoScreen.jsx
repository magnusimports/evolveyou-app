import React, { useEffect, useState } from 'react';
import { useApp, selectors } from '../contexts/AppContext.jsx';
import dataService from '../services/dataService.js';
import { motion } from 'framer-motion';

const TreinoScreen = () => {
  const { state, actions } = useApp();
  const profile = selectors.getProfile(state);
  const user = selectors.getUser(state);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentWeekProgress, setCurrentWeekProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0
  });

  useEffect(() => {
    loadWorkoutData();
    calculateWeekProgress();
  }, [profile]);

  const loadWorkoutData = async () => {
    try {
      setLoading(true);
      const userId = user.id || 'guest_user';
      
      // Carregar plano de treino
      const plan = await dataService.loadWorkoutPlan(userId);
      if (plan) {
        setWorkoutPlan(plan);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados de treino:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWeekProgress = () => {
    if (!profile.exercisePreferences) return;

    // Calcular progresso baseado no perfil
    const frequency = profile.workout_frequency || 3;
    const dayOfWeek = new Date().getDay();
    
    // Simular treinos completados baseado no dia da semana e perfil
    let completed = 0;
    if (profile.fitnessExperience === 'experiente') {
      completed = Math.min(dayOfWeek, frequency);
    } else if (profile.fitnessExperience === 'moderado') {
      completed = Math.min(Math.floor(dayOfWeek * 0.8), frequency);
    } else {
      completed = Math.min(Math.floor(dayOfWeek * 0.6), frequency);
    }

    setCurrentWeekProgress({
      completed,
      total: frequency,
      percentage: frequency > 0 ? (completed / frequency) * 100 : 0
    });
  };

  // Gerar plano de treino baseado no perfil
  const generateWorkoutPlan = () => {
    if (!profile.exercisePreferences) return [];

    const workouts = [];
    const preferences = profile.exercisePreferences;
    const experience = profile.fitnessExperience || 'iniciante';
    const availableTime = profile.availableTime || '30_60min';
    
    // Determinar duração baseada no tempo disponível
    const duration = {
      'menos_30min': 25,
      '30_60min': 45,
      'mais_60min': 60
    }[availableTime] || 45;

    // Determinar intensidade baseada na experiência
    const intensity = {
      'iniciante': 'Baixa',
      'moderado': 'Moderada',
      'experiente': 'Alta'
    }[experience] || 'Moderada';

    if (preferences.includes('musculacao')) {
      workouts.push({
        name: "Treino de Força",
        type: "Musculação",
        duration: duration,
        intensity: intensity,
        exercises: experience === 'iniciante' 
          ? ["Agachamento", "Flexão", "Prancha", "Caminhada"]
          : ["Agachamento com peso", "Supino", "Levantamento terra", "Pull-ups"],
        calories: Math.round(duration * 8),
        muscle_groups: ["Pernas", "Peito", "Core", "Costas"]
      });
    }

    if (preferences.includes('cardio')) {
      workouts.push({
        name: "Treino Cardiovascular",
        type: "Cardio",
        duration: duration,
        intensity: intensity,
        exercises: ["Corrida", "Burpees", "Mountain climbers", "Jumping jacks"],
        calories: Math.round(duration * 12),
        muscle_groups: ["Cardio", "Core", "Pernas"]
      });
    }

    if (preferences.includes('yoga')) {
      workouts.push({
        name: "Yoga Flow",
        type: "Flexibilidade",
        duration: duration,
        intensity: "Baixa",
        exercises: ["Saudação ao sol", "Guerreiro", "Triângulo", "Relaxamento"],
        calories: Math.round(duration * 4),
        muscle_groups: ["Flexibilidade", "Core", "Equilíbrio"]
      });
    }

    if (preferences.includes('funcional')) {
      workouts.push({
        name: "Treino Funcional",
        type: "Funcional",
        duration: duration,
        intensity: intensity,
        exercises: ["Kettlebell swing", "Box jump", "Battle ropes", "TRX"],
        calories: Math.round(duration * 10),
        muscle_groups: ["Corpo todo", "Core", "Coordenação"]
      });
    }

    // Se não há preferências específicas, criar treino geral
    if (workouts.length === 0) {
      workouts.push({
        name: "Treino Geral",
        type: "Misto",
        duration: duration,
        intensity: intensity,
        exercises: ["Caminhada", "Alongamento", "Exercícios básicos"],
        calories: Math.round(duration * 6),
        muscle_groups: ["Corpo todo"]
      });
    }

    return workouts;
  };

  const workouts = generateWorkoutPlan();

  // Componente de card de treino
  const WorkoutCard = ({ workout, isRecommended = false, isCompleted = false }) => (
    <motion.div
      className={`bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border ${
        isRecommended ? 'border-green-500/50 bg-green-900/20' : 
        isCompleted ? 'border-gray-600 bg-gray-800/50' : 'border-gray-800'
      }`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className={`font-semibold ${isCompleted ? 'text-gray-400' : 'text-white'}`}>
            {workout.name}
          </h4>
          <p className="text-gray-400 text-sm">{workout.type}</p>
        </div>
        <div className="text-right">
          <span className={`text-lg font-bold ${isCompleted ? 'text-gray-400' : 'text-white'}`}>
            {workout.duration}
          </span>
          <span className="text-gray-400 text-sm"> min</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <span className="text-gray-400">Intensidade:</span>
          <p className={`font-medium ${
            workout.intensity === 'Alta' ? 'text-red-400' :
            workout.intensity === 'Moderada' ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {workout.intensity}
          </p>
        </div>
        <div>
          <span className="text-gray-400">Calorias:</span>
          <p className={`font-medium ${isCompleted ? 'text-gray-400' : 'text-orange-400'}`}>
            ~{workout.calories} kcal
          </p>
        </div>
      </div>

      <div className="mb-3">
        <span className="text-gray-400 text-sm">Exercícios:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {workout.exercises.slice(0, 3).map((exercise, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded-full text-xs ${
                isCompleted ? 'bg-gray-700 text-gray-400' : 'bg-purple-900/50 text-purple-300'
              }`}
            >
              {exercise}
            </span>
          ))}
          {workout.exercises.length > 3 && (
            <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-400">
              +{workout.exercises.length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="mb-3">
        <span className="text-gray-400 text-sm">Grupos musculares:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {workout.muscle_groups.map((group, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded-full text-xs ${
                isCompleted ? 'bg-gray-700 text-gray-400' : 'bg-blue-900/50 text-blue-300'
              }`}
            >
              {group}
            </span>
          ))}
        </div>
      </div>

      {isRecommended && (
        <div className="flex items-center space-x-1 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs">Recomendado para hoje</span>
        </div>
      )}

      {isCompleted && (
        <div className="flex items-center space-x-1 mb-2">
          <span className="text-green-400 text-sm">✓</span>
          <span className="text-green-400 text-xs">Concluído</span>
        </div>
      )}

      <button
        className={`w-full py-2 rounded-lg font-medium transition-colors ${
          isCompleted 
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : isRecommended
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
        }`}
        disabled={isCompleted}
      >
        {isCompleted ? 'Concluído' : 'Iniciar Treino'}
      </button>
    </motion.div>
  );

  // Componente de progresso semanal
  const WeeklyProgress = () => (
    <motion.div
      className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/20"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold">Progresso Semanal</h3>
          <p className="text-gray-400 text-sm">
            {currentWeekProgress.completed} de {currentWeekProgress.total} treinos
          </p>
        </div>
        <div className="text-right">
          <span className="text-purple-400 text-2xl font-bold">
            {Math.round(currentWeekProgress.percentage)}%
          </span>
        </div>
      </div>
      
      <div className="relative">
        <div className="w-full bg-gray-700 rounded-full h-3">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${currentWeekProgress.percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-gray-400">0</span>
          <span className="text-purple-400 font-medium">
            {currentWeekProgress.completed}/{currentWeekProgress.total}
          </span>
          <span className="text-gray-400">{currentWeekProgress.total}</span>
        </div>
      </div>
    </motion.div>
  );

  // Componente de estatísticas
  const WorkoutStats = () => {
    const totalCalories = workouts.reduce((sum, workout) => sum + workout.calories, 0);
    const avgDuration = workouts.length > 0 ? Math.round(workouts.reduce((sum, workout) => sum + workout.duration, 0) / workouts.length) : 0;
    
    return (
      <motion.div
        className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-white font-semibold mb-3">Estatísticas do Plano</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Frequência semanal:</span>
            <p className="text-white font-medium">{currentWeekProgress.total}x por semana</p>
          </div>
          <div>
            <span className="text-gray-400">Duração média:</span>
            <p className="text-white font-medium">{avgDuration} minutos</p>
          </div>
          <div>
            <span className="text-gray-400">Calorias por treino:</span>
            <p className="text-white font-medium">~{Math.round(totalCalories / workouts.length || 0)} kcal</p>
          </div>
          <div>
            <span className="text-gray-400">Experiência:</span>
            <p className="text-white font-medium capitalize">{profile.fitnessExperience || 'Iniciante'}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-800 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header personalizado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-white text-xl font-semibold mb-1">
          Seu Treino Personalizado 💪
        </h2>
        <p className="text-gray-400 text-sm">
          {profile.goal === 'perder_peso' && 'Foco na queima de calorias'}
          {profile.goal === 'ganhar_massa' && 'Construindo força e massa muscular'}
          {profile.goal === 'manter_peso' && 'Mantendo a forma física'}
          {!profile.goal && 'Plano adaptado ao seu perfil'}
        </p>
      </motion.div>

      {/* Progresso Semanal */}
      <WeeklyProgress />

      {/* Treino de Hoje */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-white text-lg font-semibold mb-4">Treino de Hoje</h3>
        {workouts.length > 0 ? (
          <WorkoutCard workout={workouts[0]} isRecommended={true} />
        ) : (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 text-center">
            <p className="text-gray-400">Nenhum treino programado para hoje</p>
            <p className="text-gray-500 text-sm mt-1">Complete sua anamnese para receber recomendações</p>
          </div>
        )}
      </motion.div>

      {/* Plano Semanal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-white text-lg font-semibold mb-4">Plano Semanal</h3>
        <div className="space-y-4">
          {workouts.map((workout, index) => (
            <WorkoutCard
              key={index}
              workout={workout}
              isCompleted={index < currentWeekProgress.completed}
            />
          ))}
        </div>
      </motion.div>

      {/* Estatísticas */}
      <WorkoutStats />

      {/* Dicas de Treino */}
      <motion.div
        className="bg-gradient-to-r from-orange-900/30 to-red-900/30 backdrop-blur-sm rounded-2xl p-4 border border-orange-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
          <span>💡</span>
          <span>Dicas Personalizadas</span>
        </h3>
        <div className="space-y-2 text-sm">
          {profile.fitnessExperience === 'iniciante' && (
            <p className="text-gray-300">🌟 Comece devagar e aumente a intensidade gradualmente</p>
          )}
          {profile.availableTime === 'menos_30min' && (
            <p className="text-gray-300">⏰ Treinos curtos e intensos são mais eficazes</p>
          )}
          {profile.goal === 'ganhar_massa' && (
            <p className="text-gray-300">💪 Foque em exercícios compostos e progressão de carga</p>
          )}
          <p className="text-gray-300">🔥 Mantenha a consistência - é mais importante que a intensidade</p>
        </div>
      </motion.div>
    </div>
  );
};

export default TreinoScreen;

