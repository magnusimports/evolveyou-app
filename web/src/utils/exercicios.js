// Base de dados de exercícios organizados por grupo muscular

const exercicios = {
  // PEITO
  'supino_reto': {
    nome: 'Supino reto com barra',
    grupo_muscular: 'peito',
    categoria: 'composto',
    equipamento: 'barra',
    dificuldade: 'intermediario',
    instrucoes: [
      'Deite no banco com os pés apoiados no chão',
      'Segure a barra com pegada um pouco mais larga que os ombros',
      'Desça a barra controladamente até o peito',
      'Empurre a barra para cima até a extensão completa dos braços'
    ],
    musculos_primarios: ['peitoral_maior'],
    musculos_secundarios: ['triceps', 'deltoides_anterior'],
    series_recomendadas: { iniciante: 3, intermediario: 4, avancado: 4 },
    repeticoes_recomendadas: { iniciante: '8-12', intermediario: '6-10', avancado: '6-8' },
    descanso_segundos: 120
  },
  'supino_inclinado': {
    nome: 'Supino inclinado com halteres',
    grupo_muscular: 'peito',
    categoria: 'composto',
    equipamento: 'halteres',
    dificuldade: 'intermediario',
    instrucoes: [
      'Ajuste o banco em 30-45 graus de inclinação',
      'Segure os halteres com pegada neutra',
      'Desça os halteres controladamente',
      'Empurre os halteres para cima contraindo o peito'
    ],
    musculos_primarios: ['peitoral_maior_superior'],
    musculos_secundarios: ['triceps', 'deltoides_anterior'],
    series_recomendadas: { iniciante: 3, intermediario: 3, avancado: 4 },
    repeticoes_recomendadas: { iniciante: '10-12', intermediario: '8-10', avancado: '6-10' },
    descanso_segundos: 90
  },
  'flexao_peito': {
    nome: 'Flexão de braço',
    grupo_muscular: 'peito',
    categoria: 'composto',
    equipamento: 'peso_corporal',
    dificuldade: 'iniciante',
    instrucoes: [
      'Posicione-se em prancha com mãos na largura dos ombros',
      'Mantenha o corpo alinhado da cabeça aos pés',
      'Desça o corpo até o peito quase tocar o chão',
      'Empurre o corpo para cima até a posição inicial'
    ],
    musculos_primarios: ['peitoral_maior'],
    musculos_secundarios: ['triceps', 'deltoides_anterior', 'core'],
    series_recomendadas: { iniciante: 3, intermediario: 3, avancado: 4 },
    repeticoes_recomendadas: { iniciante: '8-15', intermediario: '15-20', avancado: '20+' },
    descanso_segundos: 60
  },

  // COSTAS
  'puxada_frente': {
    nome: 'Puxada pela frente',
    grupo_muscular: 'costas',
    categoria: 'composto',
    equipamento: 'polia',
    dificuldade: 'iniciante',
    instrucoes: [
      'Sente-se no equipamento com as coxas fixadas',
      'Segure a barra com pegada pronada, mais larga que os ombros',
      'Puxe a barra em direção ao peito, contraindo as costas',
      'Retorne controladamente à posição inicial'
    ],
    musculos_primarios: ['latissimo_dorso'],
    musculos_secundarios: ['biceps', 'romboides', 'trapezio_medio'],
    series_recomendadas: { iniciante: 3, intermediario: 4, avancado: 4 },
    repeticoes_recomendadas: { iniciante: '10-12', intermediario: '8-10', avancado: '6-10' },
    descanso_segundos: 90
  },
  'remada_curvada': {
    nome: 'Remada curvada com barra',
    grupo_muscular: 'costas',
    categoria: 'composto',
    equipamento: 'barra',
    dificuldade: 'intermediario',
    instrucoes: [
      'Fique em pé com pés na largura dos ombros',
      'Curve o tronco mantendo as costas retas',
      'Puxe a barra em direção ao abdômen',
      'Contraia as escápulas no final do movimento'
    ],
    musculos_primarios: ['latissimo_dorso', 'romboides'],
    musculos_secundarios: ['biceps', 'trapezio', 'deltoides_posterior'],
    series_recomendadas: { iniciante: 3, intermediario: 4, avancado: 4 },
    repeticoes_recomendadas: { iniciante: '8-10', intermediario: '6-8', avancado: '6-8' },
    descanso_segundos: 120
  },

  // PERNAS
  'agachamento': {
    nome: 'Agachamento livre',
    grupo_muscular: 'pernas',
    categoria: 'composto',
    equipamento: 'barra',
    dificuldade: 'intermediario',
    instrucoes: [
      'Posicione a barra nos trapézios',
      'Pés na largura dos ombros, pontas ligeiramente para fora',
      'Desça como se fosse sentar, mantendo o peito erguido',
      'Desça até as coxas ficarem paralelas ao chão',
      'Suba empurrando pelos calcanhares'
    ],
    musculos_primarios: ['quadriceps', 'gluteos'],
    musculos_secundarios: ['isquiotibiais', 'panturrilhas', 'core'],
    series_recomendadas: { iniciante: 3, intermediario: 4, avancado: 5 },
    repeticoes_recomendadas: { iniciante: '10-12', intermediario: '8-10', avancado: '6-8' },
    descanso_segundos: 180
  },
  'leg_press': {
    nome: 'Leg Press 45°',
    grupo_muscular: 'pernas',
    categoria: 'composto',
    equipamento: 'maquina',
    dificuldade: 'iniciante',
    instrucoes: [
      'Sente-se no equipamento com costas apoiadas',
      'Posicione os pés na plataforma na largura dos ombros',
      'Desça controladamente até formar 90° nos joelhos',
      'Empurre a plataforma até quase a extensão completa'
    ],
    musculos_primarios: ['quadriceps', 'gluteos'],
    musculos_secundarios: ['isquiotibiais'],
    series_recomendadas: { iniciante: 3, intermediario: 3, avancado: 4 },
    repeticoes_recomendadas: { iniciante: '12-15', intermediario: '10-12', avancado: '8-12' },
    descanso_segundos: 120
  },
  'stiff': {
    nome: 'Stiff com halteres',
    grupo_muscular: 'pernas',
    categoria: 'isolado',
    equipamento: 'halteres',
    dificuldade: 'intermediario',
    instrucoes: [
      'Fique em pé com halteres nas mãos',
      'Mantenha as pernas ligeiramente flexionadas',
      'Desça os halteres deslizando pelas pernas',
      'Sinta o alongamento nos posteriores de coxa',
      'Retorne contraindo glúteos e posteriores'
    ],
    musculos_primarios: ['isquiotibiais', 'gluteos'],
    musculos_secundarios: ['eretores_espinha'],
    series_recomendadas: { iniciante: 3, intermediario: 3, avancado: 4 },
    repeticoes_recomendadas: { iniciante: '10-12', intermediario: '8-10', avancado: '8-10' },
    descanso_segundos: 90
  },

  // OMBROS
  'desenvolvimento_ombros': {
    nome: 'Desenvolvimento com halteres',
    grupo_muscular: 'ombros',
    categoria: 'composto',
    equipamento: 'halteres',
    dificuldade: 'intermediario',
    instrucoes: [
      'Sente-se com as costas apoiadas',
      'Segure os halteres na altura dos ombros',
      'Empurre os halteres para cima até quase encostar',
      'Desça controladamente até a posição inicial'
    ],
    musculos_primarios: ['deltoides_anterior', 'deltoides_medio'],
    musculos_secundarios: ['triceps', 'trapezio'],
    series_recomendadas: { iniciante: 3, intermediario: 3, avancado: 4 },
    repeticoes_recomendadas: { iniciante: '10-12', intermediario: '8-10', avancado: '6-10' },
    descanso_segundos: 90
  },
  'elevacao_lateral': {
    nome: 'Elevação lateral',
    grupo_muscular: 'ombros',
    categoria: 'isolado',
    equipamento: 'halteres',
    dificuldade: 'iniciante',
    instrucoes: [
      'Fique em pé com halteres nas mãos',
      'Braços ligeiramente flexionados ao lado do corpo',
      'Eleve os braços lateralmente até a altura dos ombros',
      'Desça controladamente'
    ],
    musculos_primarios: ['deltoides_medio'],
    musculos_secundarios: ['deltoides_anterior', 'trapezio'],
    series_recomendadas: { iniciante: 3, intermediario: 3, avancado: 4 },
    repeticoes_recomendadas: { iniciante: '12-15', intermediario: '10-12', avancado: '8-12' },
    descanso_segundos: 60
  },

  // BRAÇOS
  'rosca_direta': {
    nome: 'Rosca direta com barra',
    grupo_muscular: 'biceps',
    categoria: 'isolado',
    equipamento: 'barra',
    dificuldade: 'iniciante',
    instrucoes: [
      'Fique em pé com a barra nas mãos',
      'Cotovelos colados ao corpo',
      'Flexione os braços contraindo os bíceps',
      'Desça controladamente sem balançar o corpo'
    ],
    musculos_primarios: ['biceps'],
    musculos_secundarios: ['antebracos'],
    series_recomendadas: { iniciante: 3, intermediario: 3, avancado: 4 },
    repeticoes_recomendadas: { iniciante: '10-12', intermediario: '8-10', avancado: '6-10' },
    descanso_segundos: 60
  },
  'triceps_testa': {
    nome: 'Tríceps testa',
    grupo_muscular: 'triceps',
    categoria: 'isolado',
    equipamento: 'barra',
    dificuldade: 'intermediario',
    instrucoes: [
      'Deite no banco segurando a barra',
      'Braços estendidos perpendiculares ao corpo',
      'Flexione apenas os cotovelos, descendo a barra em direção à testa',
      'Estenda os braços contraindo os tríceps'
    ],
    musculos_primarios: ['triceps'],
    musculos_secundarios: [],
    series_recomendadas: { iniciante: 3, intermediario: 3, avancado: 4 },
    repeticoes_recomendadas: { iniciante: '10-12', intermediario: '8-10', avancado: '8-10' },
    descanso_segundos: 60
  },

  // CORE/ABDÔMEN
  'prancha': {
    nome: 'Prancha isométrica',
    grupo_muscular: 'core',
    categoria: 'isometrico',
    equipamento: 'peso_corporal',
    dificuldade: 'iniciante',
    instrucoes: [
      'Posicione-se em prancha com antebraços no chão',
      'Mantenha o corpo alinhado da cabeça aos pés',
      'Contraia o abdômen e glúteos',
      'Mantenha a respiração normal'
    ],
    musculos_primarios: ['core', 'transverso_abdominal'],
    musculos_secundarios: ['gluteos', 'ombros'],
    series_recomendadas: { iniciante: 3, intermediario: 3, avancado: 4 },
    repeticoes_recomendadas: { iniciante: '30-45s', intermediario: '45-60s', avancado: '60-90s' },
    descanso_segundos: 60
  },
  'abdominal_crunch': {
    nome: 'Abdominal crunch',
    grupo_muscular: 'core',
    categoria: 'isolado',
    equipamento: 'peso_corporal',
    dificuldade: 'iniciante',
    instrucoes: [
      'Deite com joelhos flexionados',
      'Mãos atrás da cabeça ou cruzadas no peito',
      'Contraia o abdômen elevando o tronco',
      'Desça controladamente sem relaxar completamente'
    ],
    musculos_primarios: ['reto_abdominal'],
    musculos_secundarios: ['obliquos'],
    series_recomendadas: { iniciante: 3, intermediario: 3, avancado: 4 },
    repeticoes_recomendadas: { iniciante: '15-20', intermediario: '20-25', avancado: '25-30' },
    descanso_segundos: 45
  }
};

