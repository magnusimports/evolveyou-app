import React, { useEffect, useState } from 'react';
import { useApp, selectors } from '../contexts/AppContext.jsx';
import dataService from '../services/dataService.js';
import { motion } from 'framer-motion';

const NutricaoScreen = () => {
  const { state, actions } = useApp();
  const profile = selectors.getProfile(state);
  const user = selectors.getUser(state);
  const [nutritionPlan, setNutritionPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentIntake, setCurrentIntake] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0
  });

  useEffect(() => {
    loadNutritionData();
    simulateCurrentIntake();
  }, [profile]);

  const loadNutritionData = async () => {
    try {
      setLoading(true);
      const userId = user.id || 'guest_user';
      
      // Carregar plano nutricional
      const plan = await dataService.loadNutritionPlan(userId);
      if (plan) {
        setNutritionPlan(plan);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados nutricionais:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateCurrentIntake = () => {
    if (!profile.dailyCalories) return;

    // Simular consumo baseado no horário do dia
    const currentHour = new Date().getHours();
    let progressFactor = 0;

    if (currentHour >= 6 && currentHour < 12) {
      progressFactor = 0.25; // Manhã - 25%
    } else if (currentHour >= 12 && currentHour < 18) {
      progressFactor = 0.65; // Tarde - 65%
    } else if (currentHour >= 18 && currentHour < 22) {
      progressFactor = 0.85; // Noite - 85%
    } else {
      progressFactor = 0.90; // Madrugada - 90%
    }

    // Adicionar variação baseada no objetivo
    if (profile.goal === 'perder_peso') {
      progressFactor *= 0.8; // Consumo menor para perda de peso
    } else if (profile.goal === 'ganhar_massa') {
      progressFactor *= 1.1; // Consumo maior para ganho de massa
    }

    setCurrentIntake({
      calories: Math.round(profile.dailyCalories * progressFactor),
      protein: Math.round((profile.macros?.protein || 0) * progressFactor),
      carbs: Math.round((profile.macros?.carbs || 0) * progressFactor),
      fat: Math.round((profile.macros?.fat || 0) * progressFactor),
      water: Math.round((profile.waterIntake || 2000) * progressFactor)
    });
  };

  // Componente de barra de progresso nutricional
  const NutritionBar = ({ label, current, goal, unit, color, icon }) => {
    const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
    const isOverGoal = current > goal;

    return (
      <motion.div
        className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{icon}</span>
            <span className="text-white font-medium">{label}</span>
          </div>
          <div className="text-right">
            <span className={`text-lg font-bold ${isOverGoal ? 'text-red-400' : 'text-white'}`}>
              {current}
            </span>
            <span className="text-gray-400 text-sm">/{goal} {unit}</span>
          </div>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-700 rounded-full h-3">
            <motion.div
              className={`h-3 rounded-full ${isOverGoal ? 'bg-red-500' : color}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span className="text-gray-400">0</span>
            <span className={`font-medium ${isOverGoal ? 'text-red-400' : 'text-green-400'}`}>
              {Math.round(percentage)}%
            </span>
            <span className="text-gray-400">{goal}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  // Componente de refeição
  const MealCard = ({ meal, time, calories, description, isNext = false }) => (
    <motion.div
      className={`bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border ${
        isNext ? 'border-purple-500/50 bg-purple-900/20' : 'border-gray-800'
      }`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-white font-medium">{meal}</h4>
          <p className="text-gray-400 text-sm">{time}</p>
        </div>
        <div className="text-right">
          <span className="text-white font-bold">{calories}</span>
          <span className="text-gray-400 text-sm"> kcal</span>
        </div>
      </div>
      <p className="text-gray-300 text-sm">{description}</p>
      {isNext && (
        <div className="mt-2 flex items-center space-x-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span className="text-purple-400 text-xs">Próxima refeição</span>
        </div>
      )}
    </motion.div>
  );

  // Gerar plano de refeições baseado no perfil
  const generateMealPlan = () => {
    if (!profile.dailyCalories) return [];

    const caloriesPerMeal = {
      breakfast: Math.round(profile.dailyCalories * 0.25),
      lunch: Math.round(profile.dailyCalories * 0.35),
      snack: Math.round(profile.dailyCalories * 0.15),
      dinner: Math.round(profile.dailyCalories * 0.25)
    };

    const currentHour = new Date().getHours();
    
    const meals = [
      {
        meal: "Café da Manhã",
        time: "07:00 - 09:00",
        calories: caloriesPerMeal.breakfast,
        description: profile.goal === 'ganhar_massa' 
          ? "Aveia com banana, whey protein e castanhas"
          : "Omelete com vegetais e torrada integral",
        isNext: currentHour >= 6 && currentHour < 9
      },
      {
        meal: "Almoço",
        time: "12:00 - 14:00",
        calories: caloriesPerMeal.lunch,
        description: profile.goal === 'perder_peso'
          ? "Salada com frango grelhado e quinoa"
          : "Arroz integral, feijão, carne magra e legumes",
        isNext: currentHour >= 11 && currentHour < 14
      },
      {
        meal: "Lanche",
        time: "15:00 - 17:00",
        calories: caloriesPerMeal.snack,
        description: profile.goal === 'ganhar_massa'
          ? "Shake de whey com banana e aveia"
          : "Iogurte natural com frutas vermelhas",
        isNext: currentHour >= 15 && currentHour < 17
      },
      {
        meal: "Jantar",
        time: "19:00 - 21:00",
        calories: caloriesPerMeal.dinner,
        description: profile.goal === 'perder_peso'
          ? "Peixe grelhado com legumes no vapor"
          : "Frango com batata doce e brócolis",
        isNext: currentHour >= 19 && currentHour < 21
      }
    ];

    return meals;
  };

  const mealPlan = generateMealPlan();

  // Componente de dicas nutricionais
  const NutritionTips = () => {
    const tips = [];
    
    if (profile.dietaryRestrictions?.includes('vegetariano')) {
      tips.push("💚 Combine leguminosas com cereais para proteína completa");
    }
    
    if (profile.goal === 'perder_peso') {
      tips.push("🔥 Beba água antes das refeições para aumentar a saciedade");
    }
    
    if (profile.goal === 'ganhar_massa') {
      tips.push("💪 Consuma proteína a cada 3-4 horas para síntese muscular");
    }
    
    if (profile.waterIntake < 2000) {
      tips.push("💧 Aumente gradualmente seu consumo de água");
    }

    tips.push("🥗 Inclua vegetais coloridos em cada refeição");

    return (
      <motion.div
        className="bg-gradient-to-r from-green-900/30 to-blue-900/30 backdrop-blur-sm rounded-2xl p-4 border border-green-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
          <span>💡</span>
          <span>Dicas Personalizadas</span>
        </h3>
        <div className="space-y-2">
          {tips.slice(0, 3).map((tip, index) => (
            <p key={index} className="text-gray-300 text-sm">{tip}</p>
          ))}
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
      {/* Header personalizado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-white text-xl font-semibold mb-1">
          Nutrição Personalizada 🥗
        </h2>
        <p className="text-gray-400 text-sm">
          {profile.goal === 'perder_peso' && 'Foco na queima de gordura'}
          {profile.goal === 'ganhar_massa' && 'Construindo músculos com nutrição'}
          {profile.goal === 'manter_peso' && 'Mantendo o equilíbrio nutricional'}
          {!profile.goal && 'Seu plano nutricional personalizado'}
        </p>
      </motion.div>

      {/* Resumo calórico principal */}
      <motion.div
        className="bg-gradient-to-r from-orange-900/30 to-red-900/30 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-center">
          <h3 className="text-white text-lg font-semibold mb-2">Calorias de Hoje</h3>
          <div className="flex items-center justify-center space-x-4">
            <div>
              <span className="text-orange-400 text-3xl font-bold">
                {currentIntake.calories}
              </span>
              <span className="text-gray-400"> / {profile.dailyCalories || 2000}</span>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Restam</p>
              <p className="text-white font-bold">
                {Math.max(0, (profile.dailyCalories || 2000) - currentIntake.calories)} kcal
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min((currentIntake.calories / (profile.dailyCalories || 2000)) * 100, 100)}%` 
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Macronutrientes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-white text-lg font-semibold mb-4">Macronutrientes</h3>
        <div className="space-y-4">
          <NutritionBar
            label="Proteínas"
            current={currentIntake.protein}
            goal={profile.macros?.protein || 120}
            unit="g"
            color="bg-red-500"
            icon="🥩"
          />
          <NutritionBar
            label="Carboidratos"
            current={currentIntake.carbs}
            goal={profile.macros?.carbs || 250}
            unit="g"
            color="bg-yellow-500"
            icon="🍞"
          />
          <NutritionBar
            label="Gorduras"
            current={currentIntake.fat}
            goal={profile.macros?.fat || 70}
            unit="g"
            color="bg-purple-500"
            icon="🥑"
          />
          <NutritionBar
            label="Água"
            current={currentIntake.water}
            goal={profile.waterIntake || 2000}
            unit="ml"
            color="bg-blue-500"
            icon="💧"
          />
        </div>
      </motion.div>

      {/* Plano de Refeições */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-white text-lg font-semibold mb-4">Plano de Refeições</h3>
        <div className="space-y-4">
          {mealPlan.map((meal, index) => (
            <MealCard
              key={index}
              meal={meal.meal}
              time={meal.time}
              calories={meal.calories}
              description={meal.description}
              isNext={meal.isNext}
            />
          ))}
        </div>
      </motion.div>

      {/* Informações do Plano Nutricional */}
      {profile.nutrition_plan && (
        <motion.div
          className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-white font-semibold mb-3">Seu Plano Nutricional</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Objetivo:</span>
              <p className="text-white font-medium capitalize">
                {profile.goal?.replace('_', ' ') || 'Não definido'}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Restrições:</span>
              <p className="text-white font-medium">
                {profile.dietaryRestrictions?.length > 0 
                  ? profile.dietaryRestrictions.join(', ')
                  : 'Nenhuma'
                }
              </p>
            </div>
            <div>
              <span className="text-gray-400">Refeições/dia:</span>
              <p className="text-white font-medium">
                {profile.mealsPerDay || 4} refeições
              </p>
            </div>
            <div>
              <span className="text-gray-400">Hidratação:</span>
              <p className="text-white font-medium">
                {(profile.waterIntake || 2000) / 1000}L por dia
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Dicas Nutricionais */}
      <NutritionTips />
    </div>
  );
};

export default NutricaoScreen;

