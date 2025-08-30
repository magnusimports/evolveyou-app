import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Target,
  Zap,
  Flame,
  Heart,
  CheckCircle,
  Plus,
  Clock
} from 'lucide-react'

const Nutrition = () => {
  const [macros] = useState({
    proteins: { current: 123, target: 150, unit: 'g' },
    carbs: { current: 199, target: 250, unit: 'g' },
    fats: { current: 67, target: 80, unit: 'g' },
    calories: { current: 2459, target: 2459, unit: 'kcal' }
  })

  const [metabolicData] = useState({
    basalRate: 1763,
    totalExpenditure: 2732,
    calorieGoal: 2459
  })

  const [favoriteFoods] = useState([
    { name: 'Arroz e feijão', checked: true },
    { name: 'Frango', checked: true },
    { name: 'Ovos', checked: true }
  ])

  const [restrictions] = useState('Nenhuma restrição')
  const [mealsPerDay] = useState(4)

  const getMacroProgress = (current, target) => (current / target) * 100

  const getMacroColor = (progress) => {
    if (progress >= 90) return 'text-green-600'
    if (progress >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nutrição</h1>
          <p className="text-gray-600">Acompanhe seus macronutrientes e plano alimentar</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Registrar Refeição
        </Button>
      </div>

      {/* Macronutrientes Diários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Macronutrientes Diários</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Baseado no seu perfil e objetivos</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Proteínas */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Proteínas</span>
                <span className={`text-sm font-semibold ${getMacroColor(getMacroProgress(macros.proteins.current, macros.proteins.target))}`}>
                  {macros.proteins.current}{macros.proteins.unit}
                </span>
              </div>
              <Progress 
                value={getMacroProgress(macros.proteins.current, macros.proteins.target)} 
                className="h-3"
              />
              <div className="text-xs text-gray-500 text-center">
                Meta: {macros.proteins.target}{macros.proteins.unit}
              </div>
            </div>

            {/* Carboidratos */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Carboidratos</span>
                <span className={`text-sm font-semibold ${getMacroColor(getMacroProgress(macros.carbs.current, macros.carbs.target))}`}>
                  {macros.carbs.current}{macros.carbs.unit}
                </span>
              </div>
              <Progress 
                value={getMacroProgress(macros.carbs.current, macros.carbs.target)} 
                className="h-3"
              />
              <div className="text-xs text-gray-500 text-center">
                Meta: {macros.carbs.target}{macros.carbs.unit}
              </div>
            </div>

            {/* Gorduras */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Gorduras</span>
                <span className={`text-sm font-semibold ${getMacroColor(getMacroProgress(macros.fats.current, macros.fats.target))}`}>
                  {macros.fats.current}{macros.fats.unit}
                </span>
              </div>
              <Progress 
                value={getMacroProgress(macros.fats.current, macros.fats.target)} 
                className="h-3"
              />
              <div className="text-xs text-gray-500 text-center">
                Meta: {macros.fats.target}{macros.fats.unit}
              </div>
            </div>

            {/* Calorias Totais */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Calorias Totais</span>
                <span className="text-sm font-semibold text-green-600">
                  {macros.calories.current} {macros.calories.unit}
                </span>
              </div>
              <Progress 
                value={100} 
                className="h-3"
              />
              <div className="text-xs text-gray-500 text-center">
                Meta atingida!
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alimentos Favoritos e Plano Nutricional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alimentos Favoritos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span>Alimentos Favoritos</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Baseado nas suas preferências</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {favoriteFoods.map((food, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-700">{food.name}</span>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Restrições:</span>
                  <span className="text-sm font-medium">{restrictions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Refeições/dia:</span>
                  <span className="text-sm font-medium">{mealsPerDay}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plano Nutricional Personalizado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>Plano Nutricional Personalizado</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Gerado com base na sua anamnese completa</p>
            <Badge variant="outline" className="w-fit text-green-600 border-green-200">
              Dados Reais
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {/* Taxa Metabólica Basal */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-800">Taxa Metabólica Basal</h4>
                    <p className="text-sm text-green-600">Energia em repouso</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-800">{metabolicData.basalRate}</div>
                    <div className="text-sm text-green-600">kcal/dia</div>
                  </div>
                </div>
              </div>

              {/* Gasto Energético Total */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-800">Gasto Energético Total</h4>
                    <p className="text-sm text-blue-600">Incluindo atividades</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-800">{metabolicData.totalExpenditure}</div>
                    <div className="text-sm text-blue-600">kcal/dia</div>
                  </div>
                </div>
              </div>

              {/* Meta Calórica */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-purple-800">Meta Calórica</h4>
                    <p className="text-sm text-purple-600">Para seus objetivos</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-800">{metabolicData.calorieGoal}</div>
                    <div className="text-sm text-purple-600">kcal/dia</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <Button variant="outline" className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                Ver Plano Detalhado
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Nutrition

