/**
 * ALGORITMOS DE TREINO COMPENSATÓRIOS - EVOLVEYOU
 * 
 * Baseados nas preferências e limitações específicas da anamnese
 */

/**
 * Determina a divisão de treino baseada na experiência e frequência
 */
function determinarDivisaoTreino(anamnese) {
  const { experiencia_treino, frequencia_treino, local_treino } = anamnese;
  const frequencia = parseInt(frequencia_treino?.split(' ')[0]) || 3;
  
  let divisao;
  
  // Baseado na experiência e frequência
  if (experiencia_treino === 'Iniciante: Nunca treinei ou treinei por menos de 6 meses') {
    if (frequencia <= 3) {
      divisao = 'FULL_BODY';
    } else {
      divisao = 'UPPER_LOWER';
    }
  } else if (experiencia_treino === 'Intermediário: Treino de forma consistente há mais de 6 meses a 2 anos') {
    if (frequencia <= 3) {
      divisao = 'UPPER_LOWER';
    } else if (frequencia <= 5) {
      divisao = 'ABC';
    } else {
      divisao = 'PUSH_PULL_LEGS';
    }
  } else { // Avançado
    if (frequencia <= 3) {
      divisao = 'ABC';
    } else if (frequencia <= 5) {
      divisao = 'PUSH_PULL_LEGS';
    } else {
      divisao = 'PUSH_PULL_LEGS_ARNOLD';
    }
  }
  
  // Ajustar baseado no local de treino
  if (local_treino === 'Em casa, com pouco ou nenhum equipamento') {
    divisao = 'FULL_BODY_CASA';
  } else if (local_treino === 'Em casa, com alguns equipamentos (halteres, elásticos)') {
    divisao = 'UPPER_LOWER_CASA';
  }
  
  return divisao;
}

/**
 * Seleciona exercícios baseados no local e equipamentos disponíveis
 */
function selecionarExerciciosPorLocal(anamnese, grupoMuscular) {
  const { local_treino, atividades_praticadas } = anamnese;
  
  const exerciciosPorLocal = {
    'Em casa, com pouco ou nenhum equipamento': {
      peito: ['Flexão de braço', 'Flexão inclinada', 'Flexão diamante'],
      costas: ['Remada invertida', 'Superman', 'Prancha reversa'],
      pernas: ['Agachamento livre', 'Afundo', 'Agachamento búlgaro'],
      ombros: ['Flexão pike', 'Elevação lateral com garrafa', 'Handstand'],
      bracos: ['Flexão fechada', 'Tríceps no chão', 'Rosca com garrafa'],
      core: ['Prancha', 'Abdominal', 'Mountain climber']
    },
    'Em casa, com alguns equipamentos (halteres, elásticos)': {
      peito: ['Supino com halteres', 'Crucifixo', 'Flexão com elástico'],
      costas: ['Remada com halteres', 'Pullover', 'Remada com elástico'],
      pernas: ['Agachamento com halteres', 'Stiff', 'Afundo com halteres'],
      ombros: ['Desenvolvimento', 'Elevação lateral', 'Elevação frontal'],
      bracos: ['Rosca direta', 'Tríceps testa', 'Martelo'],
      core: ['Prancha com peso', 'Russian twist', 'Dead bug']
    },
    'Em uma academia com equipamentos básicos': {
      peito: ['Supino reto', 'Supino inclinado', 'Crucifixo'],
      costas: ['Puxada frontal', 'Remada baixa', 'Pullover'],
      pernas: ['Agachamento', 'Leg press', 'Stiff'],
      ombros: ['Desenvolvimento', 'Elevação lateral', 'Remada alta'],
      bracos: ['Rosca direta', 'Tríceps pulley', 'Rosca martelo'],
      core: ['Prancha', 'Abdominal na máquina', 'Elevação de pernas']
    },
    'Em uma academia completa': {
      peito: ['Supino reto', 'Supino inclinado', 'Crucifixo', 'Peck deck'],
      costas: ['Puxada frontal', 'Remada baixa', 'Barra fixa', 'Remada curvada'],
      pernas: ['Agachamento livre', 'Leg press', 'Stiff', 'Cadeira extensora'],
      ombros: ['Desenvolvimento', 'Elevação lateral', 'Elevação posterior', 'Remada alta'],
      bracos: ['Rosca direta', 'Tríceps pulley', 'Rosca 21', 'Tríceps francês'],
      core: ['Prancha', 'Abdominal na máquina', 'Russian twist', 'Cabo cruzado']
    },
    'Em um Box de Crossfit': {
      peito: ['Push-up', 'Handstand push-up', 'Dips'],
      costas: ['Pull-up', 'Ring row', 'Deadlift'],
      pernas: ['Air squat', 'Box jump', 'Lunges'],
      ombros: ['Overhead press', 'Handstand walk', 'Pike push-up'],
      bracos: ['Ring dips', 'Muscle-up progression', 'Farmer walk'],
      core: ['Hollow hold', 'V-ups', 'Plank variations']
    }
  };
  
  return exerciciosPorLocal[local_treino]?.[grupoMuscular] || exerciciosPorLocal['Em uma academia completa'][grupoMuscular];
}

