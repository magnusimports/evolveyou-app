import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Target, 
  Footprints, 
  MapPin, 
  Trophy,
  Dumbbell,
  Flame,
  Clock,
  ChevronRight,
  Zap
} from 'lucide-react'

const DashboardManus = () => {
  const [activityData, setActivityData] = useState({
    movement: { current: 452, goal: 600, percentage: 75 },
    exercise: { current: 12, goal: 30, percentage: 40 },
    standing: { current: 8, goal: 12, percentage: 67 }
  })

  const [metrics, setMetrics] = useState({
    steps: 0,
    distance: 0,
    sessions: {
      name: "Treino Tradicional de Força",
      calories: 452,
      day: "quarta-feira"
    },
    awards: 7,
    weeklyGoal: "Semana Perfeita"
  })

  // Animação dos círculos de atividade
  const ActivityCircle = ({ data, color, size = 120 }) => {
    const radius = (size - 20) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (data.percentage / 100) * circumference

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
            stroke={color}
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
            <div className="text-white text-lg font-bold">{data.current}</div>
            <div className="text-white/70 text-xs">de {data.goal}</div>
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
          <h1 className="text-2xl font-bold">Resumo</h1>
          <p className="text-gray-400">Quinta-feira, 11 de set.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-400">Firebase + Gemini AI</span>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
        </div>
      </div>

      {/* Círculos de Atividade */}
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-6">Círculos de Atividade</h2>
          <div className="flex justify-center">
            <div className="relative">
              {/* Círculo principal (maior) */}
              <ActivityCircle 
                data={activityData.movement} 
                color="#ff6b35" 
                size={140}
              />
              {/* Círculos menores sobrepostos */}
              <div className="absolute top-4 right-4">
                <ActivityCircle 
                  data={activityData.exercise} 
                  color="#00ff88" 
                  size={80}
                />
              </div>
              <div className="absolute bottom-4 right-4">
                <ActivityCircle 
                  data={activityData.standing} 
                  color="#007aff" 
                  size={60}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Passos */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Footprints className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Passos</span>
            </div>
            <div className="text-2xl font-bold">{metrics.steps}</div>
            <div className="text-xs text-gray-400">hoje</div>
          </CardContent>
        </Card>

        {/* Distância */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Distância</span>
            </div>
            <div className="text-2xl font-bold">{metrics.distance}</div>
            <div className="text-xs text-gray-400">KM hoje</div>
          </CardContent>
        </Card>
      </div>

      {/* Sessões */}
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Sessões</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">{metrics.sessions.name}</div>
              <div className="text-sm text-green-400">{metrics.sessions.calories}CAL</div>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2">{metrics.sessions.day}</div>
        </CardContent>
      </Card>

      {/* Prêmios */}
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Prêmios</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">{metrics.awards}</span>
            </div>
            <div className="text-right">
              <div className="font-semibold">{metrics.weeklyGoal}</div>
              <div className="text-xs text-gray-400">(ficar em Pé)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fitness+ Banner */}
      <Card className="bg-gradient-to-r from-orange-600 to-red-600 border-none mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-white" />
                <span className="font-bold text-white">Fitness+</span>
              </div>
              <div className="text-white/90 text-sm">Novos treinos toda semana</div>
            </div>
            <ChevronRight className="w-6 h-6 text-white" />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="flex justify-around py-2">
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-blue-500">
            <Activity className="w-5 h-5" />
            <span className="text-xs">Resumo</span>
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-400">
            <Target className="w-5 h-5" />
            <span className="text-xs">Nutrição</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-400">
            <Dumbbell className="w-5 h-5" />
            <span className="text-xs">Treino</span>
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

export default DashboardManus

