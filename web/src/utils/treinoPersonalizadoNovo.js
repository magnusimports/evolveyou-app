/**
 * GERADOR DE TREINOS PERSONALIZADOS - EVOLVEYOU V2
 * 
 * Baseado nas respostas da anamnese inteligente (22 perguntas)
 * Usa base completa de 1.023 exercícios com GIFs integrados
 */

import { obterExerciciosParaTreino, buscarPorId, GRUPOS_MUSCULARES_PT } from './exerciciosDatabase.js';

/**
 * Gerar treino personalizado baseado na anamnese
 */
export const gerarTreinoPersonalizado = (anamnese) => {
  console.log('🏋️ Gerando treino personalizado com base completa de exercícios...');
  
  try {
    // Analisar parâmetros da anamnese
    const parametros = analisarParametrosTreino(anamnese);
    
    // Determinar divisão de treino
    const divisao = determinarDivisaoTreino(parametros);
    
    // Gerar treino do dia
    const treinoDoDia = gerarTreinoDoDia(parametros, divisao);
    
    return treinoDoDia;
    
  } catch (error) {
    console.error('Erro ao gerar treino personalizado:', error);
    return gerarTreinoFallback(anamnese);
  }
};

/**
 * Analisar parâmetros da anamnese
 */
const analisarParametrosTreino = (anamnese) => {
  return {
    // Local de treino
    local: determinarLocalTreino(anamnese.local_treino),
    
    // Experiência
    experiencia: determinarExperiencia(anamnese.experiencia_treino),
    
    // Frequência semanal
    frequencia: determinarFrequencia(anamnese.frequencia_treino),
    
    // Objetivo principal
    objetivo: determinarObjetivo(anamnese.objetivo_principal),
    
    // Atividades praticadas
    atividades: analisarAtividades(anamnese.atividades_praticadas || []),
    
    // Lesões/limitações
    limitacoes: analisarLimitacoes(anamnese.lesoes_dores || []),
    
    // Intensidade preferida
    intensidade: determinarIntensidade(anamnese.intensidade_treino),
    
    // Tempo disponível
    tempoDisponivel: determinarTempo(anamnese.tempo_treino),
    
    // Dados físicos
    dadosFisicos: {
      peso: parseFloat(anamnese.peso) || 70,
      altura: parseFloat(anamnese.altura) || 170,
      idade: parseInt(anamnese.idade) || 30,
      sexo: anamnese.sexo || 'masculino'
    }
  };
};

/**
 * Determinar local de treino
 */
const determinarLocalTreino = (localAnamnese) => {
  const mapeamento = {
    'casa': 'casa',
    'academia': 'academia',
    'academia_basica': 'academia_basica',
    'academia_completa': 'academia_completa',
    'crossfit': 'crossfit',
    'ar_livre': 'ar_livre'
  };
  
  return mapeamento[localAnamnese] || 'casa';
};

/**
 * Determinar experiência
 */
const determinarExperiencia = (experienciaAnamnese) => {
  const mapeamento = {
    'nunca_treinei': 'iniciante',
    'menos_6_meses': 'iniciante',
    '6_meses_1_ano': 'intermediario',
    '1_2_anos': 'intermediario',
    'mais_2_anos': 'avancado'
  };
  
  return mapeamento[experienciaAnamnese] || 'iniciante';
};

/**
 * Determinar frequência semanal
 */
const determinarFrequencia = (frequenciaAnamnese) => {
  const mapeamento = {
    '1_2_dias': 2,
    '3_4_dias': 4,
    '5_6_dias': 6,
    'todos_dias': 7
  };
  
  return mapeamento[frequenciaAnamnese] || 3;
};

/**
 * Determinar objetivo principal
 */
const determinarObjetivo = (objetivoAnamnese) => {
  const mapeamento = {
    'emagrecer': 'emagrecimento',
    'ganhar_massa': 'hipertrofia',
    'definir': 'definicao',
    'forca': 'forca',
    'condicionamento': 'condicionamento',
    'saude': 'saude_geral'
  };
  
  return mapeamento[objetivoAnamnese] || 'saude_geral';
};

