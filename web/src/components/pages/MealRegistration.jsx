import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  Plus,
  Minus,
  Star,
  Clock,
  Utensils,
  BarChart3,
  Camera,
  Heart,
  Trash2,
  RefreshCw
} from 'lucide-react'

const MealRegistration = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMeal, setSelectedMeal] = useState('breakfast')
  const [selectedFoods, setSelectedFoods] = useState([])
  const [favorites, setFavorites] = useState([])
  const [recentMeals, setRecentMeals] = useState([])

  // Base de dados TACO simulada
  const [foodDatabase] = useState([
    { id: 1, name: 'Arroz branco cozido', calories: 128, protein: 2.5, carbs: 28.1, fat: 0.1, portion: '100g' },
    { id: 2, name: 'Feijão preto cozido', calories: 77, protein: 4.5, carbs: 14.0, fat: 0.5, portion: '100g' },
    { id: 3, name: 'Peito de frango grelhado', calories: 195, protein: 32.8, carbs: 0, fat: 5.6, portion: '100g' },
    { id: 4, name: 'Batata doce cozida', calories: 77, protein: 1.3, carbs: 18.4, fat: 0.1, portion: '100g' },
    { id: 5, name: 'Ovo de galinha cozido', calories: 155, protein: 13.3, carbs: 0.6, fat: 10.6, portion: '100g' },
    { id: 6, name: 'Banana prata', calories: 98, protein: 1.3, carbs: 26.0, fat: 0.1, portion: '100g' },
    { id: 7, name: 'Aveia em flocos', calories: 394, protein: 13.9, carbs: 67.0, fat: 8.5, portion: '100g' },
    { id: 8, name: 'Leite integral', calories: 61, protein: 2.9, carbs: 4.3, fat: 3.2, portion: '100ml' },
    { id: 9, name: 'Pão francês', calories: 300, protein: 8.0, carbs: 58.6, fat: 3.1, portion: '100g' },
    { id: 10, name: 'Queijo mussarela', calories: 330, protein: 20.3, carbs: 2.9, fat: 26.9, portion: '100g' }
  ])

  const [substitutions] = useState({
    1: [2, 4], // Arroz pode ser substituído por feijão ou batata doce
    2: [1, 4], // Feijão pode ser substituído por arroz ou batata doce
    3: [5], // Frango pode ser substituído por ovo
    4: [1, 2], // Batata doce pode ser substituída por arroz ou feijão
    5: [3], // Ovo pode ser substituído por frango
    6: [], // Banana sem substituições diretas
    7: [9], // Aveia pode ser substituída por pão
    8: [], // Leite sem substituições diretas
    9: [7], // Pão pode ser substituído por aveia
    10: [] // Queijo sem substituições diretas
  })

  const meals = [
    { id: 'breakfast', name: 'Café da Manhã', icon: '🌅', time: '07:00' },
    { id: 'morning_snack', name: 'Lanche da Manhã', icon: '☕', time: '10:00' },
    { id: 'lunch', name: 'Almoço', icon: '🍽️', time: '12:30' },
    { id: 'afternoon_snack', name: 'Lanche da Tarde', icon: '🥪', time: '15:30' },
    { id: 'dinner', name: 'Jantar', icon: '🌙', time: '19:00' },
    { id: 'supper', name: 'Ceia', icon: '🌃', time: '21:30' }
  ]

  const filteredFoods = foodDatabase.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addFoodToMeal = (food) => {
    const existingFood = selectedFoods.find(f => f.id === food.id)
    if (existingFood) {
      setSelectedFoods(selectedFoods.map(f => 
        f.id === food.id 
          ? { ...f, quantity: f.quantity + 1 }
          : f
      ))
    } else {
      setSelectedFoods([...selectedFoods, { ...food, quantity: 1 }])
    }
  }

  const removeFoodFromMeal = (foodId) => {
    setSelectedFoods(selectedFoods.filter(f => f.id !== foodId))
  }

  const updateFoodQuantity = (foodId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFoodFromMeal(foodId)
      return
    }
    setSelectedFoods(selectedFoods.map(f => 
      f.id === foodId 
        ? { ...f, quantity: newQuantity }
        : f
    ))
  }

  const toggleFavorite = (food) => {
    const isFavorite = favorites.some(f => f.id === food.id)
    if (isFavorite) {
      setFavorites(favorites.filter(f => f.id !== food.id))
    } else {
      setFavorites([...favorites, food])
    }
  }

  const getSubstitutions = (foodId) => {
    const substitutionIds = substitutions[foodId] || []
    return substitutionIds.map(id => foodDatabase.find(f => f.id === id)).filter(Boolean)
  }

  const calculateTotalNutrition = () => {
    return selectedFoods.reduce((total, food) => ({
      calories: total.calories + (food.calories * food.quantity),
      protein: total.protein + (food.protein * food.quantity),
      carbs: total.carbs + (food.carbs * food.quantity),
      fat: total.fat + (food.fat * food.quantity)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  const saveMeal = () => {
    const mealData = {
      id: Date.now(),
      meal: selectedMeal,
      foods: selectedFoods,
      nutrition: calculateTotalNutrition(),
      timestamp: new Date().toISOString()
    }
    
    setRecentMeals([mealData, ...recentMeals.slice(0, 4)])
    setSelectedFoods([])
    
    // Simular salvamento no backend
    console.log('Refeição salva:', mealData)
  }

  const totalNutrition = calculateTotalNutrition()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registro de Refeições</h1>
          <p className="text-gray-600">Registre seus alimentos e acompanhe sua nutrição</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Scanner
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Histórico
          </Button>
        </div>
      </div>

      {/* Seleção de Refeição */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-blue-600" />
            Selecionar Refeição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {meals.map((meal) => (
              <button
                key={meal.id}
                onClick={() => setSelectedMeal(meal.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedMeal === meal.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{meal.icon}</div>
                <div className="text-sm font-medium">{meal.name}</div>
                <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  {meal.time}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Busca e Seleção de Alimentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-green-600" />
              Buscar Alimentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Barra de Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Digite o nome do alimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Favoritos */}
            {favorites.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Favoritos
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {favorites.map((food) => (
                    <div key={`fav-${food.id}`} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <div>
                        <span className="font-medium text-sm">{food.name}</span>
                        <div className="text-xs text-gray-600">
                          {food.calories} kcal • {food.protein}g prot
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addFoodToMeal(food)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de Alimentos */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredFoods.map((food) => (
                <div key={food.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{food.name}</span>
                      <button
                        onClick={() => toggleFavorite(food)}
                        className={`p-1 rounded ${
                          favorites.some(f => f.id === food.id)
                            ? 'text-red-500'
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <Heart className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      {food.calories} kcal • {food.protein}g prot • {food.carbs}g carb • {food.fat}g gord
                    </div>
                    <div className="text-xs text-gray-500">Porção: {food.portion}</div>
                    
                    {/* Substituições */}
                    {getSubstitutions(food.id).length > 0 && (
                      <div className="mt-1">
                        <span className="text-xs text-blue-600">Substituições: </span>
                        {getSubstitutions(food.id).map((sub, index) => (
                          <span key={sub.id} className="text-xs text-blue-600">
                            {sub.name}{index < getSubstitutions(food.id).length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addFoodToMeal(food)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Refeição Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {meals.find(m => m.id === selectedMeal)?.icon}
                </span>
                <span>{meals.find(m => m.id === selectedMeal)?.name}</span>
              </div>
              {selectedFoods.length > 0 && (
                <Button
                  onClick={() => setSelectedFoods([])}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedFoods.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Utensils className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhum alimento selecionado</p>
                <p className="text-sm">Busque e adicione alimentos à sua refeição</p>
              </div>
            ) : (
              <>
                {/* Alimentos Selecionados */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedFoods.map((food) => (
                    <div key={food.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium">{food.name}</span>
                        <div className="text-sm text-gray-600">
                          {(food.calories * food.quantity).toFixed(0)} kcal • 
                          {(food.protein * food.quantity).toFixed(1)}g prot
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateFoodQuantity(food.id, food.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{food.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateFoodQuantity(food.id, food.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFoodFromMeal(food.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumo Nutricional */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Resumo Nutricional</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {totalNutrition.calories.toFixed(0)}
                      </div>
                      <div className="text-sm text-orange-700">Calorias</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {totalNutrition.protein.toFixed(1)}g
                      </div>
                      <div className="text-sm text-blue-700">Proteínas</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {totalNutrition.carbs.toFixed(1)}g
                      </div>
                      <div className="text-sm text-green-700">Carboidratos</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {totalNutrition.fat.toFixed(1)}g
                      </div>
                      <div className="text-sm text-purple-700">Gorduras</div>
                    </div>
                  </div>
                </div>

                {/* Botão Salvar */}
                <Button 
                  onClick={saveMeal}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  Salvar Refeição
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Refeições Recentes */}
      {recentMeals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Refeições Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentMeals.map((meal) => (
                <div key={meal.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">
                      {meals.find(m => m.id === meal.meal)?.name}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(meal.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {meal.foods.length} alimento(s)
                  </div>
                  <div className="text-lg font-bold text-orange-600">
                    {meal.nutrition.calories.toFixed(0)} kcal
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => setSelectedFoods(meal.foods)}
                  >
                    Repetir Refeição
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MealRegistration

