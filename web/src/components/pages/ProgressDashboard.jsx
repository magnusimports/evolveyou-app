import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  Award,
  Activity,
  Zap,
  Heart,
  Flame,
  Download,
  Filter,
  BarChart3
} from 'lucide-react'

const ProgressDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [progressData, setProgressData] = useState(null)

  useEffect(() => {
    generateProgressData()
  }, [selectedPeriod])

  const generateProgressData = () => {
    // Simular dados de progresso baseados no período selecionado
    const periods = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }

    const days = periods[selectedPeriod]
    const data = {
      weightProgress: [],
      workoutFrequency: [],
      strengthProgress: [],
      nutritionCompliance: [],
      bodyComposition: [],
      weeklyStats: []
    }

    // Gerar dados de peso
    let currentWeight = 85
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      
      // Simular perda gradual de peso
      currentWeight += (Math.random() - 0.6) * 0.3
      
      data.weightProgress.push({
        date: date.toISOString().split('T')[0],
        weight: Math.round(currentWeight * 10) / 10,
        target: 80,
        day: i + 1
      })
    }

    // Gerar dados de frequência de treino
    for (let i = 0; i < Math.min(days / 7, 12); i++) {
      data.workoutFrequency.push({
        week: `Sem ${i + 1}`,
        workouts: Math.floor(Math.random() * 3) + 3,
        target: 4
      })
    }

    // Gerar dados de força
    const exercises = ['Supino', 'Agachamento', 'Levantamento Terra', 'Desenvolvimento']
    exercises.forEach(exercise => {
      let currentWeight = 60 + Math.random() * 40
      for (let i = 0; i < Math.min(days / 7, 8); i++) {
        currentWeight += Math.random() * 5
        data.strengthProgress.push({
          week: i + 1,
          exercise,
          weight: Math.round(currentWeight * 10) / 10
        })
      }
    })

    // Gerar dados de compliance nutricional
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      
      data.nutritionCompliance.push({
        date: date.toISOString().split('T')[0],
        compliance: Math.floor(Math.random() * 30) + 70,
        calories: Math.floor(Math.random() * 400) + 1800,
        target: 2000
      })
    }

    // Dados de composição corporal
    data.bodyComposition = [
      { name: 'Massa Muscular', value: 45, color: '#10B981' },
      { name: 'Gordura Corporal', value: 18, color: '#F59E0B' },
      { name: 'Água', value: 32, color: '#3B82F6' },
      { name: 'Ossos/Outros', value: 5, color: '#8B5CF6' }
    ]

    // Estatísticas semanais
    data.weeklyStats = [
      { metric: 'Treinos Realizados', value: 12, target: 16, unit: 'sessões' },
      { metric: 'Calorias Queimadas', value: 3200, target: 4000, unit: 'kcal' },
      { metric: 'Peso Perdido', value: 1.2, target: 1.0, unit: 'kg' },
      { metric: 'Compliance Nutricional', value: 85, target: 90, unit: '%' }
    ]

    setProgressData(data)
  }

  const calculateTrend = (data, key) => {
    if (data.length < 2) return 0
    const recent = data.slice(-7).reduce((acc, item) => acc + item[key], 0) / 7
    const previous = data.slice(-14, -7).reduce((acc, item) => acc + item[key], 0) / 7
    return ((recent - previous) / previous * 100).toFixed(1)
  }

  const exportReport = () => {
    // Simular exportação de relatório
    const reportData = {
      period: selectedPeriod,
      generatedAt: new Date().toISOString(),
      summary: progressData?.weeklyStats,
      weightProgress: progressData?.weightProgress,
      workoutFrequency: progressData?.workoutFrequency
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `evolveyou-progress-${selectedPeriod}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!progressData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados de progresso...</p>
        </div>
      </div>
    )
  }

  const weightTrend = calculateTrend(progressData.weightProgress, 'weight')
  const complianceTrend = calculateTrend(progressData.nutritionCompliance, 'compliance')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Progresso</h1>
            <p className="text-gray-600">Acompanhe sua evolução e conquistas</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Filtro de período */}
            <div className="flex items-center gap-2">
              {[
                { value: '7d', label: '7 dias' },
                { value: '30d', label: '30 dias' },
                { value: '90d', label: '90 dias' },
                { value: '1y', label: '1 ano' }
              ].map(period => (
                <Button
                  key={period.value}
                  variant={selectedPeriod === period.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.value)}
                >
                  {period.label}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={exportReport}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Cards de estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {progressData.weeklyStats.map((stat, index) => {
            const isPositive = stat.value >= stat.target
            const percentage = (stat.value / stat.target * 100).toFixed(0)
            
            return (
              <Card key={index} className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isPositive ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      {index === 0 && <Activity className={`w-6 h-6 ${isPositive ? 'text-green-600' : 'text-orange-600'}`} />}
                      {index === 1 && <Flame className={`w-6 h-6 ${isPositive ? 'text-green-600' : 'text-orange-600'}`} />}
                      {index === 2 && <TrendingDown className={`w-6 h-6 ${isPositive ? 'text-green-600' : 'text-orange-600'}`} />}
                      {index === 3 && <Target className={`w-6 h-6 ${isPositive ? 'text-green-600' : 'text-orange-600'}`} />}
                    </div>
                    <Badge variant={isPositive ? 'default' : 'secondary'}>
                      {percentage}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{stat.metric}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </span>
                      <span className="text-sm text-gray-500">{stat.unit}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Meta: {stat.target} {stat.unit}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Tabs de análises */}
        <Tabs defaultValue="weight" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="weight">Peso</TabsTrigger>
            <TabsTrigger value="strength">Força</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrição</TabsTrigger>
            <TabsTrigger value="composition">Composição</TabsTrigger>
          </TabsList>

          {/* Aba de Peso */}
          <TabsContent value="weight" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5" />
                      Evolução do Peso
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {parseFloat(weightTrend) < 0 ? (
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        parseFloat(weightTrend) < 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.abs(weightTrend)}%
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressData.weightProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      />
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                        formatter={(value, name) => [
                          `${value} kg`, 
                          name === 'weight' ? 'Peso Atual' : 'Meta'
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
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
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Frequência de Treino
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={progressData.workoutFrequency}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="workouts" fill="#8B5CF6" />
                      <Bar dataKey="target" fill="#E5E7EB" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba de Força */}
          <TabsContent value="strength" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Progresso de Força por Exercício
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={progressData.strengthProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    {['Supino', 'Agachamento', 'Levantamento Terra', 'Desenvolvimento'].map((exercise, index) => (
                      <Line
                        key={exercise}
                        type="monotone"
                        dataKey="weight"
                        data={progressData.strengthProgress.filter(item => item.exercise === exercise)}
                        stroke={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][index]}
                        strokeWidth={2}
                        name={exercise}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Nutrição */}
          <TabsContent value="nutrition" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Compliance Nutricional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={progressData.nutritionCompliance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                        formatter={(value) => [`${value}%`, 'Compliance']}
                      />
                      <Area
                        type="monotone"
                        dataKey="compliance"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="w-5 h-5" />
                    Consumo Calórico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={progressData.nutritionCompliance.slice(-14)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit' })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                      />
                      <Bar dataKey="calories" fill="#F59E0B" />
                      <Bar dataKey="target" fill="#E5E7EB" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba de Composição Corporal */}
          <TabsContent value="composition" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Composição Corporal Atual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={progressData.bodyComposition}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {progressData.bodyComposition.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {progressData.bodyComposition.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-gray-600">{item.name}</span>
                        <span className="text-sm font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Conquistas Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Meta de Peso Atingida!</p>
                      <p className="text-sm text-green-600">Perdeu 2kg este mês</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">Sequência de Treinos</p>
                      <p className="text-sm text-blue-600">12 dias consecutivos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-800">Força Aumentada</p>
                      <p className="text-sm text-purple-600">+15% no supino</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ProgressDashboard

