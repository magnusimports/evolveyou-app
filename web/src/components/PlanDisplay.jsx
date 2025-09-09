import React, { useEffect, useState } from 'react';
import { planService } from '../services/planService';

const PlanDisplay = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const currentPlan = await planService.getCurrentPlan();
        setPlan(currentPlan);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Carregando plano...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Erro ao carregar plano: {error}</div>;
  }

  if (!plan) {
    return <div className="text-center py-4">Nenhum plano encontrado.</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Seu Plano Atual</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Plano de Treino</h3>
          <p className="text-gray-600"><strong>Objetivo:</strong> {plan.workout_plan.goal}</p>
          <p className="text-gray-600"><strong>Frequência:</strong> {plan.workout_plan.frequency}</p>
          <ul className="list-disc list-inside mt-2">
            {plan.workout_plan.exercises.map((exercise, index) => (
              <li key={index} className="text-gray-600">
                {exercise.name} - {exercise.sets} séries de {exercise.reps} repetições
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Plano de Dieta</h3>
          <p className="text-gray-600"><strong>Calorias Diárias:</strong> {plan.diet_plan.daily_calories} kcal</p>
          <p className="text-gray-600"><strong>Macronutrientes:</strong> Proteína: {plan.diet_plan.macros.protein}g, Carboidratos: {plan.diet_plan.macros.carbs}g, Gordura: {plan.diet_plan.macros.fat}g</p>
          <ul className="list-disc list-inside mt-2">
            {plan.diet_plan.meals.map((meal, index) => (
              <li key={index} className="text-gray-600">
                <strong>{meal.name}:</strong> {meal.description}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-4">Plano gerado em: {new Date(plan.generated_at).toLocaleDateString()}</p>
    </div>
  );
};

export default PlanDisplay;


