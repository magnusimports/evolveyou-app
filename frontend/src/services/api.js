// Configuração da API
const API_BASE_URL = 'https://5001-iekzmqs8eukltr2mv2a9d-516fa152.manusvm.computer'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.userId = 'default_user' // Por enquanto usar usuário padrão
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Métodos híbridos - tentam Firebase primeiro, fallback para fitness
  async getProfile() {
    try {
      // Tentar Firebase primeiro
      return await this.request(`/api/firebase/profile?user_id=${this.userId}`)
    } catch (error) {
      console.warn('Firebase profile failed, using fallback:', error)
      // Fallback para API original
      return this.request('/api/fitness/profile')
    }
  }

  async getMetrics() {
    try {
      // Tentar Firebase primeiro
      return await this.request(`/api/firebase/metrics?user_id=${this.userId}`)
    } catch (error) {
      console.warn('Firebase metrics failed, using fallback:', error)
      // Fallback para API original
      return this.request('/api/fitness/metrics')
    }
  }

  async getActivityRings() {
    try {
      // Tentar Firebase primeiro
      return await this.request(`/api/firebase/activity-rings?user_id=${this.userId}`)
    } catch (error) {
      console.warn('Firebase activity-rings failed, using fallback:', error)
      // Fallback para API original
      return this.request('/api/fitness/activity-rings')
    }
  }

  async getNutrition() {
    try {
      // Tentar Firebase primeiro
      return await this.request(`/api/firebase/nutrition?user_id=${this.userId}`)
    } catch (error) {
      console.warn('Firebase nutrition failed, using fallback:', error)
      // Fallback para API original
      return this.request('/api/fitness/nutrition')
    }
  }

  async getWorkouts() {
    try {
      // Tentar Firebase primeiro
      return await this.request(`/api/firebase/workouts?user_id=${this.userId}`)
    } catch (error) {
      console.warn('Firebase workouts failed, using fallback:', error)
      // Fallback para API original
      return this.request('/api/fitness/workouts')
    }
  }

  async getChartData() {
    try {
      // Tentar Firebase primeiro
      return await this.request(`/api/firebase/stats/charts?user_id=${this.userId}`)
    } catch (error) {
      console.warn('Firebase charts failed, using fallback:', error)
      // Fallback para API original
      return this.request('/api/fitness/stats/charts')
    }
  }

  async sendCoachMessage(message) {
    try {
      // Tentar Firebase com Gemini AI primeiro
      return await this.request('/api/firebase/coach/chat', {
        method: 'POST',
        body: JSON.stringify({ 
          message, 
          user_id: this.userId 
        })
      })
    } catch (error) {
      console.warn('Firebase chat failed, using fallback:', error)
      // Fallback para API original
      return this.request('/api/fitness/coach/chat', {
        method: 'POST',
        body: JSON.stringify({ message })
      })
    }
  }

  async calculateBMR(userData) {
    try {
      // Tentar Firebase primeiro
      return await this.request('/api/firebase/calculate-bmr', {
        method: 'POST',
        body: JSON.stringify({ 
          ...userData, 
          user_id: this.userId 
        })
      })
    } catch (error) {
      console.warn('Firebase BMR failed, using fallback:', error)
      // Fallback para API original
      return this.request('/api/fitness/calculate-bmr', {
        method: 'POST',
        body: JSON.stringify(userData)
      })
    }
  }

  // Novos métodos específicos do Firebase/Gemini
  async getMotivationalMessage() {
    try {
      return await this.request(`/api/firebase/coach/motivation?user_id=${this.userId}`)
    } catch (error) {
      console.error('Motivational message failed:', error)
      return {
        success: true,
        data: {
          message: "Você está indo muito bem! Continue assim! 💪",
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          type: "motivation"
        },
        source: "fallback"
      }
    }
  }

  async analyzeFood(foodDescription) {
    return this.request('/api/firebase/nutrition/analyze', {
      method: 'POST',
      body: JSON.stringify({ 
        food: foodDescription, 
        user_id: this.userId 
      })
    })
  }

  async suggestWorkout(workoutType = 'geral') {
    return this.request('/api/firebase/workout/suggest', {
      method: 'POST',
      body: JSON.stringify({ 
        type: workoutType, 
        user_id: this.userId 
      })
    })
  }

  async getChatHistory() {
    try {
      return await this.request(`/api/firebase/coach/history?user_id=${this.userId}&limit=20`)
    } catch (error) {
      console.error('Chat history failed:', error)
      return {
        success: true,
        data: [],
        source: "fallback"
      }
    }
  }

  async testFirebaseConnection() {
    return this.request('/api/firebase/test-connection')
  }

  async testGeminiStatus() {
    return this.request('/api/firebase/gemini/status')
  }

  // Método para definir usuário (para futuro sistema de auth)
  setUserId(userId) {
    this.userId = userId
  }

  getUserId() {
    return this.userId
  }
}

export default new ApiService()

