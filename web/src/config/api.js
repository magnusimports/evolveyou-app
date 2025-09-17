// Configuração da API para conectar frontend com backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Configuração base para requisições
const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
};

// Função helper para fazer requisições
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...apiConfig,
    ...options,
    headers: {
      ...apiConfig.headers,
      ...options.headers,
    }
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// APIs específicas
export const alimentosAPI = {
  search: (query, categoria = '', limit = 20) => 
    apiRequest(`/api/alimentos/search?q=${encodeURIComponent(query)}&categoria=${encodeURIComponent(categoria)}&limit=${limit}`),
  
  categorias: () => 
    apiRequest('/api/alimentos/categorias'),
  
  detalhes: (id) => 
    apiRequest(`/api/alimentos/${id}`),
  
  calcularNutrientes: (alimentos) => 
    apiRequest('/api/alimentos/nutrientes/calcular', {
      method: 'POST',
      body: JSON.stringify({ alimentos })
    })
};

export const exerciciosAPI = {
  search: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append('q', params.q);
    if (params.categoria) queryParams.append('categoria', params.categoria);
    if (params.nivel) queryParams.append('nivel', params.nivel);
    if (params.equipamento) queryParams.append('equipamento', params.equipamento);
    if (params.limit) queryParams.append('limit', params.limit);
    
    return apiRequest(`/api/exercicios/search?${queryParams.toString()}`);
  },
  
  categorias: () => 
    apiRequest('/api/exercicios/categorias'),
  
  equipamentos: () => 
    apiRequest('/api/exercicios/equipamentos'),
  
  detalhes: (id) => 
    apiRequest(`/api/exercicios/${id}`),
  
  gerarTreino: (params) => 
    apiRequest('/api/exercicios/treino/gerar', {
      method: 'POST',
      body: JSON.stringify(params)
    }),
  
  historico: () => 
    apiRequest('/api/exercicios/historico')
};

export const coachAPI = {
  chat: (message, context = {}) => 
    apiRequest('/api/coach/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context })
    }),
  
  planoNutricional: (dados) => 
    apiRequest('/api/coach/plano-nutricional', {
      method: 'POST',
      body: JSON.stringify(dados)
    }),
  
  analisarProgresso: (dadosProgresso, objetivo = 'melhoria_geral') => 
    apiRequest('/api/coach/analise-progresso', {
      method: 'POST',
      body: JSON.stringify({ dados_progresso: dadosProgresso, objetivo })
    }),
  
  dicasDiarias: (categoria = 'geral', nivel = 'iniciante') => 
    apiRequest(`/api/coach/dicas-diarias?categoria=${categoria}&nivel=${nivel}`),
  
  avaliarRefeicao: (alimentos, objetivo = 'equilibrio', tipo = 'almoço') => 
    apiRequest('/api/coach/avaliar-refeicao', {
      method: 'POST',
      body: JSON.stringify({ alimentos, objetivo, tipo })
    })
};

export const fitnessAPI = {
  profile: () => 
    apiRequest('/api/fitness/profile'),
  
  metrics: () => 
    apiRequest('/api/fitness/metrics'),
  
  activityRings: () => 
    apiRequest('/api/fitness/activity-rings')
};

export default {
  alimentos: alimentosAPI,
  exercicios: exerciciosAPI,
  coach: coachAPI,
  fitness: fitnessAPI
};

