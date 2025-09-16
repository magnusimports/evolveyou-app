import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, User, Activity, Heart, Target, Save } from 'lucide-react';
import { auth, makeAuthenticatedRequest, API_ENDPOINTS } from '../config/firebase';

const AnamneseScreen = ({ onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [categories, setCategories] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [autoSaving, setAutoSaving] = useState(false);

  useEffect(() => {
    loadQuestions();
    loadSavedAnswers();
  }, []);

  // Auto-save das respostas a cada mudança
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      saveAnswersLocally();
    }
  }, [answers]);

  const loadQuestions = async () => {
    try {
      console.log('Carregando 22 perguntas diretamente');
      setQuestions(getFullQuestions());
      setCategories(getCategories());
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
      setError('Erro ao carregar questionário');
    } finally {
      setLoading(false);
    }
  };

  // Carregar respostas salvas localmente
  const loadSavedAnswers = () => {
    try {
      const savedAnswers = localStorage.getItem('evolveyou_anamnese_answers');
      const savedIndex = localStorage.getItem('evolveyou_anamnese_current_index');
      
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }
      
      if (savedIndex) {
        setCurrentQuestionIndex(parseInt(savedIndex));
      }
    } catch (error) {
      console.error('Erro ao carregar respostas salvas:', error);
    }
  };

  // Salvar respostas localmente
  const saveAnswersLocally = () => {
    try {
      localStorage.setItem('evolveyou_anamnese_answers', JSON.stringify(answers));
      localStorage.setItem('evolveyou_anamnese_current_index', currentQuestionIndex.toString());
    } catch (error) {
      console.error('Erro ao salvar respostas localmente:', error);
    }
  };

  const getFullQuestions = () => {
    return [
      // DADOS PESSOAIS
      {
        id: 1,
        category: "dados_pessoais",
        question: "Qual é o seu nome completo?",
        type: "text",
        required: true
      },
      {
        id: 2,
        category: "dados_pessoais",
        question: "Qual é a sua idade?",
        type: "number",
        required: true
      },
      {
        id: 3,
        category: "dados_pessoais",
        question: "Qual é o seu sexo biológico?",
        type: "select",
        required: true,
        options: [
          { value: "masculino", label: "Masculino" },
          { value: "feminino", label: "Feminino" }
        ]
      },
      {
        id: 4,
        category: "antropometria",
        question: "Qual é a sua altura? (em centímetros)",
        type: "number",
        required: true,
        unit: "cm"
      },
      {
        id: 5,
        category: "antropometria",
        question: "Qual é o seu peso atual? (em quilogramas)",
        type: "number",
        required: true,
        unit: "kg"
      },
      {
        id: 6,
        category: "objetivos",
        question: "Qual é o seu principal objetivo?",
        type: "select",
        required: true,
        options: [
          { value: "perder_peso", label: "Perder peso" },
          { value: "ganhar_massa", label: "Ganhar massa muscular" },
          { value: "manter_peso", label: "Manter peso atual" },
          { value: "melhorar_condicionamento", label: "Melhorar condicionamento físico" }
        ]
      },
      {
        id: 7,
        category: "objetivos",
        question: "Qual é o seu peso ideal/meta? (em quilogramas)",
        type: "number",
        required: true,
        unit: "kg"
      },
      {
        id: 8,
        category: "atividade_fisica",
        question: "Com que frequência você pratica atividade física atualmente?",
        type: "select",
        required: true,
        options: [
          { value: "sedentario", label: "Sedentário (nenhuma atividade)" },
          { value: "leve", label: "Leve (1-2x por semana)" },
          { value: "moderado", label: "Moderado (3-4x por semana)" },
          { value: "intenso", label: "Intenso (5-6x por semana)" },
          { value: "muito_intenso", label: "Muito intenso (todos os dias)" }
        ]
      },
      {
        id: 9,
        category: "atividade_fisica",
        question: "Que tipos de exercício você prefere ou já pratica?",
        type: "multiple_select",
        required: false,
        options: [
          { value: "musculacao", label: "Musculação" },
          { value: "cardio", label: "Exercícios cardiovasculares" },
          { value: "funcional", label: "Treinamento funcional" },
          { value: "yoga", label: "Yoga/Pilates" },
          { value: "esportes", label: "Esportes coletivos" },
          { value: "caminhada", label: "Caminhada/Corrida" }
        ]
      },
      {
        id: 10,
        category: "saude",
        question: "Você possui alguma condição de saúde ou lesão que devemos considerar?",
        type: "multiple_select",
        required: false,
        options: [
          { value: "diabetes", label: "Diabetes" },
          { value: "hipertensao", label: "Hipertensão" },
          { value: "cardiopatia", label: "Problemas cardíacos" },
          { value: "lesao_joelho", label: "Lesão no joelho" },
          { value: "lesao_coluna", label: "Problemas na coluna" },
          { value: "nenhuma", label: "Nenhuma condição especial" }
        ]
      },
      {
        id: 11,
        category: "saude",
        question: "Você toma algum medicamento regularmente?",
        type: "select",
        required: true,
        options: [
          { value: "nao", label: "Não tomo medicamentos" },
          { value: "sim_poucos", label: "Sim, poucos medicamentos" },
          { value: "sim_varios", label: "Sim, vários medicamentos" }
        ]
      },
      {
        id: 12,
        category: "alimentacao",
        question: "Como você descreveria seus hábitos alimentares atuais?",
        type: "select",
        required: true,
        options: [
          { value: "muito_ruim", label: "Muito ruins (fast food frequente)" },
          { value: "ruim", label: "Ruins (alimentação irregular)" },
          { value: "regular", label: "Regulares (algumas refeições saudáveis)" },
          { value: "bom", label: "Bons (maioria das refeições saudáveis)" },
          { value: "excelente", label: "Excelentes (alimentação muito equilibrada)" }
        ]
      },
      {
        id: 13,
        category: "alimentacao",
        question: "Você possui alguma restrição alimentar ou alergia?",
        type: "multiple_select",
        required: false,
        options: [
          { value: "lactose", label: "Intolerância à lactose" },
          { value: "gluten", label: "Intolerância ao glúten/Celíaco" },
          { value: "vegetariano", label: "Vegetariano" },
          { value: "vegano", label: "Vegano" },
          { value: "diabetes", label: "Restrições por diabetes" },
          { value: "nenhuma", label: "Nenhuma restrição" }
        ]
      },
      {
        id: 14,
        category: "alimentacao",
        question: "Quantas refeições você faz por dia normalmente?",
        type: "select",
        required: true,
        options: [
          { value: "1-2", label: "1-2 refeições" },
          { value: "3", label: "3 refeições" },
          { value: "4-5", label: "4-5 refeições" },
          { value: "6+", label: "6 ou mais refeições" }
        ]
      },
      {
        id: 15,
        category: "hidratacao",
        question: "Quantos litros de água você bebe por dia aproximadamente?",
        type: "select",
        required: true,
        options: [
          { value: "menos_1", label: "Menos de 1 litro" },
          { value: "1-1.5", label: "1 a 1,5 litros" },
          { value: "1.5-2", label: "1,5 a 2 litros" },
          { value: "2-3", label: "2 a 3 litros" },
          { value: "mais_3", label: "Mais de 3 litros" }
        ]
      },
      {
        id: 16,
        category: "sono",
        question: "Quantas horas você dorme por noite em média?",
        type: "select",
        required: true,
        options: [
          { value: "menos_5", label: "Menos de 5 horas" },
          { value: "5-6", label: "5 a 6 horas" },
          { value: "6-7", label: "6 a 7 horas" },
          { value: "7-8", label: "7 a 8 horas" },
          { value: "8-9", label: "8 a 9 horas" },
          { value: "mais_9", label: "Mais de 9 horas" }
        ]
      },
      {
        id: 17,
        category: "sono",
        question: "Como você avalia a qualidade do seu sono?",
        type: "select",
        required: true,
        options: [
          { value: "muito_ruim", label: "Muito ruim (acordo várias vezes)" },
          { value: "ruim", label: "Ruim (acordo cansado)" },
          { value: "regular", label: "Regular (às vezes acordo cansado)" },
          { value: "boa", label: "Boa (acordo descansado)" },
          { value: "excelente", label: "Excelente (sono reparador)" }
        ]
      },
      {
        id: 18,
        category: "estilo_vida",
        question: "Qual é o seu nível de estresse no dia a dia?",
        type: "select",
        required: true,
        options: [
          { value: "muito_baixo", label: "Muito baixo" },
          { value: "baixo", label: "Baixo" },
          { value: "moderado", label: "Moderado" },
          { value: "alto", label: "Alto" },
          { value: "muito_alto", label: "Muito alto" }
        ]
      },
      {
        id: 19,
        category: "estilo_vida",
        question: "Você fuma ou consome álcool regularmente?",
        type: "multiple_select",
        required: true,
        options: [
          { value: "nao_fumo_nao_bebo", label: "Não fumo e não bebo" },
          { value: "fumo_ocasional", label: "Fumo ocasionalmente" },
          { value: "alcool_ocasional", label: "Bebo ocasionalmente" },
          { value: "alcool_regular", label: "Bebo regularmente" }
        ]
      },
      {
        id: 20,
        category: "motivacao",
        question: "O que mais te motiva a buscar uma vida mais saudável?",
        type: "multiple_select",
        required: true,
        options: [
          { value: "saude", label: "Melhorar a saúde geral" },
          { value: "estetica", label: "Questões estéticas" },
          { value: "autoestima", label: "Aumentar autoestima" },
          { value: "energia", label: "Ter mais energia" },
          { value: "longevidade", label: "Viver mais e melhor" },
          { value: "familia", label: "Ser exemplo para a família" }
        ]
      },
      {
        id: 21,
        category: "disponibilidade",
        question: "Quanto tempo você pode dedicar aos exercícios por dia?",
        type: "select",
        required: true,
        options: [
          { value: "15-30min", label: "15 a 30 minutos" },
          { value: "30-45min", label: "30 a 45 minutos" },
          { value: "45-60min", label: "45 a 60 minutos" },
          { value: "60-90min", label: "60 a 90 minutos" },
          { value: "mais_90min", label: "Mais de 90 minutos" }
        ]
      },
      {
        id: 22,
        category: "experiencia",
        question: "Qual é a sua experiência anterior com programas de fitness/nutrição?",
        type: "select",
        required: true,
        options: [
          { value: "nenhuma", label: "Nenhuma experiência" },
          { value: "pouca", label: "Pouca experiência (tentativas isoladas)" },
          { value: "moderada", label: "Experiência moderada (alguns programas)" },
          { value: "boa", label: "Boa experiência (vários programas)" },
          { value: "extensa", label: "Experiência extensa (lifestyle)" }
        ]
      }
    ];
  };

  const getCategories = () => {
    return {
      dados_pessoais: { name: "Dados Pessoais", icon: "User" },
      antropometria: { name: "Antropometria", icon: "Activity" },
      objetivos: { name: "Objetivos", icon: "Target" },
      atividade_fisica: { name: "Atividade Física", icon: "Activity" },
      saude: { name: "Saúde", icon: "Heart" },
      alimentacao: { name: "Alimentação", icon: "Utensils" },
      hidratacao: { name: "Hidratação", icon: "Droplets" },
      sono: { name: "Sono", icon: "Moon" },
      estilo_vida: { name: "Estilo de Vida", icon: "Coffee" },
      motivacao: { name: "Motivação", icon: "Zap" },
      disponibilidade: { name: "Disponibilidade", icon: "Clock" },
      experiencia: { name: "Experiência", icon: "BookOpen" }
    };
  };

  const validateAnswer = async (questionId, answer) => {
    try {
      const response = await fetch('/api/v2/anamnese/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: questionId,
          answer: answer
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.validation || { valid: true };
    } catch (error) {
      console.warn('Validação API falhou, usando validação local:', error);
      // Fallback para validação local
      return validateAnswerLocally(questionId, answer);
    }
  };

  const validateAnswerLocally = (questionId, answer) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return { valid: true };

    // Validação básica local
    if (question.required && (!answer || answer.toString().trim() === '')) {
      return { valid: false, message: 'Este campo é obrigatório' };
    }

    if (question.type === 'number') {
      const num = parseFloat(answer);
      if (isNaN(num) || num <= 0) {
        return { valid: false, message: 'Digite um número válido' };
      }
    }

    if (question.type === 'text' && answer && answer.length < 2) {
      return { valid: false, message: 'Digite pelo menos 2 caracteres' };
    }

    return { valid: true };
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Limpar erro de validação se existir
    if (validationErrors[questionId]) {
      setValidationErrors(prev => ({
        ...prev,
        [questionId]: null
      }));
    }

    // Indicar auto-save
    setAutoSaving(true);
    setTimeout(() => setAutoSaving(false), 1000);
  };

  const goToNextQuestion = () => {
    const validation = validateAnswer(currentQuestion, answers[currentQuestion.id]);
    
    if (!validation.valid) {
      setValidationErrors(prev => ({
        ...prev,
        [currentQuestion.id]: validation.error
      }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[currentQuestion.id];
        return newErrors;
      });
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitAnamnese = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Verificar se usuário está autenticado
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Converter respostas para formato da API
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: parseInt(questionId),
        answer: answer
      }));

      // Preparar dados para envio
      const anamneseData = {
        user_id: user.uid,
        answers: formattedAnswers,
        completed_at: new Date().toISOString(),
        questions_count: questions.length
      };

      console.log('Enviando anamnese para o backend:', anamneseData);

      // Enviar para Cloud Function
      const response = await makeAuthenticatedRequest(API_ENDPOINTS.completeOnboarding, {
        method: 'POST',
        body: JSON.stringify(anamneseData)
      });

      console.log('Resposta do backend:', response);

      if (response && response.success) {
        setSuccess('Anamnese concluída com sucesso!');
        
        // Limpar dados salvos localmente
        localStorage.removeItem('evolveyou_anamnese_answers');
        localStorage.removeItem('evolveyou_anamnese_current_index');
        
        // Aguardar um pouco para mostrar sucesso
        setTimeout(() => {
          if (onComplete) {
            onComplete({
              success: true,
              profile: response.profile,
              answers: formattedAnswers
            });
          }
        }, 1500);
        
      } else {
        throw new Error(response?.message || 'Erro ao processar anamnese');
      }
      
    } catch (error) {
      console.error('Erro ao submeter anamnese:', error);
      
      // Tratar diferentes tipos de erro
      if (error.message.includes('não autenticado')) {
        setError('Sessão expirada. Faça login novamente.');
      } else if (error.message.includes('network')) {
        setError('Erro de conexão. Verifique sua internet.');
      } else {
        setError('Erro ao processar anamnese. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    const currentAnswer = answers[question.id];
    const hasError = validationErrors[question.id];

    switch (question.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={currentAnswer || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className={`w-full p-4 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
              }`}
              placeholder="Digite sua resposta..."
            />
            {hasError && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle size={16} />
                {hasError}
              </p>
            )}
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <input
              type="number"
              value={currentAnswer || ''}
              onChange={(e) => handleAnswerChange(question.id, parseFloat(e.target.value))}
              className={`w-full p-4 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
              }`}
              placeholder="Digite um número..."
            />
            {question.unit && (
              <p className="text-gray-400 text-sm">Unidade: {question.unit}</p>
            )}
            {hasError && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle size={16} />
                {hasError}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswerChange(question.id, option.value)}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  currentAnswer === option.value
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {currentAnswer === option.value && <CheckCircle size={20} />}
                </div>
              </button>
            ))}
            {hasError && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle size={16} />
                {hasError}
              </p>
            )}
          </div>
        );

      case 'multiple_select':
        return (
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(option.value);
              
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    const currentArray = Array.isArray(currentAnswer) ? currentAnswer : [];
                    let newArray;
                    
                    if (isSelected) {
                      newArray = currentArray.filter(item => item !== option.value);
                    } else {
                      newArray = [...currentArray, option.value];
                    }
                    
                    handleAnswerChange(question.id, newArray);
                  }}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {isSelected && <CheckCircle size={20} />}
                  </div>
                </button>
              );
            })}
            {hasError && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle size={16} />
                {hasError}
              </p>
            )}
          </div>
        );

      default:
        return <p className="text-gray-400">Tipo de pergunta não suportado</p>;
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      dados_pessoais: User,
      antropometria: Activity,
      objetivos: Target,
      atividade_fisica: Activity,
      saude: Heart,
      alimentacao: Heart,
      hidratacao: Heart,
      sono: Heart,
      estilo_vida: Heart,
      motivacao: Target,
      disponibilidade: Activity,
      experiencia: User
    };
    
    const Icon = icons[category] || User;
    return <Icon size={20} />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      dados_pessoais: 'text-blue-400',
      antropometria: 'text-green-400',
      objetivos: 'text-purple-400',
      atividade_fisica: 'text-orange-400',
      saude: 'text-red-400',
      alimentacao: 'text-yellow-400',
      hidratacao: 'text-cyan-400',
      sono: 'text-indigo-400',
      estilo_vida: 'text-pink-400',
      motivacao: 'text-purple-400',
      disponibilidade: 'text-orange-400',
      experiencia: 'text-blue-400'
    };
    
    return colors[category] || 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Carregando anamnese...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-white">Erro ao carregar perguntas da anamnese</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canProceed = answers[currentQuestion.id] !== undefined && !validationErrors[currentQuestion.id];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Anamnese Inteligente</h1>
            <span className="text-sm text-gray-400">
              {currentQuestionIndex + 1} de {questions.length}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-2xl mx-auto p-6">
        {/* Mensagens de feedback */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-500 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
            <span className="text-green-400">{success}</span>
          </div>
        )}

        {/* Auto-save indicator */}
        {autoSaving && (
          <div className="mb-4 flex items-center text-blue-400 text-sm">
            <Save className="w-4 h-4 mr-2 animate-pulse" />
            Salvando automaticamente...
          </div>
        )}
        {/* Category Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 mb-6 ${getCategoryColor(currentQuestion.category)}`}>
          {getCategoryIcon(currentQuestion.category)}
          <span className="text-sm font-medium capitalize">
            {currentQuestion.category.replace('_', ' ')}
          </span>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            {currentQuestion.question}
          </h2>
          {currentQuestion.required && (
            <p className="text-red-400 text-sm">* Campo obrigatório</p>
          )}
        </div>

        {/* Answer Input */}
        <div className="mb-8">
          {renderQuestion(currentQuestion)}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft size={20} />
            Anterior
          </button>

          {isLastQuestion ? (
            <button
              onClick={submitAnamnese}
              disabled={!canProceed || submitting}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Finalizando...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Finalizar Anamnese
                </>
              )}
            </button>
          ) : (
            <button
              onClick={goToNextQuestion}
              disabled={!canProceed}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              Próxima
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnamneseScreen;

