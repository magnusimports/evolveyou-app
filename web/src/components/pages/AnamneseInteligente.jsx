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
    // Pergunta inicial de nome
    {
      id: 'nome',
      category: 'Dados Pessoais',
      question: 'Como você gostaria de ser chamado?',
      type: 'text',
      icon: User,
      placeholder: 'Digite seu nome',
      required: true
    },
    
    // PARTE 1: O PONTO DE PARTIDA (SEU OBJETIVO, MOTIVAÇÃO E PRAZO)
    {
      id: 'objetivo_principal',
      category: 'Objetivo Principal',
      question: 'Qual é o seu principal objetivo neste momento?',
      type: 'select',
      icon: Target,
      options: [
        'Emagrecer e perder gordura corporal (preservar massa muscular)',
        'Ganhar massa muscular (hipertrofia)',
        'Melhorar minha saúde e condicionamento físico geral (performance)',
        'Manter meu peso e composição corporal atuais (manutenção)',
        'Reabilitação, melhora postural'
      ],
      required: true
    },
    {
      id: 'motivacao',
      category: 'Motivação',
      question: 'Qual é a principal MOTIVAÇÃO por trás do seu objetivo? (Marque as principais)',
      type: 'multiselect',
      icon: Trophy,
      options: [
        'Melhorar minha saúde e bem-estar geral',
        'Aumentar minha autoestima e me sentir mais confiante',
        'Tenho um evento específico (viagem, casamento, formatura)',
        'Performance para uma competição ou prova esportiva',
        'Preparação para uma avaliação física (concurso, teste de emprego)',
        'Outro motivo'
      ],
      required: true
    },
    {
      id: 'prazo_objetivo',
      category: 'Prazo',
      question: 'Em quanto tempo você pretende alcançar este objetivo?',
      type: 'select',
      icon: Clock,
      options: [
        'Curto Prazo: O mais rápido possível',
        'Médio Prazo: Tenho um bom tempo',
        'Longo Prazo: Sem pressa, focando na consistência',
        'Contínuo: É um projeto de estilo de vida, sem um prazo final'
      ],
      required: true
    },
    {
      id: 'mentalidade',
      category: 'Mentalidade',
      question: 'Para refinar, qual destas frases melhor descreve sua mentalidade?',
      type: 'select',
      icon: Brain,
      options: [
        'Prefiro uma abordagem mais agressiva, mesmo que seja mais difícil',
        'Prefiro uma abordagem mais lenta e sustentável, que se encaixe melhor na minha rotina'
      ],
      required: true
    },
    {
      id: 'sexo',
      category: 'Dados Básicos',
      question: 'Sexo Biológico:',
      type: 'select',
      icon: Users,
      options: ['Masculino', 'Feminino'],
      required: true
    },
    {
      id: 'idade',
      category: 'Dados Básicos',
      question: 'Idade:',
      type: 'number',
      icon: Calendar,
      placeholder: 'Digite sua idade em anos',
      required: true
    },
    {
      id: 'altura',
      category: 'Dados Básicos',
      question: 'Altura:',
      type: 'number',
      icon: Ruler,
      placeholder: 'Digite sua altura em cm (ex: 175)',
      required: true
    },
    {
      id: 'peso',
      category: 'Dados Básicos',
      question: 'Peso:',
      type: 'number',
      icon: Scale,
      placeholder: 'Digite seu peso em kg (ex: 70)',
      required: true
    },
    
    // PARTE 2: SUA ROTINA E METABOLISMO (GASTO CALÓRICO)
    {
      id: 'descricao_corpo',
      category: 'Composição Corporal',
      question: 'Como você descreveria seu corpo hoje, olhando no espelho?',
      type: 'select',
      icon: User,
      options: [
        'Muito magro(a), com ossos e músculos bem visíveis',
        'Magro(a), com pouca gordura aparente e um visual "seco"',
        'Atlético(a), com músculos definidos e pouca gordura',
        'Normal ou mediano, com um pouco de gordura cobrindo os músculos',
        'Acima do peso, com acúmulo de gordura notável na barriga, quadris ou outras áreas'
      ],
      required: true
    },
    {
      id: 'atividade_trabalho',
      category: 'Atividade no Trabalho',
      question: 'Qual opção melhor descreve sua principal atividade no TRABALHO ou ESTUDOS?',
      type: 'select',
      icon: Activity,
      options: [
        'Nível 1 - Sedentário: Passo a maior parte do tempo sentado(a) (ex: escritório, motorista)',
        'Nível 2 - Leve: Fico parte do tempo sentado(a), mas caminho um pouco ou fico em pé (ex: professor, vendedor)',
        'Nível 3 - Moderado: Estou em constante movimento, caminhando bastante (ex: garçom, estoquista)',
        'Nível 4 - Intenso: Meu trabalho exige muito esforço físico e carregar pesos (ex: construção civil)'
      ],
      required: true
    },
    {
      id: 'atividade_tempo_livre',
      category: 'Atividade no Tempo Livre',
      question: 'E no seu TEMPO LIVRE (fora do trabalho e dos treinos), você se considera uma pessoa:',
      type: 'select',
      icon: Activity,
      options: [
        'Nível 1 - Muito tranquila: Passo a maior parte do tempo em atividades de baixo esforço (ler, ver TV)',
        'Nível 2 - Levemente ativa: Faço tarefas domésticas leves e pequenas caminhadas',
        'Nível 3 - Ativa: Estou sempre fazendo algo, como limpeza pesada, jardinagem, passeios longos'
      ],
      required: true
    },
    
    // PARTE 3: SEU HISTÓRICO, TREINO E PERFORMANCE
    {
      id: 'experiencia_treino',
      category: 'Experiência de Treino',
      question: 'Qual seu nível de experiência com treinos de força (musculação, Crossfit)?',
      type: 'select',
      icon: Activity,
      options: [
        'Iniciante: Nunca treinei ou treinei por menos de 6 meses',
        'Intermediário: Treino de forma consistente há mais de 6 meses a 2 anos',
        'Avançado: Treino de forma séria e consistente há vários anos'
      ],
      required: true
    },
    {
      id: 'local_treino',
      category: 'Local de Treino',
      question: 'Onde você pretende treinar?',
      type: 'select',
      icon: Activity,
      options: [
        'Em casa, com pouco ou nenhum equipamento',
        'Em casa, com alguns equipamentos (halteres, elásticos)',
        'Em uma academia com equipamentos básicos',
        'Em uma academia completa',
        'Em um Box de Crossfit'
      ],
      required: true
    },
    {
      id: 'frequencia_treino',
      category: 'Frequência de Treino',
      question: 'Quantos dias na semana você REALMENTE tem disponibilidade para treinar?',
      type: 'select',
      icon: Calendar,
      options: ['2 dias', '3 dias', '4 dias', '5 dias', '6 dias'],
      required: true
    },
    {
      id: 'atividades_praticadas',
      category: 'Atividades',
      question: 'Qual(is) atividade(s) você pratica ou gostaria de praticar? (Marque as principais)',
      type: 'multiselect',
      icon: Activity,
      options: [
        'Musculação / Treinamento de Força',
        'Crossfit / Treinamento Funcional',
        'Corrida / Caminhada',
        'Futebol / Vôlei / Basquete',
        'Beach Tennis / Tênis / Padel',
        'Ciclismo / Bike',
        'Natação / Hidroginástica',
        'Lutas (Jiu-Jitsu, Boxe, etc.)',
        'Dança / Yoga / Pilates',
        'Outra'
      ],
      required: true
    },
    {
      id: 'intensidade_treino',
      category: 'Intensidade',
      question: 'Em uma escala de 0 a 10, qual a intensidade média do seu esforço nos treinos?',
      type: 'select',
      icon: Activity,
      options: [
        '3-4 (Leve): Consigo conversar normalmente',
        '5-6 (Moderado): Conversar se torna um desafio',
        '7-8 (Intenso): Só consigo falar frases curtas',
        '9-10 (Muito Intenso): Falar é quase impossível, esforço máximo'
      ],
      required: true
    },
    {
      id: 'dores_lesoes',
      category: 'Saúde',
      question: 'Você sente alguma dor, desconforto ou tem alguma lesão ativa ou recorrente?',
      type: 'text',
      icon: Heart,
      placeholder: 'Descreva suas dores/lesões ou digite "Não" se não tiver',
      required: true
    },
    
    // PARTE 4: SUPLEMENTAÇÃO E RECURSOS ERGOGÊNICOS
    {
      id: 'uso_suplementos',
      category: 'Suplementação',
      question: 'Você faz uso ou pretende fazer uso de suplementos alimentares?',
      type: 'select',
      icon: Heart,
      options: ['Não', 'Sim'],
      required: true
    },
    {
      id: 'tipos_suplementos',
      category: 'Tipos de Suplementos',
      question: 'Se sim, quais você utiliza ou tem interesse? (Marque todos que se aplicam)',
      type: 'multiselect',
      icon: Heart,
      options: [
        'Proteína em Pó (Whey Protein, Caseína, Albumina, Proteína Vegana)',
        'Hipercalórico / Massa',
        'Carboidratos em Pó (Maltodextrina, Dextrose, Waxy Maize)',
        'Creatina',
        'Beta-Alanina',
        'Cafeína (cápsulas ou como pré-treino)',
        'Citrulina / Arginina',
        'Multivitamínico',
        'Vitamina D',
        'Ômega 3',
        'Coenzima Q10',
        'Melatonina / Indutores de sono',
        'Outros'
      ],
      required: false,
      conditional: { field: 'uso_suplementos', value: 'Sim' }
    },
    {
      id: 'recursos_ergogenicos',
      category: 'Recursos Ergogênicos',
      question: 'Você faz uso de algum recurso ergogênico farmacológico (hormônios/esteroides)? (Esta informação é confidencial e crucial para a segurança e eficácia do seu plano)',
      type: 'select',
      icon: Heart,
      options: ['Não', 'Sim'],
      required: true
    },
    
    // PARTE 5: SEUS HÁBITOS E PREFERÊNCIAS ALIMENTARES
    {
      id: 'refeicoes_dia',
      category: 'Refeições',
      question: 'Quantas refeições você costuma fazer por dia?',
      type: 'select',
      icon: Utensils,
      options: [
        '1 a 2 refeições grandes',
        '3 refeições principais (café, almoço, jantar)',
        '4 a 5 refeições (as 3 principais + lanches)',
        '6 ou mais refeições pequenas ao longo do dia'
      ],
      required: true
    },
    {
      id: 'fontes_proteina',
      category: 'Proteínas',
      question: 'Marque as fontes de PROTEÍNA que você mais gosta e costuma comer:',
      type: 'multiselect',
      icon: Utensils,
      options: [
        'Frango',
        'Carne vermelha (bovina, suína)',
        'Peixes (tilápia, salmão)',
        'Ovos',
        'Laticínios (iogurte, queijos)',
        'Proteínas em pó (Whey, Albumina)',
        'Proteínas vegetais (lentilha, grão-de-bico, tofu, soja)'
      ],
      required: true
    },
    {
      id: 'fontes_carboidrato',
      category: 'Carboidratos',
      question: 'Marque as fontes de CARBOIDRATO que você mais gosta e costuma comer:',
      type: 'multiselect',
      icon: Utensils,
      options: [
        'Arroz branco / integral',
        'Batatas (inglesa, doce) / Mandioca',
        'Massas / Pães',
        'Aveia',
        'Frutas em geral',
        'Legumes e verduras'
      ],
      required: true
    },
    {
      id: 'restricoes_alimentares',
      category: 'Restrições',
      question: 'Você possui alguma alergia, intolerância ou restrição alimentar severa?',
      type: 'multiselect',
      icon: Utensils,
      options: [
        'Não',
        'Sim, a lactose',
        'Sim, ao glúten (Celíaco ou sensibilidade)',
        'Sim, a outros alimentos'
      ],
      required: true
    },
    {
      id: 'consumo_agua',
      category: 'Hidratação',
      question: 'Quanta água você bebe por dia?',
      type: 'select',
      icon: Utensils,
      options: [
        'Quase não bebo água, mais sucos e refrigerantes',
        '1 a 2 copos (menos de 1 litro)',
        '3 a 5 copos (cerca de 1,5 litros)',
        'Mais de 6 copos (mais de 2 litros)'
      ],
      required: true
    },
    {
      id: 'alimentacao_fins_semana',
      category: 'Fins de Semana',
      question: 'Como é sua alimentação nos fins de semana?',
      type: 'select',
      icon: Utensils,
      options: [
        'Mantenho o mesmo padrão da semana',
        'Faço de 1 a 2 "refeições livres" (pizza, lanche, etc)',
        'É bem diferente, com muito mais "escapadas" da dieta'
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

  const handleMultiSelectAnswer = (option) => {
    const currentAnswers = answers[currentQuestion.id] || []
    const isSelected = currentAnswers.includes(option)
    
    let newAnswers
    if (isSelected) {
      newAnswers = currentAnswers.filter(item => item !== option)
    } else {
      newAnswers = [...currentAnswers, option]
    }
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: newAnswers
    }))
  }

  // Verificar se a pergunta deve ser exibida baseado em condições
  const shouldShowQuestion = (question) => {
    if (!question.conditional) return true
    
    const { field, value } = question.conditional
    return answers[field] === value
  }

  const handleNext = () => {
    let nextStep = currentStep + 1
    
    // Pular perguntas condicionais que não devem ser exibidas
    while (nextStep < questions.length && !shouldShowQuestion(questions[nextStep])) {
      nextStep++
    }
    
    if (nextStep < questions.length) {
      setCurrentStep(nextStep)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    let prevStep = currentStep - 1
    
    // Pular perguntas condicionais que não devem ser exibidas
    while (prevStep >= 0 && !shouldShowQuestion(questions[prevStep])) {
      prevStep--
    }
    
    if (prevStep >= 0) {
      setCurrentStep(prevStep)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      if (!user) {
        console.error('❌ Usuário não encontrado ao salvar anamnese');
        alert('Erro: usuário não encontrado. Faça login novamente.');
        return;
      }

      // Calcular IMC
      const altura = parseFloat(answers.altura) / 100
      const peso = parseFloat(answers.peso)
      const imc = peso / (altura * altura)
      
      // Preparar dados da anamnese para salvar
      const anamneseData = {
        ...answers,
        imc: imc.toFixed(2),
        timestamp: new Date().toISOString(),
        status: 'completed',
        userId: user.uid
      }
      
      console.log('💾 Salvando anamnese para usuário:', user.uid);
      
      // Salvar no Firestore usando Firebase Function
      try {
        const response = await fetch('https://us-central1-evolveyou-prod.cloudfunctions.net/salvarAnamnese', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.uid,
            dadosAnamnese: anamneseData
          })
        })
        
        if (response.ok) {
          console.log('✅ Anamnese salva no Firestore com sucesso!')
        } else {
          console.warn('⚠️ Erro ao salvar no Firestore, mas continuando com localStorage')
        }
      } catch (firestoreError) {
        console.warn('⚠️ Erro na conexão com Firestore:', firestoreError)
      }
      
      // Salvar no localStorage para verificação imediata
      localStorage.setItem('dados_anamnese', JSON.stringify(anamneseData))
      localStorage.setItem('anamnese_completa', 'true')
      localStorage.setItem('usuario_anamnese', user.uid)
      
      console.log('💾 Dados salvos no localStorage:', {
        anamnese_completa: 'true',
        usuario_anamnese: user.uid,
        nome: anamneseData.nome
      });
      
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('🚀 Redirecionando para dashboard...');
      
      // Redirecionar para o dashboard
      navigate('/dashboard')
      
    } catch (error) {
      console.error('❌ Erro ao salvar anamnese:', error)
      alert('Erro ao salvar anamnese. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isAnswered = currentQuestion?.type === 'multiselect' 
    ? (answers[currentQuestion?.id] || []).length > 0
    : answers[currentQuestion?.id]
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

            {currentQuestion?.type === 'multiselect' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => {
                  const isSelected = (answers[currentQuestion.id] || []).includes(option)
                  return (
                    <button
                      key={index}
                      onClick={() => handleMultiSelectAnswer(option)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      {option}
                    </button>
                  )
                })}
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

