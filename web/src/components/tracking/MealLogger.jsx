import React, { useState, useEffect } from 'react';
import trackingService from '../../services/trackingService.js';
import './MealLogger.css';

/**
 * Componente para registrar refeições
 */
const MealLogger = ({ onMealLogged, initialMealType = 'breakfast' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [mealData, setMealData] = useState({
    mealType: initialMealType,
    foods: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    notes: ''
  });

  const [currentFood, setCurrentFood] = useState({
    name: '',
    quantity: '',
    unit: 'g',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  const mealTypes = [
    { value: 'breakfast', label: '🌅 Café da Manhã', icon: '🥐' },
    { value: 'morning_snack', label: '🍎 Lanche da Manhã', icon: '🍎' },
    { value: 'lunch', label: '🌞 Almoço', icon: '🍽️' },
    { value: 'afternoon_snack', label: '🥨 Lanche da Tarde', icon: '🥨' },
    { value: 'dinner', label: '🌙 Jantar', icon: '🍽️' },
    { value: 'night_snack', label: '🌃 Ceia', icon: '🥛' }
  ];

  const units = [
    { value: 'g', label: 'gramas (g)' },
    { value: 'ml', label: 'mililitros (ml)' },
    { value: 'unidade', label: 'unidade' },
    { value: 'fatia', label: 'fatia' },
    { value: 'colher', label: 'colher' },
    { value: 'xícara', label: 'xícara' }
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

  // Atualiza totais quando foods mudam
  useEffect(() => {
    const totals = mealData.foods.reduce((acc, food) => ({
      calories: acc.calories + (parseFloat(food.calories) || 0),
      protein: acc.protein + (parseFloat(food.protein) || 0),
      carbs: acc.carbs + (parseFloat(food.carbs) || 0),
      fat: acc.fat + (parseFloat(food.fat) || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    setMealData(prev => ({
      ...prev,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat
    }));
  }, [mealData.foods]);

  const handleMealTypeChange = (e) => {
    setMealData(prev => ({
      ...prev,
      mealType: e.target.value
    }));
  };

  const handleFoodChange = (field, value) => {
    setCurrentFood(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addFood = () => {
    if (!currentFood.name.trim()) {
      setError('Nome do alimento é obrigatório');
      return;
    }

    if (!currentFood.quantity || parseFloat(currentFood.quantity) <= 0) {
      setError('Quantidade deve ser maior que zero');
      return;
    }

    if (!currentFood.calories || parseFloat(currentFood.calories) <= 0) {
      setError('Calorias devem ser maiores que zero');
      return;
    }

    const newFood = {
      id: Date.now(),
      name: currentFood.name.trim(),
      quantity: parseFloat(currentFood.quantity),
      unit: currentFood.unit,
      calories: parseFloat(currentFood.calories) || 0,
      protein: parseFloat(currentFood.protein) || 0,
      carbs: parseFloat(currentFood.carbs) || 0,
      fat: parseFloat(currentFood.fat) || 0
    };

    setMealData(prev => ({
      ...prev,
      foods: [...prev.foods, newFood]
    }));

    // Limpa o formulário de alimento
    setCurrentFood({
      name: '',
      quantity: '',
      unit: 'g',
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    });

    setError(null);
  };

  const removeFood = (foodId) => {
    setMealData(prev => ({
      ...prev,
      foods: prev.foods.filter(food => food.id !== foodId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mealData.foods.length === 0) {
      setError('Adicione pelo menos um alimento');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await trackingService.logMealCheckin(mealData);
      
      setSuccess(true);
      
      // Reset form
      setMealData({
        mealType: initialMealType,
        foods: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        notes: ''
      });

      // Callback para componente pai
      if (onMealLogged) {
        onMealLogged(result);
      }

    } catch (err) {
      setError(err.message || 'Erro ao registrar refeição');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMealType = mealTypes.find(type => type.value === mealData.mealType);

  return (
    <div className="meal-logger">
      <div className="meal-logger-header">
        <h3>
          {selectedMealType?.icon} Registrar Refeição
        </h3>
        <p>Adicione os alimentos consumidos</p>
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
          Refeição registrada com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="meal-form">
        {/* Seleção do tipo de refeição */}
        <div className="form-group">
          <label htmlFor="mealType">Tipo de Refeição</label>
          <select
            id="mealType"
            value={mealData.mealType}
            onChange={handleMealTypeChange}
            className="form-select"
          >
            {mealTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Adicionar alimento */}
        <div className="food-input-section">
          <h4>Adicionar Alimento</h4>
          
          <div className="food-input-grid">
            <div className="form-group">
              <label htmlFor="foodName">Nome do Alimento</label>
              <input
                id="foodName"
                type="text"
                value={currentFood.name}
                onChange={(e) => handleFoodChange('name', e.target.value)}
                placeholder="Ex: Arroz integral"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantidade</label>
              <input
                id="quantity"
                type="number"
                step="0.1"
                value={currentFood.quantity}
                onChange={(e) => handleFoodChange('quantity', e.target.value)}
                placeholder="100"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unidade</label>
              <select
                id="unit"
                value={currentFood.unit}
                onChange={(e) => handleFoodChange('unit', e.target.value)}
                className="form-select"
              >
                {units.map(unit => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="calories">Calorias</label>
              <input
                id="calories"
                type="number"
                step="0.1"
                value={currentFood.calories}
                onChange={(e) => handleFoodChange('calories', e.target.value)}
                placeholder="130"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="protein">Proteína (g)</label>
              <input
                id="protein"
                type="number"
                step="0.1"
                value={currentFood.protein}
                onChange={(e) => handleFoodChange('protein', e.target.value)}
                placeholder="2.7"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="carbs">Carboidratos (g)</label>
              <input
                id="carbs"
                type="number"
                step="0.1"
                value={currentFood.carbs}
                onChange={(e) => handleFoodChange('carbs', e.target.value)}
                placeholder="23"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fat">Gordura (g)</label>
              <input
                id="fat"
                type="number"
                step="0.1"
                value={currentFood.fat}
                onChange={(e) => handleFoodChange('fat', e.target.value)}
                placeholder="0.3"
                className="form-input"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={addFood}
            className="btn btn-secondary"
            disabled={!currentFood.name.trim() || !currentFood.quantity || !currentFood.calories}
          >
            ➕ Adicionar Alimento
          </button>
        </div>

        {/* Lista de alimentos adicionados */}
        {mealData.foods.length > 0 && (
          <div className="foods-list">
            <h4>Alimentos Adicionados</h4>
            <div className="foods-grid">
              {mealData.foods.map(food => (
                <div key={food.id} className="food-item">
                  <div className="food-info">
                    <strong>{food.name}</strong>
                    <span>{food.quantity} {food.unit}</span>
                    <div className="food-macros">
                      <span>{food.calories} kcal</span>
                      <span>P: {food.protein}g</span>
                      <span>C: {food.carbs}g</span>
                      <span>G: {food.fat}g</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFood(food.id)}
                    className="btn-remove"
                    title="Remover alimento"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumo nutricional */}
        {mealData.foods.length > 0 && (
          <div className="nutrition-summary">
            <h4>Resumo Nutricional</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Calorias Totais</span>
                <span className="summary-value">{mealData.totalCalories.toFixed(1)} kcal</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Proteína</span>
                <span className="summary-value">{mealData.totalProtein.toFixed(1)}g</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Carboidratos</span>
                <span className="summary-value">{mealData.totalCarbs.toFixed(1)}g</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Gordura</span>
                <span className="summary-value">{mealData.totalFat.toFixed(1)}g</span>
              </div>
            </div>
          </div>
        )}

        {/* Observações */}
        <div className="form-group">
          <label htmlFor="notes">Observações (opcional)</label>
          <textarea
            id="notes"
            value={mealData.notes}
            onChange={(e) => setMealData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Como você se sentiu após a refeição? Alguma observação especial?"
            className="form-textarea"
            rows="3"
          />
        </div>

        {/* Botão de envio */}
        <button
          type="submit"
          disabled={isLoading || mealData.foods.length === 0}
          className="btn btn-primary btn-full"
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              Registrando...
            </>
          ) : (
            <>
              📝 Registrar Refeição
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MealLogger;