/**
 * Calcula séries e repetições baseado na experiência e objetivo
 */
function calcularSeriesReps(anamnese, tipoExercicio = 'composto') {
  const { experiencia_treino, objetivo_principal } = anamnese;
  
  let series, reps, descanso;
  
  // Base por experiência
  if (experiencia_treino === 'Iniciante: Nunca treinei ou treinei por menos de 6 meses') {
    series = tipoExercicio === 'composto' ? 3 : 2;
    reps = '12-15';
    descanso = '60-90s';
  } else if (experiencia_treino === 'Intermediário: Treino de forma consistente há mais de 6 meses a 2 anos') {
    series = tipoExercicio === 'composto' ? 4 : 3;
    reps = '8-12';
    descanso = '90-120s';
  } else { // Avançado
    series = tipoExercicio === 'composto' ? 4 : 3;
    reps = '6-10';
    descanso = '120-180s';
  }
  
  // Ajustar por objetivo
  if (objetivo_principal === 'Emagrecer e perder gordura corporal (preservar massa muscular)') {
    reps = '12-15';
    descanso = '45-60s';
  } else if (objetivo_principal === 'Ganhar massa muscular (hipertrofia)') {
    reps = '8-12';
    descanso = '90-120s';
  }
  
  return { series, reps, descanso };
}

/**
 * Gera treino do dia baseado na divisão e dia da semana
 */
function gerarTreinoDoDiaCompensatorio(anamnese, diaSemana = new Date().getDay()) {
  const divisao = determinarDivisaoTreino(anamnese);
  const { dores_lesoes } = anamnese;
  
  // Mapear dia da semana para treino
  const mapeamentoDivisao = {
    'FULL_BODY': {
      0: 'descanso', // Domingo
      1: 'full_body', // Segunda
      2: 'descanso', // Terça
      3: 'full_body', // Quarta
      4: 'descanso', // Quinta
      5: 'full_body', // Sexta
      6: 'descanso'  // Sábado
    },
    'FULL_BODY_CASA': {
      0: 'descanso',
      1: 'full_body_casa',
      2: 'descanso',
      3: 'full_body_casa',
      4: 'descanso',
      5: 'full_body_casa',
      6: 'descanso'
    },
    'UPPER_LOWER': {
      0: 'descanso',
      1: 'upper',
      2: 'lower',
      3: 'descanso',
      4: 'upper',
      5: 'lower',
      6: 'descanso'
    },
    'UPPER_LOWER_CASA': {
      0: 'descanso',
      1: 'upper_casa',
      2: 'lower_casa',
      3: 'descanso',
      4: 'upper_casa',
      5: 'lower_casa',
      6: 'descanso'
    },
    'ABC': {
      0: 'descanso',
      1: 'treino_a',
      2: 'treino_b',
      3: 'treino_c',
      4: 'treino_a',
      5: 'treino_b',
      6: 'descanso'
    },
    'PUSH_PULL_LEGS': {
      0: 'descanso',
      1: 'push',
      2: 'pull',
      3: 'legs',
      4: 'push',
      5: 'pull',
      6: 'legs'
    }
  };
  
  const tipoTreino = mapeamentoDivisao[divisao]?.[diaSemana] || 'descanso';
  
  if (tipoTreino === 'descanso') {
    return {
      tipo: 'descanso',
      titulo: 'Dia de Descanso',
      descricao: 'Hoje é seu dia de recuperação. Aproveite para descansar e se preparar para os próximos treinos.',
      atividades: [
        'Caminhada leve (opcional)',
        'Alongamento',
        'Hidratação adequada',
        'Sono reparador'
      ]
    };
  }
  
  // Gerar exercícios baseado no tipo de treino
  const exercicios = gerarExerciciosPorTipo(anamnese, tipoTreino);
  
  // Aplicar modificações por lesões/dores
  const exerciciosModificados = aplicarModificacoesPorLesoes(exercicios, dores_lesoes);
  
  return {
    tipo: tipoTreino,
    divisao,
    titulo: obterTituloTreino(tipoTreino),
    exercicios: exerciciosModificados,
    observacoes: gerarObservacoesTreino(anamnese),
    duracaoEstimada: calcularDuracaoTreino(exerciciosModificados)
  };
}

