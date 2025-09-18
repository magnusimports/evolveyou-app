/**
 * GERADOR DE TREINOS PERSONALIZADOS - EVOLVEYOU
 * 
 * Baseado nas respostas da anamnese inteligente (22 perguntas)
 * Considera local, experiência, frequência, objetivo, lesões e preferências
 */

const { aplicarAlgoritmosCompensatorios } = require('./algoritmosCompensatorios');
const { exercicios } = require('../data/exercicios');

/**
 * Analisa as respostas da anamnese e determina parâmetros do treino
 */
function analisarParametrosTreino(anamnese) {
  console.log('🏋️ Analisando parâmetros para treino personalizado...');
  
  const parametros = {
    // Análise do local de treino
    local: determinarLocalTreino(anamnese.local_treino),
    
    // Análise da experiência
    experiencia: determinarExperiencia(anamnese.experiencia_treino),
    
    // Análise da frequência
    frequencia: determinarFrequencia(anamnese.frequencia_treino),
    
    // Análise do objetivo
    objetivo: determinarObjetivo(anamnese.objetivo_principal),
    
    // Análise das atividades praticadas
    atividades: analisarAtividades(anamnese.atividades_praticadas),
    
    // Análise de lesões/limitações
    limitacoes: analisarLimitacoes(anamnese.lesoes_dores),
    
    // Análise da intensidade preferida
    intensidade: determinarIntensidade(anamnese.intensidade_treino),
    
    // Análise do tempo disponível
    tempoDisponivel: determinarTempo(anamnese.tempo_treino),
    
    // Dados físicos
    dadosFisicos: {
      peso: parseFloat(anamnese.peso),
      altura: parseFloat(anamnese.altura),
      idade: parseInt(anamnese.idade),
      sexo: anamnese.sexo
    }
  };
  
  console.log('📊 Parâmetros analisados:', parametros);
  return parametros;
}

/**
 * Determina o local de treino baseado na resposta
 */
function determinarLocalTreino(localResposta) {
  if (!localResposta) return 'casa';
  
  if (localResposta.includes('Casa')) return 'casa';
  if (localResposta.includes('Academia básica')) return 'academia_basica';
  if (localResposta.includes('Academia completa')) return 'academia_completa';
  if (localResposta.includes('CrossFit')) return 'crossfit';
  if (localResposta.includes('Ao ar livre')) return 'ar_livre';
  
  return 'casa'; // Default
}

/**
 * Determina o nível de experiência
 */
function determinarExperiencia(experienciaResposta) {
  if (!experienciaResposta) return 'iniciante';
  
  if (experienciaResposta.includes('Nunca treinei') || 
      experienciaResposta.includes('Menos de 6 meses')) {
    return 'iniciante';
  }
  
  if (experienciaResposta.includes('6 meses a 2 anos') ||
      experienciaResposta.includes('2 a 5 anos')) {
    return 'intermediario';
  }
  
  if (experienciaResposta.includes('Mais de 5 anos') ||
      experienciaResposta.includes('Atleta/competidor')) {
    return 'avancado';
  }
  
  return 'iniciante'; // Default
}

/**
 * Determina a frequência de treino
 */
function determinarFrequencia(frequenciaResposta) {
  if (!frequenciaResposta) return 3;
  
  if (frequenciaResposta.includes('1 a 2')) return 2;
  if (frequenciaResposta.includes('3 a 4')) return 3;
  if (frequenciaResposta.includes('5 a 6')) return 5;
  if (frequenciaResposta.includes('Todos os dias')) return 7;
  
  return 3; // Default
}

/**
 * Determina o objetivo principal
 */
function determinarObjetivo(objetivoResposta) {
  if (!objetivoResposta) return 'geral';
  
  if (objetivoResposta.includes('Emagrecer')) return 'emagrecimento';
  if (objetivoResposta.includes('Ganhar massa')) return 'hipertrofia';
  if (objetivoResposta.includes('Melhorar condicionamento')) return 'condicionamento';
  if (objetivoResposta.includes('Aumentar força')) return 'forca';
  if (objetivoResposta.includes('Saúde geral')) return 'saude';
  
  return 'geral'; // Default
}

