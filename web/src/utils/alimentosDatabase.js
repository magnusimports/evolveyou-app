// Base de dados de alimentos TACO - 597 alimentos brasileiros
import alimentosTaco from './taco_foods_transformed.json';

class AlimentosDatabase {
  constructor() {
    this.alimentos = alimentosTaco;
    this.categorias = this.extrairCategorias();
  }

  // Extrair todas as categorias disponíveis
  extrairCategorias() {
    const categorias = new Set();
    this.alimentos.forEach(alimento => {
      categorias.add(alimento.category);
    });
    return Array.from(categorias).sort();
  }

  // Buscar alimentos por categoria
  buscarPorCategoria(categoria) {
    return this.alimentos.filter(alimento => 
      alimento.category === categoria
    );
  }

  // Buscar alimentos por nome (busca parcial)
  buscarPorNome(nome) {
    const nomeNormalizado = nome.toLowerCase();
    return this.alimentos.filter(alimento =>
      alimento.name.toLowerCase().includes(nomeNormalizado)
    );
  }

  // Filtrar alimentos por preferências da anamnese
  filtrarPorPreferencias(preferencias) {
    let alimentosFiltrados = [...this.alimentos];

    // Filtrar por proteínas preferidas
    if (preferencias.proteinas_preferidas && preferencias.proteinas_preferidas.length > 0) {
      const proteinasMap = {
        'frango': ['frango', 'peito de frango', 'coxa de frango'],
        'peixe': ['peixe', 'salmão', 'tilápia', 'sardinha', 'atum'],
        'carne_vermelha': ['carne', 'bovina', 'suína', 'cordeiro'],
        'ovos': ['ovo'],
        'proteina_vegetal': ['feijão', 'lentilha', 'grão-de-bico', 'soja', 'tofu'],
        'laticinios': ['leite', 'queijo', 'iogurte', 'ricota']
      };

      const termosProteinas = [];
      preferencias.proteinas_preferidas.forEach(pref => {
        if (proteinasMap[pref]) {
          termosProteinas.push(...proteinasMap[pref]);
        }
      });

      if (termosProteinas.length > 0) {
        const proteinasEncontradas = alimentosFiltrados.filter(alimento => {
          const nome = alimento.name.toLowerCase();
          return termosProteinas.some(termo => nome.includes(termo)) ||
                 alimento.category === 'Carnes e derivados' ||
                 alimento.category === 'Pescados e frutos do mar' ||
                 alimento.category === 'Ovos e derivados' ||
                 alimento.category === 'Leite e derivados' ||
                 alimento.category === 'Leguminosas e derivados';
        });
        
        // Manter também outros alimentos essenciais
        const outrosAlimentos = alimentosFiltrados.filter(alimento => {
          return alimento.category === 'Cereais e derivados' ||
                 alimento.category === 'Verduras, hortaliças e derivados' ||
                 alimento.category === 'Frutas e derivados' ||
                 alimento.category === 'Gorduras e óleos';
        });

        alimentosFiltrados = [...proteinasEncontradas, ...outrosAlimentos];
      }
    }

    // Filtrar por carboidratos preferidos
    if (preferencias.carboidratos_preferidos && preferencias.carboidratos_preferidos.length > 0) {
      const carboidratosMap = {
        'arroz': ['arroz'],
        'batata': ['batata'],
        'aveia': ['aveia'],
        'pao': ['pão'],
        'macarrao': ['macarrão', 'massa'],
        'frutas': ['banana', 'maçã', 'laranja', 'manga'],
        'quinoa': ['quinoa']
      };

      const termosCarboidratos = [];
      preferencias.carboidratos_preferidos.forEach(pref => {
        if (carboidratosMap[pref]) {
          termosCarboidratos.push(...carboidratosMap[pref]);
        }
      });

      if (termosCarboidratos.length > 0) {
        alimentosFiltrados = alimentosFiltrados.filter(alimento => {
          const nome = alimento.name.toLowerCase();
          const isCarboidrato = termosCarboidratos.some(termo => nome.includes(termo)) ||
                               alimento.category === 'Cereais e derivados' ||
                               alimento.category === 'Frutas e derivados';
          
          // Manter proteínas, vegetais e gorduras independente da preferência de carboidratos
          const isEssencial = alimento.category === 'Carnes e derivados' ||
                             alimento.category === 'Pescados e frutos do mar' ||
                             alimento.category === 'Ovos e derivados' ||
                             alimento.category === 'Leite e derivados' ||
                             alimento.category === 'Leguminosas e derivados' ||
                             alimento.category === 'Verduras, hortaliças e derivados' ||
                             alimento.category === 'Gorduras e óleos';

          return isCarboidrato || isEssencial;
        });
      }
    }

    // Remover alimentos com restrições
    if (preferencias.restricoes && preferencias.restricoes.length > 0) {
      preferencias.restricoes.forEach(restricao => {
        switch (restricao) {
          case 'lactose':
            alimentosFiltrados = alimentosFiltrados.filter(alimento => 
              alimento.category !== 'Leite e derivados'
            );
            break;
          case 'gluten':
            alimentosFiltrados = alimentosFiltrados.filter(alimento => {
              const nome = alimento.name.toLowerCase();
              return !nome.includes('trigo') && 
                     !nome.includes('pão') && 
                     !nome.includes('macarrão') &&
                     !nome.includes('massa');
            });
            break;
        }
      });
    }

    return alimentosFiltrados;
  }

