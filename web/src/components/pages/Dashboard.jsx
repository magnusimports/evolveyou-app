import { useState, useEffect } from 'react'
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

  const [userProfile] = useState({
    age: 30,
    height: 175,
    goal: 'Perder Peso',
    activity: 'Moderadamente Ativo',
    challenges: ['Falta de tempo', 'Controle de porções']
  })

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Acompanhe seu progresso em tempo real</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Dados atualizados agora
        </Badge>
      </div>

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
    </div>
  )
}

export default Dashboard