/**
 * Analisa atividades praticadas
 */
function analisarAtividades(atividadesResposta) {
  const atividades = {
    musculacao: false,
    cardio: false,
    esportes: false,
    funcional: false,
    yoga: false,
    natacao: false
  };
  
  if (!atividadesResposta || !Array.isArray(atividadesResposta)) {
    return atividades;
  }
  
  atividadesResposta.forEach(atividade => {
    if (atividade.includes('Musculação')) atividades.musculacao = true;
    if (atividade.includes('Cardio') || atividade.includes('Corrida')) atividades.cardio = true;
    if (atividade.includes('Esportes')) atividades.esportes = true;
    if (atividade.includes('Funcional') || atividade.includes('CrossFit')) atividades.funcional = true;
    if (atividade.includes('Yoga') || atividade.includes('Pilates')) atividades.yoga = true;
    if (atividade.includes('Natação')) atividades.natacao = true;
  });
  
  return atividades;
}

/**
 * Analisa lesões e limitações
 */
function analisarLimitacoes(lesoesResposta) {
  const limitacoes = {
    joelho: false,
    lombar: false,
    ombro: false,
    punho: false,
    pescoco: false,
    tornozelo: false,
    nenhuma: false
  };
  
  if (!lesoesResposta) {
    limitacoes.nenhuma = true;
    return limitacoes;
  }
  
  if (lesoesResposta.includes('Não tenho')) {
    limitacoes.nenhuma = true;
    return limitacoes;
  }
  
  if (lesoesResposta.includes('Joelho')) limitacoes.joelho = true;
  if (lesoesResposta.includes('Lombar') || lesoesResposta.includes('Coluna')) limitacoes.lombar = true;
  if (lesoesResposta.includes('Ombro')) limitacoes.ombro = true;
  if (lesoesResposta.includes('Punho')) limitacoes.punho = true;
  if (lesoesResposta.includes('Pescoço')) limitacoes.pescoco = true;
  if (lesoesResposta.includes('Tornozelo')) limitacoes.tornozelo = true;
  
  return limitacoes;
}

/**
 * Determina intensidade preferida
 */
function determinarIntensidade(intensidadeResposta) {
  if (!intensidadeResposta) return 'moderada';
  
  if (intensidadeResposta.includes('Leve')) return 'leve';
  if (intensidadeResposta.includes('Moderada')) return 'moderada';
  if (intensidadeResposta.includes('Intensa')) return 'intensa';
  if (intensidadeResposta.includes('Muito intensa')) return 'muito_intensa';
  
  return 'moderada'; // Default
}

/**
 * Determina tempo disponível
 */
function determinarTempo(tempoResposta) {
  if (!tempoResposta) return 45;
  
  if (tempoResposta.includes('30')) return 30;
  if (tempoResposta.includes('45')) return 45;
  if (tempoResposta.includes('60')) return 60;
  if (tempoResposta.includes('90')) return 90;
  
  return 45; // Default
}

/**
 * Seleciona divisão de treino baseada na experiência e frequência
 */
function selecionarDivisaoTreino(parametros) {
  const { experiencia, frequencia, objetivo } = parametros;
  
  // Lógica de seleção de divisão
  if (frequencia <= 2) {
    return 'full_body'; // Full Body para baixa frequência
  }
  
  if (experiencia === 'iniciante') {
    if (frequencia <= 3) return 'full_body';
    return 'upper_lower'; // Upper/Lower para iniciantes com mais frequência
  }
  
  if (experiencia === 'intermediario') {
    if (frequencia <= 3) return 'upper_lower';
    if (frequencia <= 4) return 'abc';
    return 'push_pull_legs'; // Push/Pull/Legs para intermediários
  }
  
  if (experiencia === 'avancado') {
    if (frequencia <= 3) return 'upper_lower';
    if (frequencia <= 5) return 'push_pull_legs';
    return 'especializada'; // Divisão especializada para avançados
  }
  
  return 'full_body'; // Default
}

