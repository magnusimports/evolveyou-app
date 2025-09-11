import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Mic, Paperclip, Sparkles } from 'lucide-react'
import { useCoachChat } from '../hooks/useApi'

const Message = ({ content, isUser, timestamp }) => {
  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-gray-400 text-sm font-medium">Coach EVO</span>
          </div>
        )}
        
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-white border border-gray-700'
          }`}
        >
          <p className="text-sm leading-relaxed">{content}</p>
        </div>
        
        <p className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {timestamp}
        </p>
      </div>
    </motion.div>
  )
}

const QuickAction = ({ icon: Icon, label, onClick }) => {
  return (
    <motion.button
      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-3 transition-colors"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <Icon size={16} className="text-gray-400" />
      <span className="text-white text-sm">{label}</span>
    </motion.button>
  )
}

const CoachScreen = () => {
  const { messages, sendMessage, loading } = useCoachChat()
  const [inputMessage, setInputMessage] = useState('')

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage)
      setInputMessage('')
    }
  }

  const quickActions = [
    { 
      icon: Sparkles, 
      label: "Dica do dia", 
      action: () => sendMessage("Me dê uma dica para hoje") 
    },
    { 
      icon: Mic, 
      label: "Motivação", 
      action: () => sendMessage("Preciso de motivação para treinar") 
    },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Header do Chat */}
      <motion.div
        className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800 mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Coach EVO</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-500 text-sm">IA Real • Online</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((message) => (
          <Message
            key={message.id}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}
        
        {loading && (
          <motion.div
            className="flex justify-start mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="max-w-[80%]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <span className="text-gray-400 text-sm font-medium">Coach EVO</span>
              </div>
              <div className="bg-gray-800 text-white border border-gray-700 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-sm text-gray-400 ml-2">EVO está digitando...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Ações Rápidas */}
      <motion.div
        className="flex gap-2 mb-4 overflow-x-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {quickActions.map((action, index) => (
          <QuickAction
            key={index}
            icon={action.icon}
            label={action.label}
            onClick={action.action}
          />
        ))}
      </motion.div>

      {/* Input de Mensagem */}
      <motion.div
        className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Paperclip size={20} />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Digite sua mensagem para o EVO..."
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              disabled={loading}
            />
          </div>
          
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Mic size={20} />
          </button>
          
          <motion.button
            onClick={handleSendMessage}
            className={`text-white p-3 rounded-xl transition-colors ${
              inputMessage.trim() && !loading
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-600 cursor-not-allowed'
            }`}
            whileTap={{ scale: 0.95 }}
            disabled={!inputMessage.trim() || loading}
          >
            <Send size={18} />
          </motion.button>
        </div>
      </motion.div>

      {/* Informações do EVO */}
      <motion.div
        className="mt-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-4 border border-purple-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <Sparkles size={16} className="text-purple-400" />
          <div>
            <p className="text-white text-sm font-medium">Powered by Gemini AI</p>
            <p className="text-gray-400 text-xs">Conversas com inteligência artificial real</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CoachScreen

