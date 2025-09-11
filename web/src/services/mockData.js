/**
 * Dados mock realistas para desenvolvimento e fallback
 * Baseados na estrutura dos microserviços do EvolveYou
 */

// Simulação de delay de rede
const simulateNetworkDelay = (min = 200, max = 800) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Dados do usuário demo
const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@evolveyou.com',
  name: 'Usuário Demo',
  age: 30,
  height: 175,
  weight: 75,
  targetWeight: 70,
  activityLevel: 'moderately_active',
  goal: 'weight_loss',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: new Date().toISOString()
};

// Dados de perfil do usuário
export const mockUserProfile = {
  user: DEMO_USER,
  preferences: {
    dietType: 'balanced',
    allergies: ['gluten'],
    dislikes: ['broccoli'],
    mealsPerDay: 4,
    workoutFrequency: 3,
    workoutDuration: 45,
    preferredWorkoutTime: 'morning'
  },
  stats: {
    currentWeight: 75,
    targetWeight: 70,
    bmi: 24.5,
    bmiCategory: 'normal',
    bodyFat: 18,
    muscleMass: 32,
    waterIntake: 2.2,
    dailyCalories: 2100,
    targetCalories: 1800
  }
};

// Dados do plano personalizado
export const mockUserPlan = {
  id: 'plan-demo-123',
  userId: DEMO_USER.id,
  type: 'complete',
  createdAt: new Date().toISOString(),
  
  // Plano de dieta
  dietPlan: {
    dailyCalories: 1800,
    macros: {
      protein: { grams: 120, percentage: 27 },
      carbs: { grams: 180, percentage: 40 },
      fat: { grams: 50, percentage: 25 },
      fiber: { grams: 25, percentage: 8 }
    },
    meals: [
      {
        id: 'breakfast',
        name: 'Café da Manhã',
        time: '07:00',
        calories: 450,
        foods: [
          { name: 'Iogurte grego natural', amount: '200g', calories: 130 },
          { name: 'Granola integral', amount: '30g', calories: 120 },
          { name: 'Frutas vermelhas', amount: '100g', calories: 50 },
          { name: 'Mel', amount: '1 colher', calories: 60 },
          { name: 'Café com leite desnatado', amount: '200ml', calories: 90 }
        ]
      },
      {
        id: 'lunch',
        name: 'Almoço',
        time: '12:00',
        calories: 600,
        foods: [
          { name: 'Peito de frango grelhado', amount: '150g', calories: 250 },
          { name: 'Arroz integral', amount: '100g', calories: 110 },
          { name: 'Feijão preto', amount: '80g', calories: 90 },
          { name: 'Salada verde mista', amount: '150g', calories: 30 },
          { name: 'Azeite extra virgem', amount: '1 colher', calories: 120 }
        ]
      },
      {
        id: 'snack',
        name: 'Lanche',
        time: '15:30',
        calories: 200,
        foods: [
          { name: 'Banana', amount: '1 unidade', calories: 90 },
          { name: 'Pasta de amendoim', amount: '1 colher', calories: 110 }
        ]
      },
      {
        id: 'dinner',
        name: 'Jantar',
        time: '19:00',
        calories: 550,
        foods: [
          { name: 'Salmão grelhado', amount: '120g', calories: 200 },
          { name: 'Batata doce assada', amount: '150g', calories: 130 },
          { name: 'Brócolis refogado', amount: '100g', calories: 35 },
          { name: 'Salada de folhas verdes', amount: '100g', calories: 20 },
          { name: 'Azeite de oliva', amount: '1 colher', calories: 120 },
          { name: 'Suco de limão', amount: '50ml', calories: 10 }
        ]
      }
    ]
  },

  // Plano de treino
  workoutPlan: {
    frequency: 3,
    duration: 45,
    level: 'intermediate',
    goal: 'weight_loss',
    schedule: [
      {
        day: 'monday',
        name: 'Treino A - Peito e Tríceps',
        duration: 45,
        exercises: [
          { name: 'Aquecimento - Esteira', sets: 1, reps: '10 min', rest: 0 },
          { name: 'Supino reto', sets: 3, reps: 12, rest: 60 },
          { name: 'Supino inclinado', sets: 3, reps: 10, rest: 60 },
          { name: 'Crucifixo', sets: 3, reps: 12, rest: 45 },
          { name: 'Tríceps testa', sets: 3, reps: 12, rest: 45 },
          { name: 'Tríceps corda', sets: 3, reps: 15, rest: 45 },
          { name: 'Alongamento', sets: 1, reps: '10 min', rest: 0 }
        ]
      },
      {
        day: 'wednesday',
        name: 'Treino B - Costas e Bíceps',
        duration: 45,
        exercises: [
          { name: 'Aquecimento - Bicicleta', sets: 1, reps: '10 min', rest: 0 },
          { name: 'Puxada frontal', sets: 3, reps: 12, rest: 60 },
          { name: 'Remada baixa', sets: 3, reps: 12, rest: 60 },
          { name: 'Remada alta', sets: 3, reps: 10, rest: 60 },
          { name: 'Rosca direta', sets: 3, reps: 12, rest: 45 },
          { name: 'Rosca martelo', sets: 3, reps: 12, rest: 45 },
          { name: 'Alongamento', sets: 1, reps: '10 min', rest: 0 }
        ]
      },
      {
        day: 'friday',
        name: 'Treino C - Pernas e Glúteos',
        duration: 45,
        exercises: [
          { name: 'Aquecimento - Elíptico', sets: 1, reps: '10 min', rest: 0 },
          { name: 'Agachamento livre', sets: 3, reps: 15, rest: 90 },
          { name: 'Leg press', sets: 3, reps: 12, rest: 60 },
          { name: 'Cadeira extensora', sets: 3, reps: 12, rest: 45 },
          { name: 'Mesa flexora', sets: 3, reps: 12, rest: 45 },
          { name: 'Panturrilha em pé', sets: 3, reps: 20, rest: 30 },
          { name: 'Alongamento', sets: 1, reps: '15 min', rest: 0 }
        ]
      }
    ]
  }
};

// Dados de progresso
export const mockProgress = {
  userId: DEMO_USER.id,
  period: 'last_30_days',
  
  // Métricas gerais
  overview: {
    workoutsCompleted: 12,
    totalWorkouts: 15,
    completionRate: 80,
    streakDays: 7,
    caloriesBurned: 3600,
    avgCaloriesPerDay: 2050
  },

  // Progresso de peso
  weightProgress: [
    { date: '2025-08-15', weight: 77.5 },
    { date: '2025-08-22', weight: 76.8 },
    { date: '2025-08-29', weight: 76.2 },
    { date: '2025-09-05', weight: 75.5 },
    { date: '2025-09-11', weight: 75.0 }
  ],

  // Progresso de medidas
  measurements: {
    chest: { current: 98, previous: 100, change: -2 },
    waist: { current: 85, previous: 88, change: -3 },
    hips: { current: 95, previous: 97, change: -2 },
    arms: { current: 32, previous: 31, change: +1 },
    thighs: { current: 58, previous: 60, change: -2 }
  },

  // Refeições dos últimos 7 dias
  recentMeals: [
    {
      date: '2025-09-11',
      meals: [
        { type: 'breakfast', logged: true, calories: 420 },
        { type: 'lunch', logged: true, calories: 580 },
        { type: 'snack', logged: false, calories: 0 },
        { type: 'dinner', logged: false, calories: 0 }
      ],
      totalCalories: 1000,
      targetCalories: 1800
    },
    {
      date: '2025-09-10',
      meals: [
        { type: 'breakfast', logged: true, calories: 450 },
        { type: 'lunch', logged: true, calories: 600 },
        { type: 'snack', logged: true, calories: 200 },
        { type: 'dinner', logged: true, calories: 550 }
      ],
      totalCalories: 1800,
      targetCalories: 1800
    }
  ],

  // Treinos dos últimos 7 dias
  recentWorkouts: [
    {
      date: '2025-09-10',
      name: 'Treino A - Peito e Tríceps',
      duration: 42,
      completed: true,
      caloriesBurned: 280,
      exercises: 7
    },
    {
      date: '2025-09-08',
      name: 'Treino B - Costas e Bíceps',
      duration: 45,
      completed: true,
      caloriesBurned: 300,
      exercises: 7
    },
    {
      date: '2025-09-06',
      name: 'Treino C - Pernas e Glúteos',
      duration: 48,
      completed: true,
      caloriesBurned: 350,
      exercises: 7
    }
  ]
};

// Histórico do Coach EVO
export const mockEVOHistory = [
  {
    id: 'msg-1',
    timestamp: '2025-09-11T14:30:00Z',
    type: 'user',
    message: 'Como posso melhorar minha dieta para perder peso mais rápido?'
  },
  {
    id: 'msg-2',
    timestamp: '2025-09-11T14:30:15Z',
    type: 'evo',
    message: 'Ótima pergunta! Com base no seu progresso atual, você já está no caminho certo. Para acelerar a perda de peso de forma saudável, sugiro: 1) Aumentar a ingestão de proteínas para 1.6g por kg de peso corporal, 2) Incluir mais vegetais de folhas verdes nas refeições, 3) Beber mais água (pelo menos 35ml por kg de peso). Quer que eu ajuste seu plano alimentar?'
  },
  {
    id: 'msg-3',
    timestamp: '2025-09-11T10:15:00Z',
    type: 'user',
    message: 'Estou sentindo dor no joelho após o treino de pernas. É normal?'
  },
  {
    id: 'msg-4',
    timestamp: '2025-09-11T10:15:30Z',
    type: 'evo',
    message: 'Dor no joelho pode ser um sinal de sobrecarga ou técnica inadequada. Recomendo: 1) Reduzir a carga nos exercícios de pernas por alguns dias, 2) Focar no aquecimento e alongamento, 3) Verificar a forma dos exercícios. Se a dor persistir por mais de 2 dias, consulte um profissional. Posso sugerir exercícios alternativos de baixo impacto?'
  }
];