/**
 * Filtra exercícios baseado no local e limitações
 */
function filtrarExercicios(parametros) {
  const { local, limitacoes } = parametros;
  
  let exerciciosFiltrados = { ...exercicios };
  
  // Filtrar por local
  Object.keys(exerciciosFiltrados).forEach(categoria => {
    exerciciosFiltrados[categoria] = exerciciosFiltrados[categoria].filter(exercicio => {
      // Verificar se o exercício é adequado para o local
      if (local === 'casa' && exercicio.equipamento && 
          !['peso_corporal', 'halteres', 'elastico'].includes(exercicio.equipamento)) {
        return false;
      }
      
      if (local === 'academia_basica' && exercicio.equipamento === 'maquinas_especializadas') {
        return false;
      }
      
      return true;
    });
  });
  
  // Filtrar por limitações
  if (!limitacoes.nenhuma) {
    Object.keys(exerciciosFiltrados).forEach(categoria => {
      exerciciosFiltrados[categoria] = exerciciosFiltrados[categoria].filter(exercicio => {
        // Remover exercícios que podem agravar lesões
        if (limitacoes.joelho && exercicio.articulacoes?.includes('joelho') && 
            exercicio.impacto === 'alto') {
          return false;
        }
        
        if (limitacoes.lombar && exercicio.articulacoes?.includes('lombar') && 
            exercicio.tipo === 'composto') {
          return false;
        }
        
        if (limitacoes.ombro && exercicio.articulacoes?.includes('ombro') && 
            exercicio.movimento?.includes('overhead')) {
          return false;
        }
        
        return true;
      });
    });
  }
  
  return exerciciosFiltrados;
}

/**
 * Calcula séries, repetições e carga baseado nos parâmetros
 */
function calcularParametrosTreino(parametros) {
  const { experiencia, objetivo, intensidade, dadosFisicos } = parametros;
  
  let series, repeticoes, descanso, cargaBase;
  
  // Configuração baseada no objetivo
  switch (objetivo) {
    case 'forca':
      series = experiencia === 'iniciante' ? 3 : experiencia === 'intermediario' ? 4 : 5;
      repeticoes = '3-5';
      descanso = '3-5 min';
      cargaBase = dadosFisicos.peso * 0.8;
      break;
      
    case 'hipertrofia':
      series = experiencia === 'iniciante' ? 3 : 4;
      repeticoes = '8-12';
      descanso = '60-90 seg';
      cargaBase = dadosFisicos.peso * 0.6;
      break;
      
    case 'emagrecimento':
      series = 3;
      repeticoes = '12-15';
      descanso = '30-60 seg';
      cargaBase = dadosFisicos.peso * 0.5;
      break;
      
    case 'condicionamento':
      series = 3;
      repeticoes = '15-20';
      descanso = '30-45 seg';
      cargaBase = dadosFisicos.peso * 0.4;
      break;
      
    default:
      series = 3;
      repeticoes = '10-12';
      descanso = '60 seg';
      cargaBase = dadosFisicos.peso * 0.5;
  }
  
  // Ajustar pela intensidade
  const multiplicadorIntensidade = {
    'leve': 0.7,
    'moderada': 1.0,
    'intensa': 1.3,
    'muito_intensa': 1.5
  };
  
  cargaBase *= multiplicadorIntensidade[intensidade] || 1.0;
  
  // Ajustar pela experiência
  const multiplicadorExperiencia = {
    'iniciante': 0.8,
    'intermediario': 1.0,
    'avancado': 1.2
  };
  
  cargaBase *= multiplicadorExperiencia[experiencia] || 1.0;
  
  return {
    series,
    repeticoes,
    descanso,
    cargaBase: Math.round(cargaBase)
  };
}

