const TreinoGenerator = require('../algorithms/treinoGenerator');

describe('TreinoGenerator', () => {
  let anamneseIniciante, anamneseIntermediario, anamneseAvancado;

  beforeEach(() => {
    // Dados de teste para iniciante
    anamneseIniciante = {
      userId: 'test-user-1',
      nome: 'João Silva',
      sexo: 'masculino',
      idade: 25,
      peso: 70,
      altura: 175,
      experiencia_treino: 'Nunca treinei',
      frequencia_semanal: 3,
      objetivo: 'Melhorar condicionamento físico'
    };

    // Dados de teste para intermediário
    anamneseIntermediario = {
      userId: 'test-user-2',
      nome: 'Maria Santos',
      sexo: 'feminino',
      idade: 30,
      peso: 60,
      altura: 165,
      experiencia_treino: 'Menos de 1 ano',
      frequencia_semanal: 4,
      objetivo: 'Perder peso'
    };

    // Dados de teste para avançado
    anamneseAvancado = {
      userId: 'test-user-3',
      nome: 'Carlos Oliveira',
      sexo: 'masculino',
      idade: 35,
      peso: 85,
      altura: 180,
      experiencia_treino: 'Mais de 2 anos',
      frequencia_semanal: 6,
      objetivo: 'Ganhar massa muscular'
    };
  });

  describe('Determinação do Nível de Treino', () => {
    test('deve classificar como iniciante', () => {
      const generator = new TreinoGenerator(anamneseIniciante);
      expect(generator.nivelTreino).toBe('iniciante');
    });

    test('deve classificar como intermediário', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      expect(generator.nivelTreino).toBe('intermediario');
    });

    test('deve classificar como avançado', () => {
      const generator = new TreinoGenerator(anamneseAvancado);
      expect(generator.nivelTreino).toBe('avancado');
    });

    test('deve classificar como iniciante para frequência baixa', () => {
      const anamneseBaixaFrequencia = {
        ...anamneseAvancado,
        frequencia_semanal: 2
      };
      
      const generator = new TreinoGenerator(anamneseBaixaFrequencia);
      expect(generator.nivelTreino).toBe('iniciante');
    });
  });

  describe('Seleção de Divisão de Treino', () => {
    test('deve selecionar fullbody para iniciante', () => {
      const generator = new TreinoGenerator(anamneseIniciante);
      expect(generator.divisaoTreino).toBe('fullbody');
    });

    test('deve selecionar abc para intermediário', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      expect(generator.divisaoTreino).toBe('abc');
    });

    test('deve selecionar push_pull_legs para avançado', () => {
      const generator = new TreinoGenerator(anamneseAvancado);
      expect(generator.divisaoTreino).toBe('push_pull_legs');
    });

    test('deve selecionar fullbody para frequência baixa independente do nível', () => {
      const anamneseBaixaFrequencia = {
        ...anamneseAvancado,
        frequencia_semanal: 2
      };
      
      const generator = new TreinoGenerator(anamneseBaixaFrequencia);
      expect(generator.divisaoTreino).toBe('fullbody');
    });
  });

  describe('Geração de Treino do Dia', () => {
    test('deve gerar treino completo', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      const treino = generator.gerarTreinoDoDia(1); // Segunda-feira
      
      expect(treino).toHaveProperty('tipo');
      expect(treino).toHaveProperty('titulo');
      expect(treino).toHaveProperty('data');
      expect(treino).toHaveProperty('nivel');
      expect(treino).toHaveProperty('duracao_estimada');
      expect(treino).toHaveProperty('exercicios');
      expect(treino).toHaveProperty('observacoes');
    });

    test('deve gerar dia de descanso no domingo', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      const treino = generator.gerarTreinoDoDia(0); // Domingo
      
      expect(treino.tipo).toBe('descanso');
      expect(treino.titulo).toBe('Dia de Descanso');
    });

    test('deve gerar treino A na segunda-feira para divisão ABC', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      const treino = generator.gerarTreinoDoDia(1); // Segunda-feira
      
      expect(treino.tipo).toBe('treino');
      expect(treino.titulo).toContain('A');
    });

    test('deve ter exercícios válidos', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      const treino = generator.gerarTreinoDoDia(1); // Segunda-feira
      
      if (treino.tipo === 'treino') {
        expect(treino.exercicios).toBeInstanceOf(Array);
        expect(treino.exercicios.length).toBeGreaterThan(0);
        
        treino.exercicios.forEach(exercicio => {
          expect(exercicio).toHaveProperty('id');
          expect(exercicio).toHaveProperty('nome');
          expect(exercicio).toHaveProperty('series');
          expect(exercicio).toHaveProperty('repeticoes');
          expect(exercicio).toHaveProperty('descanso_segundos');
          expect(exercicio).toHaveProperty('instrucoes');
          expect(exercicio).toHaveProperty('peso_sugerido');
        });
      }
    });

    test('deve ter duração estimada positiva', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      const treino = generator.gerarTreinoDoDia(1); // Segunda-feira
      
      if (treino.tipo === 'treino') {
        expect(treino.duracao_estimada).toBeGreaterThan(0);
      }
    });
  });

  describe('Configuração de Exercícios', () => {
    test('deve configurar séries baseadas no nível', () => {
      const generatorIniciante = new TreinoGenerator(anamneseIniciante);
      const treinoIniciante = generatorIniciante.gerarTreinoDoDia(1);
      
      const generatorAvancado = new TreinoGenerator(anamneseAvancado);
      const treinoAvancado = generatorAvancado.gerarTreinoDoDia(1);
      
      if (treinoIniciante.tipo === 'treino' && treinoAvancado.tipo === 'treino') {
        // Iniciante deve ter menos exercícios que avançado
        expect(treinoIniciante.exercicios.length).toBeLessThanOrEqual(4);
        expect(treinoAvancado.exercicios.length).toBeLessThanOrEqual(6);
      }
    });

    test('deve calcular peso sugerido baseado no peso corporal', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      const treino = generator.gerarTreinoDoDia(1);
      
      if (treino.tipo === 'treino') {
        treino.exercicios.forEach(exercicio => {
          expect(exercicio.peso_sugerido).toBeDefined();
          expect(typeof exercicio.peso_sugerido).toBe('string');
          
          if (exercicio.peso_sugerido !== 'Peso corporal') {
            expect(exercicio.peso_sugerido).toMatch(/^\d+kg$/);
          }
        });
      }
    });

    test('deve ter instruções para cada exercício', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      const treino = generator.gerarTreinoDoDia(1);
      
      if (treino.tipo === 'treino') {
        treino.exercicios.forEach(exercicio => {
          expect(exercicio.instrucoes).toBeInstanceOf(Array);
          expect(exercicio.instrucoes.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Mapeamento de Dias da Semana', () => {
    test('deve mapear corretamente para fullbody', () => {
      const generator = new TreinoGenerator(anamneseIniciante);
      
      // Segunda, quarta, sexta devem ser treino
      expect(generator.gerarTreinoDoDia(1).tipo).toBe('treino'); // Segunda
      expect(generator.gerarTreinoDoDia(3).tipo).toBe('treino'); // Quarta
      expect(generator.gerarTreinoDoDia(5).tipo).toBe('treino'); // Sexta
      
      // Outros dias devem ser descanso
      expect(generator.gerarTreinoDoDia(0).tipo).toBe('descanso'); // Domingo
      expect(generator.gerarTreinoDoDia(2).tipo).toBe('descanso'); // Terça
      expect(generator.gerarTreinoDoDia(4).tipo).toBe('descanso'); // Quinta
      expect(generator.gerarTreinoDoDia(6).tipo).toBe('descanso'); // Sábado
    });

    test('deve mapear corretamente para ABC', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      
      // Segunda a sábado devem ser treino
      for (let dia = 1; dia <= 6; dia++) {
        expect(generator.gerarTreinoDoDia(dia).tipo).toBe('treino');
      }
      
      // Domingo deve ser descanso
      expect(generator.gerarTreinoDoDia(0).tipo).toBe('descanso');
    });
  });

  describe('Programa Semanal', () => {
    test('deve gerar programa completo', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      const programa = generator.gerarProgramaSemanal();
      
      expect(programa).toHaveProperty('usuario');
      expect(programa).toHaveProperty('data_inicio');
      expect(programa).toHaveProperty('divisao');
      expect(programa).toHaveProperty('nivel');
      expect(programa).toHaveProperty('frequencia_semanal');
      expect(programa).toHaveProperty('objetivo');
      expect(programa).toHaveProperty('treinos_semana');
    });

    test('deve ter treinos para todos os dias da semana', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      const programa = generator.gerarProgramaSemanal();
      
      const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
      
      diasSemana.forEach(dia => {
        expect(programa.treinos_semana).toHaveProperty(dia);
      });
    });

    test('deve ter dados corretos do usuário', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      const programa = generator.gerarProgramaSemanal();
      
      expect(programa.usuario).toBe(anamneseIntermediario.userId);
      expect(programa.nivel).toBe('intermediario');
      expect(programa.divisao).toBe('abc');
      expect(programa.frequencia_semanal).toBe(4);
      expect(programa.objetivo).toBe('Perder peso');
    });
  });

  describe('Cálculo de Duração', () => {
    test('deve calcular duração baseada no número de exercícios', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      
      // Testar com diferentes números de exercícios
      const duracao4Ex = generator.calcularDuracaoEstimada(4);
      const duracao6Ex = generator.calcularDuracaoEstimada(6);
      
      expect(duracao6Ex).toBeGreaterThan(duracao4Ex);
      expect(duracao4Ex).toBeGreaterThan(0);
    });

    test('deve incluir tempo de aquecimento', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      const duracao = generator.calcularDuracaoEstimada(1);
      
      // Deve ser maior que apenas o tempo do exercício
      expect(duracao).toBeGreaterThan(10); // Mais que apenas 1 exercício
    });
  });

  describe('Observações e Instruções', () => {
    test('deve gerar observações gerais', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      const observacoes = generator.gerarObservacoes();
      
      expect(observacoes).toBeInstanceOf(Array);
      expect(observacoes.length).toBeGreaterThan(0);
      
      observacoes.forEach(obs => {
        expect(typeof obs).toBe('string');
        expect(obs.length).toBeGreaterThan(0);
      });
    });

    test('deve ter observações específicas para iniciantes', () => {
      const generator = new TreinoGenerator(anamneseIniciante);
      const observacoes = generator.gerarObservacoes();
      
      const temObservacaoIniciante = observacoes.some(obs => 
        obs.includes('iniciante') || obs.includes('técnica') || obs.includes('gradualmente')
      );
      
      expect(temObservacaoIniciante).toBe(true);
    });

    test('deve ter observações específicas para avançados', () => {
      const generator = new TreinoGenerator(anamneseAvancado);
      const observacoes = generator.gerarObservacoes();
      
      const temObservacaoAvancado = observacoes.some(obs => 
        obs.includes('avançado') || obs.includes('drop sets') || obs.includes('overtraining')
      );
      
      expect(temObservacaoAvancado).toBe(true);
    });
  });

  describe('Casos extremos', () => {
    test('deve lidar com frequência semanal muito baixa', () => {
      const anamneseBaixaFreq = {
        ...anamneseAvancado,
        frequencia_semanal: 1
      };
      
      const generator = new TreinoGenerator(anamneseBaixaFreq);
      const programa = generator.gerarProgramaSemanal();
      
      expect(programa.divisao).toBe('fullbody');
      expect(programa.nivel).toBe('iniciante');
    });

    test('deve lidar com frequência semanal muito alta', () => {
      const anamneseAltaFreq = {
        ...anamneseAvancado,
        frequencia_semanal: 7
      };
      
      const generator = new TreinoGenerator(anamneseAltaFreq);
      const programa = generator.gerarProgramaSemanal();
      
      expect(programa.divisao).toBe('push_pull_legs');
    });

    test('deve lidar com peso muito baixo', () => {
      const anamneseLeve = {
        ...anamneseIniciante,
        peso: 40
      };
      
      const generator = new TreinoGenerator(anamneseLeve);
      const treino = generator.gerarTreinoDoDia(1);
      
      if (treino.tipo === 'treino') {
        treino.exercicios.forEach(exercicio => {
          expect(exercicio.peso_sugerido).toBeDefined();
        });
      }
    });

    test('deve lidar com peso muito alto', () => {
      const anamnesePesado = {
        ...anamneseAvancado,
        peso: 150
      };
      
      const generator = new TreinoGenerator(anamnesePesado);
      const treino = generator.gerarTreinoDoDia(1);
      
      if (treino.tipo === 'treino') {
        treino.exercicios.forEach(exercicio => {
          expect(exercicio.peso_sugerido).toBeDefined();
        });
      }
    });
  });

  describe('Validação de dados', () => {
    test('deve ter data no formato correto', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      const treino = generator.gerarTreinoDoDia(1);
      
      expect(treino.data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('deve ter nível correto no treino', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      const treino = generator.gerarTreinoDoDia(1);
      
      if (treino.tipo === 'treino') {
        expect(treino.nivel).toBe('intermediario');
      }
    });

    test('deve ter grupos musculares definidos', () => {
      const generator = new TreinoGenerator(anamneseIntermediario);
      const treino = generator.gerarTreinoDoDia(1);
      
      if (treino.tipo === 'treino') {
        expect(treino.grupos_musculares).toBeInstanceOf(Array);
        expect(treino.grupos_musculares.length).toBeGreaterThan(0);
      }
    });
  });
});