/**
 * Analisar atividades praticadas
 */
const analisarAtividades = (atividades) => {
  if (!Array.isArray(atividades)) return [];
  
  return atividades.map(atividade => {
    const mapeamento = {
      'musculacao': 'musculacao',
      'cardio': 'cardio',
      'funcional': 'funcional',
      'crossfit': 'crossfit',
      'yoga': 'yoga',
      'pilates': 'pilates',
      'natacao': 'natacao',
      'corrida': 'corrida',
      'ciclismo': 'ciclismo'
    };
    
    return mapeamento[atividade] || atividade;
  });
};

/**
 * Analisar lesões e limitações
 */
const analisarLimitacoes = (lesoes) => {
  if (!Array.isArray(lesoes)) return [];
  
  return lesoes.map(lesao => {
    const mapeamento = {
      'joelho': 'joelho',
      'lombar': 'lombar',
      'ombro': 'ombro',
      'punho': 'punho',
      'pescoco': 'pescoco',
      'tornozelo': 'tornozelo'
    };
    
    return mapeamento[lesao] || lesao;
  });
};

/**
 * Determinar intensidade
 */
const determinarIntensidade = (intensidadeAnamnese) => {
  const mapeamento = {
    'leve': 'leve',
    'moderada': 'moderada',
    'intensa': 'intensa',
    'muito_intensa': 'muito_intensa'
  };
  
  return mapeamento[intensidadeAnamnese] || 'moderada';
};

/**
 * Determinar tempo disponível
 */
const determinarTempo = (tempoAnamnese) => {
  const mapeamento = {
    '30_min': 30,
    '45_min': 45,
    '60_min': 60,
    '90_min': 90,
    'mais_90_min': 120
  };
  
  return mapeamento[tempoAnamnese] || 60;
};

/**
 * Determinar divisão de treino baseada na frequência e experiência
 */
const determinarDivisaoTreino = (parametros) => {
  const { frequencia, experiencia } = parametros;
  
  if (frequencia <= 2) {
    return 'full_body';
  } else if (frequencia <= 3) {
    return experiencia === 'iniciante' ? 'full_body' : 'upper_lower';
  } else if (frequencia <= 4) {
    return experiencia === 'iniciante' ? 'upper_lower' : 'abc';
  } else if (frequencia <= 6) {
    return 'push_pull_legs';
  } else {
    return 'especializada';
  }
};

/**
 * Gerar treino do dia baseado na divisão
 */
const gerarTreinoDoDia = (parametros, divisao) => {
  const hoje = new Date();
  const diaSemana = hoje.getDay(); // 0 = domingo, 1 = segunda, etc.
  
  // Verificar se é domingo (dia de descanso)
  if (diaSemana === 0) {
    return {
      tipo: 'descanso',
      titulo: 'Dia de Descanso',
      observacoes: ['Aproveite para relaxar e se recuperar!']
    };
  }
  
  // Determinar grupos musculares do dia
  const gruposMusculares = determinarGruposMuscularesDoDia(divisao, diaSemana);
  
  // Buscar exercícios na base completa
  const exercicios = obterExerciciosParaTreino({
    gruposMuscularesDesejados: gruposMusculares,
    local: parametros.local,
    experiencia: parametros.experiencia,
    categoria: determinarCategoriaPorObjetivo(parametros.objetivo),
    quantidade: determinarQuantidadeExercicios(parametros)
  });
  
  // Processar exercícios para o formato do treino
  const exerciciosProcessados = exercicios.map(exercicio => 
    processarExercicio(exercicio, parametros)
  );
  
  return {
    tipo: 'treino',
    titulo: gerarTituloTreino(divisao, gruposMusculares),
    grupos: gruposMusculares.map(grupo => GRUPOS_MUSCULARES_PT[grupo] || grupo),
    duracao: parametros.tempoDisponivel,
    exercicios: exerciciosProcessados,
    observacoes: gerarObservacoes(parametros)
  };
};

/**
 * Determinar grupos musculares do dia baseado na divisão
 */
const determinarGruposMuscularesDoDia = (divisao, diaSemana) => {
  const divisoes = {
    'full_body': ['peitoral', 'costas', 'ombros', 'quadriceps'],
    'upper_lower': diaSemana % 2 === 1 ? ['peitoral', 'costas', 'ombros', 'biceps', 'triceps'] : ['quadriceps', 'gluteos', 'posterior_coxa'],
    'abc': {
      1: ['peitoral', 'triceps'], // Segunda - A
      2: ['costas', 'biceps'],    // Terça - B  
      3: ['quadriceps', 'gluteos'], // Quarta - C
      4: ['peitoral', 'triceps'], // Quinta - A
      5: ['costas', 'biceps'],    // Sexta - B
      6: ['quadriceps', 'gluteos'] // Sábado - C
    },
    'push_pull_legs': {
      1: ['peitoral', 'ombros', 'triceps'], // Segunda - Push
      2: ['costas', 'biceps'],              // Terça - Pull
      3: ['quadriceps', 'gluteos'],         // Quarta - Legs
      4: ['peitoral', 'ombros', 'triceps'], // Quinta - Push
      5: ['costas', 'biceps'],              // Sexta - Pull
      6: ['quadriceps', 'gluteos']          // Sábado - Legs
    }
  };
  
  if (typeof divisoes[divisao] === 'object' && !Array.isArray(divisoes[divisao])) {
    return divisoes[divisao][diaSemana] || divisoes[divisao][1];
  }
  
  return divisoes[divisao] || ['peitoral', 'costas'];
};

/**
 * Determinar categoria por objetivo
 */
const determinarCategoriaPorObjetivo = (objetivo) => {
  const mapeamento = {
    'emagrecimento': 'hiit',
    'hipertrofia': 'força',
    'definicao': 'força',
    'forca': 'força',
    'condicionamento': 'funcional',
    'saude_geral': 'força'
  };
  
  return mapeamento[objetivo] || 'força';
};

/**
 * Determinar quantidade de exercícios
 */
const determinarQuantidadeExercicios = (parametros) => {
  const { experiencia, tempoDisponivel } = parametros;
  
  if (tempoDisponivel <= 30) return 3;
  if (tempoDisponivel <= 45) return 4;
  if (tempoDisponivel <= 60) return 5;
  
  return experiencia === 'avancado' ? 7 : 6;
};

/**
 * Processar exercício para formato do treino
 */
const processarExercicio = (exercicio, parametros) => {
  const { experiencia, objetivo, dadosFisicos } = parametros;
  
  // Determinar séries e repetições baseado na experiência e objetivo
  const { series, repeticoes } = determinarSeriesReps(experiencia, objetivo);
  
  // Calcular carga sugerida
  const carga = calcularCargaSugerida(exercicio, dadosFisicos, experiencia);
  
  // Determinar tempo de descanso
  const descanso = determinarTempoDescanso(objetivo, experiencia);
  
  return {
    nome: exercicio.name,
    grupoMuscular: exercicio.muscle_groups.primary[0] || 'geral',
    series,
    repeticoes,
    descanso,
    carga,
    instrucoes: exercicio.premium_guidance?.form_tips || 'Execute com boa forma',
    gif_url: exercicio.gif_url,
    met_value: exercicio.met_value,
    difficulty_level: exercicio.difficulty_level
  };
};

/**
 * Determinar séries e repetições
 */
const determinarSeriesReps = (experiencia, objetivo) => {
  const configuracoes = {
    'iniciante': {
      'emagrecimento': { series: 3, repeticoes: '12-15' },
      'hipertrofia': { series: 3, repeticoes: '10-12' },
      'forca': { series: 3, repeticoes: '6-8' },
      'default': { series: 3, repeticoes: '10-12' }
    },
    'intermediario': {
      'emagrecimento': { series: 4, repeticoes: '15-20' },
      'hipertrofia': { series: 4, repeticoes: '8-12' },
      'forca': { series: 4, repeticoes: '4-6' },
      'default': { series: 4, repeticoes: '8-12' }
    },
    'avancado': {
      'emagrecimento': { series: 5, repeticoes: '15-25' },
      'hipertrofia': { series: 5, repeticoes: '6-10' },
      'forca': { series: 5, repeticoes: '3-5' },
      'default': { series: 5, repeticoes: '6-10' }
    }
  };
  
  return configuracoes[experiencia]?.[objetivo] || configuracoes[experiencia]?.default || { series: 3, repeticoes: '10-12' };
};

