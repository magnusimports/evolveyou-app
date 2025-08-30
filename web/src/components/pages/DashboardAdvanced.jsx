import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Target, 
  Flame, 
  Droplets, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  Zap,
  Heart,
  Award,
  Plus
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

const DashboardAdvanced = () => {
  const [userData, setUserData] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Carregar dados do usuário
    const storedUserData = localStorage.getItem('evolveyou_user_data')
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData))
    }

    // Gerar dados do dashboard
    generateDashboardData()

    // Atualizar horário a cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const generateDashboardData = () => {
    // Simular dados em tempo real baseados no algoritmo TMB/GET
    const baseData = {
      // Balanço energético
      energyBalance: {
        consumed: 1650,
        burned: 2100,
        target: 2000,
        deficit: 450,
        progress: 82.5
      },
      
      // Macronutrientes
      macros: {
        carbs: { consumed: 180, target: 220, percentage: 82 },
        protein: { consumed: 125, target: 140, percentage: 89 },
        fat: { consumed: 55, target: 65, percentage: 85 }
      },
      
      // Hidratação
      hydration: {
        consumed: 2.1,
        target: 3.0,
        percentage: 70
      },
      
      // Atividade física
      activity: {
        steps: 8420,
        target: 10000,
        workouts: 1,
        targetWorkouts: 1,
        caloriesBurned: 320
      },
      
      // Dados da semana para gráfico
      weeklyData: [
        { day: 'Seg', calories: 1950, target: 2000 },
        { day: 'Ter', calories: 2100, target: 2000 },
        { day: 'Qua', calories: 1850, target: 2000 },
        { day: 'Qui', calories: 2050, target: 2000 },
        { day: 'Sex', calories: 1900, target: 2000 },
        { day: 'Sáb', calories: 2200, target: 2000 },
        { day: 'Dom', calories: 1650, target: 2000 }
      ],
      
      // Conquistas recentes
      achievements: [
        { id: 1, title: 'Meta Diária Atingida', description: '5 dias consecutivos', icon: Target, color: 'green' },
        { id: 2, title: 'Hidratação Perfeita', description: 'Meta de água atingida', icon: Droplets, color: 'blue' },
        { id: 3, title: 'Treino Completo', description: 'Todas as séries realizadas', icon: Activity, color: 'purple' }
      ]
    }

    setDashboardData(baseData)
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header com saudação */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getGreeting()}, {userData?.name || 'Usuário'}! 👋
              </h1>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                {formatDate(currentTime)}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <p className="text-sm text-gray-500">Hora atual</p>
            </div>
          </div>
        </div>

        {/* Cards principais de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Balanço Energético */}
          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Balanço Energético
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    -{dashboardData.energyBalance.deficit}
                  </span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Déficit
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consumido:</span>
                    <span className="font-medium">{dashboardData.energyBalance.consumed} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Queimado:</span>
                    <span className="font-medium">{dashboardData.energyBalance.burned} kcal</span>
                  </div>
                </div>
                <Progress value={dashboardData.energyBalance.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Macronutrientes */}
          <Card className="shadow-lg border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Macronutrientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(dashboardData.macros).map(([key, macro]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize text-gray-600">{key === 'carbs' ? 'Carboidratos' : key === 'protein' ? 'Proteínas' : 'Gorduras'}:</span>
                      <span className="font-medium">{macro.consumed}g/{macro.target}g</span>
                    </div>
                    <Progress value={macro.percentage} className="h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hidratação */}
          <Card className="shadow-lg border-l-4 border-l-cyan-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Hidratação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {dashboardData.hydration.consumed}L
                  </span>
                  <Badge variant="outline">
                    {dashboardData.hydration.percentage}%
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  Meta: {dashboardData.hydration.target}L
                </div>
                <Progress value={dashboardData.hydration.percentage} className="h-2" />
                <Button size="sm" className="w-full" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar 250ml
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Atividade Física */}
          <Card className="shadow-lg border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Atividade Física
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {dashboardData.activity.steps.toLocaleString()}
                  </span>
                  <Badge variant="secondary">
                    Passos
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Meta:</span>
                    <span className="font-medium">{dashboardData.activity.target.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Treinos:</span>
                    <span className="font-medium">{dashboardData.activity.workouts}/{dashboardData.activity.targetWorkouts}</span>
                  </div>
                </div>
                <Progress value={(dashboardData.activity.steps / dashboardData.activity.target) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de gráficos e conquistas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Gráfico semanal */}
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Progresso Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dashboardData.weeklyData}>
                  <XAxis dataKey="day" />
                  <YAxis hide />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} kcal`, 
                      name === 'calories' ? 'Consumido' : 'Meta'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#10B981" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
              
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Consumido</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Meta</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conquistas */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Conquistas Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.achievements.map((achievement) => {
                const Icon = achievement.icon
                return (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      achievement.color === 'green' ? 'bg-green-100' :
                      achievement.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        achievement.color === 'green' ? 'text-green-600' :
                        achievement.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{achievement.title}</p>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Ações rápidas */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                <Plus className="w-6 h-6" />
                <span className="text-sm">Registrar Refeição</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                <Activity className="w-6 h-6" />
                <span className="text-sm">Iniciar Treino</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                <Droplets className="w-6 h-6" />
                <span className="text-sm">Beber Água</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                <Heart className="w-6 h-6" />
                <span className="text-sm">Coach EVO</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardAdvanced

