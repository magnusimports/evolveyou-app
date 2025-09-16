import { useState, useEffect, useCallback } from 'react'
import ApiService from '../services/api'

export const useApi = (endpoint, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      let result
      switch (endpoint) {
        case 'profile':
          result = await ApiService.getProfile()
          break
        case 'metrics':
          result = await ApiService.getMetrics()
          break
        case 'activity-rings':
          result = await ApiService.getActivityRings()
          break
        case 'nutrition':
          result = await ApiService.getNutrition()
          break
        case 'workouts':
          result = await ApiService.getWorkouts()
          break
        case 'chart-data':
          result = await ApiService.getChartData()
          break
        default:
          throw new Error(`Unknown endpoint: ${endpoint}`)
      }
      
      setData(result.data)
    } catch (err) {
      setError(err.message)
      console.error(`Error fetching ${endpoint}:`, err)
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...dependencies])

  return { data, loading, error, refetch: fetchData }
}

export const useCoachChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Olá! Eu sou o EVO, seu coach virtual personalizado! 🚀 Como você está se sentindo hoje?",
      isUser: false,
      timestamp: "8:00 AM"
    },
    {
      id: 2,
      content: "Vi que seu objetivo é perder peso. Baseado no seu perfil, calculei um plano personalizado para você alcançar 70kg em 6 meses! 💪",
      isUser: false,
      timestamp: "8:00 AM"
    }
  ])
  
  const [loading, setLoading] = useState(false)

  const sendMessage = async (message) => {
    if (!message.trim()) return

    // Adicionar mensagem do usuário
    const userMessage = {
      id: Date.now(),
      content: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      // Enviar para a API
      const response = await ApiService.sendCoachMessage(message)
      
      // Adicionar resposta do coach
      const coachMessage = {
        id: Date.now() + 1,
        content: response.data.message,
        isUser: false,
        timestamp: response.data.timestamp
      }
      
      setMessages(prev => [...prev, coachMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Fallback para resposta de erro
      const errorMessage = {
        id: Date.now() + 1,
        content: "Desculpe, estou com problemas de conexão. Tente novamente em alguns instantes.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return { messages, sendMessage, loading }
}