/**
 * Gera treino para um dia específico
 */
function gerarTreinoDia(parametros, divisao, diaSemana, exerciciosFiltrados) {
  const parametrosTreino = calcularParametrosTreino(parametros);
  
  // Determinar grupos musculares para o dia
  const gruposMusculares = determinarGruposMusculares(divisao, diaSemana);
  
  if (gruposMusculares.includes('descanso')) {
    return {
      tipo: 'descanso',
      titulo: 'Dia de Descanso',
      descricao: 'Dia dedicado ao descanso e recuperação muscular',
      atividades: [
        'Caminhada leve (20-30 min)',
        'Alongamento (10-15 min)',
        'Hidratação adequada',
        'Sono reparador (7-9 horas)'
      ]
    };
  }
  
  const treino = {
    tipo: 'treino',
    titulo: `Treino ${divisao.toUpperCase()} - ${gruposMusculares.join('/')}`,
    gruposMusculares,
    duracao: parametros.tempoDisponivel,
    exercicios: [],
    observacoes: []
  };
  
  // Selecionar exercícios para cada grupo muscular
  gruposMusculares.forEach(grupo => {
    const exerciciosGrupo = exerciciosFiltrados[grupo] || [];
    
    if (exerciciosGrupo.length > 0) {
      // Selecionar 2-3 exercícios por grupo muscular
      const numExercicios = parametros.experiencia === 'iniciante' ? 2 : 
                           parametros.experiencia === 'intermediario' ? 3 : 4;
      
      for (let i = 0; i < Math.min(numExercicios, exerciciosGrupo.length); i++) {
        const exercicio = exerciciosGrupo[i];
        
        treino.exercicios.push({
          nome: exercicio.nome,
          grupo: grupo,
          series: parametrosTreino.series,
          repeticoes: parametrosTreino.repeticoes,
          descanso: parametrosTreino.descanso,
          carga: calcularCargaExercicio(exercicio, parametrosTreino.cargaBase),
          instrucoes: exercicio.instrucoes || 'Execute o movimento de forma controlada',
          equipamento: exercicio.equipamento || 'peso_corporal',
          dificuldade: exercicio.dificuldade || parametros.experiencia
        });
      }
    }
  });
  
  // Adicionar observações personalizadas
  treino.observacoes = gerarObservacoesTreino(parametros, treino);
  
  return treino;
}

/**
 * Determina grupos musculares para cada dia baseado na divisão
 */
function determinarGruposMusculares(divisao, diaSemana) {
  const divisoes = {
    full_body: {
      1: ['peito', 'costas', 'pernas', 'ombros'],
      2: ['descanso'],
      3: ['peito', 'costas', 'pernas', 'bracos'],
      4: ['descanso'],
      5: ['peito', 'costas', 'pernas', 'core'],
      6: ['descanso'],
      7: ['descanso']
    },
    
    upper_lower: {
      1: ['peito', 'costas', 'ombros', 'bracos'],
      2: ['pernas', 'gluteos', 'core'],
      3: ['descanso'],
      4: ['peito', 'costas', 'ombros', 'bracos'],
      5: ['pernas', 'gluteos', 'core'],
      6: ['descanso'],
      7: ['descanso']
    },
    
    abc: {
      1: ['peito', 'triceps', 'ombros'], // A
      2: ['costas', 'biceps'], // B
      3: ['pernas', 'gluteos', 'core'], // C
      4: ['descanso'],
      5: ['peito', 'triceps', 'ombros'], // A
      6: ['costas', 'biceps'], // B
      7: ['descanso']
    },
    
    push_pull_legs: {
      1: ['peito', 'ombros', 'triceps'], // Push
      2: ['costas', 'biceps'], // Pull
      3: ['pernas', 'gluteos'], // Legs
      4: ['descanso'],
      5: ['peito', 'ombros', 'triceps'], // Push
      6: ['costas', 'biceps'], // Pull
      7: ['pernas', 'gluteos'] // Legs
    }
  };
  
  return divisoes[divisao]?.[diaSemana] || ['descanso'];
}

