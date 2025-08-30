import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  User,
  Target,
  Activity,
  Heart,
  Scale,
  Ruler,
  Calendar,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const Onboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Dados Pessoais
    name: '',
    email: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    
    // Objetivos
    goal: '',
    targetWeight: '',
    timeframe: '',
    
    // Histórico Médico
    medicalConditions: [],
    medications: '',
    allergies: '',
    injuries: '',
    
    // Estilo de Vida
    activityLevel: '',
    workType: '',
    sleepHours: '',
    stressLevel: '',
    
    // Preferências Alimentares
    dietType: '',
    foodRestrictions: [],
    dislikedFoods: '',
    mealsPerDay: '',
    
    // Experiência
    previousDiets: '',
    exerciseExperience: '',
    supplementsUsed: ''
  })

  const steps = [
    {
      id: 0,
      title: 'Bem-vindo ao EvolveYou!',
      subtitle: 'Vamos conhecer você melhor',
      icon: User,
      color: 'bg-blue-500'
    },
    {
      id: 1,
      title: 'Dados Pessoais',
      subtitle: 'Informações básicas sobre você',
      icon: User,
      color: 'bg-green-500'
    },
    {
      id: 2,
      title: 'Seus Objetivos',
      subtitle: 'O que você quer alcançar?',
      icon: Target,
      color: 'bg-purple-500'
    },
    {
      id: 3,
      title: 'Histórico Médico',
      subtitle: 'Informações importantes para sua segurança',
      icon: Heart,
      color: 'bg-red-500'
    },
    {
      id: 4,
      title: 'Estilo de Vida',
      subtitle: 'Como é sua rotina atual?',
      icon: Activity,
      color: 'bg-orange-500'
    },
    {
      id: 5,
      title: 'Preferências Alimentares',
      subtitle: 'Suas preferências e restrições',
      icon: Scale,
      color: 'bg-yellow-500'
    },
    {
      id: 6,
      title: 'Experiência Anterior',
      subtitle: 'Sua jornada até aqui',
      icon: Calendar,
      color: 'bg-indigo-500'
    },
    {
      id: 7,
      title: 'Finalização',
      subtitle: 'Calculando seu plano personalizado',
      icon: CheckCircle,
      color: 'bg-green-600'
    }
  ]

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleArrayField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const calculateTMB = () => {
    const { weight, height, age, gender } = formData
    if (!weight || !height || !age || !gender) return 0

    const w = parseFloat(weight)
    const h = parseFloat(height)
    const a = parseFloat(age)

    // Fórmula de Mifflin-St Jeor
    let baseTMB
    if (gender === 'male') {
      baseTMB = (10 * w) + (6.25 * h) - (5 * a) + 5
    } else {
      baseTMB = (10 * w) + (6.25 * h) - (5 * a) - 161
    }

    // Aplicar fatores de ajuste personalizados
    let adjustedTMB = baseTMB

    // Fator de composição corporal (+8% para atlético)
    if (formData.body_description === 'athletic') {
      adjustedTMB *= 1.08
    } else if (formData.body_description === 'very_thin') {
      adjustedTMB *= 0.95
    } else if (formData.body_description === 'thin') {
      adjustedTMB *= 0.98
    } else if (formData.body_description === 'overweight') {
      adjustedTMB *= 1.02
    }

    // Fator de experiência (+2% intermediário, +5% avançado)
    if (formData.exerciseExperience === 'intermediate') {
      adjustedTMB *= 1.02
    } else if (formData.exerciseExperience === 'advanced') {
      adjustedTMB *= 1.05
    }

    // Fator de ergogênicos (+10% para hormônios, +3% suplementos)
    if (formData.supplementsUsed && formData.supplementsUsed.includes('hormônios')) {
      adjustedTMB *= 1.10
    } else if (formData.supplementsUsed && formData.supplementsUsed.length > 0) {
      adjustedTMB *= 1.03
    }

    return Math.round(adjustedTMB)
  }

  const calculateGET = () => {
    const tmb = calculateTMB()
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    }
    return tmb * (activityMultipliers[formData.activityLevel] || 1.2)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    const tmb = calculateTMB()
    const get = calculateGET()
    
    // Salvar dados no localStorage
    const userData = {
      ...formData,
      tmb,
      get,
      completedAt: new Date().toISOString()
    }
    
    localStorage.setItem('evolveyou_user_data', JSON.stringify(userData))
    
    // Redirecionar para apresentação do plano
    navigate('/plan-presentation')
  }
  const renderWelcome = () => (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
        <span className="text-white font-bold text-4xl">E</span>
      </div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo ao EvolveYou!</h2>
        <p className="text-gray-600 text-lg">
          Seu coach pessoal com inteligência artificial para nutrição, treinos e motivação
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-4 bg-green-50 rounded-lg">
          <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-green-800">Planos Personalizados</h3>
          <p className="text-sm text-green-700">Nutrição e treino sob medida para você</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-blue-800">Acompanhamento Real</h3>
          <p className="text-sm text-blue-700">Métricas e progresso em tempo real</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-purple-800">Coach EVO</h3>
          <p className="text-sm text-purple-700">IA personalizada para te motivar</p>
        </div>
      </div>
      <p className="text-sm text-gray-500">
        Vamos fazer algumas perguntas para criar seu plano perfeito. Leva apenas 5 minutos!
      </p>
    </div>
  )

  const renderPersonalData = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nome Completo *</label>
          <Input
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
            placeholder="Seu nome completo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email *</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            placeholder="seu@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Idade *</label>
          <Input
            type="number"
            value={formData.age}
            onChange={(e) => updateFormData('age', e.target.value)}
            placeholder="Ex: 30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Sexo *</label>
          <div className="grid grid-cols-2 gap-2">
            {['male', 'female'].map((gender) => (
              <button
                key={gender}
                onClick={() => updateFormData('gender', gender)}
                className={`p-3 border rounded-lg ${
                  formData.gender === gender
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {gender === 'male' ? 'Masculino' : 'Feminino'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Altura (cm) *</label>
          <Input
            type="number"
            value={formData.height}
            onChange={(e) => updateFormData('height', e.target.value)}
            placeholder="Ex: 175"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Peso Atual (kg) *</label>
          <Input
            type="number"
            value={formData.weight}
            onChange={(e) => updateFormData('weight', e.target.value)}
            placeholder="Ex: 70"
          />
        </div>
      </div>
    </div>
  )

  const renderGoals = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3">Qual é seu objetivo principal? *</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { id: 'lose_weight', label: 'Perder Peso', icon: '⬇️' },
            { id: 'gain_weight', label: 'Ganhar Peso', icon: '⬆️' },
            { id: 'maintain_weight', label: 'Manter Peso', icon: '➡️' },
            { id: 'build_muscle', label: 'Ganhar Massa Muscular', icon: '💪' },
            { id: 'lose_fat', label: 'Perder Gordura', icon: '🔥' },
            { id: 'improve_health', label: 'Melhorar Saúde', icon: '❤️' }
          ].map((goal) => (
            <button
              key={goal.id}
              onClick={() => updateFormData('goal', goal.id)}
              className={`p-4 border rounded-lg text-left ${
                formData.goal === goal.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{goal.icon}</span>
                <span className="font-medium">{goal.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {(formData.goal === 'lose_weight' || formData.goal === 'gain_weight') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Peso Meta (kg)</label>
            <Input
              type="number"
              value={formData.targetWeight}
              onChange={(e) => updateFormData('targetWeight', e.target.value)}
              placeholder="Ex: 65"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Prazo Desejado</label>
            <select
              value={formData.timeframe}
              onChange={(e) => updateFormData('timeframe', e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Selecione...</option>
              <option value="1_month">1 mês</option>
              <option value="3_months">3 meses</option>
              <option value="6_months">6 meses</option>
              <option value="1_year">1 ano</option>
              <option value="no_rush">Sem pressa</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )

  const renderMedicalHistory = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Informações Importantes</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Essas informações são essenciais para criar um plano seguro e eficaz para você.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Possui alguma condição médica?</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            'Diabetes', 'Hipertensão', 'Problemas Cardíacos', 'Problemas na Tireoide',
            'Problemas Renais', 'Problemas Hepáticos', 'Artrite', 'Osteoporose'
          ].map((condition) => (
            <button
              key={condition}
              onClick={() => toggleArrayField('medicalConditions', condition)}
              className={`p-3 border rounded-lg text-left ${
                formData.medicalConditions.includes(condition)
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {condition}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Medicamentos em uso</label>
        <Input
          value={formData.medications}
          onChange={(e) => updateFormData('medications', e.target.value)}
          placeholder="Liste os medicamentos que você usa regularmente"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Alergias alimentares</label>
        <Input
          value={formData.allergies}
          onChange={(e) => updateFormData('allergies', e.target.value)}
          placeholder="Ex: Lactose, Glúten, Amendoim..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Lesões ou limitações físicas</label>
        <Input
          value={formData.injuries}
          onChange={(e) => updateFormData('injuries', e.target.value)}
          placeholder="Descreva qualquer lesão ou limitação que possua"
        />
      </div>
    </div>
  )

  const renderLifestyle = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3">Nível de Atividade Física *</label>
        <div className="space-y-3">
          {[
            { id: 'sedentary', label: 'Sedentário', desc: 'Pouco ou nenhum exercício' },
            { id: 'light', label: 'Levemente Ativo', desc: 'Exercício leve 1-3 dias/semana' },
            { id: 'moderate', label: 'Moderadamente Ativo', desc: 'Exercício moderado 3-5 dias/semana' },
            { id: 'active', label: 'Muito Ativo', desc: 'Exercício intenso 6-7 dias/semana' },
            { id: 'very_active', label: 'Extremamente Ativo', desc: 'Exercício muito intenso, trabalho físico' }
          ].map((level) => (
            <button
              key={level.id}
              onClick={() => updateFormData('activityLevel', level.id)}
              className={`w-full p-4 border rounded-lg text-left ${
                formData.activityLevel === level.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{level.label}</div>
              <div className="text-sm text-gray-600">{level.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tipo de Trabalho</label>
          <select
            value={formData.workType}
            onChange={(e) => updateFormData('workType', e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Selecione...</option>
            <option value="desk">Escritório (sentado)</option>
            <option value="standing">Em pé na maior parte do tempo</option>
            <option value="physical">Trabalho físico</option>
            <option value="mixed">Misto</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Horas de Sono por Noite</label>
          <select
            value={formData.sleepHours}
            onChange={(e) => updateFormData('sleepHours', e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Selecione...</option>
            <option value="less_than_6">Menos de 6 horas</option>
            <option value="6_to_7">6-7 horas</option>
            <option value="7_to_8">7-8 horas</option>
            <option value="8_to_9">8-9 horas</option>
            <option value="more_than_9">Mais de 9 horas</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Nível de Estresse</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {[
            { id: 'low', label: 'Baixo', color: 'green' },
            { id: 'medium', label: 'Médio', color: 'yellow' },
            { id: 'high', label: 'Alto', color: 'red' }
          ].map((stress) => (
            <button
              key={stress.id}
              onClick={() => updateFormData('stressLevel', stress.id)}
              className={`p-3 border rounded-lg ${
                formData.stressLevel === stress.id
                  ? `border-${stress.color}-500 bg-${stress.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {stress.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderFoodPreferences = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3">Tipo de Dieta</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { id: 'omnivore', label: 'Onívora', desc: 'Como de tudo' },
            { id: 'vegetarian', label: 'Vegetariana', desc: 'Não como carne' },
            { id: 'vegan', label: 'Vegana', desc: 'Não como produtos animais' },
            { id: 'keto', label: 'Cetogênica', desc: 'Baixo carboidrato, alta gordura' },
            { id: 'paleo', label: 'Paleo', desc: 'Alimentos naturais' },
            { id: 'mediterranean', label: 'Mediterrânea', desc: 'Rica em peixes e azeite' }
          ].map((diet) => (
            <button
              key={diet.id}
              onClick={() => updateFormData('dietType', diet.id)}
              className={`p-4 border rounded-lg text-left ${
                formData.dietType === diet.id
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{diet.label}</div>
              <div className="text-sm text-gray-600">{diet.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Restrições Alimentares</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            'Lactose', 'Glúten', 'Amendoim', 'Frutos do Mar', 'Ovos', 'Soja'
          ].map((restriction) => (
            <button
              key={restriction}
              onClick={() => toggleArrayField('foodRestrictions', restriction)}
              className={`p-3 border rounded-lg ${
                formData.foodRestrictions.includes(restriction)
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {restriction}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Alimentos que não gosta</label>
        <Input
          value={formData.dislikedFoods}
          onChange={(e) => updateFormData('dislikedFoods', e.target.value)}
          placeholder="Ex: Brócolis, Peixe, Fígado..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Quantas refeições por dia prefere?</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['3', '4', '5', '6'].map((meals) => (
            <button
              key={meals}
              onClick={() => updateFormData('mealsPerDay', meals)}
              className={`p-3 border rounded-lg ${
                formData.mealsPerDay === meals
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {meals} refeições
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderExperience = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Já fez dietas antes?</label>
        <textarea
          value={formData.previousDiets}
          onChange={(e) => updateFormData('previousDiets', e.target.value)}
          placeholder="Conte sobre suas experiências anteriores com dietas..."
          className="w-full p-3 border rounded-lg h-24"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Experiência com exercícios</label>
        <textarea
          value={formData.exerciseExperience}
          onChange={(e) => updateFormData('exerciseExperience', e.target.value)}
          placeholder="Descreva sua experiência com atividades físicas..."
          className="w-full p-3 border rounded-lg h-24"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Suplementos que já usou</label>
        <Input
          value={formData.supplementsUsed}
          onChange={(e) => updateFormData('supplementsUsed', e.target.value)}
          placeholder="Ex: Whey Protein, Creatina, Vitaminas..."
        />
      </div>
    </div>
  )

  const renderFinalization = () => {
    const tmb = calculateTMB()
    const get = calculateGET()
    
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Parabéns, {formData.name}!</h2>
          <p className="text-gray-600">
            Seu plano personalizado está sendo criado com base nas suas informações.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{tmb.toFixed(0)}</div>
            <div className="text-sm text-blue-700">Taxa Metabólica Basal (kcal/dia)</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{get.toFixed(0)}</div>
            <div className="text-sm text-green-700">Gasto Energético Total (kcal/dia)</div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Seu plano incluirá:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Dieta personalizada</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Treino adequado ao seu nível</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Acompanhamento do Coach EVO</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Monitoramento de progresso</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderWelcome()
      case 1: return renderPersonalData()
      case 2: return renderGoals()
      case 3: return renderMedicalHistory()
      case 4: return renderLifestyle()
      case 5: return renderFoodPreferences()
      case 6: return renderExperience()
      case 7: return renderFinalization()
      default: return renderWelcome()
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.email && formData.age && formData.gender && formData.height && formData.weight
      case 2:
        return formData.goal
      case 4:
        return formData.activityLevel
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Passo {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% completo
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto">
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500' :
                    isActive ? step.color :
                    'bg-gray-200'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isCompleted || isActive ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                  {index < steps.length - 1 && (
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
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {steps[currentStep].title}
            </CardTitle>
            <p className="text-gray-600">{steps[currentStep].subtitle}</p>
          </CardHeader>
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={completeOnboarding}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 flex items-center gap-2"
            >
              Finalizar
              <CheckCircle className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 flex items-center gap-2"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Onboarding

