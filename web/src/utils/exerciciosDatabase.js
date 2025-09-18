import exerciciosData from './exercicios_completos.json';

/**
 * Base de dados completa de exercícios do EvolveYou
 * Total: 1.023 exercícios com GIFs integrados
 */
export const EXERCICIOS_DATABASE = exerciciosData;

/**
 * Filtrar exercícios por grupo muscular
 */
export const filtrarPorGrupoMuscular = (grupoMuscular) => {
  return EXERCICIOS_DATABASE.filter(exercicio => 
    exercicio.muscle_groups.primary.includes(grupoMuscular.toLowerCase()) ||
    exercicio.muscle_groups.secondary.includes(grupoMuscular.toLowerCase())
  );
};

/**
 * Filtrar exercícios por categoria
 */
export const filtrarPorCategoria = (categoria) => {
  return EXERCICIOS_DATABASE.filter(exercicio => 
    exercicio.category.toLowerCase().includes(categoria.toLowerCase())
  );
};

/**
 * Filtrar exercícios por equipamento
 */
export const filtrarPorEquipamento = (equipamento) => {
  if (equipamento === 'casa' || equipamento === 'peso_corporal') {
    return EXERCICIOS_DATABASE.filter(exercicio => 
      exercicio.equipment.includes('não especificado') ||
      exercicio.equipment.includes('peso corporal') ||
      exercicio.category.includes('calistenia') ||
      exercicio.category.includes('treino funcional')
    );
  }
  
  return EXERCICIOS_DATABASE.filter(exercicio => 
    exercicio.equipment.some(eq => eq.toLowerCase().includes(equipamento.toLowerCase()))
  );
};

/**
 * Filtrar exercícios por nível de dificuldade
 */
export const filtrarPorDificuldade = (nivel) => {
  const nivelMap = {
    'iniciante': [1, 2],
    'intermediario': [2, 3],
    'avancado': [3, 4, 5]
  };
  
  const niveisPermitidos = nivelMap[nivel] || [2];
  
  return EXERCICIOS_DATABASE.filter(exercicio => 
    niveisPermitidos.includes(exercicio.difficulty_level)
  );
};

/**
 * Buscar exercício por ID
 */
export const buscarPorId = (exerciseId) => {
  return EXERCICIOS_DATABASE.find(exercicio => 
    exercicio.exercise_id === exerciseId
  );
};

/**
 * Buscar exercícios por nome (busca parcial)
 */
export const buscarPorNome = (nome) => {
  return EXERCICIOS_DATABASE.filter(exercicio => 
    exercicio.name.toLowerCase().includes(nome.toLowerCase())
  );
};

/**
 * Obter exercícios para treino específico
 */
export const obterExerciciosParaTreino = (filtros) => {
  const {
    gruposMuscularesDesejados = [],
    local = 'academia',
    experiencia = 'intermediario',
    categoria = 'força',
    quantidade = 5
  } = filtros;

  let exerciciosFiltrados = [...EXERCICIOS_DATABASE];

  // Filtrar por grupos musculares
  if (gruposMuscularesDesejados.length > 0) {
    exerciciosFiltrados = exerciciosFiltrados.filter(exercicio => 
      gruposMuscularesDesejados.some(grupo => 
        exercicio.muscle_groups.primary.includes(grupo.toLowerCase()) ||
        exercicio.muscle_groups.secondary.includes(grupo.toLowerCase())
      )
    );
  }

  // Filtrar por local/equipamento
  if (local === 'casa') {
    exerciciosFiltrados = exerciciosFiltrados.filter(exercicio => 
      exercicio.equipment.includes('não especificado') ||
      exercicio.category.includes('calistenia') ||
      exercicio.category.includes('treino funcional') ||
      exercicio.category.includes('hiit')
    );
  }

  // Filtrar por experiência
  const niveisPermitidos = {
    'iniciante': [1, 2],
    'intermediario': [2, 3],
    'avancado': [3, 4, 5]
  }[experiencia] || [2];

  exerciciosFiltrados = exerciciosFiltrados.filter(exercicio => 
    niveisPermitidos.includes(exercicio.difficulty_level)
  );

  // Filtrar por categoria se especificada
  if (categoria) {
    exerciciosFiltrados = exerciciosFiltrados.filter(exercicio => 
      exercicio.category.toLowerCase().includes(categoria.toLowerCase())
    );
  }

  // Embaralhar e retornar quantidade desejada
  const exerciciosEmbaralhados = exerciciosFiltrados.sort(() => Math.random() - 0.5);
  
  return exerciciosEmbaralhados.slice(0, quantidade);
};

/**
 * Obter estatísticas da base de dados
 */
export const obterEstatisticas = () => {
  const categorias = {};
  const gruposMusculares = {};
  const equipamentos = {};
  const dificuldades = {};

  EXERCICIOS_DATABASE.forEach(exercicio => {
    // Contar categorias
    categorias[exercicio.category] = (categorias[exercicio.category] || 0) + 1;

    // Contar grupos musculares
    exercicio.muscle_groups.primary.forEach(grupo => {
      gruposMusculares[grupo] = (gruposMusculares[grupo] || 0) + 1;
    });

    // Contar equipamentos
    exercicio.equipment.forEach(eq => {
      equipamentos[eq] = (equipamentos[eq] || 0) + 1;
    });

    // Contar dificuldades
    dificuldades[exercicio.difficulty_level] = (dificuldades[exercicio.difficulty_level] || 0) + 1;
  });

  return {
    total: EXERCICIOS_DATABASE.length,
    categorias,
    gruposMusculares,
    equipamentos,
    dificuldades
  };
};

/**
 * Mapear grupos musculares para português
 */
export const GRUPOS_MUSCULARES_PT = {
  'peitoral': 'Peito',
  'costas': 'Costas',
  'ombros': 'Ombros',
  'biceps': 'Bíceps',
  'triceps': 'Tríceps',
  'quadriceps': 'Quadríceps',
  'posterior_coxa': 'Posterior de Coxa',
  'gluteos': 'Glúteos',
  'panturrilha': 'Panturrilha',
  'abdomen': 'Abdômen',
  'antebracos': 'Antebraços',
  'trapezio': 'Trapézio',
  'deltoides': 'Deltoides'
};

/**
 * Mapear categorias para português
 */
export const CATEGORIAS_PT = {
  'força': 'Força',
  'hiit': 'HIIT',
  'cardio': 'Cardio',
  'funcional': 'Funcional',
  'calistenia': 'Calistenia',
  'crossfit': 'CrossFit',
  'alongamento': 'Alongamento',
  'mobilidade': 'Mobilidade'
};

export default {
  EXERCICIOS_DATABASE,
  filtrarPorGrupoMuscular,
  filtrarPorCategoria,
  filtrarPorEquipamento,
  filtrarPorDificuldade,
  buscarPorId,
  buscarPorNome,
  obterExerciciosParaTreino,
  obterEstatisticas,
  GRUPOS_MUSCULARES_PT,
  CATEGORIAS_PT
};