/**
 * Gera exercícios específicos por tipo de treino
 */
function gerarExerciciosPorTipo(anamnese, tipoTreino) {
  const exercicios = [];
  
  switch (tipoTreino) {
    case 'full_body':
    case 'full_body_casa':
      exercicios.push(
        ...criarExercicio(anamnese, 'pernas', 'Agachamento', 'composto'),
        ...criarExercicio(anamnese, 'peito', 'Supino/Flexão', 'composto'),
        ...criarExercicio(anamnese, 'costas', 'Remada', 'composto'),
        ...criarExercicio(anamnese, 'ombros', 'Desenvolvimento', 'isolado'),
        ...criarExercicio(anamnese, 'bracos', 'Rosca bíceps', 'isolado'),
        ...criarExercicio(anamnese, 'core', 'Prancha', 'isolado')
      );
      break;
      
    case 'upper':
    case 'upper_casa':
      exercicios.push(
        ...criarExercicio(anamnese, 'peito', 'Supino reto', 'composto'),
        ...criarExercicio(anamnese, 'costas', 'Puxada frontal', 'composto'),
        ...criarExercicio(anamnese, 'ombros', 'Desenvolvimento', 'composto'),
        ...criarExercicio(anamnese, 'peito', 'Crucifixo', 'isolado'),
        ...criarExercicio(anamnese, 'costas', 'Remada baixa', 'isolado'),
        ...criarExercicio(anamnese, 'bracos', 'Rosca direta', 'isolado'),
        ...criarExercicio(anamnese, 'bracos', 'Tríceps pulley', 'isolado')
      );
      break;
      
    case 'lower':
    case 'lower_casa':
      exercicios.push(
        ...criarExercicio(anamnese, 'pernas', 'Agachamento', 'composto'),
        ...criarExercicio(anamnese, 'pernas', 'Stiff', 'composto'),
        ...criarExercicio(anamnese, 'pernas', 'Leg press', 'composto'),
        ...criarExercicio(anamnese, 'pernas', 'Afundo', 'isolado'),
        ...criarExercicio(anamnese, 'pernas', 'Panturrilha', 'isolado'),
        ...criarExercicio(anamnese, 'core', 'Prancha', 'isolado')
      );
      break;
      
    case 'treino_a': // Peito, ombros, tríceps
      exercicios.push(
        ...criarExercicio(anamnese, 'peito', 'Supino reto', 'composto'),
        ...criarExercicio(anamnese, 'peito', 'Supino inclinado', 'composto'),
        ...criarExercicio(anamnese, 'ombros', 'Desenvolvimento', 'composto'),
        ...criarExercicio(anamnese, 'peito', 'Crucifixo', 'isolado'),
        ...criarExercicio(anamnese, 'ombros', 'Elevação lateral', 'isolado'),
        ...criarExercicio(anamnese, 'bracos', 'Tríceps pulley', 'isolado')
      );
      break;
      
    case 'treino_b': // Costas, bíceps
      exercicios.push(
        ...criarExercicio(anamnese, 'costas', 'Puxada frontal', 'composto'),
        ...criarExercicio(anamnese, 'costas', 'Remada curvada', 'composto'),
        ...criarExercicio(anamnese, 'costas', 'Remada baixa', 'isolado'),
        ...criarExercicio(anamnese, 'costas', 'Pullover', 'isolado'),
        ...criarExercicio(anamnese, 'bracos', 'Rosca direta', 'isolado'),
        ...criarExercicio(anamnese, 'bracos', 'Rosca martelo', 'isolado')
      );
      break;
      
    case 'treino_c': // Pernas, core
      exercicios.push(
        ...criarExercicio(anamnese, 'pernas', 'Agachamento livre', 'composto'),
        ...criarExercicio(anamnese, 'pernas', 'Stiff', 'composto'),
        ...criarExercicio(anamnese, 'pernas', 'Leg press', 'composto'),
        ...criarExercicio(anamnese, 'pernas', 'Cadeira extensora', 'isolado'),
        ...criarExercicio(anamnese, 'pernas', 'Mesa flexora', 'isolado'),
        ...criarExercicio(anamnese, 'core', 'Prancha', 'isolado')
      );
      break;
      
    case 'push': // Peito, ombros, tríceps
      exercicios.push(
        ...criarExercicio(anamnese, 'peito', 'Supino reto', 'composto'),
        ...criarExercicio(anamnese, 'ombros', 'Desenvolvimento', 'composto'),
        ...criarExercicio(anamnese, 'peito', 'Supino inclinado', 'isolado'),
        ...criarExercicio(anamnese, 'ombros', 'Elevação lateral', 'isolado'),
        ...criarExercicio(anamnese, 'bracos', 'Tríceps francês', 'isolado')
      );
      break;
      
    case 'pull': // Costas, bíceps
      exercicios.push(
        ...criarExercicio(anamnese, 'costas', 'Puxada frontal', 'composto'),
        ...criarExercicio(anamnese, 'costas', 'Remada curvada', 'composto'),
        ...criarExercicio(anamnese, 'costas', 'Remada baixa', 'isolado'),
        ...criarExercicio(anamnese, 'bracos', 'Rosca direta', 'isolado'),
        ...criarExercicio(anamnese, 'bracos', 'Rosca 21', 'isolado')
      );
      break;
      
    case 'legs': // Pernas, core
      exercicios.push(
        ...criarExercicio(anamnese, 'pernas', 'Agachamento livre', 'composto'),
        ...criarExercicio(anamnese, 'pernas', 'Stiff', 'composto'),
        ...criarExercicio(anamnese, 'pernas', 'Afundo', 'isolado'),
        ...criarExercicio(anamnese, 'pernas', 'Cadeira extensora', 'isolado'),
        ...criarExercicio(anamnese, 'core', 'Prancha', 'isolado')
      );
      break;
  }
  
  return exercicios;
}

