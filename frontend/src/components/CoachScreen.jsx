import React, { useState, useEffect, useRef } from 'react';
import { useApp, selectors } from '../contexts/AppContext.jsx';
import dataService from '../services/dataService.js';
import { motion, AnimatePresence } from 'framer-motion';

const CoachScreen = () => {
  const { state, actions } = useApp();
  const profile = selectors.getProfile(state);
  const user = selectors.getUser(state);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      const userId = user.id || 'guest_user';
      const history = await dataService.loadChatHistory(userId);
      if (history && history.length > 0) {
        setChatHistory(history);
        setMessages(history);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico do chat:', error);
    }
  };

  const initializeChat = () => {
    if (messages.length === 0) {
      const welcomeMessage = generateWelcomeMessage();
      setMessages([welcomeMessage]);
    }
  };

  const generateWelcomeMessage = () => {
    const currentHour = new Date().getHours();
    let greeting = '';
    
    if (currentHour >= 5 && currentHour < 12) {
      greeting = 'Bom dia';
    } else if (currentHour >= 12 && currentHour < 18) {
      greeting = 'Boa tarde';
    } else {
      greeting = 'Boa noite';
    }

    let personalizedMessage = `${greeting}, ${profile.name || user.name || 'usuário'}! 👋\n\n`;
    
    if (profile.anamnese_completed) {
      personalizedMessage += `Analisei seu perfil e estou aqui para te ajudar a alcançar seus objetivos! `;
      
      if (profile.goal === 'perder_peso') {
        personalizedMessage += `Vamos focar na queima de gordura e criação de hábitos saudáveis. 🔥`;
      } else if (profile.goal === 'ganhar_massa') {
        personalizedMessage += `Vamos construir músculos e força de forma inteligente! 💪`;
      } else if (profile.goal === 'manter_peso') {
        personalizedMessage += `Vamos manter seu equilíbrio e melhorar sua qualidade de vida! ⚖️`;
      }
      
      personalizedMessage += `\n\nCom base na sua anamnese, posso te ajudar com:`;
      personalizedMessage += `\n• Orientações nutricionais personalizadas`;
      personalizedMessage += `\n• Ajustes no seu plano de treino`;
      personalizedMessage += `\n• Motivação e acompanhamento`;
      personalizedMessage += `\n• Análise do seu progresso`;
      
      if (profile.anamnese_score?.score_total) {
        personalizedMessage += `\n\nSeu score de saúde atual é ${Math.round(profile.anamnese_score.score_total)}/100. Vamos trabalhar juntos para melhorar! 📈`;
      }
    } else {
      personalizedMessage += `Sou o Coach EVO, seu assistente pessoal de fitness e nutrição! 🤖\n\n`;
      personalizedMessage += `Complete sua anamnese para que eu possa oferecer orientações mais personalizadas.`;
    }
    
    personalizedMessage += `\n\nComo posso te ajudar hoje?`;

    return {
      id: Date.now(),
      text: personalizedMessage,
      sender: 'coach',
      timestamp: new Date().toISOString(),
      type: 'welcome'
    };
  };

  const buildContextualPrompt = (userMessage) => {
    const currentHour = new Date().getHours();
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    let context = `Você é o Coach EVO, assistente pessoal de fitness e nutrição do ${profile.name || user.name || 'usuário'}.\n\n`;
    
    // Contexto temporal
    context += `CONTEXTO ATUAL:\n`;
    context += `- Data: ${currentDate}\n`;
    context += `- Horário: ${currentHour}:${new Date().getMinutes().toString().padStart(2, '0')}\n`;
    
    // Contexto do perfil
    if (profile.anamnese_completed) {
      context += `\nPERFIL DO USUÁRIO:\n`;
      context += `- Nome: ${profile.name || user.name}\n`;
      context += `- Idade: ${profile.age} anos\n`;
      context += `- Objetivo: ${profile.goal?.replace('_', ' ') || 'Não definido'}\n`;
      context += `- Peso atual: ${profile.weight}kg\n`;
      if (profile.targetWeight) {
        context += `- Peso meta: ${profile.targetWeight}kg\n`;
      }
      context += `- Altura: ${profile.height}cm\n`;
      context += `- Nível de atividade: ${profile.activityLevel || 'Não definido'}\n`;
      context += `- Experiência fitness: ${profile.fitnessExperience || 'Não definido'}\n`;
      
      // Métricas calculadas
      if (profile.bmr) {
        context += `- TMB: ${profile.bmr} kcal/dia\n`;
      }
      if (profile.dailyCalories) {
        context += `- Meta calórica diária: ${profile.dailyCalories} kcal\n`;
      }
      if (profile.bmi) {
        context += `- IMC: ${profile.bmi}\n`;
      }
      
      // Preferências e restrições
      if (profile.exercisePreferences?.length > 0) {
        context += `- Preferências de exercício: ${profile.exercisePreferences.join(', ')}\n`;
      }
      if (profile.dietaryRestrictions?.length > 0) {
        context += `- Restrições alimentares: ${profile.dietaryRestrictions.join(', ')}\n`;
      }
      if (profile.availableTime) {
        context += `- Tempo disponível para treino: ${profile.availableTime.replace('_', ' ')}\n`;
      }
      
      // Condições de saúde
      if (profile.healthConditions?.length > 0) {
        context += `- Condições de saúde: ${profile.healthConditions.join(', ')}\n`;
      }
      
      // Score da anamnese
      if (profile.anamnese_score?.score_total) {
        context += `- Score de saúde: ${Math.round(profile.anamnese_score.score_total)}/100\n`;
      }
      
      // Recomendações da anamnese
      if (profile.recommendations?.prioridades?.length > 0) {
        context += `- Prioridades identificadas: ${profile.recommendations.prioridades.slice(0, 2).join(', ')}\n`;
      }
    }
    
    // Contexto temporal específico
    context += `\nCONTEXTO TEMPORAL:\n`;
    if (currentHour >= 5 && currentHour < 9) {
      context += `- Período: Manhã - Foque em motivação, planejamento do dia, café da manhã saudável\n`;
    } else if (currentHour >= 9 && currentHour < 12) {
      context += `- Período: Meio da manhã - Hidratação, lanches saudáveis, preparação para treino\n`;
    } else if (currentHour >= 12 && currentHour < 14) {
      context += `- Período: Almoço - Nutrição balanceada, energia para a tarde\n`;
    } else if (currentHour >= 14 && currentHour < 18) {
      context += `- Período: Tarde - Treino, atividade física, lanches pré/pós treino\n`;
    } else if (currentHour >= 18 && currentHour < 21) {
      context += `- Período: Noite - Jantar saudável, relaxamento, preparação para descanso\n`;
    } else {
      context += `- Período: Noite/Madrugada - Foque em descanso, recuperação, sono reparador\n`;
    }
    
    // Histórico recente (últimas 3 mensagens)
    if (messages.length > 1) {
      context += `\nHISTÓRICO RECENTE:\n`;
      const recentMessages = messages.slice(-6); // Últimas 3 trocas (6 mensagens)
      recentMessages.forEach(msg => {
        if (msg.sender === 'user') {
          context += `Usuário: ${msg.text}\n`;
        } else if (msg.sender === 'coach' && msg.type !== 'welcome') {
          context += `Coach EVO: ${msg.text}\n`;
        }
      });
    }
    
    context += `\nINSTRUÇÕES:\n`;
    context += `- Responda em português brasileiro\n`;
    context += `- Seja motivador, empático e personalizado\n`;
    context += `- Use o contexto do perfil para dar conselhos específicos\n`;
    context += `- Considere o horário atual nas suas sugestões\n`;
    context += `- Seja conciso mas informativo (máximo 200 palavras)\n`;
    context += `- Use emojis moderadamente para tornar a conversa mais amigável\n`;
    context += `- Se não tiver informações suficientes, peça esclarecimentos\n`;
    context += `- Sempre incentive hábitos saudáveis\n\n`;
    
    context += `PERGUNTA DO USUÁRIO: ${userMessage}`;
    
    return context;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Construir prompt contextual
      const contextualPrompt = buildContextualPrompt(userMessage.text);
      
      // Enviar para API
      const response = await fetch('/api/v2/coach/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: contextualPrompt,
          user_id: user.id || 'guest_user',
          context: {
            profile: profile,
            timestamp: new Date().toISOString(),
            conversation_history: messages.slice(-10) // Últimas 10 mensagens
          }
        }),
      });

      const data = await response.json();
      
      const coachMessage = {
        id: Date.now() + 1,
        text: data.response || 'Desculpe, não consegui processar sua mensagem. Tente novamente.',
        sender: 'coach',
        timestamp: new Date().toISOString(),
        type: 'response'
      };

      setMessages(prev => [...prev, coachMessage]);
      
      // Salvar no histórico
      const updatedHistory = [...messages, userMessage, coachMessage];
      await dataService.saveChatMessage(updatedHistory);
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Ops! Tive um problema técnico. Tente novamente em alguns instantes. 🤖',
        sender: 'coach',
        timestamp: new Date().toISOString(),
        type: 'error'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    {
      text: "Dica do dia",
      icon: "💡",
      action: () => setInputMessage("Me dê uma dica personalizada para hoje")
    },
    {
      text: "Motivação",
      icon: "🔥",
      action: () => setInputMessage("Preciso de motivação para treinar hoje")
    },
    {
      text: "Nutrição",
      icon: "🥗",
      action: () => setInputMessage("Como está minha alimentação hoje?")
    },
    {
      text: "Progresso",
      icon: "📈",
      action: () => setInputMessage("Analise meu progresso atual")
    }
  ];

  // Componente de mensagem
  const MessageBubble = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
        {message.sender === 'coach' && (
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">🤖</span>
            </div>
            <span className="text-gray-400 text-xs">Coach EVO</span>
          </div>
        )}
        
        <div
          className={`rounded-2xl px-4 py-3 ${
            message.sender === 'user'
              ? 'bg-purple-600 text-white'
              : message.type === 'welcome'
                ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 text-white'
                : 'bg-gray-800 text-white'
          }`}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.text}
          </p>
          <p className="text-xs opacity-70 mt-2">
            {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header do Chat */}
      <motion.div
        className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/20 mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">🤖</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">Coach EVO</h3>
            <p className="text-gray-400 text-sm">
              {profile.anamnese_completed 
                ? 'Seu assistente pessoal com IA contextualizada'
                : 'Assistente de fitness e nutrição'
              }
            </p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs">Online</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-1">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start mb-4"
          >
            <div className="bg-gray-800 rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Ações Rápidas */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 rounded-full px-3 py-2 text-sm text-white transition-colors whitespace-nowrap"
            >
              <span>{action.icon}</span>
              <span>{action.text}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Input de Mensagem */}
      <motion.div
        className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-3 border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none"
              rows="1"
              style={{ minHeight: '24px', maxHeight: '96px' }}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-full p-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {profile.anamnese_completed && (
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-gray-400">
              Powered by Gemini AI • Contexto personalizado ativo
            </span>
            <span className="text-purple-400">
              Score: {Math.round(profile.anamnese_score?.score_total || 0)}/100
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CoachScreen;

