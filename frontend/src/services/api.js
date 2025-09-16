// Configuração da API
const API_BASE_URL = 'http://localhost:5000'

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

  // Método para submeter anamnese
  async submitAnamnese(responses) {
    try {
      // Tentar API v2 primeiro
      return await this.request('/api/v2/anamnese/submit', {
        method: 'POST',
        body: JSON.stringify({
          user_id: this.userId,
          responses: responses
        })
      })
    } catch (error) {
      console.warn('API v2 anamnese failed, using fallback:', error)
      // Fallback para processamento local
      return {
        success: true,
        profile: this.processAnamneseLocally(responses),
        message: 'Anamnese processada localmente'
      }
    }
  }

  // Processamento local da anamnese como fallback
  processAnamneseLocally(responses) {
    const profile = {
      name: responses[0] || 'Usuário',
      age: parseInt(responses[1]) || 25,
      gender: responses[2] || 'masculino',
      height: parseFloat(responses[3]) || 170,
      weight: parseFloat(responses[4]) || 70,
      target_weight: parseFloat(responses[5]) || 65,
      goal: responses[6] || 'perder_peso',
      activity_level: responses[7] || 'moderado',
      experience: responses[21] || 'iniciante'
    }

    // Calcular TMB usando fórmula de Harris-Benedict
    let tmb
    if (profile.gender === 'masculino') {
      tmb = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age)
    } else {
      tmb = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age)
    }

    // Fator de atividade
    const activityFactors = {
      'sedentario': 1.2,
      'leve': 1.375,
      'moderado': 1.55,
      'intenso': 1.725,
      'muito_intenso': 1.9
    }

    const activityFactor = activityFactors[profile.activity_level] || 1.55
    const dailyCalories = Math.round(tmb * activityFactor)

    // Ajustar calorias baseado no objetivo
    let targetCalories = dailyCalories
    if (profile.goal === 'perder_peso') {
      targetCalories = Math.round(dailyCalories * 0.8) // Déficit de 20%
    } else if (profile.goal === 'ganhar_massa') {
      targetCalories = Math.round(dailyCalories * 1.15) // Superávit de 15%
    }

    return {
      ...profile,
      tmb: Math.round(tmb),
      daily_calories: targetCalories,
      macros: {
        protein: Math.round(targetCalories * 0.25 / 4), // 25% proteína
        carbs: Math.round(targetCalories * 0.45 / 4),   // 45% carboidratos
        fat: Math.round(targetCalories * 0.30 / 9)      // 30% gordura
      },
      anamnese_completed: true,
      created_at: new Date().toISOString()
    }
  }

  // Método para definir usuário (para futuro sistema de auth)
  setUserId(userId) {
    this.userId = userId
  }

  getUserId() {
    return this.userId
  }

  // ==========================================
  // DASHBOARD API METHODS
  // ==========================================
  
  async getDashboardMetrics(userId) {
    try {
      return await this.request(`/api/dashboard/metrics/${userId}`)
    } catch (error) {
      console.warn('Dashboard metrics failed:', error)
      return null
    }
  }
  
  async getActivityRings(userId) {
    try {
      return await this.request(`/api/dashboard/activity-rings/${userId}`)
    } catch (error) {
      console.warn('Activity rings failed:', error)
      return null
    }
  }
  
  async getWeeklyProgress(userId) {
    try {
      return await this.request(`/api/dashboard/weekly-progress/${userId}`)
    } catch (error) {
      console.warn('Weekly progress failed:', error)
      return null
    }
  }
  
  async getAchievements(userId) {
    try {
      return await this.request(`/api/dashboard/achievements/${userId}`)
    } catch (error) {
      console.warn('Achievements failed:', error)
      return null
    }
  }
  
  // ==========================================
  // WORKOUT API METHODS
  // ==========================================
  
  async getWorkoutPlan(userId) {
    try {
      return await this.request(`/api/workout/plan/${userId}`)
    } catch (error) {
      console.warn('Workout plan failed:', error)
      return null
    }
  }
  
  async getWorkoutProgress(userId) {
    try {
      return await this.request(`/api/workout/progress/${userId}`)
    } catch (error) {
      console.warn('Workout progress failed:', error)
      return null
    }
  }
  
  async completeWorkout(userId, workoutId, duration, exercisesCompleted) {
    try {
      return await this.request('/api/workout/complete', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          workout_id: workoutId,
          duration: duration,
          exercises_completed: exercisesCompleted
        })
      })
    } catch (error) {
      console.warn('Complete workout failed:', error)
      return null
    }
  }
  
  async getExercisesByMuscleGroup(muscleGroup) {
    try {
      return await this.request(`/api/workout/exercises/${muscleGroup}`)
    } catch (error) {
      console.warn('Exercises by muscle group failed:', error)
      return null
    }
  }
  
  // ==========================================
  // NUTRITION API METHODS
  // ==========================================
  
  async getNutritionPlan(userId) {
    try {
      return await this.request(`/api/nutrition/plan/${userId}`)
    } catch (error) {
      console.warn('Nutrition plan failed:', error)
      return null
    }
  }
  
  async getCurrentIntake(userId) {
    try {
      return await this.request(`/api/nutrition/intake/${userId}`)
    } catch (error) {
      console.warn('Current intake failed:', error)
      return null
    }
  }
  
  async logFood(userId, foodName, quantity, mealType) {
    try {
      return await this.request('/api/nutrition/log-food', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          food_name: foodName,
          quantity: quantity,
          meal_type: mealType
        })
      })
    } catch (error) {
      console.warn('Log food failed:', error)
      return null
    }
  }
  
  async searchFoods(query) {
    try {
      return await this.request(`/api/nutrition/foods/search?q=${encodeURIComponent(query)}`)
    } catch (error) {
      console.warn('Search foods failed:', error)
      return null
    }
  }
  
  async getWeeklyNutritionProgress(userId) {
    try {
      return await this.request(`/api/nutrition/weekly-progress/${userId}`)
    } catch (error) {
      console.warn('Weekly nutrition progress failed:', error)
      return null
    }
  }

  // ==========================================
  // COACH API METHODS
  // ==========================================
  
  async sendChatMessage(userId, message, history = []) {
    try {
      return await this.request('/api/coach/chat', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          message: message,
          history: history
        })
      })
    } catch (error) {
      console.warn('Send chat message failed:', error)
      return null
    }
  }
  
  async getChatHistory(userId) {
    try {
      return await this.request(`/api/coach/history/${userId}`)
    } catch (error) {
      console.warn('Get chat history failed:', error)
      return null
    }
  }
  
  async getChatSuggestions(userId) {
    try {
      return await this.request(`/api/coach/suggestions/${userId}`)
    } catch (error) {
      console.warn('Get chat suggestions failed:', error)
      return null
    }
  }
  
  async getMotivationalQuote() {
    try {
      return await this.request('/api/coach/motivational-quote')
    } catch (error) {
      console.warn('Get motivational quote failed:', error)
      return null
    }
  }
  
  async getQuickTips(category) {
    try {
      return await this.request(`/api/coach/quick-tips/${category}`)
    } catch (error) {
      console.warn('Get quick tips failed:', error)
      return null
    }
  }
}

export default new ApiService()

