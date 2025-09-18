const { exercicios, divisoesTreino, obterExerciciosPorGrupo, obterExerciciosPorDificuldade } = require('../data/exercicios');

// Algoritmo para gerar treinos personalizados
class TreinoGenerator {
  constructor(anamnese) {
    this.anamnese = anamnese;
    this.nivelTreino = this.determinarNivelTreino();
    this.divisaoTreino = this.selecionarDivisaoTreino();
  }

  // Determinar nível de treino baseado na experiência
  determinarNivelTreino() {
    const { experiencia_treino, frequencia_semanal } = this.anamnese;
    
    if (experiencia_treino === 'Nunca treinei' || frequencia_semanal <= 2) {
      return 'iniciante';
    } else if (experiencia_treino === 'Menos de 1 ano' || frequencia_semanal <= 4) {
      return 'intermediario';
    } else {
      return 'avancado';
    }
  }

  // Selecionar divisão de treino baseada no nível e frequência
  selecionarDivisaoTreino() {
    const { frequencia_semanal } = this.anamnese;
    
    if (frequencia_semanal <= 3 || this.nivelTreino === 'iniciante') {
      return 'fullbody';
    } else if (frequencia_semanal <= 4) {
      return 'abc';
    } else {
      return 'push_pull_legs';
    }
  }

  // Gerar treino do dia baseado no dia da semana
  gerarTreinoDoDia(diaSemana = null) {
    const hoje = diaSemana || new Date().getDay(); // 0 = Domingo, 1 = Segunda, etc.
    
    // Mapear dias da semana para treinos
    const mapeamentoDias = this.criarMapeamentoDias();
    const tipoTreino = mapeamentoDias[hoje];
    
    if (tipoTreino === 'descanso') {
      return {
        tipo: 'descanso',
        titulo: 'Dia de Descanso',
        descricao: 'Aproveite para descansar e se recuperar. A recuperação é fundamental para o crescimento muscular.',
        data: new Date().toISOString().split('T')[0]
      };
    }

    const divisao = divisoesTreino[this.divisaoTreino];
    const treinoDoDia = divisao.dias[tipoTreino];
    
    const treino = {
      tipo: 'treino',
      titulo: `Treino ${tipoTreino.toUpperCase()} - ${treinoDoDia.nome}`,
      subtitulo: treinoDoDia.nome,
      grupos_musculares: treinoDoDia.grupos,
      data: new Date().toISOString().split('T')[0],
      nivel: this.nivelTreino,
      duracao_estimada: this.calcularDuracaoEstimada(treinoDoDia.exercicios_principais.length),
      exercicios: this.selecionarExercicios(treinoDoDia),
      observacoes: this.gerarObservacoes()
    };

    return treino;
  }

  // Criar mapeamento de dias da semana para tipos de treino
  criarMapeamentoDias() {
    const { frequencia_semanal } = this.anamnese;
    
    if (this.divisaoTreino === 'fullbody') {
      // Full Body: Segunda, Quarta, Sexta
      return {
        0: 'descanso', // Domingo
        1: 'fullbody', // Segunda
        2: 'descanso', // Terça
        3: 'fullbody', // Quarta
        4: 'descanso', // Quinta
        5: 'fullbody', // Sexta
        6: 'descanso'  // Sábado
      };
    } else if (this.divisaoTreino === 'abc') {
      // ABC: Segunda(A), Terça(B), Quarta(C), Quinta(A), Sexta(B), Sábado(C)
      return {
        0: 'descanso', // Domingo
        1: 'A',        // Segunda
        2: 'B',        // Terça
        3: 'C',        // Quarta
        4: 'A',        // Quinta
        5: 'B',        // Sexta
        6: 'C'         // Sábado
      };
    } else if (this.divisaoTreino === 'push_pull_legs') {
      // Push/Pull/Legs: Segunda(Push), Terça(Pull), Quarta(Legs), Quinta(Push), Sexta(Pull), Sábado(Legs)
      return {
        0: 'descanso', // Domingo
        1: 'push',     // Segunda
        2: 'pull',     // Terça
        3: 'legs',     // Quarta
        4: 'push',     // Quinta
        5: 'pull',     // Sexta
        6: 'legs'      // Sábado
      };
    }
  }

  // Selecionar exercícios para o treino
  selecionarExercicios(treinoDoDia) {
    const exerciciosSelecionados = [];
    const exerciciosDisponiveis = treinoDoDia.exercicios_principais;
    
    // Adicionar exercícios principais
    exerciciosDisponiveis.forEach(exercicioId => {
      if (exercicios[exercicioId]) {
        const exercicio = exercicios[exercicioId];
        const config = this.configurarExercicio(exercicio, exercicioId);
        exerciciosSelecionados.push(config);
      }
    });

    // Adicionar exercícios complementares se necessário
    if (exerciciosSelecionados.length < 4 && this.nivelTreino !== 'iniciante') {
      const exerciciosComplementares = this.selecionarExerciciosComplementares(treinoDoDia.grupos, exerciciosDisponiveis);
      exerciciosSelecionados.push(...exerciciosComplementares);
    }

    return exerciciosSelecionados.slice(0, this.nivelTreino === 'iniciante' ? 4 : 6);
  }