/**
 * Cria um exercício com todas as especificações
 */
function criarExercicio(anamnese, grupoMuscular, nomeBase, tipo) {
  const exerciciosDisponiveis = selecionarExerciciosPorLocal(anamnese, grupoMuscular);
  const nomeExercicio = exerciciosDisponiveis[0] || nomeBase;
  const { series, reps, descanso } = calcularSeriesReps(anamnese, tipo);
  
  return [{
    nome: nomeExercicio,
    grupo: grupoMuscular,
    tipo,
    series,
    repeticoes: reps,
    descanso,
    peso: calcularPesoSugerido(anamnese, tipo),
    instrucoes: gerarInstrucoesExercicio(nomeExercicio),
    observacoes: gerarObservacoesExercicio(anamnese, nomeExercicio)
  }];
}

/**
 * Calcula peso sugerido baseado no peso corporal e experiência
 */
function calcularPesoSugerido(anamnese, tipoExercicio) {
  const { peso, experiencia_treino, sexo } = anamnese;
  const pesoCorporal = parseFloat(peso);
  
  let fatorPeso = 0.3; // Iniciante
  if (experiencia_treino === 'Intermediário: Treino de forma consistente há mais de 6 meses a 2 anos') {
    fatorPeso = 0.5;
  } else if (experiencia_treino === 'Avançado: Treino de forma séria e consistente há vários anos') {
    fatorPeso = 0.7;
  }
  
  // Ajustar por sexo
  if (sexo === 'Feminino') {
    fatorPeso *= 0.8;
  }
  
  // Ajustar por tipo de exercício
  if (tipoExercicio === 'composto') {
    fatorPeso *= 1.2;
  }
  
  const pesoSugerido = Math.round(pesoCorporal * fatorPeso);
  return `${pesoSugerido}kg (ajustar conforme necessário)`;
}

/**
 * Gera instruções específicas para cada exercício
 */
function gerarInstrucoesExercicio(nomeExercicio) {
  const instrucoes = {
    'Agachamento': 'Pés na largura dos ombros, descer até 90°, manter o core contraído',
    'Supino reto': 'Pegada na largura dos ombros, descer até o peito, subir controlado',
    'Flexão de braço': 'Corpo alinhado, descer até quase tocar o chão, subir controlado',
    'Puxada frontal': 'Pegada pronada, puxar até a altura do peito, controlar a descida',
    'Remada': 'Manter postura ereta, puxar até o abdômen, apertar as escápulas'
  };
  
  return instrucoes[nomeExercicio] || 'Execute o movimento de forma controlada, mantendo a postura correta';
}

/**
 * Gera observações específicas baseadas na anamnese
 */
