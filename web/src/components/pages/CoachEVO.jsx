import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Bot,
  Send,
  Sparkles,
  MessageCircle,
  Clock,
  User,
  Zap
} from 'lucide-react'

const CoachEVO = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Olá! Eu sou o EVO, seu coach virtual personalizado! 🚀 Como você está se sentindo hoje?',
      timestamp: '2:01:08 PM'
    },
    {
      id: 2,
      type: 'bot', 
      content: 'Vi que seu objetivo é perder peso. Baseado no seu perfil, calculei um plano personalizado para você alcançar 70kg em 6 meses! 💪',
      timestamp: '2:01:08 PM'
    }
  ])

  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setIsTyping(true)

    // Simular resposta do EVO
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: generateEVOResponse(newMessage),
        timestamp: new Date().toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        })
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const generateEVOResponse = (userInput) => {
    const responses = [
      'Entendi sua pergunta! Como seu coach, recomendo manter o foco nos seus objetivos! 💪',
      'Baseado no seu perfil, posso sugerir algumas estratégias personalizadas para você.',
      'Excelente pergunta! Vou analisar seus dados e criar uma recomendação específica.',
      'Isso é muito importante para seu progresso! Vamos trabalhar juntos nessa questão.',
      'Perfeito! Seus dados mostram que você está no caminho certo. Continue assim!'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickQuestions = [
    'Como melhorar minha alimentação?',
    'Qual treino fazer hoje?',
    'Como aumentar minha motivação?',
    'Dicas para dormir melhor?'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coach EVO</h1>
          <p className="text-gray-600">Seu Assistente Pessoal com IA</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <Sparkles className="w-3 h-3 mr-1" />
            IA Real
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            <Zap className="w-3 h-3 mr-1" />
            Personalizado
          </Badge>
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <span>Coach EVO - Seu Assistente Pessoal</span>
              <p className="text-sm font-normal text-gray-600">
                Converse com o EVO sobre nutrição, treinos e motivação
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'bot' && (
                    <Bot className="w-4 h-4 mt-1 text-purple-600" />
                  )}
                  {message.type === 'user' && (
                    <User className="w-4 h-4 mt-1 text-white" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="w-3 h-3 opacity-60" />
                      <span className="text-xs opacity-60">{message.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Quick Questions */}
        <div className="px-4 py-2 border-t bg-gray-50">
          <p className="text-xs text-gray-600 mb-2">Perguntas rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setNewMessage(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem para o EVO..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isTyping}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* EVO Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Conversas Inteligentes</h3>
                <p className="text-sm text-gray-600">Respostas personalizadas baseadas no seu perfil</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">IA Avançada</h3>
                <p className="text-sm text-gray-600">Powered by Gemini AI para máxima precisão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tempo Real</h3>
                <p className="text-sm text-gray-600">Respostas instantâneas 24/7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CoachEVO

