import React, { useEffect, useState } from 'react';
import { useApp, selectors } from '../contexts/AppContext.jsx';
import dataService from '../services/dataService.js';
import { motion } from 'framer-motion';

const ResumoScreen = () => {
  const { state, actions } = useApp();
  const profile = selectors.getProfile(state);
  const activityRings = selectors.getActivityRings(state);
  const metrics = selectors.getMetrics(state);
  const user = selectors.getUser(state);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadResumoData();
  }, []);

  const loadResumoData = async () => {
    try {
      setLoading(true);
      const userId = user.id || 'guest_user';
      
      // Carregar dados em paralelo
      const [dashboardMetrics, rings] = await Promise.all([
        dataService.loadDashboardMetrics(userId),
        dataService.loadActivityRings(userId)
      ]);
      
      if (dashboardMetrics) {
        actions.updateMetrics(dashboardMetrics);
      }
      
      if (rings) {
        actions.updateActivityRings(rings);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados do resumo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular dados baseados no perfil da anamnese
  const calculatePersonalizedData = () => {
    if (!profile.dailyCalories) return null;

    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    
    // Simular progresso baseado no perfil
    const baseProgress = {
      movement: Math.min(100, (profile.activityLevel === 'alto' ? 85 : profile.activityLevel === 'moderado' ? 65 : 45)),
      exercise: Math.min(100, (profile.exercisePreferences?.length > 2 ? 80 : 60)),
      standing: Math.min(100, (dayOfWeek >= 1 && dayOfWeek <= 5 ? 75 : 50))
    };

    return {
      activityRings: {
        movement: {
          current: Math.round((profile.dailyCalories * baseProgress.movement) / 100),
          goal: profile.dailyCalories,
          percentage: baseProgress.movement
        },
        exercise: {
          current: Math.round((90 * baseProgress.exercise) / 100),
          goal: 90,
          percentage: baseProgress.exercise
        },
        standing: {
          current: Math.round((12 * baseProgress.standing) / 100),
          goal: 12,
          percentage: baseProgress.standing
        }
      },
      metrics: {
        steps: Math.round(8000 + (profile.activityLevel === 'alto' ? 4000 : profile.activityLevel === 'moderado' ? 2000 : 0)),
        distance: Math.round((8 + (profile.activityLevel === 'alto' ? 4 : profile.activityLevel === 'moderado' ? 2 : 0)) * 100) / 100,
        calories: Math.round((profile.dailyCalories * baseProgress.movement) / 100),
        activeMinutes: Math.round(30 + (profile.availableTime === 'mais_60min' ? 30 : profile.availableTime === '30_60min' ? 15 : 0))
      }
    };
  };

  const personalizedData = calculatePersonalizedData();
  const displayRings = personalizedData?.activityRings || activityRings;
  const displayMetrics = personalizedData?.metrics || metrics;

  // Componente do círculo de atividade
  const ActivityRing = ({ data, color, label, unit = '' }) => {
    const radius = 45;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (data.percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Círculo de fundo */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Círculo de progresso */}
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white text-sm font-bold">
              {data.current}
            </span>
            <span className="text-gray-400 text-xs">
              /{data.goal}{unit}
            </span>
          </div>
        </div>
        <span className="text-white text-sm font-medium mt-2">{label}</span>
        <span className="text-gray-400 text-xs">
          {Math.round(data.percentage)}%
        </span>
      </div>
    );
  };

  // Componente de métrica
  const MetricCard = ({ title, value, unit, icon, trend }) => (
    <motion.div
      className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex items-baseline space-x-1">
        <span className="text-white text-2xl font-bold">{value}</span>
        <span className="text-gray-400 text-sm">{unit}</span>
      </div>
      {trend && (
        <div className="flex items-center mt-1">
          <span className={`text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </span>
        </div>
      )}
    </motion.div>
  );

  // Componente de recomendação personalizada
  const PersonalizedRecommendation = () => {
    if (!profile.recommendations) return null;

    const recommendations = profile.recommendations;
    const priorities = recommendations.prioridades || [];
    const suggestions = recommendations.sugestoes || [];

    return (
      <motion.div
        className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-2xl">🎯</span>
          <h3 className="text-white font-semibold">Recomendações Personalizadas</h3>
        </div>
        
        {priorities.length > 0 && (
          <div className="mb-3">
            <h4 className="text-purple-300 text-sm font-medium mb-2">Prioridades:</h4>
            <ul className="space-y-1">
              {priorities.slice(0, 2).map((priority, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-start space-x-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{priority}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {suggestions.length > 0 && (
          <div>
            <h4 className="text-blue-300 text-sm font-medium mb-2">Sugestões:</h4>
            <ul className="space-y-1">
              {suggestions.slice(0, 2).map((suggestion, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-start space-x-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-800 rounded-full"></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-800 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Saudação personalizada */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-white text-xl font-semibold mb-1">
          Olá, {profile.name || user.name || 'Usuário'}! 👋
        </h2>
        <p className="text-gray-400 text-sm">
          {profile.goal === 'perder_peso' && 'Vamos queimar calorias hoje!'}
          {profile.goal === 'ganhar_massa' && 'Hora de construir músculos!'}
          {profile.goal === 'manter_peso' && 'Mantendo o equilíbrio perfeito!'}
          {!profile.goal && 'Vamos alcançar seus objetivos!'}
        </p>
      </motion.div>

      {/* Círculos de Atividade */}
      <motion.div
        className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-white text-lg font-semibold mb-4">Círculos de Atividade</h3>
        <div className="grid grid-cols-3 gap-4">
          <ActivityRing
            data={displayRings.movement}
            color="#ff3b30"
            label="Movimento"
            unit=" CAL"
          />
          <ActivityRing
            data={displayRings.exercise}
            color="#30d158"
            label="Exercício"
            unit=" MIN"
          />
          <ActivityRing
            data={displayRings.standing}
            color="#007aff"
            label="Em Pé"
            unit=" H"
          />
        </div>
      </motion.div>

      {/* Métricas Diárias */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-white text-lg font-semibold mb-4">Métricas de Hoje</h3>
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Passos"
            value={displayMetrics.steps?.toLocaleString() || '0'}
            icon="👣"
            trend={5}
          />
          <MetricCard
            title="Distância"
            value={displayMetrics.distance || '0'}
            unit="km"
            icon="🏃"
            trend={3}
          />
          <MetricCard
            title="Calorias"
            value={displayMetrics.calories || '0'}
            unit="kcal"
            icon="🔥"
            trend={8}
          />
          <MetricCard
            title="Ativo"
            value={displayMetrics.activeMinutes || '0'}
            unit="min"
            icon="⏱️"
            trend={-2}
          />
        </div>
      </motion.div>

      {/* Informações do Perfil */}
      {profile.dailyCalories && (
        <motion.div
          className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-white text-lg font-semibold mb-3">Seu Perfil</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Meta Diária:</span>
              <p className="text-white font-medium">{profile.dailyCalories} kcal</p>
            </div>
            <div>
              <span className="text-gray-400">TMB:</span>
              <p className="text-white font-medium">{profile.bmr} kcal</p>
            </div>
            {profile.bmi && (
              <div>
                <span className="text-gray-400">IMC:</span>
                <p className="text-white font-medium">{profile.bmi}</p>
              </div>
            )}
            {profile.idealWeight && (
              <div>
                <span className="text-gray-400">Peso Ideal:</span>
                <p className="text-white font-medium">{profile.idealWeight} kg</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Recomendações Personalizadas */}
      <PersonalizedRecommendation />

      {/* Score da Anamnese */}
      {profile.anamnese_score && (
        <motion.div
          className="bg-gradient-to-r from-green-900/30 to-blue-900/30 backdrop-blur-sm rounded-2xl p-4 border border-green-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Score de Saúde</h3>
              <p className="text-gray-400 text-sm">Baseado na sua anamnese</p>
            </div>
            <div className="text-right">
              <span className="text-green-400 text-2xl font-bold">
                {Math.round(profile.anamnese_score.score_total || 0)}
              </span>
              <span className="text-gray-400">/100</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ResumoScreen;

