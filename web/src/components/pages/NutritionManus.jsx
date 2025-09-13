import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Target, 
  Flame, 
  Activity,
  Dumbbell,
  Zap,
  Clock
} from 'lucide-react'

const NutritionManus = () => {
  const [nutritionData, setNutritionData] = useState({
    calories: {
      consumed: 1847,
      goal: 2459,
      remaining: 612
    },
    macros: {
      protein: { current: 89, goal: 123, percentage: 72 },
      carbs: { current: 156, goal: 199, percentage: 78 },
      fat: { current: 45, goal: 67, percentage: 67 }
    }
  })

  // Componente do círculo de calorias
  const CalorieCircle = ({ consumed, goal, remaining }) => {
    const percentage = (consumed / goal) * 100
    const radius = 80
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg width="192" height="192" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="#ff6b35"
            strokeWidth="12"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-3xl font-bold">{consumed}</div>
            <div className="text-white/70 text-sm">kcal</div>
          </div>
        </div>
      </div>
    )
  }

  // Componente da barra de macronutrientes
  const MacroBar = ({ name, current, goal, percentage, color }) => {
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white text-sm">{name}</span>
          <div className="text-right">
            <span className="text-white font-bold">{current}g</span>
            <span className="text-gray-400 text-sm ml-2">Meta: {goal}g</span>
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: color
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Nutrição</h1>
          <p className="text-gray-400">Plano personalizado</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-400">Firebase + Gemini AI</span>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
        </div>
      </div>

      {/* Calorias Hoje */}
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-6">Calorias Hoje</h2>
          <div className="flex items-center justify-between">
            <CalorieCircle 
              consumed={nutritionData.calories.consumed}
              goal={nutritionData.calories.goal}
              remaining={nutritionData.calories.remaining}
            />
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-400">Meta</span>
                </div>
                <div className="text-orange-500 font-bold">{nutritionData.calories.goal} kcal</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-400">Consumidas</span>
                </div>
                <div className="text-red-500 font-bold">{nutritionData.calories.consumed} kcal</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-400">Restantes</span>
                </div>
                <div className="text-blue-500 font-bold">{nutritionData.calories.remaining} kcal</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Macronutrientes */}
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-6">Macronutrientes</h2>
          
          <MacroBar 
            name="Proteínas"
            current={nutritionData.macros.protein.current}
            goal={nutritionData.macros.protein.goal}
            percentage={nutritionData.macros.protein.percentage}
            color="#007aff"
          />
          
          <MacroBar 
            name="Carboidratos"
            current={nutritionData.macros.carbs.current}
            goal={nutritionData.macros.carbs.goal}
            percentage={nutritionData.macros.carbs.percentage}
            color="#00ff88"
          />
          
          <MacroBar 
            name="Gorduras"
            current={nutritionData.macros.fat.current}
            goal={nutritionData.macros.fat.goal}
            percentage={nutritionData.macros.fat.percentage}
            color="#ffcc00"
          />
        </CardContent>
      </Card>

      {/* Refeições de Hoje */}
      <Card className="bg-gray-900 border-gray-800 mb-20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Refeições de Hoje</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-center py-8 text-gray-400">
            <p>Nenhuma refeição registrada ainda</p>
            <Button className="mt-4 bg-orange-600 hover:bg-orange-700">
              Adicionar Refeição
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="flex justify-around py-2">
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-400">
            <Activity className="w-5 h-5" />
            <span className="text-xs">Resumo</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-orange-500">
            <Target className="w-5 h-5" />
            <span className="text-xs">Nutrição</span>
            <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
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

export default NutritionManus

