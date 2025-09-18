// Base de dados de alimentos baseada na Tabela TACO
// Valores por 100g do alimento

const alimentos = {
  // PROTEÍNAS ANIMAIS
  'frango_peito': {
    nome: 'Peito de frango grelhado',
    categoria: 'proteina_animal',
    calorias: 165,
    proteinas: 31.0,
    carboidratos: 0,
    gorduras: 3.6,
    fibras: 0,
    porcao_padrao: 120, // gramas
    unidade: 'g'
  },
  'carne_bovina_magra': {
    nome: 'Carne bovina magra',
    categoria: 'proteina_animal',
    calorias: 191,
    proteinas: 26.4,
    carboidratos: 0,
    gorduras: 8.8,
    fibras: 0,
    porcao_padrao: 100,
    unidade: 'g'
  },
  'salmao': {
    nome: 'Salmão grelhado',
    categoria: 'proteina_animal',
    calorias: 231,
    proteinas: 25.4,
    carboidratos: 0,
    gorduras: 13.4,
    fibras: 0,
    porcao_padrao: 120,
    unidade: 'g'
  },
  'ovo_inteiro': {
    nome: 'Ovo de galinha',
    categoria: 'proteina_animal',
    calorias: 155,
    proteinas: 13.0,
    carboidratos: 1.6,
    gorduras: 10.6,
    fibras: 0,
    porcao_padrao: 50, // 1 ovo médio
    unidade: 'unidade'
  },
  'tilapia': {
    nome: 'Tilápia grelhada',
    categoria: 'proteina_animal',
    calorias: 96,
    proteinas: 20.1,
    carboidratos: 0,
    gorduras: 1.7,
    fibras: 0,
    porcao_padrao: 120,
    unidade: 'g'
  },

  // PROTEÍNAS VEGETAIS
  'whey_protein': {
    nome: 'Whey protein',
    categoria: 'suplemento',
    calorias: 350,
    proteinas: 80.0,
    carboidratos: 5.0,
    gorduras: 2.0,
    fibras: 0,
    porcao_padrao: 30, // 1 scoop
    unidade: 'scoop'
  },
  'feijao_carioca': {
    nome: 'Feijão carioca cozido',
    categoria: 'leguminosa',
    calorias: 76,
    proteinas: 4.8,
    carboidratos: 13.6,
    gorduras: 0.5,
    fibras: 8.5,
    porcao_padrao: 100,
    unidade: 'g'
  },
  'lentilha': {
    nome: 'Lentilha cozida',
    categoria: 'leguminosa',
    calorias: 93,
    proteinas: 6.3,
    carboidratos: 16.3,
    gorduras: 0.5,
    fibras: 7.9,
    porcao_padrao: 100,
    unidade: 'g'
  },

  // CARBOIDRATOS
  'arroz_integral': {
    nome: 'Arroz integral cozido',
    categoria: 'carboidrato',
    calorias: 124,
    proteinas: 2.6,
    carboidratos: 25.8,
    gorduras: 1.0,
    fibras: 2.7,
    porcao_padrao: 100,
    unidade: 'g'
  },
  'batata_doce': {
    nome: 'Batata doce cozida',
    categoria: 'carboidrato',
    calorias: 77,
    proteinas: 1.3,
    carboidratos: 18.4,
    gorduras: 0.1,
    fibras: 2.2,
    porcao_padrao: 150,
    unidade: 'g'
  },
  'aveia': {
    nome: 'Aveia em flocos',
    categoria: 'carboidrato',
    calorias: 394,
    proteinas: 13.9,
    carboidratos: 67.0,
    gorduras: 8.5,
    fibras: 9.1,
    porcao_padrao: 40,
    unidade: 'g'
  },
  'banana': {
    nome: 'Banana prata',
    categoria: 'fruta',
    calorias: 98,
    proteinas: 1.3,
    carboidratos: 26.0,
    gorduras: 0.1,
    fibras: 2.0,
    porcao_padrao: 100, // 1 banana média
    unidade: 'unidade'
  },
  'pao_integral': {
    nome: 'Pão integral',
    categoria: 'carboidrato',
    calorias: 253,
    proteinas: 9.4,
    carboidratos: 43.3,
    gorduras: 4.2,
    fibras: 6.9,
    porcao_padrao: 50, // 2 fatias
    unidade: 'fatias'
  },
  'macarrao_integral': {
    nome: 'Macarrão integral cozido',
    categoria: 'carboidrato',
    calorias: 124,
    proteinas: 4.5,
    carboidratos: 25.4,
    gorduras: 1.1,
    fibras: 3.9,
    porcao_padrao: 100,
    unidade: 'g'
  },

  // GORDURAS BOAS
  'azeite_oliva': {
    nome: 'Azeite de oliva',
    categoria: 'gordura',
    calorias: 884,
    proteinas: 0,
    carboidratos: 0,
    gorduras: 100.0,
    fibras: 0,
    porcao_padrao: 10, // 1 colher de sopa
    unidade: 'ml'
  },
  'abacate': {
    nome: 'Abacate',
    categoria: 'gordura',
    calorias: 96,
    proteinas: 1.2,
    carboidratos: 6.0,
    gorduras: 8.4,
    fibras: 6.3,
    porcao_padrao: 100,
    unidade: 'g'
  },
  'castanha_para': {
    nome: 'Castanha do Pará',
    categoria: 'oleaginosa',
    calorias: 643,
    proteinas: 14.5,
    carboidratos: 15.1,
    gorduras: 63.5,
    fibras: 7.9,
    porcao_padrao: 20, // 3-4 unidades
    unidade: 'g'
  },
  'amendoim': {
    nome: 'Amendoim torrado',
    categoria: 'oleaginosa',
    calorias: 544,
    proteinas: 27.2,
    carboidratos: 20.3,
    gorduras: 43.9,
    fibras: 8.0,
    porcao_padrao: 30,
    unidade: 'g'
  },

  // VEGETAIS E VERDURAS
  'broccolis': {
    nome: 'Brócolis cozido',
    categoria: 'vegetal',
    calorias: 25,
    proteinas: 3.4,
    carboidratos: 4.0,
    gorduras: 0.4,
    fibras: 3.4,
    porcao_padrao: 100,
    unidade: 'g'
  },
  'espinafre': {
    nome: 'Espinafre refogado',
    categoria: 'vegetal',
    calorias: 26,
    proteinas: 3.4,
    carboidratos: 3.5,
    gorduras: 0.3,
    fibras: 2.9,
    porcao_padrao: 100,
    unidade: 'g'
  },
  'aspargos': {
    nome: 'Aspargos grelhados',
    categoria: 'vegetal',
    calorias: 23,
    proteinas: 2.4,
    carboidratos: 4.5,
    gorduras: 0.2,
    fibras: 1.9,
    porcao_padrao: 100,
    unidade: 'g'
  },
  'tomate': {
    nome: 'Tomate',
    categoria: 'vegetal',
    calorias: 15,
    proteinas: 1.1,
    carboidratos: 3.1,
    gorduras: 0.2,
    fibras: 1.2,
    porcao_padrao: 100,
    unidade: 'g'
  },

  // LATICÍNIOS
  'iogurte_grego': {
    nome: 'Iogurte grego natural',
    categoria: 'laticinios',
    calorias: 97,
    proteinas: 9.0,
    carboidratos: 4.0,
    gorduras: 5.0,
    fibras: 0,
    porcao_padrao: 150,
    unidade: 'g'
  },
  'queijo_cottage': {
    nome: 'Queijo cottage',
    categoria: 'laticinios',
    calorias: 98,
    proteinas: 11.1,
    carboidratos: 3.4,
    gorduras: 4.3,
    fibras: 0,
    porcao_padrao: 100,
    unidade: 'g'
  },

  // FRUTAS
  'maca': {
    nome: 'Maçã',
    categoria: 'fruta',
    calorias: 56,
    proteinas: 0.3,
    carboidratos: 15.2,
    gorduras: 0.1,
    fibras: 1.3,
    porcao_padrao: 150, // 1 maçã média
    unidade: 'unidade'
  },
  'morango': {
    nome: 'Morango',
    categoria: 'fruta',
    calorias: 30,
    proteinas: 0.9,
    carboidratos: 6.8,
    gorduras: 0.3,
    fibras: 1.7,
    porcao_padrao: 100,
    unidade: 'g'
  }
};

// Função para calcular valores nutricionais por porção
const calcularPorcao = (alimento, quantidade) => {
  const dados = alimentos[alimento];
  if (!dados) return null;

  const fator = quantidade / 100; // Converter para fator baseado em 100g
  
  return {
    nome: dados.nome,
    quantidade: quantidade,
    unidade: dados.unidade,
    calorias: Math.round(dados.calorias * fator),
    proteinas: Math.round(dados.proteinas * fator * 10) / 10,
    carboidratos: Math.round(dados.carboidratos * fator * 10) / 10,
    gorduras: Math.round(dados.gorduras * fator * 10) / 10,
    fibras: Math.round(dados.fibras * fator * 10) / 10
  };
};

// Função para obter alimentos por categoria
const obterAlimentosPorCategoria = (categoria) => {
  return Object.keys(alimentos).filter(key => alimentos[key].categoria === categoria);
};

module.exports = {
  alimentos,
  calcularPorcao,
  obterAlimentosPorCategoria
};

