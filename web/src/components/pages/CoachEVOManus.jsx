import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Target, 
  Dumbbell,
  Zap,
  Send,
  Mic,
  Lightbulb,
  Heart,
  Sparkles
} from 'lucide-react'

const CoachEVOManus = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'coach',
      content: 'Olá! Eu sou o EVO, seu coach virtual personalizado! 🚀 Como você está se sentindo hoje?',
      timestamp: '8:00 AM'
    },
    {
      id: 2,
      sender: 'coach',
      content: 'Vi que seu objetivo é perder peso. Baseado no seu perfil, calculei um plano personalizado para você alcançar 70kg em 6 meses! 💪',
      timestamp: '8:00 AM'
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

    // Adicionar mensagem do usuário
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setIsTyping(true)

    // Simular resposta do coach (aqui você integraria com a API do Gemini)
    setTimeout(() => {
      const coachResponse = {
        id: messages.length + 2,
        sender: 'coach',
        content: 'Entendi! Vou ajudar você com isso. Baseado nos seus dados, tenho algumas sugestões personalizadas para otimizar seus resultados! 🎯',
        timestamp: new Date().toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
      setMessages(prev => [...prev, coachResponse])
      setIsTyping(false)
    }, 2000)
  }

  const handleQuickAction = (action) => {
    let message = ''
    switch(action) {
      case 'tip':
        message = 'Me dê uma dica para hoje'
        break
      case 'motivation':
        message = 'Preciso de motivação'
        break
      default:
        return
    }
    setNewMessage(message)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold">Coach EVO</h1>
          <p className="text-gray-400">Seu assistente pessoal</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-400">Firebase + Gemini AI</span>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
        </div>
      </div>

      {/* Coach Status */}
      <div className="p-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Coach EVO</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-400">IA Real</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-400">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto pb-32">
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <div className="flex items-start gap-2">
              {message.sender === 'coach' && (
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white ml-auto' 
                  : 'bg-gray-800 text-white'
              }`}>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
            <div className={`text-xs text-gray-400 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
              {message.timestamp}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="mb-4 text-left">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-800 text-white px-4 py-2 rounded-2xl">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleQuickAction('tip')}
            className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            Dica do dia
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleQuickAction('motivation')}
            className="border-orange-600 text-orange-400 hover:bg-orange-600/10"
          >
            <Heart className="w-4 h-4 mr-1" />
            Motivação
          </Button>
        </div>

        {/* Input */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem para o EVO..."
              className="border-none bg-transparent text-white placeholder-gray-400 focus:ring-0"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button 
              size="sm" 
              variant="ghost"
              className="text-gray-400 hover:text-white p-1"
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 p-1"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Powered by */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
          <Sparkles className="w-3 h-3" />
          <span>Powered by Gemini AI</span>
          <span>Conversas com inteligência artificial real</span>
        </div>
      </div>

      {/* Navigation Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="flex justify-around py-2">
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-400">
            <Activity className="w-5 h-5" />
            <span className="text-xs">Resumo</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-400">
            <Target className="w-5 h-5" />
            <span className="text-xs">Nutrição</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-400">
            <Dumbbell className="w-5 h-5" />
            <span className="text-xs">Treino</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-purple-500">
            <Zap className="w-5 h-5" />
            <span className="text-xs">Coach EVO</span>
            <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CoachEVOManus

