import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, User, Activity, Heart, Target } from 'lucide-react';

const AnamneseScreen = ({ onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [categories, setCategories] = useState({});

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await fetch('/api/v2/anamnese/questions');
      const data = await response.json();
      
      if (data.success) {
        setQuestions(data.questions);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
    } finally {
      setLoading(false);
    }
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
      
      const data = await response.json();
      return data.validation;
    } catch (error) {
      console.error('Erro na validação:', error);
      return { valid: true };
    }
  };

  const handleAnswerChange = async (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Validar resposta
    const validation = await validateAnswer(questionId, answer);
    
    if (!validation.valid) {
      setValidationErrors(prev => ({
        ...prev,
        [questionId]: validation.error
      }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
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
    
    try {
      // Converter respostas para formato da API
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: parseInt(questionId),
        answer: answer
      }));

      const response = await fetch('/api/v2/anamnese/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': localStorage.getItem('user_id') || 'guest_user'
        },
        body: JSON.stringify({
          answers: formattedAnswers
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Salvar perfil no localStorage
        localStorage.setItem('user_profile', JSON.stringify(data.profile));
        
        // Chamar callback de conclusão
        if (onComplete) {
          onComplete(data);
        }
      } else {
        alert('Erro ao submeter anamnese: ' + data.message);
      }
    } catch (error) {
      console.error('Erro ao submeter anamnese:', error);
      alert('Erro ao submeter anamnese');
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

