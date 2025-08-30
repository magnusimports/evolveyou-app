import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus,
  Minus,
  Activity,
  Utensils,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Target,
  BarChart3
} from 'lucide-react'

const FullTimeSystem = () => {
  const [activities, setActivities] = useState([])
  const [extraFoods, setExtraFoods] = useState([])
  const [dailyBalance, setDailyBalance] = useState({
    plannedCalories: 2000,
    consumedCalories: 1800,
    burnedCalories: 300,
    extraCalories: 0,
    extraBurned: 0
  })

  // Base de dados de atividades
  const [activityDatabase] = useState([
    { id: 1, name: 'Futebol', caloriesPerMinute: 8.5, category: 'Esporte' },
    { id: 2, name: 'Corrida', caloriesPerMinute: 12.0, category: 'Cardio' },
    { id: 3, name: 'Caminhada', caloriesPerMinute: 4.5, category: 'Cardio' },
    { id: 4, name: 'Natação', caloriesPerMinute: 10.0, category: 'Esporte' },
    { id: 5, name: 'Ciclismo', caloriesPerMinute: 9.0, category: 'Cardio' },
    { id: 6, name: 'Dança', caloriesPerMinute: 6.5, category: 'Recreativo' },
    { id: 7, name: 'Tênis', caloriesPerMinute: 7.5, category: 'Esporte' },
    { id: 8, name: 'Yoga', caloriesPerMinute: 3.0, category: 'Relaxamento' },
    { id: 9, name: 'Musculação', caloriesPerMinute: 6.0, category: 'Força' },
    { id: 10, name: 'Vôlei', caloriesPerMinute: 7.0, category: 'Esporte' }
  ])

  // Base de dados de alimentos extras
  const [extraFoodDatabase] = useState([
    { id: 1, name: 'Pizza Portuguesa (1 fatia)', calories: 280, category: 'Fast Food' },
    { id: 2, name: 'Hambúrguer', calories: 540, category: 'Fast Food' },
    { id: 3, name: 'Refrigerante (350ml)', calories: 140, category: 'Bebida' },
    { id: 4, name: 'Cerveja (350ml)', calories: 150, category: 'Bebida' },
    { id: 5, name: 'Sorvete (1 bola)', calories: 120, category: 'Sobremesa' },
    { id: 6, name: 'Chocolate (30g)', calories: 160, category: 'Doce' },
    { id: 7, name: 'Batata Frita (porção)', calories: 320, category: 'Fast Food' },
    { id: 8, name: 'Açaí (300ml)', calories: 250, category: 'Sobremesa' },
    { id: 9, name: 'Pastel (1 unidade)', calories: 200, category: 'Fast Food' },
    { id: 10, name: 'Brigadeiro (1 unidade)', calories: 80, category: 'Doce' }
  ])

  const [activitySearch, setActivitySearch] = useState('')
  const [foodSearch, setFoodSearch] = useState('')
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [activityDuration, setActivityDuration] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)
  const [foodQuantity, setFoodQuantity] = useState(1)

  const filteredActivities = activityDatabase.filter(activity =>
    activity.name.toLowerCase().includes(activitySearch.toLowerCase())
  )

  const filteredFoods = extraFoodDatabase.filter(food =>
    food.name.toLowerCase().includes(foodSearch.toLowerCase())
  )

  const addActivity = () => {
    if (!selectedActivity || !activityDuration) return

    const duration = parseInt(activityDuration)
    const totalCalories = selectedActivity.caloriesPerMinute * duration

    const newActivity = {
      id: Date.now(),
      ...selectedActivity,
      duration,
      totalCalories,
      timestamp: new Date().toISOString()
    }

    setActivities([newActivity, ...activities])
    setDailyBalance(prev => ({
      ...prev,
      extraBurned: prev.extraBurned + totalCalories
    }))

    setSelectedActivity(null)
    setActivityDuration('')
    setActivitySearch('')
  }

  const addExtraFood = () => {
    if (!selectedFood) return

    const totalCalories = selectedFood.calories * foodQuantity

    const newFood = {
      id: Date.now(),
      ...selectedFood,
      quantity: foodQuantity,
      totalCalories,
      timestamp: new Date().toISOString()
    }

    setExtraFoods([newFood, ...extraFoods])
    setDailyBalance(prev => ({
      ...prev,
      extraCalories: prev.extraCalories + totalCalories
    }))

    setSelectedFood(null)
    setFoodQuantity(1)
    setFoodSearch('')
  }

  const removeActivity = (activityId) => {
    const activity = activities.find(a => a.id === activityId)
    if (activity) {
      setActivities(activities.filter(a => a.id !== activityId))
      setDailyBalance(prev => ({
        ...prev,
        extraBurned: prev.extraBurned - activity.totalCalories
      }))
    }
  }

  const removeExtraFood = (foodId) => {
    const food = extraFoods.find(f => f.id === foodId)
    if (food) {
      setExtraFoods(extraFoods.filter(f => f.id !== foodId))
      setDailyBalance(prev => ({
        ...prev,
        extraCalories: prev.extraCalories - food.totalCalories
      }))
    }
  }

  const calculateBalance = () => {
    const totalConsumed = dailyBalance.consumedCalories + dailyBalance.extraCalories
    const totalBurned = dailyBalance.burnedCalories + dailyBalance.extraBurned
    const netBalance = totalConsumed - totalBurned
    const targetDeficit = dailyBalance.plannedCalories - totalBurned
    
    return {
      netBalance,
      targetDeficit,
      isOverTarget: netBalance > targetDeficit,
      surplus: Math.max(0, netBalance - targetDeficit)
    }
  }

  const balance = calculateBalance()

  const getMotivationalMessage = () => {
    if (activities.length > 0 && extraFoods.length === 0) {
      return {
        type: 'success',
        title: 'Parabéns! 🎉',
        message: `Você teve um gasto calórico extra de ${dailyBalance.extraBurned} calorias! Isso vai acelerar seus resultados.`
      }
    }
    
    if (extraFoods.length > 0 && !balance.isOverTarget) {
      return {
        type: 'info',
        title: 'Tudo sob controle! 😊',
        message: 'Não se preocupe, vamos readequar sua dieta para os próximos dias. Isso não vai impactar no seu objetivo final.'
      }
    }
    
    if (balance.isOverTarget) {
      return {
        type: 'warning',
        title: 'Vamos rebalancear! ⚖️',
        message: `Você está ${balance.surplus.toFixed(0)} calorias acima da meta. Vamos ajustar suas próximas refeições.`
      }
    }
    
    return {
      type: 'neutral',
      title: 'Continue assim! 💪',
      message: 'Você está no caminho certo para atingir seus objetivos.'
    }
  }

  const motivationalMessage = getMotivationalMessage()

  const getRebalancingPlan = () => {
    if (!balance.isOverTarget) return null

    const surplus = balance.surplus
    const fatReduction = surplus * 0.6
    const carbReduction = surplus * 0.3
    const proteinReduction = surplus * 0.1

    return {
      fatReduction: fatReduction / 9, // 9 cal por grama de gordura
      carbReduction: carbReduction / 4, // 4 cal por grama de carboidrato
      proteinReduction: proteinReduction / 4 // 4 cal por grama de proteína
    }
  }

  const rebalancingPlan = getRebalancingPlan()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema Full-time</h1>
          <p className="text-gray-600">Registre atividades e alimentos extras do seu dia</p>
        </div>
        <Badge 
          variant={balance.isOverTarget ? "destructive" : "default"}
          className="text-lg px-4 py-2"
        >
          {balance.isOverTarget ? 'Acima da Meta' : 'Dentro da Meta'}
        </Badge>
      </div>

      {/* Mensagem Motivacional */}
      <Card className={`border-l-4 ${
        motivationalMessage.type === 'success' ? 'border-l-green-500 bg-green-50' :
        motivationalMessage.type === 'warning' ? 'border-l-orange-500 bg-orange-50' :
        motivationalMessage.type === 'info' ? 'border-l-blue-500 bg-blue-50' :
        'border-l-gray-500 bg-gray-50'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${
              motivationalMessage.type === 'success' ? 'bg-green-100' :
              motivationalMessage.type === 'warning' ? 'bg-orange-100' :
              motivationalMessage.type === 'info' ? 'bg-blue-100' :
              'bg-gray-100'
            }`}>
              {motivationalMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
               motivationalMessage.type === 'warning' ? <AlertCircle className="w-5 h-5 text-orange-600" /> :
               <Target className="w-5 h-5 text-blue-600" />}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{motivationalMessage.title}</h3>
              <p className="text-gray-700 mt-1">{motivationalMessage.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balanço Calórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Balanço Calórico do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {dailyBalance.consumedCalories}
              </div>
              <div className="text-sm text-blue-700">Planejado</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                +{dailyBalance.extraCalories}
              </div>
              <div className="text-sm text-red-700">Extra Consumido</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {dailyBalance.burnedCalories}
              </div>
              <div className="text-sm text-green-700">Gasto Planejado</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                +{dailyBalance.extraBurned}
              </div>
              <div className="text-sm text-orange-700">Extra Queimado</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Balanço Final:</span>
              <div className={`flex items-center gap-2 ${
                balance.netBalance > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {balance.netBalance > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-bold">
                  {balance.netBalance > 0 ? '+' : ''}{balance.netBalance.toFixed(0)} kcal
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adicionar Atividade Extra */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Incluir Atividade Não Prevista
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Busca de Atividade */}
            <div>
              <Input
                placeholder="Digite o nome da atividade..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
              />
            </div>

            {/* Lista de Atividades */}
            {activitySearch && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredActivities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity)}
                    className={`w-full text-left p-3 border rounded-lg hover:bg-gray-50 ${
                      selectedActivity?.id === activity.id ? 'border-green-500 bg-green-50' : ''
                    }`}
                  >
                    <div className="font-medium">{activity.name}</div>
                    <div className="text-sm text-gray-600">
                      {activity.caloriesPerMinute} kcal/min • {activity.category}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Duração da Atividade */}
            {selectedActivity && (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium">{selectedActivity.name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedActivity.caloriesPerMinute} kcal por minuto
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Duração (minutos)
                  </label>
                  <Input
                    type="number"
                    placeholder="Ex: 60"
                    value={activityDuration}
                    onChange={(e) => setActivityDuration(e.target.value)}
                  />
                </div>

                {activityDuration && (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="font-medium text-orange-800">
                      Calorias queimadas: {(selectedActivity.caloriesPerMinute * parseInt(activityDuration || 0)).toFixed(0)} kcal
                    </div>
                  </div>
                )}

                <Button 
                  onClick={addActivity}
                  className="w-full bg-green-500 hover:bg-green-600"
                  disabled={!activityDuration}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Atividade
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Adicionar Alimento Extra */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-red-600" />
              Inserir Alimento Fora do Plano
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Busca de Alimento */}
            <div>
              <Input
                placeholder="Digite o nome do alimento..."
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
              />
            </div>

            {/* Lista de Alimentos */}
            {foodSearch && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    className={`w-full text-left p-3 border rounded-lg hover:bg-gray-50 ${
                      selectedFood?.id === food.id ? 'border-red-500 bg-red-50' : ''
                    }`}
                  >
                    <div className="font-medium">{food.name}</div>
                    <div className="text-sm text-gray-600">
                      {food.calories} kcal • {food.category}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Quantidade do Alimento */}
            {selectedFood && (
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="font-medium">{selectedFood.name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedFood.calories} kcal por unidade
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Quantidade
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setFoodQuantity(Math.max(1, foodQuantity - 1))}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-12 text-center font-medium">{foodQuantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setFoodQuantity(foodQuantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium text-orange-800">
                    Total de calorias: {(selectedFood.calories * foodQuantity).toFixed(0)} kcal
                  </div>
                </div>

                <Button 
                  onClick={addExtraFood}
                  className="w-full bg-red-500 hover:bg-red-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Alimento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plano de Rebalanceamento */}
      {rebalancingPlan && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Zap className="h-5 w-5" />
              Plano de Rebalanceamento Inteligente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-4">
              Para compensar o excesso de {balance.surplus.toFixed(0)} calorias, vamos ajustar suas próximas refeições:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  -{rebalancingPlan.fatReduction.toFixed(1)}g
                </div>
                <div className="text-sm text-purple-700">Gorduras (60%)</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  -{rebalancingPlan.carbReduction.toFixed(1)}g
                </div>
                <div className="text-sm text-green-700">Carboidratos (30%)</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  -{rebalancingPlan.proteinReduction.toFixed(1)}g
                </div>
                <div className="text-sm text-blue-700">Proteínas (10%)</div>
              </div>
            </div>
            <p className="text-sm text-orange-600 mt-3">
              * Essas reduções serão distribuídas nas suas próximas refeições até você voltar ao equilíbrio.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Histórico do Dia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividades Extras */}
        {activities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Atividades Extras Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">{activity.name}</div>
                      <div className="text-sm text-gray-600">
                        {activity.duration} min • {activity.totalCalories.toFixed(0)} kcal
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeActivity(activity.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alimentos Extras */}
        {extraFoods.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-red-600" />
                Alimentos Extras Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {extraFoods.map((food) => (
                  <div key={food.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium">{food.name}</div>
                      <div className="text-sm text-gray-600">
                        {food.quantity}x • {food.totalCalories.toFixed(0)} kcal
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(food.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeExtraFood(food.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default FullTimeSystem