// Conteúdo educativo
export const mockArticles = [
  {
    id: 'art-1',
    title: 'Como Acelerar o Metabolismo Naturalmente',
    category: 'nutrition',
    author: 'Dr. Ana Silva',
    publishedAt: '2025-09-10',
    readTime: 5,
    summary: 'Descubra 7 estratégias cientificamente comprovadas para aumentar seu metabolismo e queimar mais calorias.',
    image: '/images/metabolism.jpg',
    tags: ['metabolismo', 'queima de gordura', 'nutrição']
  },
  {
    id: 'art-2',
    title: 'Treino HIIT: Máximos Resultados em Menos Tempo',
    category: 'workout',
    author: 'Prof. Carlos Santos',
    publishedAt: '2025-09-09',
    readTime: 7,
    summary: 'Aprenda como o treino intervalado de alta intensidade pode revolucionar seus resultados.',
    image: '/images/hiit.jpg',
    tags: ['hiit', 'cardio', 'treino']
  },
  {
    id: 'art-3',
    title: 'A Importância do Sono na Perda de Peso',
    category: 'lifestyle',
    author: 'Dra. Maria Costa',
    publishedAt: '2025-09-08',
    readTime: 6,
    summary: 'Como a qualidade do sono afeta diretamente seus resultados na balança.',
    image: '/images/sleep.jpg',
    tags: ['sono', 'recuperação', 'hormônios']
  }
];

// Serviço mock principal
class MockDataService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.cache = new Map();
  }

  // Simular resposta da API (nunca falha para garantir fallback)
  async mockApiResponse(data, shouldFail = false, failureRate = 0) {
    await simulateNetworkDelay(100, 300); // Delay menor para melhor UX
    
    // Mock nunca falha para garantir fallback funcional
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      source: 'mock'
    };
  }

  // Health check sempre retorna sucesso para mock
  async healthCheck() {
    return this.mockApiResponse({
      status: 'healthy',
      services: {
        'users-service': 'online',
        'plans-service': 'online',
        'tracking-service': 'online',
        'evo-service': 'online',
        'content-service': 'online'
      },
      version: '1.0.0-mock'
    });
  }

  // Perfil do usuário
  async getUserProfile(userId) {
    return this.mockApiResponse(mockUserProfile);
  }

  // Plano do usuário
  async getUserPlan(userId) {
    return this.mockApiResponse(mockUserPlan);
  }

  // Progresso do usuário
  async getProgress(userId) {
    return this.mockApiResponse(mockProgress);
  }

  // Histórico do EVO
  async getEVOHistory(userId) {
    return this.mockApiResponse(mockEVOHistory);
  }

  // Artigos
  async getArticles(category = null) {
    const filteredArticles = category 
      ? mockArticles.filter(article => article.category === category)
      : mockArticles;
    
    return this.mockApiResponse(filteredArticles);
  }

  // Simular envio de mensagem para EVO
  async sendMessageToEVO(userId, message) {
    const responses = [
      'Entendi sua pergunta! Com base no seu perfil, posso te ajudar com isso.',
      'Ótima pergunta! Vou analisar seus dados e te dar uma resposta personalizada.',
      'Baseado no seu progresso atual, tenho algumas sugestões para você.',
      'Vou verificar seu plano atual e sugerir os melhores ajustes.'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return this.mockApiResponse({
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'evo',
      message: randomResponse,
      context: 'demo_response'
    });
  }

  // Registrar refeição
  async logMeal(userId, mealData) {
    return this.mockApiResponse({
      id: `meal-${Date.now()}`,
      userId,
      ...mealData,
      timestamp: new Date().toISOString(),
      status: 'logged'
    });
  }

  // Registrar treino
  async logWorkout(userId, workoutData) {
    return this.mockApiResponse({
      id: `workout-${Date.now()}`,
      userId,
      ...workoutData,
      timestamp: new Date().toISOString(),
      status: 'completed'
    });
  }
}

// Instância singleton
const mockDataService = new MockDataService();

export default mockDataService;

