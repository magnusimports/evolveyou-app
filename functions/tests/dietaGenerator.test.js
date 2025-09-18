const DietaGenerator = require('../algorithms/dietaGenerator');

describe('DietaGenerator', () => {
  let anamneseMasculino, anamneseFeminino, anamnesePerderPeso, anamneseGanharMassa;

  beforeEach(() => {
    // Dados de teste para homem
    anamneseMasculino = {
      userId: 'test-user-1',
      nome: 'João Silva',
      sexo: 'masculino',
      idade: 30,
      peso: 80,
      altura: 180,
      objetivo: 'Manter peso atual',
      nivel_atividade: 'moderadamente_ativo'
    };

    // Dados de teste para mulher
    anamneseFeminino = {
      userId: 'test-user-2',
      nome: 'Maria Santos',
      sexo: 'feminino',
      idade: 25,
      peso: 60,
      altura: 165,
      objetivo: 'Manter peso atual',
      nivel_atividade: 'moderadamente_ativo'
    };

    // Dados para perder peso
    anamnesePerderPeso = {
      ...anamneseMasculino,
      objetivo: 'Perder peso'
    };

    // Dados para ganhar massa
    anamneseGanharMassa = {
      ...anamneseMasculino,
      objetivo: 'Ganhar massa muscular'
    };
  });

  describe('Cálculo de TMB', () => {
    test('deve calcular TMB corretamente para homem', () => {
      const generator = new DietaGenerator(anamneseMasculino);
      const tmb = generator.calcularTMB();
      
      // TMB esperado: (10 * 80) + (6.25 * 180) - (5 * 30) + 5 = 1810
      expect(tmb).toBe(1810);
    });

    test('deve calcular TMB corretamente para mulher', () => {
      const generator = new DietaGenerator(anamneseFeminino);
      const tmb = generator.calcularTMB();
      
      // TMB esperado: (10 * 60) + (6.25 * 165) - (5 * 25) - 161 = 1370.25
      expect(tmb).toBe(1370.25);
    });

    test('deve retornar valores positivos', () => {
      const generator = new DietaGenerator(anamneseMasculino);
      const tmb = generator.calcularTMB();
      
      expect(tmb).toBeGreaterThan(0);
    });
  });

  describe('Cálculo de TDEE', () => {
    test('deve calcular TDEE corretamente', () => {
      const generator = new DietaGenerator(anamneseMasculino);
      const tdee = generator.calcularTDEE();
      
      // TDEE esperado: 1810 * 1.55 = 2805.5
      expect(tdee).toBe(2805.5);
    });

    test('deve usar fator padrão para nível de atividade inválido', () => {
      const anamneseInvalida = {
        ...anamneseMasculino,
        nivel_atividade: 'nivel_inexistente'
      };
      
      const generator = new DietaGenerator(anamneseInvalida);
      const tdee = generator.calcularTDEE();
      
      // Deve usar fator padrão 1.375
      expect(tdee).toBe(1810 * 1.375);
    });

    test('deve retornar TDEE maior que TMB', () => {
      const generator = new DietaGenerator(anamneseMasculino);
      const tmb = generator.calcularTMB();
      const tdee = generator.calcularTDEE();
      
      expect(tdee).toBeGreaterThan(tmb);
    });
  });

  describe('Cálculo de Calorias Meta', () => {
    test('deve aplicar déficit para perder peso', () => {
      const generator = new DietaGenerator(anamnesePerderPeso);
      const tdee = generator.calcularTDEE();
      const caloriasMeta = generator.calcularCaloriasMeta();
      
      expect(caloriasMeta).toBe(tdee - 500);
    });

    test('deve aplicar superávit para ganhar massa', () => {
      const generator = new DietaGenerator(anamneseGanharMassa);
      const tdee = generator.calcularTDEE();
      const caloriasMeta = generator.calcularCaloriasMeta();
      
      expect(caloriasMeta).toBe(tdee + 300);
    });

    test('deve manter TDEE para manter peso', () => {
      const generator = new DietaGenerator(anamneseMasculino);
      const tdee = generator.calcularTDEE();
      const caloriasMeta = generator.calcularCaloriasMeta();
      
      expect(caloriasMeta).toBe(tdee);
    });
  });

  describe('Cálculo de Macronutrientes', () => {
    test('deve calcular macros para perder peso', () => {
      const generator = new DietaGenerator(anamnesePerderPeso);
      const macros = generator.calcularMacronutrientes();
      
      expect(macros).toHaveProperty('proteinas');
      expect(macros).toHaveProperty('carboidratos');
      expect(macros).toHaveProperty('gorduras');
      
      // Proteína alta para perder peso: 2.2g/kg
      expect(macros.proteinas.gramas).toBe(80 * 2.2);
      
      // Verificar se todos os valores são positivos
      expect(macros.proteinas.gramas).toBeGreaterThan(0);
      expect(macros.carboidratos.gramas).toBeGreaterThan(0);
      expect(macros.gorduras.gramas).toBeGreaterThan(0);
    });

    test('deve calcular macros para ganhar massa', () => {
      const generator = new DietaGenerator(anamneseGanharMassa);
      const macros = generator.calcularMacronutrientes();
      
      // Proteína para ganhar massa: 2.0g/kg
      expect(macros.proteinas.gramas).toBe(80 * 2.0);
      
      // Carboidratos devem ser 45% das calorias
      expect(macros.carboidratos.percentual).toBe(45);
    });

    test('deve ter percentuais que somam aproximadamente 100%', () => {
      const generator = new DietaGenerator(anamneseMasculino);
      const macros = generator.calcularMacronutrientes();
      
      const totalPercentual = macros.proteinas.percentual + 
                             macros.carboidratos.percentual + 
                             macros.gorduras.percentual;
      
      // Permitir pequena variação devido a arredondamentos
      expect(totalPercentual).toBeGreaterThanOrEqual(95);
      expect(totalPercentual).toBeLessThanOrEqual(105);
    });
  });

  describe('Geração de Plano Alimentar', () => {
    test('deve gerar plano completo', () => {
      const generator = new DietaGenerator(anamneseMasculino);
      const plano = generator.gerarPlanoAlimentar();
      
      expect(plano).toHaveProperty('dataPlano');
      expect(plano).toHaveProperty('usuario');
      expect(plano).toHaveProperty('objetivo');
      expect(plano).toHaveProperty('calorias_meta');
      expect(plano).toHaveProperty('macronutrientes_meta');
      expect(plano).toHaveProperty('refeicoes');
      expect(plano).toHaveProperty('totalCalorias');
      expect(plano).toHaveProperty('totalProteinas');
      expect(plano).toHaveProperty('totalCarboidratos');
      expect(plano).toHaveProperty('totalGorduras');
    });

    test('deve gerar 5 refeições', () => {
      const generator = new DietaGenerator(anamneseMasculino);
      const plano = generator.gerarPlanoAlimentar();
      
      expect(plano.refeicoes).toHaveLength(5);
      
      const nomeRefeicoes = plano.refeicoes.map(r => r.id);
      expect(nomeRefeicoes).toContain('cafe_manha');
      expect(nomeRefeicoes).toContain('lanche_manha');
      expect(nomeRefeicoes).toContain('almoco');
      expect(nomeRefeicoes).toContain('lanche_tarde');
      expect(nomeRefeicoes).toContain('jantar');
    });

    test('deve ter refeições com alimentos', () => {
      const generator = new DietaGenerator(anamneseMasculino);
      const plano = generator.gerarPlanoAlimentar();
      
      plano.refeicoes.forEach(refeicao => {
        expect(refeicao).toHaveProperty('alimentos');
        expect(refeicao.alimentos).toBeInstanceOf(Array);
        expect(refeicao.alimentos.length).toBeGreaterThan(0);
        
        refeicao.alimentos.forEach(alimento => {
          expect(alimento).toHaveProperty('nome');
          expect(alimento).toHaveProperty('quantidade');
          expect(alimento).toHaveProperty('calorias');
          expect(alimento).toHaveProperty('proteinas');
          expect(alimento).toHaveProperty('carboidratos');
          expect(alimento).toHaveProperty('gorduras');
        });
      });
    });

    test('deve calcular totais corretamente', () => {
      const generator = new DietaGenerator(anamneseMasculino);
      const plano = generator.gerarPlanoAlimentar();
      
      let caloriasCalculadas = 0;
      let proteinasCalculadas = 0;
      let carboidratosCalculados = 0;
      let gordurasCalculadas = 0;
      
      plano.refeicoes.forEach(refeicao => {
        refeicao.alimentos.forEach(alimento => {
          caloriasCalculadas += alimento.calorias;
          proteinasCalculadas += alimento.proteinas;
          carboidratosCalculados += alimento.carboidratos;
          gordurasCalculadas += alimento.gorduras;
        });
      });
      
      expect(plano.totalCalorias).toBe(Math.round(caloriasCalculadas));
      expect(plano.totalProteinas).toBe(Math.round(proteinasCalculadas * 10) / 10);
      expect(plano.totalCarboidratos).toBe(Math.round(carboidratosCalculados * 10) / 10);
      expect(plano.totalGorduras).toBe(Math.round(gordurasCalculadas * 10) / 10);
    });

    test('deve ter calorias próximas à meta', () => {
      const generator = new DietaGenerator(anamneseMasculino);
      const plano = generator.gerarPlanoAlimentar();
      
      // Permitir variação de até 10% da meta
      const margem = plano.calorias_meta * 0.1;
      expect(plano.totalCalorias).toBeGreaterThanOrEqual(plano.calorias_meta - margem);
      expect(plano.totalCalorias).toBeLessThanOrEqual(plano.calorias_meta + margem);
    });
  });

  describe('Casos extremos', () => {
    test('deve lidar com idade muito baixa', () => {
      const anamneseJovem = {
        ...anamneseMasculino,
        idade: 18
      };
      
      const generator = new DietaGenerator(anamneseJovem);
      const plano = generator.gerarPlanoAlimentar();
      
      expect(plano.calorias_meta).toBeGreaterThan(0);
      expect(plano.refeicoes).toHaveLength(5);
    });

    test('deve lidar com idade muito alta', () => {
      const anamneseIdoso = {
        ...anamneseMasculino,
        idade: 80
      };
      
      const generator = new DietaGenerator(anamneseIdoso);
      const plano = generator.gerarPlanoAlimentar();
      
      expect(plano.calorias_meta).toBeGreaterThan(0);
      expect(plano.refeicoes).toHaveLength(5);
    });

    test('deve lidar com peso muito baixo', () => {
      const anamneseLeve = {
        ...anamneseFeminino,
        peso: 40
      };
      
      const generator = new DietaGenerator(anamneseLeve);
      const plano = generator.gerarPlanoAlimentar();
      
      expect(plano.calorias_meta).toBeGreaterThan(0);
      expect(plano.macronutrientes_meta.proteinas.gramas).toBeGreaterThan(0);
    });

    test('deve lidar com peso muito alto', () => {
      const anamnesePesado = {
        ...anamneseMasculino,
        peso: 150
      };
      
      const generator = new DietaGenerator(anamnesePesado);
      const plano = generator.gerarPlanoAlimentar();
      
      expect(plano.calorias_meta).toBeGreaterThan(0);
      expect(plano.macronutrientes_meta.proteinas.gramas).toBeGreaterThan(0);
    });
  });

  describe('Validação de dados', () => {
    test('deve ter userId no plano gerado', () => {
      const generator = new DietaGenerator(anamneseMasculino);
      const plano = generator.gerarPlanoAlimentar();
      
      expect(plano.usuario).toBe(anamneseMasculino.userId);
    });

    test('deve ter data do plano', () => {
      const generator = new DietaGenerator(anamneseMasculino);
      const plano = generator.gerarPlanoAlimentar();
      
      expect(plano.dataPlano).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('deve ter objetivo correto', () => {
      const generator = new DietaGenerator(anamnesePerderPeso);
      const plano = generator.gerarPlanoAlimentar();
      
      expect(plano.objetivo).toBe('Perder peso');
    });
  });
});

