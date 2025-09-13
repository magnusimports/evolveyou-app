import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Target, 
  Dumbbell,
  Zap,
  Play,
  Eye,
  Clock,
  Flame,
  BarChart3,
  ChevronRight
} from 'lucide-react'

const WorkoutManus = () => {
  const [workoutData, setWorkoutData] = useState({
    weeklyProgress: {
      completed: 12,
      total: 15,
      percentage: 80,
      nextWorkout: "Quinta-feira - Pernas",
      consistency: 7
    },
    todayWorkout: {
      name: "Quinta-feira",
      type: "Pernas • Moderado",
      exercises: 6,
      duration: 45,
      calories: 380,
      isActive: true
    },
    upcomingWorkouts: [
      {
        name: "Sexta-feira",
        type: "Cardio • Intenso",
        exercises: 1,
        duration: 30,
        calories: 320
      }
    ]
  })

  // Componente do círculo de progresso
  const ProgressCircle = ({ percentage, size = 120 }) => {
    const radius = (size - 20) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#00ff88"
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-2xl font-bold">{percentage}%</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Treino</h1>
          <p className="text-gray-400">Seu programa de exercícios</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-400">Firebase + Gemini AI</span>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
        </div>
      </div>

      {/* Progresso Semanal */}
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-6">Progresso Semanal</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-2">Treinos Concluídos</div>
              <div className="text-3xl font-bold mb-4">
                {workoutData.weeklyProgress.completed}/{workoutData.weeklyProgress.total}
              </div>
              <div className="text-sm text-green-400 mb-2">Próximo Treino</div>
              <div className="font-semibold">{workoutData.weeklyProgress.nextWorkout}</div>
              <div className="text-sm text-gray-400 mt-4">Consistência</div>
              <div className="font-semibold">{workoutData.weeklyProgress.consistency} dias</div>
            </div>
            <ProgressCircle percentage={workoutData.weeklyProgress.percentage} />
          </div>
        </CardContent>
      </Card>

      {/* Hoje */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Hoje</h2>
        <Card className="bg-green-600 border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{workoutData.todayWorkout.name}</h3>
                <p className="text-green-100">{workoutData.todayWorkout.type}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-white/20 hover:bg-white/30 text-white border-none"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Iniciar Treino
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver Treino
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-green-100">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                <span className="text-sm">{workoutData.todayWorkout.exercises} exercícios</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{workoutData.todayWorkout.duration} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <span className="text-sm">{workoutData.todayWorkout.calories} cal</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Treinos */}
      <div className="mb-20">
        <h2 className="text-xl font-bold mb-4">Próximos Treinos</h2>
        {workoutData.upcomingWorkouts.map((workout, index) => (
          <Card key={index} className="bg-gray-900 border-gray-800 mb-3">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">{workout.name}</h3>
                  <p className="text-gray-400 text-sm">{workout.type}</p>
                  <div className="flex items-center gap-4 mt-2 text-gray-400 text-sm">
                    <div className="flex items-center gap-1">
                      <Dumbbell className="w-3 h-3" />
                      <span>{workout.exercises} exercício</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{workout.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      <span>{workout.calories} cal</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver Treino
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="flex justify-around py-2">
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-400">
            <Activity className="w-5 h-5" />
            <span className="text-xs">Resumo</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-400">
            <Target className="w-5 h-5" />
            <span className="text-xs">Nutrição</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-green-500">
            <Dumbbell className="w-5 h-5" />
            <span className="text-xs">Treino</span>
            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-400">
            <Zap className="w-5 h-5" />
            <span className="text-xs">Coach EVO</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default WorkoutManus

