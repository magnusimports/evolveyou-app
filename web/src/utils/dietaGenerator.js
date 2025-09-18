const { alimentos, calcularPorcao, obterAlimentosPorCategoria } = require('../data/alimentos');

// Algoritmo para gerar plano alimentar personalizado
class DietaGenerator {
  constructor(anamnese) {
    this.anamnese = anamnese;
    this.tmb = this.calcularTMB();
    this.tdee = this.calcularTDEE();
    this.caloriasMeta = this.calcularCaloriasMeta();
    this.macros = this.calcularMacronutrientes();
  }

  // Calcular Taxa Metabólica Basal usando fórmula Mifflin-St Jeor
  calcularTMB() {
    const { sexo, idade, peso, altura } = this.anamnese;
    
    if (sexo === 'masculino') {
      return (10 * peso) + (6.25 * altura) - (5 * idade) + 5;
    } else {
      return (10 * peso) + (6.25 * altura) - (5 * idade) - 161;
    }
  }

  // Calcular Gasto Energético Total Diário
  calcularTDEE() {
    const fatoresAtividade = {
      'sedentario': 1.2,
      'levemente_ativo': 1.375,
      'moderadamente_ativo': 1.55,
      'muito_ativo': 1.725,
      'extremamente_ativo': 1.9
    };

    const fator = fatoresAtividade[this.anamnese.nivel_atividade] || 1.375;
    return this.tmb * fator;
  }

  // Calcular calorias meta baseado no objetivo
  calcularCaloriasMeta() {
    const { objetivo } = this.anamnese;
    
    switch (objetivo) {
      case 'Perder peso':
        return this.tdee - 500; // Déficit de 500 kcal
      case 'Ganhar massa muscular':
        return this.tdee + 300; // Superávit de 300 kcal
      case 'Manter peso atual':
        return this.tdee;
      case 'Melhorar condicionamento físico':
        return this.tdee - 200; // Déficit leve
      default:
        return this.tdee;
    }
  }

  // Calcular distribuição de macronutrientes
  calcularMacronutrientes() {
    const { objetivo } = this.anamnese;
    let proteinaPorKg, percentualCarbo, percentualGordura;

    switch (objetivo) {
      case 'Perder peso':
        proteinaPorKg = 2.2; // Alta proteína para preservar massa muscular
        percentualCarbo = 0.30;
        percentualGordura = 0.25;
        break;
      case 'Ganhar massa muscular':
        proteinaPorKg = 2.0;
        percentualCarbo = 0.45;
        percentualGordura = 0.25;
        break;
      case 'Manter peso atual':
        proteinaPorKg = 1.8;
        percentualCarbo = 0.40;
        percentualGordura = 0.30;
        break;
      default:
        proteinaPorKg = 1.8;
        percentualCarbo = 0.40;
        percentualGordura = 0.30;
    }

    const proteinaGramas = this.anamnese.peso * proteinaPorKg;
    const proteinaCalorias = proteinaGramas * 4;
    
    const carboCalorias = this.caloriasMeta * percentualCarbo;
    const carboGramas = carboCalorias / 4;
    
    const gorduraCalorias = this.caloriasMeta * percentualGordura;
    const gorduraGramas = gorduraCalorias / 9;

    return {
      proteinas: {
        gramas: Math.round(proteinaGramas),
        calorias: Math.round(proteinaCalorias),
        percentual: Math.round((proteinaCalorias / this.caloriasMeta) * 100)
      },
      carboidratos: {
        gramas: Math.round(carboGramas),
        calorias: Math.round(carboCalorias),
        percentual: Math.round(percentualCarbo * 100)
      },
      gorduras: {
        gramas: Math.round(gorduraGramas),
        calorias: Math.round(gorduraCalorias),
        percentual: Math.round(percentualGordura * 100)
      }
    };
  }