/**
 * Calcula carga específica para um exercício
 */
function calcularCargaExercicio(exercicio, cargaBase) {
  if (exercicio.equipamento === 'peso_corporal') {
    return 'Peso corporal';
  }
  
  // Multiplicadores por tipo de exercício
  const multiplicadores = {
    'composto': 1.0,
    'isolado': 0.6,
    'funcional': 0.8
  };
  
  const multiplicador = multiplicadores[exercicio.tipo] || 0.8;
  const carga = Math.round(cargaBase * multiplicador);
  
  // Ajustar para múltiplos de 2.5kg (padrão de academia)
  return Math.round(carga / 2.5) * 2.5;
}

/**
 * Gera observações personalizadas para o treino
 */
function gerarObservacoesTreino(parametros, treino) {
  const observacoes = [];
  
  // Observações baseadas na experiência
  if (parametros.experiencia === 'iniciante') {
    observacoes.push('🔰 Foque na execução correta antes de aumentar a carga');
    observacoes.push('⏰ Respeite os tempos de descanso para recuperação adequada');
  } else if (parametros.experiencia === 'avancado') {
    observacoes.push('💪 Considere técnicas avançadas como drop-sets ou supersets');
    observacoes.push('📈 Monitore a progressão de carga semanalmente');
  }
  
  // Observações baseadas no objetivo
  if (parametros.objetivo === 'emagrecimento') {
    observacoes.push('🔥 Mantenha intensidade alta para maximizar gasto calórico');
    observacoes.push('⏱️ Considere reduzir o descanso entre séries');
  } else if (parametros.objetivo === 'hipertrofia') {
    observacoes.push('🎯 Foque na conexão mente-músculo durante cada repetição');
    observacoes.push('📊 Aumente a carga quando conseguir fazer todas as séries facilmente');
  }
  
  // Observações baseadas em limitações
  if (!parametros.limitacoes.nenhuma) {
    observacoes.push('⚠️ Exercícios adaptados para suas limitações físicas');
    observacoes.push('🩺 Pare imediatamente se sentir dor ou desconforto');
  }
  
  // Observações baseadas no local
  if (parametros.local === 'casa') {
    observacoes.push('🏠 Treino adaptado para execução em casa');
    observacoes.push('💡 Use objetos domésticos como peso adicional se necessário');
  }
  
  observacoes.push('💧 Mantenha-se hidratado durante todo o treino');
  observacoes.push('📱 Use o sistema de check-in para acompanhar seu progresso');
  
  return observacoes;
}

/**
 * Gera programa de treino completo (7 dias)
 */
function gerarTreinoPersonalizado(anamnese) {
  console.log('🏋️ Gerando treino personalizado...');
  
  // 1. Analisar parâmetros da anamnese
  const parametros = analisarParametrosTreino(anamnese);
  
  // 2. Selecionar divisão de treino
  const divisao = selecionarDivisaoTreino(parametros);
  
  // 3. Filtrar exercícios por local e limitações
  const exerciciosFiltrados = filtrarExercicios(parametros);
  
  // 4. Gerar treino para cada dia da semana
  const programaSemanal = {
    informacoes: {
      divisao,
      frequenciaSemanal: parametros.frequencia,
      duracaoSessao: parametros.tempoDisponivel,
      objetivo: parametros.objetivo,
      experiencia: parametros.experiencia,
      local: parametros.local
    },
    treinos: {}
  };
  
  // Gerar treinos para cada dia da semana
  for (let dia = 1; dia <= 7; dia++) {
    const nomeDia = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'][dia];
    
    programaSemanal.treinos[nomeDia] = gerarTreinoDia(
      parametros, 
      divisao, 
      dia, 
      exerciciosFiltrados
    );
  }
  
  // 5. Adicionar recomendações gerais
  programaSemanal.recomendacoes = gerarRecomendacoesGerais(parametros);
  
  console.log('✅ Treino personalizado gerado:', programaSemanal);
  
  return programaSemanal;
}

