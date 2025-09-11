import { useState, useEffect } from 'react'
import { Home, Utensils, Dumbbell, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

// Componentes das telas
import ResumoScreen from './components/ResumoScreen'
import NutricaoScreen from './components/NutricaoScreen'
import TreinoScreen from './components/TreinoScreen'
import CoachScreen from './components/CoachScreen'
import AuthScreen from './components/AuthScreen'
import apiService from './services/api'

function App() {
  const [activeTab, setActiveTab] = useState('resumo')
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('evolveyou_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        apiService.setUserId(userData.id)
      } catch (error) {
        console.error('Erro ao carregar usuário salvo:', error)
        localStorage.removeItem('evolveyou_user')
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    apiService.setUserId(userData.id)
    localStorage.setItem('evolveyou_user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    apiService.setUserId('default_user')
    localStorage.removeItem('evolveyou_user')
    setActiveTab('resumo')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Carregando EvolveYou...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />
  }

  const tabs = [
    { id: 'resumo', label: 'Resumo', icon: Home, component: ResumoScreen },
    { id: 'nutricao', label: 'Nutrição', icon: Utensils, component: NutricaoScreen },
    { id: 'treino', label: 'Treino', icon: Dumbbell, component: TreinoScreen },
    { id: 'coach', label: 'Coach EVO', icon: MessageCircle, component: CoachScreen }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="dark min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 pt-12">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {activeTab === 'resumo' && 'Resumo'}
            {activeTab === 'nutricao' && 'Nutrição'}
            {activeTab === 'treino' && 'Treino'}
            {activeTab === 'coach' && 'Coach EVO'}
          </h1>
          <p className="text-gray-400 text-sm">
            {activeTab === 'resumo' && 'Quinta-feira, 11 de set.'}
            {activeTab === 'nutricao' && 'Plano personalizado'}
            {activeTab === 'treino' && 'Seu programa de exercícios'}
            {activeTab === 'coach' && 'Seu assistente pessoal'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-white text-sm font-medium">{user.name}</p>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white text-xs transition-colors"
            >
              Sair
            </button>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {ActiveComponent && <ActiveComponent user={user} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className={`p-2 rounded-full ${
                    isActive 
                      ? 'bg-green-500' 
                      : 'bg-transparent'
                  }`}
                  animate={{
                    backgroundColor: isActive ? '#10b981' : 'transparent',
                    scale: isActive ? 1.1 : 1
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon size={20} />
                </motion.div>
                <span className={`text-xs mt-1 font-medium ${
                  isActive ? 'text-white' : 'text-gray-500'
                }`}>
                  {tab.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </nav>

      {/* Status da conexão */}
      <div className="fixed top-4 right-4 flex space-x-2 z-50">
        <div className="flex items-center bg-gray-900/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-gray-300">Firebase + Gemini AI</span>
        </div>
      </div>
    </div>
  )
}

export default App

