/**
 * Algoritmo TMB/GET Personalizado - EvolveYou
 * Baseado na Equação de Mifflin-St Jeor com fatores de ajuste personalizados
 */

// Fatores de ajuste baseados na anamnese
const ADJUSTMENT_FACTORS = {
  // Composição corporal (pergunta 6)
  body_composition: {
    'very_thin': 0.95,      // Muito magro
    'thin': 0.98,           // Magro
    'athletic': 1.08,       // Atlético (+8%)
    'normal': 1.0,          // Normal
    'overweight': 1.02      // Acima do peso
  },
  
  // Experiência de treino (pergunta 9)
  training_experience: {
    'beginner': 1.0,        // Iniciante
    'intermediate': 1.02,   // Intermediário (+2%)
    'advanced': 1.05        // Avançado (+5%)
  },
  
  // Uso de ergogênicos (pergunta 16)
  ergogenic_use: {
    'none': 1.0,           // Não usa
    'supplements': 1.03,   // Suplementos básicos (+3%)
    'hormones': 1.10       // Hormônios/esteroides (+10%)
  },
  
  // Nível de atividade física (pergunta 7)
  activity_level: {
    'sedentary': 1.2,      // Sedentário
    'light': 1.375,        // Levemente ativo
    'moderate': 1.55,      // Moderadamente ativo
    'active': 1.725,       // Muito ativo
    'very_active': 1.9     // Extremamente ativo
  }
}

/**
 * Calcula a Taxa Metabólica Basal (TMB) usando a equação de Mifflin-St Jeor
 * @param {Object} userData - Dados do usuário
 * @param {string} userData.gender - 'male' ou 'female'
 * @param {number} userData.weight - Peso em kg
 * @param {number} userData.height - Altura em cm
 * @param {number} userData.age - Idade em anos
 * @returns {number} TMB em kcal/dia
 */
export const calculateTMB = (userData) => {
  const { gender, weight, height, age } = userData
  
  if (!weight || !height || !age || !gender) {
    throw new Error('Dados incompletos para cálculo do TMB')
  }
  
  const w = parseFloat(weight)
  const h = parseFloat(height)
  const a = parseFloat(age)
  
  let tmb
  if (gender === 'male') {
    tmb = (10 * w) + (6.25 * h) - (5 * a) + 5
  } else {
    tmb = (10 * w) + (6.25 * h) - (5 * a) - 161
  }
  
  return Math.round(tmb)
}

/**
 * Aplica fatores de ajuste personalizados ao TMB
 * @param {number} baseTMB - TMB base calculado
 * @param {Object} anamnesisData - Dados da anamnese
 * @returns {number} TMB ajustado
 */
export const applyPersonalizedFactors = (baseTMB, anamnesisData) => {
  let adjustedTMB = baseTMB
  
  // Fator de composição corporal
  const bodyComposition = anamnesisData.body_composition || 'normal'
  const bodyFactor = ADJUSTMENT_FACTORS.body_composition[bodyComposition] || 1.0
  adjustedTMB *= bodyFactor
  
  // Fator de experiência de treino
  const experience = anamnesisData.training_experience || 'beginner'
  const experienceFactor = ADJUSTMENT_FACTORS.training_experience[experience] || 1.0
  adjustedTMB *= experienceFactor
  
  // Fator de uso de ergogênicos
  const ergogenicUse = anamnesisData.ergogenic_use || 'none'
  const ergogenicFactor = ADJUSTMENT_FACTORS.ergogenic_use[ergogenicUse] || 1.0
  adjustedTMB *= ergogenicFactor
  
  return Math.round(adjustedTMB)
}

/**
 * Calcula o Gasto Energético Total (GET)
 * @param {number} adjustedTMB - TMB ajustado
 * @param {string} activityLevel - Nível de atividade física
 * @returns {number} GET em kcal/dia
 */
export const calculateGET = (adjustedTMB, activityLevel) => {
  const activityFactor = ADJUSTMENT_FACTORS.activity_level[activityLevel] || 1.2
  return Math.round(adjustedTMB * activityFactor)
}

/**
 * Função principal que calcula TMB e GET personalizados
 * @param {Object} userData - Dados básicos do usuário
 * @param {Object} anamnesisData - Dados da anamnese completa
 * @returns {Object} Resultado com TMB e GET
 */
