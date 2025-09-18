const { 
  exercicios, 
  divisoesTreino, 
  obterExerciciosPorGrupo, 
  obterExerciciosPorDificuldade, 
  obterExerciciosCompostos 
} = require('../data/exercicios');

describe('Base de Exercícios', () => {
  describe('Estrutura dos exercícios', () => {
    test('deve ter exercícios definidos', () => {
      expect(exercicios).toBeDefined();
      expect(typeof exercicios).toBe('object');
      expect(Object.keys(exercicios).length).toBeGreaterThan(0);
    });

    test('cada exercício deve ter propriedades obrigatórias', () => {
      Object.keys(exercicios).forEach(key => {
        const exercicio = exercicios[key];
        
        expect(exercicio).toHaveProperty('nome');
        expect(exercicio).toHaveProperty('grupo_muscular');
        expect(exercicio).toHaveProperty('categoria');
        expect(exercicio).toHaveProperty('equipamento');
        expect(exercicio).toHaveProperty('dificuldade');
        expect(exercicio).toHaveProperty('instrucoes');
        expect(exercicio).toHaveProperty('musculos_primarios');
        expect(exercicio).toHaveProperty('musculos_secundarios');
        expect(exercicio).toHaveProperty('series_recomendadas');
        expect(exercicio).toHaveProperty('repeticoes_recomendadas');
        expect(exercicio).toHaveProperty('descanso_segundos');
        
        // Verificar tipos
        expect(typeof exercicio.nome).toBe('string');
        expect(typeof exercicio.grupo_muscular).toBe('string');
        expect(typeof exercicio.categoria).toBe('string');
        expect(typeof exercicio.equipamento).toBe('string');
        expect(typeof exercicio.dificuldade).toBe('string');
        expect(Array.isArray(exercicio.instrucoes)).toBe(true);
        expect(Array.isArray(exercicio.musculos_primarios)).toBe(true);
        expect(Array.isArray(exercicio.musculos_secundarios)).toBe(true);
        expect(typeof exercicio.series_recomendadas).toBe('object');
        expect(typeof exercicio.repeticoes_recomendadas).toBe('object');
        expect(typeof exercicio.descanso_segundos).toBe('number');
      });
    });

    test('séries recomendadas devem ter todos os níveis', () => {
      Object.keys(exercicios).forEach(key => {
        const exercicio = exercicios[key];
        
        expect(exercicio.series_recomendadas).toHaveProperty('iniciante');
        expect(exercicio.series_recomendadas).toHaveProperty('intermediario');
        expect(exercicio.series_recomendadas).toHaveProperty('avancado');
        
        expect(typeof exercicio.series_recomendadas.iniciante).toBe('number');
        expect(typeof exercicio.series_recomendadas.intermediario).toBe('number');
        expect(typeof exercicio.series_recomendadas.avancado).toBe('number');
      });
    });

    test('repetições recomendadas devem ter todos os níveis', () => {
      Object.keys(exercicios).forEach(key => {
        const exercicio = exercicios[key];
        
        expect(exercicio.repeticoes_recomendadas).toHaveProperty('iniciante');
        expect(exercicio.repeticoes_recomendadas).toHaveProperty('intermediario');
        expect(exercicio.repeticoes_recomendadas).toHaveProperty('avancado');
        
        expect(typeof exercicio.repeticoes_recomendadas.iniciante).toBe('string');
        expect(typeof exercicio.repeticoes_recomendadas.intermediario).toBe('string');
        expect(typeof exercicio.repeticoes_recomendadas.avancado).toBe('string');
      });
    });

    test('deve ter categorias válidas', () => {
      const categoriasValidas = ['composto', 'isolado', 'isometrico'];
      
      Object.keys(exercicios).forEach(key => {
        const exercicio = exercicios[key];
        expect(categoriasValidas).toContain(exercicio.categoria);
      });
    });

    test('deve ter dificuldades válidas', () => {
      const dificuldadesValidas = ['iniciante', 'intermediario', 'avancado'];
      
      Object.keys(exercicios).forEach(key => {
        const exercicio = exercicios[key];
        expect(dificuldadesValidas).toContain(exercicio.dificuldade);
      });
    });

    test('deve ter equipamentos válidos', () => {
      const equipamentosValidos = [
        'barra', 'halteres', 'peso_corporal', 'polia', 'maquina'
      ];
      
      Object.keys(exercicios).forEach(key => {
        const exercicio = exercicios[key];
        expect(equipamentosValidos).toContain(exercicio.equipamento);
      });
    });
  });

  describe('Função obterExerciciosPorGrupo', () => {
    test('deve retornar exercícios de peito', () => {
      const exerciciosPeito = obterExerciciosPorGrupo('peito');
      
      expect(exerciciosPeito).toBeInstanceOf(Array);
      expect(exerciciosPeito.length).toBeGreaterThan(0);
      expect(exerciciosPeito).toContain('supino_reto');
      expect(exerciciosPeito).toContain('flexao_peito');
    });

    test('deve retornar exercícios de costas', () => {
      const exerciciosCostas = obterExerciciosPorGrupo('costas');
      
      expect(exerciciosCostas).toBeInstanceOf(Array);
      expect(exerciciosCostas.length).toBeGreaterThan(0);
      expect(exerciciosCostas).toContain('puxada_frente');
      expect(exerciciosCostas).toContain('remada_curvada');
    });

    test('deve retornar exercícios de pernas', () => {
      const exerciciosPernas = obterExerciciosPorGrupo('pernas');
      
      expect(exerciciosPernas).toBeInstanceOf(Array);
      expect(exerciciosPernas.length).toBeGreaterThan(0);
      expect(exerciciosPernas).toContain('agachamento');
      expect(exerciciosPernas).toContain('leg_press');
    });

    test('deve retornar array vazio para grupo inexistente', () => {
      const inexistente = obterExerciciosPorGrupo('grupo_inexistente');
      
      expect(inexistente).toBeInstanceOf(Array);
      expect(inexistente.length).toBe(0);
    });

    test('todos os exercícios retornados devem ser do grupo solicitado', () => {
      const exerciciosPeito = obterExerciciosPorGrupo('peito');
      
      exerciciosPeito.forEach(exercicioKey => {
        expect(exercicios[exercicioKey].grupo_muscular).toBe('peito');
      });
    });
  });

  describe('Função obterExerciciosPorDificuldade', () => {
    test('deve retornar exercícios para iniciantes', () => {
      const exerciciosIniciante = obterExerciciosPorDificuldade('iniciante');
      
      expect(exerciciosIniciante).toBeInstanceOf(Array);
      expect(exerciciosIniciante.length).toBeGreaterThan(0);
      expect(exerciciosIniciante).toContain('flexao_peito');
      expect(exerciciosIniciante).toContain('puxada_frente');
    });

    test('deve retornar exercícios para intermediários', () => {
      const exerciciosIntermediario = obterExerciciosPorDificuldade('intermediario');
      
      expect(exerciciosIntermediario).toBeInstanceOf(Array);
      expect(exerciciosIntermediario.length).toBeGreaterThan(0);
    });

    test('todos os exercícios retornados devem ser da dificuldade solicitada', () => {
      const exerciciosIniciante = obterExerciciosPorDificuldade('iniciante');
      
      exerciciosIniciante.forEach(exercicioKey => {
        expect(exercicios[exercicioKey].dificuldade).toBe('iniciante');
      });
    });
  });

  describe('Função obterExerciciosCompostos', () => {
    test('deve retornar exercícios compostos', () => {
      const exerciciosCompostos = obterExerciciosCompostos();
      
      expect(exerciciosCompostos).toBeInstanceOf(Array);
      expect(exerciciosCompostos.length).toBeGreaterThan(0);
      expect(exerciciosCompostos).toContain('supino_reto');
      expect(exerciciosCompostos).toContain('agachamento');
    });

    test('todos os exercícios retornados devem ser compostos', () => {
      const exerciciosCompostos = obterExerciciosCompostos();
      
      exerciciosCompostos.forEach(exercicioKey => {
        expect(exercicios[exercicioKey].categoria).toBe('composto');
      });
    });
  });

  describe('Divisões de Treino', () => {
    test('deve ter divisões definidas', () => {
      expect(divisoesTreino).toBeDefined();
      expect(typeof divisoesTreino).toBe('object');
      expect(Object.keys(divisoesTreino).length).toBeGreaterThan(0);
    });

    test('deve ter divisão ABC', () => {
      expect(divisoesTreino).toHaveProperty('abc');
      
      const abc = divisoesTreino.abc;
      expect(abc).toHaveProperty('nome');
      expect(abc).toHaveProperty('descricao');
      expect(abc).toHaveProperty('frequencia_semanal');
      expect(abc).toHaveProperty('dias');
      
      expect(abc.dias).toHaveProperty('A');
      expect(abc.dias).toHaveProperty('B');
      expect(abc.dias).toHaveProperty('C');
    });

    test('deve ter divisão Push/Pull/Legs', () => {
      expect(divisoesTreino).toHaveProperty('push_pull_legs');
      
      const ppl = divisoesTreino.push_pull_legs;
      expect(ppl.dias).toHaveProperty('push');
      expect(ppl.dias).toHaveProperty('pull');
      expect(ppl.dias).toHaveProperty('legs');
    });

    test('deve ter divisão Full Body', () => {
      expect(divisoesTreino).toHaveProperty('fullbody');
      
      const fullbody = divisoesTreino.fullbody;
      expect(fullbody.dias).toHaveProperty('fullbody');
    });

    test('cada dia deve ter exercícios principais', () => {
      Object.keys(divisoesTreino).forEach(divisaoKey => {
        const divisao = divisoesTreino[divisaoKey];
        
        Object.keys(divisao.dias).forEach(diaKey => {
          const dia = divisao.dias[diaKey];
          
          expect(dia).toHaveProperty('nome');
          expect(dia).toHaveProperty('grupos');
          expect(dia).toHaveProperty('exercicios_principais');
          
          expect(Array.isArray(dia.grupos)).toBe(true);
          expect(Array.isArray(dia.exercicios_principais)).toBe(true);
          expect(dia.exercicios_principais.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Exercícios específicos', () => {
    test('supino reto deve ter configuração correta', () => {
      const supino = exercicios['supino_reto'];
      
      expect(supino.nome).toBe('Supino reto com barra');
      expect(supino.grupo_muscular).toBe('peito');
      expect(supino.categoria).toBe('composto');
      expect(supino.equipamento).toBe('barra');
      expect(supino.dificuldade).toBe('intermediario');
      expect(supino.instrucoes.length).toBeGreaterThan(0);
      expect(supino.musculos_primarios).toContain('peitoral_maior');
    });

    test('agachamento deve ter configuração correta', () => {
      const agachamento = exercicios['agachamento'];
      
      expect(agachamento.nome).toBe('Agachamento livre');
      expect(agachamento.grupo_muscular).toBe('pernas');
      expect(agachamento.categoria).toBe('composto');
      expect(agachamento.equipamento).toBe('barra');
      expect(agachamento.musculos_primarios).toContain('quadriceps');
      expect(agachamento.musculos_primarios).toContain('gluteos');
    });

    test('flexão deve ter configuração correta', () => {
      const flexao = exercicios['flexao_peito'];
      
      expect(flexao.nome).toBe('Flexão de braço');
      expect(flexao.grupo_muscular).toBe('peito');
      expect(flexao.categoria).toBe('composto');
      expect(flexao.equipamento).toBe('peso_corporal');
      expect(flexao.dificuldade).toBe('iniciante');
    });
  });

  describe('Cobertura de grupos musculares', () => {
    test('deve ter exercícios para todos os grupos principais', () => {
      const gruposEsperados = [
        'peito', 'costas', 'pernas', 'ombros', 'biceps', 'triceps', 'core'
      ];
      
      gruposEsperados.forEach(grupo => {
        const exerciciosGrupo = obterExerciciosPorGrupo(grupo);
        expect(exerciciosGrupo.length).toBeGreaterThan(0);
      });
    });

    test('deve ter variedade suficiente para peito', () => {
      const exerciciosPeito = obterExerciciosPorGrupo('peito');
      expect(exerciciosPeito.length).toBeGreaterThanOrEqual(2);
    });

    test('deve ter variedade suficiente para pernas', () => {
      const exerciciosPernas = obterExerciciosPorGrupo('pernas');
      expect(exerciciosPernas.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Validação de instruções', () => {
    test('todos os exercícios devem ter instruções', () => {
      Object.keys(exercicios).forEach(key => {
        const exercicio = exercicios[key];
        
        expect(exercicio.instrucoes.length).toBeGreaterThan(0);
        
        exercicio.instrucoes.forEach(instrucao => {
          expect(typeof instrucao).toBe('string');
          expect(instrucao.length).toBeGreaterThan(0);
        });
      });
    });

    test('exercícios devem ter músculos primários', () => {
      Object.keys(exercicios).forEach(key => {
        const exercicio = exercicios[key];
        
        expect(exercicio.musculos_primarios.length).toBeGreaterThan(0);
        
        exercicio.musculos_primarios.forEach(musculo => {
          expect(typeof musculo).toBe('string');
          expect(musculo.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Progressão de dificuldade', () => {
    test('exercícios avançados devem ter mais séries que iniciantes', () => {
      const exerciciosIniciante = obterExerciciosPorDificuldade('iniciante');
      const exerciciosAvancado = obterExerciciosPorDificuldade('avancado');
      
      if (exerciciosIniciante.length > 0 && exerciciosAvancado.length > 0) {
        const seriesIniciante = exercicios[exerciciosIniciante[0]].series_recomendadas.iniciante;
        const seriesAvancado = exercicios[exerciciosAvancado[0]].series_recomendadas.avancado;
        
        expect(seriesAvancado).toBeGreaterThanOrEqual(seriesIniciante);
      }
    });

    test('descanso deve ser apropriado para exercícios compostos', () => {
      const exerciciosCompostos = obterExerciciosCompostos();
      
      exerciciosCompostos.forEach(exercicioKey => {
        const exercicio = exercicios[exercicioKey];
        
        // Exercícios compostos devem ter descanso maior
        expect(exercicio.descanso_segundos).toBeGreaterThanOrEqual(60);
      });
    });
  });

  describe('Consistência dos dados', () => {
    test('exercícios de peso corporal devem ter equipamento correto', () => {
      Object.keys(exercicios).forEach(key => {
        const exercicio = exercicios[key];
        
        if (exercicio.equipamento === 'peso_corporal') {
          expect(['flexao_peito', 'prancha', 'abdominal_crunch']).toContain(key);
        }
      });
    });

    test('exercícios isométricos devem ter repetições em tempo', () => {
      Object.keys(exercicios).forEach(key => {
        const exercicio = exercicios[key];
        
        if (exercicio.categoria === 'isometrico') {
          expect(exercicio.repeticoes_recomendadas.iniciante).toMatch(/\d+s/);
        }
      });
    });

    test('exercícios compostos devem trabalhar múltiplos músculos', () => {
      const exerciciosCompostos = obterExerciciosCompostos();
      
      exerciciosCompostos.forEach(exercicioKey => {
        const exercicio = exercicios[exercicioKey];
        
        const totalMusculos = exercicio.musculos_primarios.length + 
                             exercicio.musculos_secundarios.length;
        
        expect(totalMusculos).toBeGreaterThan(1);
      });
    });
  });
});