  // Gerar plano alimentar completo
  gerarPlanoAlimentar() {
    const refeicoes = this.criarEstrutraRefeicoes();
    const plano = {
      dataPlano: new Date().toISOString().split('T')[0],
      usuario: this.anamnese.userId,
      objetivo: this.anamnese.objetivo,
      calorias_meta: Math.round(this.caloriasMeta),
      macronutrientes_meta: this.macros,
      tmb: Math.round(this.tmb),
      tdee: Math.round(this.tdee),
      refeicoes: refeicoes,
      totalCalorias: 0,
      totalProteinas: 0,
      totalCarboidratos: 0,
      totalGorduras: 0
    };

    // Calcular totais
    refeicoes.forEach(refeicao => {
      refeicao.alimentos.forEach(alimento => {
        plano.totalCalorias += alimento.calorias;
        plano.totalProteinas += alimento.proteinas;
        plano.totalCarboidratos += alimento.carboidratos;
        plano.totalGorduras += alimento.gorduras;
      });
    });

    // Arredondar totais
    plano.totalCalorias = Math.round(plano.totalCalorias);
    plano.totalProteinas = Math.round(plano.totalProteinas * 10) / 10;
    plano.totalCarboidratos = Math.round(plano.totalCarboidratos * 10) / 10;
    plano.totalGorduras = Math.round(plano.totalGorduras * 10) / 10;

    return plano;
  }

  // Criar estrutura das refeições
  criarEstrutraRefeicoes() {
    const distribuicaoCalorias = {
      'cafe_manha': 0.25,
      'lanche_manha': 0.10,
      'almoco': 0.35,
      'lanche_tarde': 0.10,
      'jantar': 0.20
    };

    const refeicoes = [];

    // Café da manhã
    refeicoes.push(this.criarCafeManha(this.caloriasMeta * distribuicaoCalorias.cafe_manha));
    
    // Lanche da manhã
    refeicoes.push(this.criarLancheManha(this.caloriasMeta * distribuicaoCalorias.lanche_manha));
    
    // Almoço
    refeicoes.push(this.criarAlmoco(this.caloriasMeta * distribuicaoCalorias.almoco));
    
    // Lanche da tarde
    refeicoes.push(this.criarLancheTarde(this.caloriasMeta * distribuicaoCalorias.lanche_tarde));
    
    // Jantar
    refeicoes.push(this.criarJantar(this.caloriasMeta * distribuicaoCalorias.jantar));

    return refeicoes;
  }

  // Criar café da manhã
  criarCafeManha(caloriasMeta) {
    const alimentos = [];
    
    // Base: Aveia (carboidrato + proteína)
    const aveia = calcularPorcao('aveia', 40);
    alimentos.push({
      ...aveia,
      nome: 'Aveia em flocos',
      quantidade: '40g'
    });

    // Proteína: Ovo ou iogurte
    if (Math.random() > 0.5) {
      const ovos = calcularPorcao('ovo_inteiro', 100); // 2 ovos
      alimentos.push({
        ...ovos,
        nome: 'Ovos mexidos',
        quantidade: '2 unidades'
      });
    } else {
      const iogurte = calcularPorcao('iogurte_grego', 150);
      alimentos.push({
        ...iogurte,
        nome: 'Iogurte grego natural',
        quantidade: '150g'
      });
    }

    // Fruta
    const banana = calcularPorcao('banana', 100);
    alimentos.push({
      ...banana,
      nome: 'Banana',
      quantidade: '1 unidade'
    });

    return {
      id: 'cafe_manha',
      nome: 'Café da Manhã',
      horario: '07:00',
      alimentos: alimentos,
      calorias: alimentos.reduce((sum, a) => sum + a.calorias, 0)
    };
  }

  // Criar lanche da manhã
  criarLancheManha(caloriasMeta) {
    const alimentos = [];
    
    // Castanhas ou whey
    if (Math.random() > 0.5) {
      const castanha = calcularPorcao('castanha_para', 20);
      alimentos.push({
        ...castanha,
        nome: 'Castanha do Pará',
        quantidade: '4 unidades'
      });
    } else {
      const whey = calcularPorcao('whey_protein', 30);
      alimentos.push({
        ...whey,
        nome: 'Whey protein',
        quantidade: '1 scoop'
      });
    }

    return {
      id: 'lanche_manha',
      nome: 'Lanche da Manhã',
      horario: '10:00',
      alimentos: alimentos,
      calorias: alimentos.reduce((sum, a) => sum + a.calorias, 0)
    };
  }