/**
 * Calcular carga sugerida
 */
const calcularCargaSugerida = (exercicio, dadosFisicos, experiencia) => {
  const { peso } = dadosFisicos;
  
  // Se é exercício de peso corporal
  if (exercicio.equipment.includes('não especificado') || 
      exercicio.category.includes('calistenia')) {
    return 'Peso corporal';
  }
  
  // Multiplicadores por experiência
  const multiplicadores = {
    'iniciante': 0.4,
    'intermediario': 0.6,
    'avancado': 0.8
  };
  
  const multiplicador = multiplicadores[experiencia] || 0.5;
  const cargaCalculada = Math.round((peso * multiplicador) / 2.5) * 2.5;
  
  return `${cargaCalculada}kg`;
};

/**
 * Determinar tempo de descanso
 */
const determinarTempoDescanso = (objetivo, experiencia) => {
  const tempos = {
    'emagrecimento': '45s',
    'hipertrofia': '60s',
    'forca': '90s',
    'condicionamento': '30s',
    'default': '60s'
  };
  
  return tempos[objetivo] || tempos.default;
};

/**
 * Gerar título do treino
 */
const gerarTituloTreino = (divisao, gruposMusculares) => {
  const titulos = {
    'full_body': 'Treino Full Body',
    'upper_lower': gruposMusculares.includes('peitoral') ? 'Treino Upper Body' : 'Treino Lower Body',
    'abc': `Treino ${gruposMusculares.includes('peitoral') ? 'A' : gruposMusculares.includes('costas') ? 'B' : 'C'}`,
    'push_pull_legs': gruposMusculares.includes('peitoral') ? 'Treino Push' : 
                      gruposMusculares.includes('costas') ? 'Treino Pull' : 'Treino Legs'
  };
  
  return titulos[divisao] || 'Treino Personalizado';
};

/**
 * Gerar observações personalizadas
 */
const gerarObservacoes = (parametros) => {
  const observacoes = [];
  
  observacoes.push(`🎯 Treino adaptado para ${parametros.objetivo}`);
  observacoes.push(`🏠 Exercícios adequados para ${parametros.local}`);
  observacoes.push(`💪 Nível ${parametros.experiencia} baseado na sua experiência`);
  
  if (parametros.limitacoes.length > 0) {
    observacoes.push(`⚠️ Adaptado para limitações: ${parametros.limitacoes.join(', ')}`);
  }
  
  observacoes.push('💧 Mantenha-se hidratado durante o treino');
  
  return observacoes;
};

/**
 * Treino fallback em caso de erro
 */
const gerarTreinoFallback = (anamnese) => {
  console.log('🔄 Usando treino fallback...');
  
  return {
    tipo: 'treino',
    titulo: 'Treino Básico',
    grupos: ['Peito', 'Costas'],
    duracao: 45,
    exercicios: [
      {
        nome: 'Flexão de braço',
        grupoMuscular: 'Peito',
        series: 3,
        repeticoes: '10-12',
        descanso: '60s',
        carga: 'Peso corporal',
        instrucoes: 'Mantenha o corpo alinhado'
      },
      {
        nome: 'Remada com garrafa',
        grupoMuscular: 'Costas',
        series: 3,
        repeticoes: '12-15',
        descanso: '60s',
        carga: '5L cada mão',
        instrucoes: 'Puxe o cotovelo para trás'
      }
    ],
    observacoes: [
      '🔰 Treino básico de segurança',
      '💪 Foque na execução correta'
    ]
  };
};

export default {
  gerarTreinoPersonalizado
};