/**
 * Gera recomendações gerais para o programa
 */
function gerarRecomendacoesGerais(parametros) {
  const recomendacoes = [];
  
  // Recomendações baseadas na frequência
  if (parametros.frequencia <= 2) {
    recomendacoes.push('📅 Com baixa frequência, foque em exercícios compostos');
    recomendacoes.push('💪 Cada treino deve trabalhar o corpo todo');
  } else if (parametros.frequencia >= 5) {
    recomendacoes.push('🔄 Alta frequência permite maior especialização');
    recomendacoes.push('😴 Garanta pelo menos 1 dia de descanso completo');
  }
  
  // Recomendações baseadas no objetivo
  if (parametros.objetivo === 'emagrecimento') {
    recomendacoes.push('🏃 Combine treino com atividade cardiovascular');
    recomendacoes.push('🍽️ Mantenha déficit calórico através da dieta');
  } else if (parametros.objetivo === 'hipertrofia') {
    recomendacoes.push('🥩 Consuma proteína adequada (1.6-2.2g/kg)');
    recomendacoes.push('😴 Priorize sono de qualidade para recuperação');
  }
  
  // Recomendações baseadas na experiência
  if (parametros.experiencia === 'iniciante') {
    recomendacoes.push('📚 Considere aulas ou personal trainer inicialmente');
    recomendacoes.push('📈 Progressão gradual é mais importante que intensidade');
  }
  
  recomendacoes.push('📊 Registre seus treinos para acompanhar evolução');
  recomendacoes.push('🎯 Reavalie o programa a cada 4-6 semanas');
  
  return recomendacoes;
}

/**
 * Gera variações do treino para evitar monotonia
 */
function gerarVariacoesTreino(programaBase, numeroSemanas = 4) {
  const variacoes = [programaBase]; // Semana 1 é o programa base
  
  for (let semana = 2; semana <= numeroSemanas; semana++) {
    const variacao = JSON.parse(JSON.stringify(programaBase)); // Deep copy
    
    // Variar exercícios mantendo grupos musculares
    Object.keys(variacao.treinos).forEach(dia => {
      const treino = variacao.treinos[dia];
      
      if (treino.tipo === 'treino') {
        treino.exercicios = treino.exercicios.map(exercicio => {
          // 30% de chance de trocar por exercício equivalente
          if (Math.random() < 0.3) {
            return gerarExercicioEquivalente(exercicio);
          }
          return exercicio;
        });
      }
    });
    
    variacoes.push(variacao);
  }
  
  return variacoes;
}

/**
 * Gera exercício equivalente para o mesmo grupo muscular
 */
function gerarExercicioEquivalente(exercicioOriginal) {
  // Lógica simplificada - em produção, usar base de equivalências
  const equivalencias = {
    'Flexão de braço': ['Flexão inclinada', 'Flexão com joelhos', 'Flexão diamante'],
    'Agachamento': ['Agachamento sumo', 'Agachamento búlgaro', 'Agachamento jump'],
    'Prancha': ['Prancha lateral', 'Prancha com elevação', 'Prancha dinâmica']
  };
  
  const equivalentes = equivalencias[exercicioOriginal.nome];
  if (equivalentes && equivalentes.length > 0) {
    const novoNome = equivalentes[Math.floor(Math.random() * equivalentes.length)];
    return {
      ...exercicioOriginal,
      nome: novoNome
    };
  }
  
  return exercicioOriginal;
}

module.exports = {
  gerarTreinoPersonalizado,
  analisarParametrosTreino,
  selecionarDivisaoTreino,
  filtrarExercicios,
  gerarTreinoDia,
  gerarVariacoesTreino,
  gerarRecomendacoesGerais
};

