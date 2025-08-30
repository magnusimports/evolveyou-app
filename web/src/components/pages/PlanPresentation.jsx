import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Target,
  TrendingDown,
  TrendingUp,
  Activity,
  Heart,
  Zap,
  CheckCircle,
  ArrowRight,
  Calculator,
  Dumbbell,
  Apple
} from 'lucide-react'

const PlanPresentation = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [planData, setPlanData] = useState(null)
  const [currentSection, setCurrentSection] = useState(0)

  useEffect(() => {
    // Recuperar dados do usuário do localStorage
    const storedUserData = localStorage.getItem('evolveyou_user_data')
    if (storedUserData) {
      const data = JSON.parse(storedUserData)
      setUserData(data)
      generatePlanPresentation(data)
    } else {
      // Se não há dados, redirecionar para onboarding
      navigate('/onboarding')
    }
  }, [navigate])

  const generatePlanPresentation = (data) => {
    const { goal, name, tmb, get, targetWeight, weight, timeframe } = data
    
    // Calcular déficit/superávit baseado no objetivo
    let calorieAdjustment = 0
    let dailyTarget = get
    let approach = 'manutenção'
    
    if (goal === 'lose_weight' && targetWeight && timeframe) {
      const weightDiff = parseFloat(weight) - parseFloat(targetWeight)
      const timeInDays = getTimeframeDays(timeframe)
      const totalCaloriesNeeded = weightDiff * 7700 // 7700 kcal por kg de gordura
      calorieAdjustment = Math.round(totalCaloriesNeeded / timeInDays)
      dailyTarget = get - calorieAdjustment
      approach = 'déficit calórico'
    } else if (goal === 'gain_weight' && targetWeight) {
      const weightDiff = parseFloat(targetWeight) - parseFloat(weight)
      const timeInDays = getTimeframeDays(timeframe)
      const totalCaloriesNeeded = weightDiff * 7700
      calorieAdjustment = Math.round(totalCaloriesNeeded / timeInDays)
      dailyTarget = get + calorieAdjustment
      approach = 'superávit calórico'
    }

    const plan = {
      greeting: `Olá, ${name}! Tudo bem?`,
      objective: getObjectiveText(goal, targetWeight, weight, timeframe),
      strategy: getStrategyText(goal, calorieAdjustment, approach),
      mathematics: getMathematicsText(goal, weight, targetWeight, timeframe, calorieAdjustment),
      nutrition: getNutritionText(goal, calorieAdjustment),
      training: getTrainingText(goal),
      summary: getSummaryText(goal, calorieAdjustment, approach),
      tmb,
      get,
      dailyTarget,
      calorieAdjustment: Math.abs(calorieAdjustment)
    }

    setPlanData(plan)
  }

  const getTimeframeDays = (timeframe) => {
    const mapping = {
      '1_month': 30,
      '3_months': 90,
      '6_months': 180,
      '1_year': 365,
      'no_rush': 365
    }
    return mapping[timeframe] || 90
  }

  const getObjectiveText = (goal, targetWeight, currentWeight, timeframe) => {
    const goalTexts = {
      'lose_weight': `Perder ${(parseFloat(currentWeight) - parseFloat(targetWeight)).toFixed(1)}kg de gordura`,
      'gain_weight': `Ganhar ${(parseFloat(targetWeight) - parseFloat(currentWeight)).toFixed(1)}kg`,
      'build_muscle': 'Ganhar massa muscular',
      'lose_fat': 'Perder gordura corporal',
      'maintain_weight': 'Manter peso atual',
      'improve_health': 'Melhorar saúde geral'
    }
    
    const timeTexts = {
      '1_month': 'em 1 mês',
      '3_months': 'em 3 meses',
      '6_months': 'em 6 meses',
      '1_year': 'em 1 ano',
      'no_rush': 'sem pressa'
    }

    return `${goalTexts[goal] || 'Alcançar seus objetivos'} ${timeTexts[timeframe] || ''}`
  }

  const getStrategyText = (goal, calorieAdjustment, approach) => {
    if (goal === 'lose_weight') {
      return `Sei que você está animado para alcançar seu objetivo, e eu estou aqui para te guiar nessa jornada. Vamos focar em uma estratégia inteligente que otimize a perda de gordura e, ao mesmo tempo, preserve a sua massa muscular, que é super importante!`
    } else if (goal === 'gain_weight' || goal === 'build_muscle') {
      return `Vamos trabalhar juntos para alcançar seu objetivo de ganho de peso/massa muscular de forma saudável e sustentável. Nossa estratégia focará em um superávit calórico controlado e treinos que estimulem o crescimento muscular.`
    } else {
      return `Vamos criar um plano equilibrado que te ajude a manter sua saúde e bem-estar, focando em hábitos sustentáveis a longo prazo.`
    }
  }

  const getMathematicsText = (goal, currentWeight, targetWeight, timeframe, calorieAdjustment) => {
    if (goal === 'lose_weight') {
      const weightDiff = parseFloat(currentWeight) - parseFloat(targetWeight)
      const days = getTimeframeDays(timeframe)
      return `Para perder 1kg de gordura, precisamos queimar aproximadamente 7.700 calorias. Nosso objetivo é perder ${weightDiff.toFixed(1)}kg, o que significa um total de ${(weightDiff * 7700).toFixed(0)} calorias. Em ${days} dias, isso representa um déficit diário de ${calorieAdjustment} calorias.`
    } else if (goal === 'gain_weight') {
      const weightDiff = parseFloat(targetWeight) - parseFloat(currentWeight)
      const days = getTimeframeDays(timeframe)
      return `Para ganhar 1kg, precisamos de um superávit de aproximadamente 7.700 calorias. Nosso objetivo é ganhar ${weightDiff.toFixed(1)}kg, o que significa um total de ${(weightDiff * 7700).toFixed(0)} calorias. Em ${days} dias, isso representa um superávit diário de ${calorieAdjustment} calorias.`
    }
    return ''
  }

  const getNutritionText = (goal, calorieAdjustment) => {
    if (goal === 'lose_weight') {
      return `A dieta será a principal ferramenta para criarmos esse déficit calórico. Não se trata de passar fome, mas sim de fazer escolhas inteligentes. Vamos focar em alimentos ricos em nutrientes, controlar as porções e evitar calorias vazias.`
    } else if (goal === 'gain_weight' || goal === 'build_muscle') {
      return `A alimentação será fundamental para fornecer a energia e os nutrientes necessários para o crescimento muscular. Vamos focar em alimentos de qualidade, com atenção especial às proteínas e carboidratos.`
    }
    return `Vamos focar em uma alimentação equilibrada e nutritiva que suporte seus objetivos de saúde.`
  }

  const getTrainingText = (goal) => {
    if (goal === 'lose_weight') {
      return `Seu plano de treino será estruturado para manter sua massa muscular durante o processo de perda de gordura. Músculos são como "fornalhas" que queimam calorias, mesmo em repouso.`
    } else if (goal === 'gain_weight' || goal === 'build_muscle') {
      return `Seu plano de treino será focado em exercícios que estimulem o crescimento muscular, com progressão de cargas e volume adequados para maximizar a hipertrofia.`
    }
    return `Seu plano de treino será balanceado para melhorar sua condição física geral e suportar seus objetivos.`
  }

  const getSummaryText = (goal, calorieAdjustment, approach) => {
    return `Com consistência, foco e nossa estratégia combinada de dieta e treino, tenho certeza que você alcançará seus objetivos e se sentirá ainda mais forte e saudável!`
  }

  const sections = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao seu plano personalizado!',
      icon: Heart,
      color: 'bg-blue-500'
    },
    {
      id: 'objective',
      title: 'Seu Objetivo',
      icon: Target,
      color: 'bg-purple-500'
    },
    {
      id: 'mathematics',
      title: 'A Matemática do Sucesso',
      icon: Calculator,
      color: 'bg-green-500'
    },
    {
      id: 'strategy',
      title: 'Nossa Estratégia',
      icon: Zap,
      color: 'bg-orange-500'
    },
    {
      id: 'nutrition',
      title: 'Plano Nutricional',
      icon: Apple,
      color: 'bg-red-500'
    },
    {
      id: 'training',
      title: 'Plano de Treino',
      icon: Dumbbell,
      color: 'bg-indigo-500'
    },
    {
      id: 'summary',
      title: 'Resumo Final',
      icon: CheckCircle,
      color: 'bg-green-600'
    }
  ]

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const finishPresentation = () => {
    navigate('/dashboard')
  }

  if (!userData || !planData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Preparando seu plano personalizado...</p>
        </div>
      </div>
    )
  }

  const currentSectionData = sections[currentSection]
  const Icon = currentSectionData.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Seção {currentSection + 1} de {sections.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(((currentSection + 1) / sections.length) * 100)}% completo
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* EVO Avatar */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-3xl">EVO</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Seu Coach Virtual</h1>
        </div>

        {/* Section Indicators */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto">
          <div className="flex items-center space-x-2">
            {sections.map((section, index) => {
              const SectionIcon = section.icon
              const isActive = index === currentSection
              const isCompleted = index < currentSection
              
              return (
                <div key={section.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500' :
                    isActive ? section.color :
                    'bg-gray-200'
                  }`}>
                    <SectionIcon className={`w-5 h-5 ${
                      isCompleted || isActive ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                  {index < sections.length - 1 && (
                    <div className={`w-8 h-0.5 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl mb-8">
          <CardHeader className="text-center">
            <div className={`w-16 h-16 ${currentSectionData.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {currentSectionData.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {renderSectionContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevSection}
            disabled={currentSection === 0}
            className="flex items-center gap-2"
          >
            Anterior
          </Button>
          
          {currentSection === sections.length - 1 ? (
            <Button
              onClick={finishPresentation}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 flex items-center gap-2"
            >
              Vamos começar!
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={nextSection}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 flex items-center gap-2"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  function renderSectionContent() {
    switch (currentSection) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-6">
            <div className="text-lg text-gray-700">
              {planData.greeting}
            </div>
            <div className="text-gray-600">
              Analisei todas as suas informações e, com base nos seus objetivos, criei um plano de ação completo para você. Este é o nosso ponto de partida para alcançar a sua melhor versão.
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Objetivo Principal:</h3>
              <p className="text-blue-700">{planData.objective}</p>
            </div>
          </div>
        )

      case 1: // Objective
        return (
          <div className="space-y-6">
            <div className="text-lg text-gray-700">
              {planData.strategy}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-800">Meta</span>
                </div>
                <p className="text-purple-700">{planData.objective}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-orange-800">Abordagem</span>
                </div>
                <p className="text-orange-700">
                  {planData.calorieAdjustment > 0 ? 'Estratégia agressiva e eficaz' : 'Abordagem equilibrada'}
                </p>
              </div>
            </div>
          </div>
        )

      case 2: // Mathematics
        return (
          <div className="space-y-6">
            <div className="text-lg text-gray-700 mb-4">
              A Matemática da Transformação: Como Vamos Alcançar a Meta?
            </div>
            <div className="text-gray-600 mb-6">
              {planData.mathematics}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{planData.tmb}</div>
                <div className="text-sm text-blue-700">TMB Personalizado (kcal/dia)</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{planData.get}</div>
                <div className="text-sm text-green-700">Gasto Total (kcal/dia)</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{planData.calorieAdjustment}</div>
                <div className="text-sm text-orange-700">Ajuste Diário (kcal)</div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="font-semibold text-yellow-800 mb-2">🎯 Nossa Meta Diária:</div>
              <div className="text-yellow-700">
                Consumir {planData.dailyTarget} calorias por dia para alcançar seu objetivo de forma saudável e sustentável.
              </div>
            </div>
          </div>
        )

      case 3: // Strategy
        return (
          <div className="space-y-6">
            <div className="text-lg text-gray-700 mb-4">
              A Estratégia de Ouro: Dieta e Treino Trabalhando Juntos
            </div>
            <div className="text-gray-600 mb-6">
              Pense no seu corpo como um carro. Para ele andar, você coloca combustível (comida). Para alcançar seus objetivos, precisamos equilibrar perfeitamente o combustível que entra com a energia que gastamos.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Apple className="w-6 h-6 text-red-600" />
                  <h3 className="font-semibold text-red-800">Estratégia Nutricional</h3>
                </div>
                <p className="text-red-700 text-sm">
                  {planData.nutrition}
                </p>
              </div>
              <div className="bg-indigo-50 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Dumbbell className="w-6 h-6 text-indigo-600" />
                  <h3 className="font-semibold text-indigo-800">Estratégia de Treino</h3>
                </div>
                <p className="text-indigo-700 text-sm">
                  {planData.training}
                </p>
              </div>
            </div>
          </div>
        )

      case 4: // Nutrition
        return (
          <div className="space-y-6">
            <div className="text-lg text-gray-700 mb-4">
              Plano Nutricional: Onde a Mágica Acontece!
            </div>
            <div className="text-gray-600 mb-6">
              {planData.nutrition}
            </div>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">✅ Prioridades Nutricionais:</h4>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Alimentos ricos em nutrientes (legumes, verduras, proteínas magras)</li>
                  <li>• Controle inteligente de porções</li>
                  <li>• Hidratação adequada (mínimo 2L de água por dia)</li>
                  <li>• Distribuição equilibrada de macronutrientes</li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">❌ Evitar:</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• Alimentos ultraprocessados</li>
                  <li>• Bebidas açucaradas</li>
                  <li>• Frituras em excesso</li>
                  <li>• "Calorias vazias" sem valor nutricional</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 5: // Training
        return (
          <div className="space-y-6">
            <div className="text-lg text-gray-700 mb-4">
              Plano de Treino: Construindo Sua Melhor Versão!
            </div>
            <div className="text-gray-600 mb-6">
              {planData.training}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-800 mb-2">🏋️ Estrutura do Treino:</h4>
                <ul className="text-indigo-700 text-sm space-y-1">
                  <li>• Treinos estruturados A-B-C-D</li>
                  <li>• 3 dias seguidos + 1 dia de descanso</li>
                  <li>• Progressão de cargas</li>
                  <li>• Foco na consistência</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">🎯 Objetivos:</h4>
                <ul className="text-purple-700 text-sm space-y-1">
                  <li>• Preservar/construir massa muscular</li>
                  <li>• Melhorar condicionamento</li>
                  <li>• Aumentar força funcional</li>
                  <li>• Otimizar queima calórica</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 6: // Summary
        return (
          <div className="text-center space-y-6">
            <div className="text-lg text-gray-700">
              {planData.summary}
            </div>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4">🚀 Resumo do Seu Plano:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Meta: {planData.objective}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>TMB Personalizado: {planData.tmb} kcal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Gasto Total: {planData.get} kcal</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Meta Diária: {planData.dailyTarget} kcal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Treino estruturado A-B-C-D</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Acompanhamento 24/7 com EVO</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xl font-semibold text-gray-800">
              Vamos juntos nessa jornada? 💪
            </div>
          </div>
        )

      default:
        return null
    }
  }
}

export default PlanPresentation