export const calculatePersonalizedMetabolism = (userData, anamnesisData) => {
  try {
    // 1. Calcular TMB base
    const baseTMB = calculateTMB(userData)
    
    // 2. Aplicar fatores de ajuste personalizados
    const adjustedTMB = applyPersonalizedFactors(baseTMB, anamnesisData)
    
    // 3. Calcular GET
    const activityLevel = anamnesisData.activity_level || 'sedentary'
    const get = calculateGET(adjustedTMB, activityLevel)
    
    // 4. Calcular diferença percentual
    const adjustmentPercentage = ((adjustedTMB - baseTMB) / baseTMB * 100).toFixed(1)
    
    return {
      baseTMB,
      adjustedTMB,
      get,
      adjustmentPercentage,
      factors: {
        body_composition: ADJUSTMENT_FACTORS.body_composition[anamnesisData.body_composition || 'normal'],
        training_experience: ADJUSTMENT_FACTORS.training_experience[anamnesisData.training_experience || 'beginner'],
        ergogenic_use: ADJUSTMENT_FACTORS.ergogenic_use[anamnesisData.ergogenic_use || 'none'],
        activity_level: ADJUSTMENT_FACTORS.activity_level[activityLevel]
      }
    }
  } catch (error) {
    console.error('Erro no cálculo do metabolismo personalizado:', error)
    throw error
  }
}

/**
 * Mapeia respostas da anamnese para os fatores do algoritmo
 * @param {Object} anamnesisAnswers - Respostas da anamnese
 * @returns {Object} Dados formatados para o algoritmo
 */
export const mapAnamnesisToFactors = (anamnesisAnswers) => {
  return {
    // Pergunta 6: Como você descreveria seu corpo hoje?
    body_composition: mapBodyComposition(anamnesisAnswers.body_description),
    
    // Pergunta 7: Atividade no trabalho
    work_activity: anamnesisAnswers.work_activity_level,
    
    // Pergunta 8: Atividade no tempo livre
    leisure_activity: anamnesisAnswers.leisure_activity_level,
    
    // Pergunta 9: Experiência com treinos
    training_experience: anamnesisAnswers.training_experience,
    
    // Pergunta 16: Uso de ergogênicos
    ergogenic_use: mapErgogenicUse(anamnesisAnswers.ergogenic_use),
    
    // Combinação das atividades para nível geral
    activity_level: calculateOverallActivityLevel(
      anamnesisAnswers.work_activity_level,
      anamnesisAnswers.leisure_activity_level
    )
  }
}

// Funções auxiliares de mapeamento
const mapBodyComposition = (bodyDescription) => {
  const mapping = {
    'very_thin': 'very_thin',
    'thin': 'thin', 
    'athletic': 'athletic',
    'normal': 'normal',
    'overweight': 'overweight'
  }
  return mapping[bodyDescription] || 'normal'
}

const mapErgogenicUse = (ergogenicData) => {
  if (!ergogenicData || ergogenicData === 'no') return 'none'
  if (ergogenicData === 'supplements') return 'supplements'
  if (ergogenicData === 'hormones') return 'hormones'
  return 'none'
}

const calculateOverallActivityLevel = (workLevel, leisureLevel) => {
  // Lógica para combinar atividade no trabalho e tempo livre
  const workWeight = 0.6  // 60% peso para trabalho
  const leisureWeight = 0.4  // 40% peso para lazer
  
  const levelValues = {
    'sedentary': 1,
    'light': 2,
    'moderate': 3,
    'active': 4,
    'very_active': 5
  }
  
  const workValue = levelValues[workLevel] || 1
  const leisureValue = levelValues[leisureLevel] || 1
  
  const combinedValue = (workValue * workWeight) + (leisureValue * leisureWeight)
  
  if (combinedValue <= 1.5) return 'sedentary'
  if (combinedValue <= 2.5) return 'light'
  if (combinedValue <= 3.5) return 'moderate'
  if (combinedValue <= 4.5) return 'active'
  return 'very_active'
}

export default {
  calculateTMB,
  applyPersonalizedFactors,
  calculateGET,
  calculatePersonalizedMetabolism,
  mapAnamnesisToFactors,
  ADJUSTMENT_FACTORS
}

