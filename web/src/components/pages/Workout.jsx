import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Dumbbell,
  Calendar,
  Clock,
  Target,
  Play,
  CheckCircle,
  TrendingUp,
  Timer
} from 'lucide-react'

const Workout = () => {
  const [workoutPlan] = useState([
    {
      day: 'Segunda-feira',
      focus: 'Peito/Tríceps',
      exercises: 4,
      duration: 45,
      color: 'bg-green-500',
      completed: true
    },
    {
      day: 'Terça-feira', 
      focus: 'Costas/Bíceps',
      exercises: 4,
      duration: 45,
      color: 'bg-purple-500',
      completed: true
    },
    {
      day: 'Quarta-feira',
      focus: 'Cardio',
      exercises: 1,
      duration: 30,
      color: 'bg-orange-500',
      completed: false,
      isToday: true
    },
    {
      day: 'Quinta-feira',
      focus: 'Pernas',
      exercises: 5,
      duration: 50,
      color: 'bg-blue-500',
      completed: false
    },
    {
      day: 'Sexta-feira',
      focus: 'Ombros/Abs',
      exercises: 4,
      duration: 40,
      color: 'bg-red-500',
      completed: false
    }
  ])

  const [weeklyProgress] = useState({
    completed: 12,
    total: 15,
    nextWorkout: 'Quinta-feira - Pernas'
  })

  const [userLevel] = useState('Moderadamente Ativo')

  const progressPercentage = (weeklyProgress.completed / weeklyProgress.total) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Treino</h1>
          <p className="text-gray-600">Seu plano de treino personalizado</p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          <Target className="w-3 h-3 mr-1" />
          Nível: {userLevel}
        </Badge>
      </div>

      {/* Progresso Semanal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Progresso Semanal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Treinos Concluídos</span>
              <span className="text-sm text-gray-600">{weeklyProgress.completed}/{weeklyProgress.total}</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-gray-600">Próximo:</span>
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                <Clock className="w-3 h-3 mr-1" />
                {weeklyProgress.nextWorkout}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plano de Treino Personalizado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Dumbbell className="h-5 w-5 text-blue-600" />
            <span>Plano de Treino Personalizado</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Baseado no seu nível: {userLevel}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workoutPlan.map((workout, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  workout.isToday ? 'ring-2 ring-orange-500 ring-opacity-50' : ''
                }`}
              >
                <div className={`h-2 ${workout.color}`}></div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header do Card */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{workout.day}</h3>
                        <p className="text-sm text-gray-600">{workout.focus}</p>
                      </div>
                      {workout.completed && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {workout.isToday && (
                        <Badge variant="secondary" className="text-xs">
                          Hoje
                        </Badge>
                      )}
                    </div>

                    {/* Detalhes do Treino */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Target className="w-4 h-4" />
                        <span>{workout.exercises} exercícios</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Timer className="w-4 h-4" />
                        <span>{workout.duration} min</span>
                      </div>
                    </div>

                    {/* Botão de Ação */}
                    <Button 
                      className={`w-full ${
                        workout.completed 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : workout.isToday
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : 'bg-gray-500 hover:bg-gray-600'
                      }`}
                      disabled={workout.completed}
                    >
                      {workout.completed ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Concluído
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Ver Treino
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900">{weeklyProgress.completed}</p>
                <p className="text-xs text-gray-500">treinos concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tempo Total</p>
                <p className="text-2xl font-bold text-gray-900">8h 30m</p>
                <p className="text-xs text-gray-500">esta semana</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sequência</p>
                <p className="text-2xl font-bold text-gray-900">7</p>
                <p className="text-xs text-gray-500">dias consecutivos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Workout