  // Configurar exercício com séries, repetições e carga
  configurarExercicio(exercicio, exercicioId) {
    const series = exercicio.series_recomendadas[this.nivelTreino];
    const repeticoes = exercicio.repeticoes_recomendadas[this.nivelTreino];
    
    return {
      id: exercicioId,
      nome: exercicio.nome,
      grupo_muscular: exercicio.grupo_muscular,
      categoria: exercicio.categoria,
      equipamento: exercicio.equipamento,
      series: series,
      repeticoes: repeticoes,
      descanso_segundos: exercicio.descanso_segundos,
      instrucoes: exercicio.instrucoes,
      musculos_primarios: exercicio.musculos_primarios,
      musculos_secundarios: exercicio.musculos_secundarios,
      peso_sugerido: this.calcularPesoSugerido(exercicio),
      observacoes: this.gerarObservacoesExercicio(exercicio)
    };
  }

  // Selecionar exercícios complementares
  selecionarExerciciosComplementares(grupos, exerciciosJaIncluidos) {
    const complementares = [];
    
    grupos.forEach(grupo => {
      const exerciciosGrupo = obterExerciciosPorGrupo(grupo);
      const exerciciosDisponiveis = exerciciosGrupo.filter(ex => 
        !exerciciosJaIncluidos.includes(ex) && 
        exercicios[ex].dificuldade === this.nivelTreino
      );
      
      if (exerciciosDisponiveis.length > 0 && complementares.length < 2) {
        const exercicioSelecionado = exerciciosDisponiveis[Math.floor(Math.random() * exerciciosDisponiveis.length)];
        const exercicio = exercicios[exercicioSelecionado];
        complementares.push(this.configurarExercicio(exercicio, exercicioSelecionado));
      }
    });
    
    return complementares;
  }

  // Calcular peso sugerido baseado no nível
  calcularPesoSugerido(exercicio) {
    const { peso } = this.anamnese;
    const { categoria, equipamento } = exercicio;
    
    if (equipamento === 'peso_corporal') {
      return 'Peso corporal';
    }
    
    let percentualPeso;
    
    // Percentuais baseados no peso corporal e nível
    if (categoria === 'composto') {
      switch (this.nivelTreino) {
        case 'iniciante':
          percentualPeso = exercicio.grupo_muscular === 'pernas' ? 0.8 : 0.5;
          break;
        case 'intermediario':
          percentualPeso = exercicio.grupo_muscular === 'pernas' ? 1.2 : 0.8;
          break;
        case 'avancado':
          percentualPeso = exercicio.grupo_muscular === 'pernas' ? 1.5 : 1.0;
          break;
      }
    } else {
      // Exercícios isolados usam menos peso
      switch (this.nivelTreino) {
        case 'iniciante':
          percentualPeso = 0.2;
          break;
        case 'intermediario':
          percentualPeso = 0.3;
          break;
        case 'avancado':
          percentualPeso = 0.4;
          break;
      }
    }
    
    const pesoSugerido = Math.round((peso * percentualPeso) / 5) * 5; // Arredondar para múltiplos de 5
    return `${pesoSugerido}kg`;
  }

  // Calcular duração estimada do treino
  calcularDuracaoEstimada(numeroExercicios) {
    const tempoBase = 10; // minutos por exercício
    const tempoAquecimento = 10;
    const tempoDescanso = numeroExercicios * 2; // 2 minutos de descanso médio por exercício
    
    return tempoAquecimento + (numeroExercicios * tempoBase) + tempoDescanso;
  }

  // Gerar observações gerais do treino
  gerarObservacoes() {
    const observacoes = [
      'Faça um aquecimento de 5-10 minutos antes de iniciar o treino',
      'Mantenha a técnica correta em todos os exercícios',
      'Hidrate-se adequadamente durante o treino'
    ];

    if (this.nivelTreino === 'iniciante') {
      observacoes.push('Comece com pesos mais leves e foque na técnica');
      observacoes.push('Aumente a carga gradualmente a cada semana');
    } else if (this.nivelTreino === 'avancado') {
      observacoes.push('Considere técnicas avançadas como drop sets ou rest-pause');
      observacoes.push('Monitore sinais de overtraining');
    }

    return observacoes;
  }

  // Gerar observações específicas do exercício
  gerarObservacoesExercicio(exercicio) {
    const observacoes = [];
    
    if (exercicio.categoria === 'composto') {
      observacoes.push('Exercício composto - trabalha múltiplos grupos musculares');
    }
    
    if (exercicio.dificuldade === 'avancado') {
      observacoes.push('Exercício avançado - certifique-se de dominar a técnica');
    }
    
    if (exercicio.equipamento === 'peso_corporal') {
      observacoes.push('Use o peso corporal - ajuste a dificuldade conforme necessário');
    }
    
    return observacoes;
  }

  // Gerar programa de treino semanal completo
  gerarProgramaSemanal() {
    const programa = {
      usuario: this.anamnese.userId,
      data_inicio: new Date().toISOString().split('T')[0],
      divisao: this.divisaoTreino,
      nivel: this.nivelTreino,
      frequencia_semanal: this.anamnese.frequencia_semanal,
      objetivo: this.anamnese.objetivo,
      treinos_semana: {}
    };

    // Gerar treino para cada dia da semana
    for (let dia = 0; dia < 7; dia++) {
      const nomeDia = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][dia];
      programa.treinos_semana[nomeDia] = this.gerarTreinoDoDia(dia);
    }

    return programa;
  }
}

module.exports = TreinoGenerator;