  // Selecionar alimentos para uma refeição específica
  selecionarParaRefeicao(tipoRefeicao, preferencias = {}) {
    const alimentosFiltrados = this.filtrarPorPreferencias(preferencias);
    
    const selecoes = {
      'cafe_manha': {
        categorias: ['Cereais e derivados', 'Frutas e derivados', 'Leite e derivados', 'Ovos e derivados'],
        termos: ['aveia', 'banana', 'leite', 'ovo', 'pão', 'iogurte', 'queijo']
      },
      'lanche_manha': {
        categorias: ['Frutas e derivados', 'Nozes e sementes', 'Leite e derivados'],
        termos: ['fruta', 'castanha', 'amendoim', 'iogurte']
      },
      'almoco': {
        categorias: ['Carnes e derivados', 'Cereais e derivados', 'Verduras, hortaliças e derivados', 'Leguminosas e derivados'],
        termos: ['frango', 'carne', 'arroz', 'feijão', 'salada', 'brócolis']
      },
      'lanche_tarde': {
        categorias: ['Frutas e derivados', 'Cereais e derivados', 'Leite e derivados'],
        termos: ['fruta', 'aveia', 'iogurte', 'queijo']
      },
      'jantar': {
        categorias: ['Carnes e derivados', 'Pescados e frutos do mar', 'Verduras, hortaliças e derivados', 'Ovos e derivados'],
        termos: ['frango', 'peixe', 'ovo', 'salada', 'legumes']
      },
      'ceia': {
        categorias: ['Leite e derivados', 'Ovos e derivados'],
        termos: ['leite', 'iogurte', 'queijo', 'ovo']
      }
    };

    const config = selecoes[tipoRefeicao] || selecoes['almoco'];
    
    return alimentosFiltrados.filter(alimento => {
      const nome = alimento.name.toLowerCase();
      const categoriaMatch = config.categorias.includes(alimento.category);
      const termoMatch = config.termos.some(termo => nome.includes(termo));
      
      return categoriaMatch || termoMatch;
    });
  }

  // Calcular porção baseada em macronutrientes alvo
  calcularPorcao(alimento, macrosAlvo) {
    const nutricao = alimento.base_nutrition_per_100g;
    
    // Priorizar por tipo de macronutriente principal
    let porcaoBase = 100; // gramas
    
    if (macrosAlvo.proteinas > 0) {
      porcaoBase = (macrosAlvo.proteinas / nutricao.protein_g) * 100;
    } else if (macrosAlvo.carboidratos > 0) {
      porcaoBase = (macrosAlvo.carboidratos / nutricao.carbohydrate_g) * 100;
    } else if (macrosAlvo.gorduras > 0) {
      porcaoBase = (macrosAlvo.gorduras / nutricao.lipid_g) * 100;
    }

    // Limitar porções entre 10g e 500g
    porcaoBase = Math.max(10, Math.min(500, porcaoBase));
    
    // Arredondar para múltiplos de 5g
    return Math.round(porcaoBase / 5) * 5;
  }

  // Obter informações nutricionais para uma porção específica
  obterNutricaoPorcao(alimento, porcaoGramas) {
    const nutricao = alimento.base_nutrition_per_100g;
    const fator = porcaoGramas / 100;

    return {
      calorias: Math.round(nutricao.energy_kcal * fator),
      proteinas: Math.round(nutricao.protein_g * fator * 10) / 10,
      carboidratos: Math.round(nutricao.carbohydrate_g * fator * 10) / 10,
      gorduras: Math.round(nutricao.lipid_g * fator * 10) / 10,
      fibras: Math.round((nutricao.fiber_g || 0) * fator * 10) / 10
    };
  }

  // Buscar alimentos ricos em determinado macronutriente
  buscarRicosEm(macronutriente, limite = 20) {
    const ordenados = [...this.alimentos].sort((a, b) => {
      const nutricaoA = a.base_nutrition_per_100g;
      const nutricaoB = b.base_nutrition_per_100g;
      
      switch (macronutriente) {
        case 'proteina':
          return nutricaoB.protein_g - nutricaoA.protein_g;
        case 'carboidrato':
          return nutricaoB.carbohydrate_g - nutricaoA.carbohydrate_g;
        case 'gordura':
          return nutricaoB.lipid_g - nutricaoA.lipid_g;
        default:
          return 0;
      }
    });

    return ordenados.slice(0, limite);
  }

  // Obter estatísticas do banco de dados
  obterEstatisticas() {
    return {
      totalAlimentos: this.alimentos.length,
      totalCategorias: this.categorias.length,
      categorias: this.categorias,
      alimentosPorCategoria: this.categorias.map(categoria => ({
        categoria,
        quantidade: this.buscarPorCategoria(categoria).length
      }))
    };
  }
}

// Instância singleton
const alimentosDB = new AlimentosDatabase();

export default alimentosDB;
export { AlimentosDatabase };

