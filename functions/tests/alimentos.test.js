const { alimentos, calcularPorcao, obterAlimentosPorCategoria } = require('../data/alimentos');

describe('Base de Alimentos', () => {
  describe('Estrutura dos alimentos', () => {
    test('deve ter alimentos definidos', () => {
      expect(alimentos).toBeDefined();
      expect(typeof alimentos).toBe('object');
      expect(Object.keys(alimentos).length).toBeGreaterThan(0);
    });

    test('cada alimento deve ter propriedades obrigatórias', () => {
      Object.keys(alimentos).forEach(key => {
        const alimento = alimentos[key];
        
        expect(alimento).toHaveProperty('nome');
        expect(alimento).toHaveProperty('categoria');
        expect(alimento).toHaveProperty('calorias');
        expect(alimento).toHaveProperty('proteinas');
        expect(alimento).toHaveProperty('carboidratos');
        expect(alimento).toHaveProperty('gorduras');
        expect(alimento).toHaveProperty('fibras');
        expect(alimento).toHaveProperty('porcao_padrao');
        expect(alimento).toHaveProperty('unidade');
        
        // Verificar tipos
        expect(typeof alimento.nome).toBe('string');
        expect(typeof alimento.categoria).toBe('string');
        expect(typeof alimento.calorias).toBe('number');
        expect(typeof alimento.proteinas).toBe('number');
        expect(typeof alimento.carboidratos).toBe('number');
        expect(typeof alimento.gorduras).toBe('number');
        expect(typeof alimento.fibras).toBe('number');
        expect(typeof alimento.porcao_padrao).toBe('number');
        expect(typeof alimento.unidade).toBe('string');
      });
    });

    test('valores nutricionais devem ser não negativos', () => {
      Object.keys(alimentos).forEach(key => {
        const alimento = alimentos[key];
        
        expect(alimento.calorias).toBeGreaterThanOrEqual(0);
        expect(alimento.proteinas).toBeGreaterThanOrEqual(0);
        expect(alimento.carboidratos).toBeGreaterThanOrEqual(0);
        expect(alimento.gorduras).toBeGreaterThanOrEqual(0);
        expect(alimento.fibras).toBeGreaterThanOrEqual(0);
        expect(alimento.porcao_padrao).toBeGreaterThan(0);
      });
    });

    test('deve ter categorias válidas', () => {
      const categoriasValidas = [
        'proteina_animal', 'suplemento', 'leguminosa', 'carboidrato', 
        'fruta', 'gordura', 'oleaginosa', 'vegetal', 'laticinios'
      ];
      
      Object.keys(alimentos).forEach(key => {
        const alimento = alimentos[key];
        expect(categoriasValidas).toContain(alimento.categoria);
      });
    });
  });

  describe('Função calcularPorcao', () => {
    test('deve calcular porção corretamente', () => {
      const porcao = calcularPorcao('frango_peito', 120);
      
      expect(porcao).toBeDefined();
      expect(porcao).toHaveProperty('nome');
      expect(porcao).toHaveProperty('quantidade');
      expect(porcao).toHaveProperty('unidade');
      expect(porcao).toHaveProperty('calorias');
      expect(porcao).toHaveProperty('proteinas');
      expect(porcao).toHaveProperty('carboidratos');
      expect(porcao).toHaveProperty('gorduras');
      expect(porcao).toHaveProperty('fibras');
    });

    test('deve calcular valores proporcionalmente', () => {
      const porcao100g = calcularPorcao('frango_peito', 100);
      const porcao200g = calcularPorcao('frango_peito', 200);
      
      expect(porcao200g.calorias).toBe(porcao100g.calorias * 2);
      expect(porcao200g.proteinas).toBe(porcao100g.proteinas * 2);
    });

    test('deve retornar null para alimento inexistente', () => {
      const porcao = calcularPorcao('alimento_inexistente', 100);
      expect(porcao).toBeNull();
    });

    test('deve arredondar valores corretamente', () => {
      const porcao = calcularPorcao('frango_peito', 33); // Quantidade que gera decimais
      
      expect(Number.isInteger(porcao.calorias)).toBe(true);
      // Verificar se proteínas está arredondada para 1 casa decimal
      expect(porcao.proteinas).toBe(Math.round(porcao.proteinas * 10) / 10);
    });

    test('deve calcular porção zero', () => {
      const porcao = calcularPorcao('frango_peito', 0);
      
      expect(porcao.calorias).toBe(0);
      expect(porcao.proteinas).toBe(0);
      expect(porcao.carboidratos).toBe(0);
      expect(porcao.gorduras).toBe(0);
    });
  });

  describe('Função obterAlimentosPorCategoria', () => {
    test('deve retornar alimentos da categoria proteína animal', () => {
      const proteinas = obterAlimentosPorCategoria('proteina_animal');
      
      expect(proteinas).toBeInstanceOf(Array);
      expect(proteinas.length).toBeGreaterThan(0);
      expect(proteinas).toContain('frango_peito');
      expect(proteinas).toContain('carne_bovina_magra');
    });

    test('deve retornar alimentos da categoria carboidrato', () => {
      const carboidratos = obterAlimentosPorCategoria('carboidrato');
      
      expect(carboidratos).toBeInstanceOf(Array);
      expect(carboidratos.length).toBeGreaterThan(0);
      expect(carboidratos).toContain('arroz_integral');
      expect(carboidratos).toContain('batata_doce');
    });

    test('deve retornar array vazio para categoria inexistente', () => {
      const inexistente = obterAlimentosPorCategoria('categoria_inexistente');
      
      expect(inexistente).toBeInstanceOf(Array);
      expect(inexistente.length).toBe(0);
    });

    test('todos os alimentos retornados devem ser da categoria solicitada', () => {
      const vegetais = obterAlimentosPorCategoria('vegetal');
      
      vegetais.forEach(alimentoKey => {
        expect(alimentos[alimentoKey].categoria).toBe('vegetal');
      });
    });
  });

  describe('Alimentos específicos', () => {
    test('frango peito deve ter valores nutricionais corretos', () => {
      const frango = alimentos['frango_peito'];
      
      expect(frango.nome).toBe('Peito de frango grelhado');
      expect(frango.categoria).toBe('proteina_animal');
      expect(frango.calorias).toBe(165);
      expect(frango.proteinas).toBe(31.0);
      expect(frango.carboidratos).toBe(0);
      expect(frango.gorduras).toBe(3.6);
    });

    test('aveia deve ter valores nutricionais corretos', () => {
      const aveia = alimentos['aveia'];
      
      expect(aveia.nome).toBe('Aveia em flocos');
      expect(aveia.categoria).toBe('carboidrato');
      expect(aveia.calorias).toBe(394);
      expect(aveia.proteinas).toBe(13.9);
      expect(aveia.carboidratos).toBe(67.0);
    });

    test('azeite deve ter valores nutricionais corretos', () => {
      const azeite = alimentos['azeite_oliva'];
      
      expect(azeite.nome).toBe('Azeite de oliva');
      expect(azeite.categoria).toBe('gordura');
      expect(azeite.calorias).toBe(884);
      expect(azeite.proteinas).toBe(0);
      expect(azeite.carboidratos).toBe(0);
      expect(azeite.gorduras).toBe(100.0);
    });
  });

  describe('Cobertura de categorias', () => {
    test('deve ter alimentos de todas as categorias principais', () => {
      const categoriasEsperadas = [
        'proteina_animal', 'carboidrato', 'gordura', 'vegetal', 'fruta'
      ];
      
      categoriasEsperadas.forEach(categoria => {
        const alimentosCategoria = obterAlimentosPorCategoria(categoria);
        expect(alimentosCategoria.length).toBeGreaterThan(0);
      });
    });

    test('deve ter variedade suficiente de proteínas', () => {
      const proteinas = obterAlimentosPorCategoria('proteina_animal');
      expect(proteinas.length).toBeGreaterThanOrEqual(3);
    });

    test('deve ter variedade suficiente de carboidratos', () => {
      const carboidratos = obterAlimentosPorCategoria('carboidrato');
      expect(carboidratos.length).toBeGreaterThanOrEqual(3);
    });

    test('deve ter variedade suficiente de vegetais', () => {
      const vegetais = obterAlimentosPorCategoria('vegetal');
      expect(vegetais.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Consistência dos dados', () => {
    test('alimentos com peso corporal devem ter unidade apropriada', () => {
      Object.keys(alimentos).forEach(key => {
        const alimento = alimentos[key];
        
        if (alimento.unidade === 'unidade') {
          expect(alimento.porcao_padrao).toBeGreaterThan(0);
        }
      });
    });

    test('alimentos líquidos devem ter unidade ml', () => {
      const azeite = alimentos['azeite_oliva'];
      expect(azeite.unidade).toBe('ml');
    });

    test('suplementos devem ter unidade apropriada', () => {
      const whey = alimentos['whey_protein'];
      expect(whey.unidade).toBe('scoop');
      expect(whey.categoria).toBe('suplemento');
    });
  });

  describe('Validação nutricional', () => {
    test('alimentos ricos em proteína devem ter proteína > 10g/100g', () => {
      const proteinasAnimais = obterAlimentosPorCategoria('proteina_animal');
      
      proteinasAnimais.forEach(alimentoKey => {
        const alimento = alimentos[alimentoKey];
        if (alimento.categoria === 'proteina_animal') {
          expect(alimento.proteinas).toBeGreaterThan(10);
        }
      });
    });

    test('gorduras devem ter alto teor de lipídios', () => {
      const gorduras = obterAlimentosPorCategoria('gordura');
      
      gorduras.forEach(alimentoKey => {
        const alimento = alimentos[alimentoKey];
        expect(alimento.gorduras).toBeGreaterThan(5);
      });
    });

    test('vegetais devem ter baixas calorias', () => {
      const vegetais = obterAlimentosPorCategoria('vegetal');
      
      vegetais.forEach(alimentoKey => {
        const alimento = alimentos[alimentoKey];
        expect(alimento.calorias).toBeLessThan(100);
      });
    });
  });
});