// Função para obter exercícios por grupo muscular
const obterExerciciosPorGrupo = (grupo) => {
  return Object.keys(exercicios).filter(key => exercicios[key].grupo_muscular === grupo);
};

// Função para obter exercícios por dificuldade
const obterExerciciosPorDificuldade = (dificuldade) => {
  return Object.keys(exercicios).filter(key => exercicios[key].dificuldade === dificuldade);
};

// Função para obter exercícios compostos
const obterExerciciosCompostos = () => {
  return Object.keys(exercicios).filter(key => exercicios[key].categoria === 'composto');
};

// Divisões de treino pré-definidas
const divisoesTreino = {
  'abc': {
    nome: 'Divisão ABC',
    descricao: 'Treino dividido em 3 dias: Peito/Tríceps, Costas/Bíceps, Pernas/Ombros',
    frequencia_semanal: 6,
    dias: {
      'A': {
        nome: 'Peito e Tríceps',
        grupos: ['peito', 'triceps'],
        exercicios_principais: ['supino_reto', 'supino_inclinado', 'flexao_peito', 'triceps_testa']
      },
      'B': {
        nome: 'Costas e Bíceps',
        grupos: ['costas', 'biceps'],
        exercicios_principais: ['puxada_frente', 'remada_curvada', 'rosca_direta']
      },
      'C': {
        nome: 'Pernas e Ombros',
        grupos: ['pernas', 'ombros', 'core'],
        exercicios_principais: ['agachamento', 'leg_press', 'stiff', 'desenvolvimento_ombros', 'elevacao_lateral']
      }
    }
  },
  'push_pull_legs': {
    nome: 'Push/Pull/Legs',
    descricao: 'Empurrar, Puxar, Pernas',
    frequencia_semanal: 6,
    dias: {
      'push': {
        nome: 'Push (Empurrar)',
        grupos: ['peito', 'ombros', 'triceps'],
        exercicios_principais: ['supino_reto', 'desenvolvimento_ombros', 'elevacao_lateral', 'triceps_testa']
      },
      'pull': {
        nome: 'Pull (Puxar)',
        grupos: ['costas', 'biceps'],
        exercicios_principais: ['puxada_frente', 'remada_curvada', 'rosca_direta']
      },
      'legs': {
        nome: 'Legs (Pernas)',
        grupos: ['pernas', 'core'],
        exercicios_principais: ['agachamento', 'leg_press', 'stiff', 'prancha']
      }
    }
  },
  'fullbody': {
    nome: 'Full Body',
    descricao: 'Treino de corpo inteiro',
    frequencia_semanal: 3,
    dias: {
      'fullbody': {
        nome: 'Corpo Inteiro',
        grupos: ['peito', 'costas', 'pernas', 'ombros', 'core'],
        exercicios_principais: ['agachamento', 'supino_reto', 'puxada_frente', 'desenvolvimento_ombros', 'prancha']
      }
    }
  }
};

module.exports = {
  exercicios,
  divisoesTreino,
  obterExerciciosPorGrupo,
  obterExerciciosPorDificuldade,
  obterExerciciosCompostos
};