function gerarObservacoesExercicio(anamnese, nomeExercicio) {
  const { dores_lesoes } = anamnese;
  const observacoes = [];
  
  if (dores_lesoes && dores_lesoes.toLowerCase() !== 'não') {
    if (dores_lesoes.toLowerCase().includes('joelho') && nomeExercicio.includes('Agachamento')) {
      observacoes.push('⚠️ Cuidado com a profundidade devido ao problema no joelho');
    }
    if (dores_lesoes.toLowerCase().includes('coluna') && nomeExercicio.includes('Stiff')) {
      observacoes.push('⚠️ Manter coluna neutra, reduzir amplitude se necessário');
    }
  }
  
  return observacoes;
}

/**
 * Aplica modificações nos exercícios baseado em lesões/dores
 */
function aplicarModificacoesPorLesoes(exercicios, dores_lesoes) {
  if (!dores_lesoes || dores_lesoes.toLowerCase() === 'não') {
    return exercicios;
  }
  
  return exercicios.map(exercicio => {
    const exercicioModificado = { ...exercicio };
    
    // Modificações por problemas no joelho
    if (dores_lesoes.toLowerCase().includes('joelho')) {
      if (exercicio.nome.includes('Agachamento')) {
        exercicioModificado.observacoes.push('Reduzir amplitude, não descer além de 90°');
        exercicioModificado.repeticoes = '10-12'; // Menos repetições
      }
    }
    
    // Modificações por problemas na coluna
    if (dores_lesoes.toLowerCase().includes('coluna')) {
      if (exercicio.nome.includes('Stiff') || exercicio.nome.includes('Remada curvada')) {
        exercicioModificado.observacoes.push('Manter coluna neutra, movimento controlado');
        exercicioModificado.peso = 'Peso reduzido';
      }
    }
    
    return exercicioModificado;
  });
}

/**
 * Gera observações gerais do treino
 */
function gerarObservacoesTreino(anamnese) {
  const observacoes = [];
  const { experiencia_treino, intensidade_treino, dores_lesoes } = anamnese;
  
  if (experiencia_treino === 'Iniciante: Nunca treinei ou treinei por menos de 6 meses') {
    observacoes.push('🔰 Foque na execução correta antes de aumentar o peso');
    observacoes.push('💧 Mantenha-se hidratado durante todo o treino');
  }
  
  if (intensidade_treino === '9-10 (Muito Intenso): Falar é quase impossível, esforço máximo') {
    observacoes.push('🔥 Treino de alta intensidade - respeite os tempos de descanso');
  }
  
  if (dores_lesoes && dores_lesoes.toLowerCase() !== 'não') {
    observacoes.push('⚠️ Pare imediatamente se sentir dor durante o exercício');
  }
  
  observacoes.push('📱 Use o cronômetro para controlar os tempos de descanso');
  
  return observacoes;
}

/**
 * Obtém título do treino baseado no tipo
 */
function obterTituloTreino(tipoTreino) {
  const titulos = {
    'full_body': 'Treino Full Body',
    'full_body_casa': 'Treino Full Body em Casa',
    'upper': 'Treino Membros Superiores',
    'upper_casa': 'Treino Superior em Casa',
    'lower': 'Treino Membros Inferiores',
    'lower_casa': 'Treino Inferior em Casa',
    'treino_a': 'Treino A - Peito, Ombros e Tríceps',
    'treino_b': 'Treino B - Costas e Bíceps',
    'treino_c': 'Treino C - Pernas e Core',
    'push': 'Treino Push - Empurrar',
    'pull': 'Treino Pull - Puxar',
    'legs': 'Treino Legs - Pernas'
  };
  
  return titulos[tipoTreino] || 'Treino do Dia';
}

/**
 * Calcula duração estimada do treino
 */
function calcularDuracaoTreino(exercicios) {
  const tempoMedioExercicio = 4; // minutos por exercício (incluindo descanso)
  const aquecimento = 10; // minutos
  const alongamento = 10; // minutos
  
  const duracaoTotal = aquecimento + (exercicios.length * tempoMedioExercicio) + alongamento;
  
  return `${duracaoTotal} minutos`;
}

module.exports = {
  determinarDivisaoTreino,
  selecionarExerciciosPorLocal,
  calcularSeriesReps,
  gerarTreinoDoDiaCompensatorio,
  gerarExerciciosPorTipo,
  criarExercicio,
  calcularPesoSugerido,
  aplicarModificacoesPorLesoes
};

