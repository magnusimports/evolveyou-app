import React, { useState, useEffect } from 'react'
import PlanDisplay from '../../components/PlanDisplay'
import MealLogger from '../tracking/MealLogger'
import ExerciseLogger from '../tracking/ExerciseLogger'
import CoachEVO from '../coach/CoachEVO'
import FullTimeSystem from '../fulltime/FullTimeSystem'
import trackingService from '../../services/trackingService'
import apiService from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Scale, 
  Calculator, 
  Flame, 
  Droplets,
  TrendingUp,
  Target,
  Clock,
  Award
} from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  
  // Estados para dados dinâmicos
  const [userProfile, setUserProfile] = useState(null)
  const [userPlan, setUserPlan] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estados legados mantidos para compatibilidade
  const [metrics, setMetrics] = useState({
    currentWeight: 75,
    targetWeight: 70,
    bmi: 24.5,
    todayCalories: 2100,
    targetCalories: 2459,
    waterIntake: 2.2,
    targetWater: 2.5,
    workoutsCompleted: 12,
    totalWorkouts: 15,
    weeklyProgress: {
      weightLoss: 2.5,
      consistency: 7
    }
  })

  const [trackingData, setTrackingData] = useState({
    todayMeals: [],
    todayExercises: [],
    dashboardSummary: null,
    isLoading: false,
    error: null
  })

  const [activeTab, setActiveTab] = useState('overview') // overview, meals, exercises, coach, fulltime

  // Carrega dados reais da API ao montar o componente
  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    if (!user?.uid) return
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Carregando dados do dashboard...')
      
      // Carrega dados em paralelo
      const [profileResponse, planResponse, progressResponse] = await Promise.all([
        apiService.getUserProfile(user.uid),
        apiService.getUserPlan(user.uid),
        apiService.getProgress(user.uid)
      ])

      console.log('✅ Dados carregados:', { profileResponse, planResponse, progressResponse })

      // Atualiza estados com dados reais
      if (profileResponse?.success) {
        setUserProfile(profileResponse.data)
        
        // Atualiza métricas com dados do perfil
        if (profileResponse.data.stats) {
          setMetrics(prev => ({
            ...prev,
            currentWeight: profileResponse.data.stats.currentWeight || prev.currentWeight,
            targetWeight: profileResponse.data.stats.targetWeight || prev.targetWeight,
            bmi: profileResponse.data.stats.bmi || prev.bmi,
            targetCalories: profileResponse.data.stats.targetCalories || prev.targetCalories,
            todayCalories: profileResponse.data.stats.dailyCalories || prev.todayCalories,
            waterIntake: profileResponse.data.stats.waterIntake || prev.waterIntake
          }))
        }
      }

      if (planResponse?.success) {
        setUserPlan(planResponse.data)
      }

      if (progressResponse?.success) {
        setProgressData(progressResponse.data)
        
        // Atualiza métricas com dados de progresso
        if (progressResponse.data.overview) {
          setMetrics(prev => ({
            ...prev,
            workoutsCompleted: progressResponse.data.overview.workoutsCompleted || prev.workoutsCompleted,
            totalWorkouts: progressResponse.data.overview.totalWorkouts || prev.totalWorkouts
          }))
        }
      }

      // Carrega dados de tracking legados
      await loadTrackingData()

    } catch (error) {
      console.error('❌ Erro ao carregar dados do dashboard:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadTrackingData = async () => {
    setTrackingData(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const [dashboardSummary, mealHistory, exerciseHistory] = await Promise.all([
        trackingService.getDashboardSummary(),
        trackingService.getLogHistory('meal', { limit: 10 }),
        trackingService.getLogHistory('exercise', { limit: 10 })
      ])

      setTrackingData(prev => ({
        ...prev,
        dashboardSummary,
        todayMeals: mealHistory || [],
        todayExercises: exerciseHistory || [],
        isLoading: false
      }))

    } catch (error) {
      console.error('❌ Erro ao carregar dados de tracking:', error)
      setTrackingData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }))
    }
  }

  const handleMealLogged = (mealData) => {
    setTrackingData(prev => ({
      ...prev,
      todayMeals: [mealData, ...prev.todayMeals]
    }))
    
    // Recarrega dados do dashboard
    loadTrackingData()
  }

  const handleExerciseLogged = (exerciseData) => {
    setTrackingData(prev => ({
      ...prev,
      todayExercises: [exerciseData, ...prev.todayExercises]
    }))
    
    // Recarrega dados do dashboard
    loadTrackingData()
  }

  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) return { status: 'Abaixo do peso', color: 'text-blue-600' }
    if (bmi < 25) return { status: 'Peso normal', color: 'text-green-600' }
    if (bmi < 30) return { status: 'Sobrepeso', color: 'text-yellow-600' }
    return { status: 'Obesidade', color: 'text-red-600' }
  }

  const bmiStatus = getBMIStatus(metrics.bmi)
  const caloriesProgress = (metrics.todayCalories / metrics.targetCalories) * 100
  const waterProgress = (metrics.waterIntake / metrics.targetWater) * 100
  const workoutProgress = (metrics.workoutsCompleted / metrics.totalWorkouts) * 100

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando seus dados...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-gray-600 mb-4">Erro ao carregar dados: {error}</p>
            <button 
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            {userProfile?.user?.name ? `Olá, ${userProfile.user.name}!` : 'Acompanhe seu progresso em tempo real'}
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          {progressData?.source === 'mock' ? 'Dados demo' : 'Dados atualizados agora'}
        </Badge>
      </div>

      {/* Visualização do Plano */}
      <PlanDisplay />

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Peso Atual */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Peso Atual</CardTitle>
            <Scale className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metrics.currentWeight}kg</div>
            <p className="text-xs text-gray-500 mt-1">Meta: {metrics.targetWeight}kg</p>
            <div className="mt-2">
              <Progress 
                value={((metrics.currentWeight - metrics.targetWeight) / metrics.currentWeight) * 100} 
                className="h-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* IMC */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">IMC</CardTitle>
            <Calculator className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metrics.bmi}</div>
            <p className={`text-xs mt-1 ${bmiStatus.color}`}>{bmiStatus.status}</p>
            <div className="mt-2">
              <Progress value={75} className="h-1" />
            </div>
          </CardContent>
        </Card>

        {/* Calorias Hoje */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Calorias Hoje</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metrics.todayCalories}</div>
            <p className="text-xs text-gray-500 mt-1">Meta: {metrics.targetCalories} kcal</p>
            <div className="mt-2">
              <Progress value={caloriesProgress} className="h-1" />
            </div>
          </CardContent>
        </Card>

        {/* Água */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Água</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metrics.waterIntake}L</div>
            <p className="text-xs text-gray-500 mt-1">Meta: {metrics.targetWater}L</p>
            <div className="mt-2">
              <Progress value={waterProgress} className="h-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso Semanal e Perfil */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progresso Semanal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Progresso Semanal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Treinos Concluídos</span>
                <span className="text-sm text-gray-600">{metrics.workoutsCompleted}/{metrics.totalWorkouts}</span>
              </div>
              <Progress value={workoutProgress} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Perda de Peso</span>
                <span className="text-sm text-green-600 font-semibold">-{metrics.weeklyProgress.weightLoss}kg</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Consistência</span>
                <span className="text-sm text-blue-600 font-semibold">{metrics.weeklyProgress.consistency} dias</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Próximo Treino</span>
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <Clock className="w-3 h-3 mr-1" />
                  Quinta-feira - Pernas
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seu Perfil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span>Seu Perfil</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Idade:</span>
                <p className="font-semibold">{userProfile.age} anos</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Altura:</span>
                <p className="font-semibold">{userProfile.height}cm</p>
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-600">Objetivo:</span>
              <p className="font-semibold text-green-600">{userProfile.goal}</p>
            </div>

            <div>
              <span className="text-sm text-gray-600">Atividade:</span>
              <p className="font-semibold text-blue-600">{userProfile.activity}</p>
            </div>

            <div>
              <span className="text-sm text-gray-600">Principais Desafios:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {userProfile.challenges.map((challenge, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {challenge}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Tracking */}
      <div className="space-y-6">
        {/* Navegação por Abas */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('meals')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'meals'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🍽️ Refeições
          </button>
          <button
            onClick={() => setActiveTab('exercises')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'exercises'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏋️‍♂️ Exercícios
          </button>
          <button
            onClick={() => setActiveTab('coach')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'coach'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🤖 Coach EVO
          </button>
          <button
            onClick={() => setActiveTab('fulltime')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'fulltime'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔄 Full-time
          </button>
        </div>

        {/* Conteúdo das Abas */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumo de Refeições Hoje */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🍽️</span>
                  <span>Refeições de Hoje</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trackingData.isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Carregando...</p>
                  </div>
                ) : trackingData.todayMeals.length > 0 ? (
                  <div className="space-y-3">
                    {trackingData.todayMeals.slice(0, 3).map((meal, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{meal.meal_type || 'Refeição'}</p>
                          <p className="text-sm text-gray-600">
                            {meal.total_calories || 0} kcal
                          </p>
                        </div>
                        <span className="text-2xl">🍽️</span>
                      </div>
                    ))}
                    {trackingData.todayMeals.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{trackingData.todayMeals.length - 3} refeições a mais
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Nenhuma refeição registrada hoje</p>
                    <button
                      onClick={() => setActiveTab('meals')}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Registrar primeira refeição
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo de Exercícios Hoje */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🏋️‍♂️</span>
                  <span>Exercícios de Hoje</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trackingData.isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Carregando...</p>
                  </div>
                ) : trackingData.todayExercises.length > 0 ? (
                  <div className="space-y-3">
                    {trackingData.todayExercises.slice(0, 3).map((exercise, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{exercise.exercise_name || 'Exercício'}</p>
                          <p className="text-sm text-gray-600">
                            {exercise.reps_done || 0} reps
                            {exercise.weight_kg && ` • ${exercise.weight_kg}kg`}
                          </p>
                        </div>
                        <span className="text-2xl">💪</span>
                      </div>
                    ))}
                    {trackingData.todayExercises.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{trackingData.todayExercises.length - 3} exercícios a mais
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Nenhum exercício registrado hoje</p>
                    <button
                      onClick={() => setActiveTab('exercises')}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Iniciar primeiro treino
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'meals' && (
          <MealLogger onMealLogged={handleMealLogged} />
        )}

        {activeTab === 'exercises' && (
          <ExerciseLogger onExerciseLogged={handleExerciseLogged} />
        )}

        {activeTab === 'coach' && (
          <CoachEVO />
        )}

        {activeTab === 'fulltime' && (
          <FullTimeSystem />
        )}

        {/* Indicador de Erro */}
        {trackingData.error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <p className="text-yellow-800 text-sm">{trackingData.error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