  // Criar almoço
  criarAlmoco(caloriasMeta) {
    const alimentos = [];
    
    // Proteína principal
    const proteinas = ['frango_peito', 'carne_bovina_magra', 'tilapia'];
    const proteinaSelecionada = proteinas[Math.floor(Math.random() * proteinas.length)];
    const proteina = calcularPorcao(proteinaSelecionada, 120);
    alimentos.push({
      ...proteina,
      quantidade: '120g'
    });

    // Carboidrato
    const carboidratos = ['arroz_integral', 'batata_doce'];
    const carboSelecionado = carboidratos[Math.floor(Math.random() * carboidratos.length)];
    const carbo = calcularPorcao(carboSelecionado, 100);
    alimentos.push({
      ...carbo,
      quantidade: '100g'
    });

    // Vegetal
    const vegetais = ['broccolis', 'aspargos'];
    const vegetalSelecionado = vegetais[Math.floor(Math.random() * vegetais.length)];
    const vegetal = calcularPorcao(vegetalSelecionado, 100);
    alimentos.push({
      ...vegetal,
      quantidade: '100g'
    });

    // Gordura boa
    const azeite = calcularPorcao('azeite_oliva', 10);
    alimentos.push({
      ...azeite,
      nome: 'Azeite de oliva',
      quantidade: '1 colher de sopa'
    });

    return {
      id: 'almoco',
      nome: 'Almoço',
      horario: '12:30',
      alimentos: alimentos,
      calorias: alimentos.reduce((sum, a) => sum + a.calorias, 0)
    };
  }

  // Criar lanche da tarde
  criarLancheTarde(caloriasMeta) {
    const alimentos = [];
    
    // Whey + fruta ou iogurte
    if (Math.random() > 0.5) {
      const whey = calcularPorcao('whey_protein', 30);
      alimentos.push({
        ...whey,
        nome: 'Whey protein',
        quantidade: '1 scoop'
      });
      
      const banana = calcularPorcao('banana', 100);
      alimentos.push({
        ...banana,
        nome: 'Banana',
        quantidade: '1 unidade'
      });
    } else {
      const iogurte = calcularPorcao('iogurte_grego', 150);
      alimentos.push({
        ...iogurte,
        nome: 'Iogurte grego',
        quantidade: '150g'
      });
      
      const morango = calcularPorcao('morango', 100);
      alimentos.push({
        ...morango,
        nome: 'Morangos',
        quantidade: '100g'
      });
    }

    return {
      id: 'lanche_tarde',
      nome: 'Lanche da Tarde',
      horario: '15:30',
      alimentos: alimentos,
      calorias: alimentos.reduce((sum, a) => sum + a.calorias, 0)
    };
  }

  // Criar jantar
  criarJantar(caloriasMeta) {
    const alimentos = [];
    
    // Proteína
    const proteinas = ['salmao', 'frango_peito', 'tilapia'];
    const proteinaSelecionada = proteinas[Math.floor(Math.random() * proteinas.length)];
    const proteina = calcularPorcao(proteinaSelecionada, 120);
    alimentos.push({
      ...proteina,
      quantidade: '120g'
    });

    // Carboidrato (menor quantidade à noite)
    const batataDoce = calcularPorcao('batata_doce', 80);
    alimentos.push({
      ...batataDoce,
      nome: 'Batata doce',
      quantidade: '80g'
    });

    // Salada
    const espinafre = calcularPorcao('espinafre', 100);
    alimentos.push({
      ...espinafre,
      nome: 'Espinafre refogado',
      quantidade: '100g'
    });

    return {
      id: 'jantar',
      nome: 'Jantar',
      horario: '19:00',
      alimentos: alimentos,
      calorias: alimentos.reduce((sum, a) => sum + a.calorias, 0)
    };
  }
}

module.exports = DietaGenerator;

