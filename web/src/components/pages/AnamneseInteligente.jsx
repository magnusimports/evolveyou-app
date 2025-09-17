import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  User, 
  Calendar, 
  Users, 
  Ruler, 
  Scale, 
  Target,
  Activity,
  Heart,
  Utensils,
  Clock,
  Moon,
  Brain,
  Cigarette,
  Trophy,
  Timer,
  Star,
  CheckCircle
} from 'lucide-react'

const AnamneseInteligente = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Limpar dados antigos quando um novo usuário acessa
  useEffect(() => {
    if (user) {
      // Verificar se é um novo usuário ou se os dados são de outro usuário
      const dadosExistentes = localStorage.getItem('dados_anamnese');
      const usuarioAnterior = localStorage.getItem('usuario_anamnese');
      
      if (!dadosExistentes || usuarioAnterior !== user.uid) {
        // Limpar dados antigos
        localStorage.removeItem('anamnese_completa');
        localStorage.removeItem('dados_anamnese');
        localStorage.removeItem('usuario_anamnese');
        setAnswers({});
      } else {
        // Carregar dados existentes do mesmo usuário
        try {
          const dados = JSON.parse(dadosExistentes);
          setAnswers(dados);
        } catch (error) {
          console.error('Erro ao carregar dados da anamnese:', error);
          setAnswers({});
        }
      }
    }
  }, [user]);

  const questions = [
    {
      id: 'nome',
      category: 'Dados Pessoais',
      question: 'Qual é o seu nome completo?',
      type: 'text',
      icon: User,
      placeholder: 'Digite seu nome completo',
      required: true
    },
    {
      id: 'idade',
      category: 'Idade',
      question: 'Qual é a sua idade?',
      type: 'number',
      icon: Calendar,
      placeholder: 'Digite sua idade',
      required: true
    },
    {
      id: 'sexo',
      category: 'Sexo',
      question: 'Qual é o seu sexo?',
      type: 'select',
      icon: Users,
      options: ['Masculino', 'Feminino'],
      required: true
    },
    {
      id: 'altura',
      category: 'Altura',
      question: 'Qual é a sua altura (em cm)?',
      type: 'number',
      icon: Ruler,
      placeholder: 'Ex: 175',
      required: true
    },
    {
      id: 'peso',
      category: 'Peso',
      question: 'Qual é o seu peso atual (em kg)?',
      type: 'number',
      icon: Scale,
      placeholder: 'Ex: 70',
      required: true
    },
    {
      id: 'objetivo',
      category: 'Objetivo',
      question: 'Qual é o seu principal objetivo?',
      type: 'select',
      icon: Target,
      options: ['Perder peso', 'Ganhar massa muscular', 'Manter peso atual', 'Melhorar condicionamento físico'],
      required: true
    },
    {
      id: 'peso_meta',
      category: 'Meta',
      question: 'Qual é o seu peso meta (em kg)?',
      type: 'number',
      icon: Target,
      placeholder: 'Ex: 75',
      required: true
    },
    {
      id: 'nivel_atividade',
      category: 'Atividade',
      question: 'Qual é o seu nível de atividade física?',
      type: 'select',
      icon: Activity,
      options: [
        'Sedentário (nenhuma atividade)',
        'Leve (1-2x por semana)',
        'Moderado (3-4x por semana)',
        'Intenso (5-6x por semana)',
        'Muito intenso (todos os dias)'
      ],
      required: true
    },
    {
      id: 'exercicios_preferidos',
      category: 'Exercícios',
      question: 'Quais exercícios você prefere?',
      type: 'select',
      icon: Activity,
      options: [
        'Musculação',
        'Exercícios cardiovasculares',
        'Treinamento funcional',
        'Yoga/Pilates',
        'Esportes coletivos',
        'Caminhada/Corrida'
      ],
      required: true
    },
    {
      id: 'condicoes_saude',
      category: 'Saúde',
      question: 'Você possui alguma condição de saúde especial?',
      type: 'select',
      icon: Heart,
      options: [
        'Diabetes',
        'Hipertensão',
        'Problemas cardíacos',
        'Lesão no joelho',
        'Problemas na coluna',
        'Nenhuma condição especial'
      ],
      required: true
    },
    {
      id: 'medicamentos',
      category: 'Medicamentos',
      question: 'Você toma medicamentos regularmente?',
      type: 'select',
      icon: Heart,
      options: [
        'Não tomo medicamentos',
        'Sim, poucos medicamentos',
        'Sim, vários medicamentos'
      ],
      required: true
    },
    {
      id: 'habitos_alimentares',
      category: 'Alimentação',
      question: 'Como você avalia seus hábitos alimentares?',
      type: 'select',
      icon: Utensils,
      options: [
        'Muito ruins (fast food frequente)',
        'Ruins (alimentação irregular)',
        'Regulares (algumas refeições saudáveis)',
        'Bons (maioria das refeições saudáveis)',
        'Excelentes (alimentação muito equilibrada)'
      ],
      required: true
    },
    {
      id: 'restricoes_alimentares',
      category: 'Restrições',
      question: 'Você possui alguma restrição alimentar?',
      type: 'select',
      icon: Utensils,
      options: [
        'Intolerância à lactose',
        'Intolerância ao glúten/Celíaco',
        'Vegetariano',
        'Vegano',
        'Restrições por diabetes',
        'Nenhuma restrição'
      ],
      required: true
    },
    {
      id: 'refeicoes_dia',
      category: 'Refeições',
      question: 'Quantas refeições você faz por dia?',
      type: 'select',
      icon: Utensils,
      options: [
        '1-2 refeições',
        '3 refeições',
        '4-5 refeições',
        '6 ou mais refeições'
      ],
      required: true
    },
    {
      id: 'consumo_agua',
      category: 'Hidratação',
      question: 'Quanto de água você bebe por dia?',
      type: 'select',
      icon: Utensils,
      options: [
        'Menos de 1 litro',
        '1 a 1,5 litros',
        '1,5 a 2 litros',
        '2 a 3 litros',
        'Mais de 3 litros'
      ],
      required: true
    },
    {
      id: 'horas_sono',
      category: 'Sono',
      question: 'Quantas horas você dorme por noite?',
      type: 'select',
      icon: Moon,
      options: [
        'Menos de 5 horas',
        '5 a 6 horas',
        '6 a 7 horas',
        '7 a 8 horas',
        '8 a 9 horas',
        'Mais de 9 horas'
      ],
      required: true
    },
    {
      id: 'qualidade_sono',
      category: 'Qualidade do Sono',
      question: 'Como você avalia a qualidade do seu sono?',
      type: 'select',
      icon: Moon,
      options: [
        'Muito ruim (acordo várias vezes)',
        'Ruim (acordo cansado)',
        'Regular (às vezes acordo cansado)',
        'Boa (acordo descansado)',
        'Excelente (sono reparador)'
      ],
      required: true
    },
    {
      id: 'nivel_stress',
      category: 'Estresse',
      question: 'Como você avalia seu nível de estresse?',
      type: 'select',
      icon: Brain,
      options: [
        'Muito baixo',
        'Baixo',
        'Moderado',
        'Alto',
        'Muito alto'
      ],
      required: true
    },
    {
      id: 'habitos_vida',
      category: 'Hábitos',
      question: 'Você fuma ou consome álcool regularmente?',
      type: 'select',
      icon: Cigarette,
      options: [
        'Não fumo e não bebo',
        'Fumo ocasionalmente',
        'Bebo ocasionalmente',
        'Bebo regularmente'
      ],
      required: true
    },
    {
      id: 'motivacao',
      category: 'Motivação',
      question: 'O que mais te motiva a buscar uma vida mais saudável?',
      type: 'select',
      icon: Trophy,
      options: [
        'Melhorar a saúde geral',
        'Questões estéticas',
        'Aumentar autoestima',
        'Ter mais energia',
        'Viver mais e melhor',
        'Ser exemplo para a família'
      ],
      required: true
    },
    {
      id: 'tempo_exercicio',
      category: 'Tempo',
      question: 'Quanto tempo você pode dedicar aos exercícios por dia?',
      type: 'select',
      icon: Timer,
      options: [
        '15 a 30 minutos',
        '30 a 45 minutos',
        '45 a 60 minutos',
        '60 a 90 minutos',
        'Mais de 90 minutos'
      ],
      required: true
    },
    {
      id: 'experiencia',
      category: 'Experiência',
      question: 'Qual é a sua experiência anterior com programas de fitness/nutrição?',
      type: 'select',
      icon: Star,
      options: [
        'Nenhuma experiência',
        'Pouca experiência (tentativas isoladas)',
        'Experiência moderada (alguns programas)',
        'Boa experiência (vários programas)',
        'Experiência extensa (lifestyle)'
      ],
      required: true
    }
  ]

  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100

  const handleAnswer = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Calcular IMC
      const altura = parseFloat(answers.altura) / 100
      const peso = parseFloat(answers.peso)
      const imc = peso / (altura * altura)
      
      // Preparar dados do usuário
      const userData = {
        id: user?.uid || `user_${Date.now()}`,
        anamnese: answers,
        imc: imc.toFixed(2),
        created_at: new Date().toISOString(),
        status: 'completed'
      }
      
      // Salvar no localStorage com as chaves corretas
      localStorage.setItem('dados_anamnese', JSON.stringify(answers))
      localStorage.setItem('anamnese_completa', 'true')
      localStorage.setItem('evolveyou_user_data', JSON.stringify(userData))
      if (user) {
        localStorage.setItem('usuario_anamnese', user.uid)
      }
      
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirecionar para o dashboard
      navigate('/dashboard')
      
    } catch (error) {
      console.error('Erro ao salvar anamnese:', error)
      alert('Erro ao salvar anamnese. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isAnswered = answers[currentQuestion?.id]
  const canProceed = isAnswered || !currentQuestion?.required

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processando sua anamnese...</h2>
            <p className="text-gray-600 mb-4">Estamos criando seu perfil personalizado</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Anamnese Inteligente</h1>
          <p className="text-gray-600">{currentStep + 1} de {questions.length}</p>
          <Progress value={progress} className="mt-4" />
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              {currentQuestion && <currentQuestion.icon className="w-8 h-8 text-white" />}
            </div>
            <div className="text-sm text-gray-500 mb-2">{currentQuestion?.category}</div>
            <CardTitle className="text-xl">{currentQuestion?.question}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {currentQuestion?.type === 'text' && (
              <Input
                type="text"
                placeholder={currentQuestion.placeholder}
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                className="text-center text-lg"
              />
            )}

            {currentQuestion?.type === 'number' && (
              <Input
                type="number"
                placeholder={currentQuestion.placeholder}
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                className="text-center text-lg"
              />
            )}

            {currentQuestion?.type === 'select' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      answers[currentQuestion.id] === option
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                ← Anterior
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                {currentStep === questions.length - 1 ? 'Finalizar' : 'Próxima'} →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnamneseInteligente

