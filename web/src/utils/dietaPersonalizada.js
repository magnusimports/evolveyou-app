/**
 * GERADOR DE DIETA PERSONALIZADA - EVOLVEYOU
 * 
 * Baseado nas preferências alimentares e número de refeições da anamnese
 * Utiliza algoritmos compensatórios para cálculos precisos
 */

const { aplicarAlgoritmosCompensatorios } = require('./algoritmosCompensatorios');
const { alimentos } = require('../data/alimentos');

/**
 * Filtra alimentos baseado nas preferências da anamnese
 */
function filtrarAlimentosPorPreferencias(anamnese) {
  const { proteinas_preferidas, carboidratos_preferidos, restricoes_alimentares } = anamnese;
  
  // Mapear preferências para categorias da base TACO
  const alimentosFiltrados = {
    proteinas: [],
    carboidratos: [],
    gorduras: [],
    vegetais: [],
    frutas: [],
    laticinios: []
  };
  
  // Filtrar proteínas baseado nas preferências
  if (proteinas_preferidas && proteinas_preferidas.length > 0) {
    alimentos.proteinas.forEach(alimento => {
      const incluir = proteinas_preferidas.some(pref => {
        switch (pref) {
          case 'Frango':
            return alimento.nome.toLowerCase().includes('frango') || 
                   alimento.nome.toLowerCase().includes('peito');
          case 'Peixe':
            return alimento.nome.toLowerCase().includes('peixe') || 
                   alimento.nome.toLowerCase().includes('salmão') ||
                   alimento.nome.toLowerCase().includes('tilápia');
          case 'Carne vermelha':
            return alimento.nome.toLowerCase().includes('carne') || 
                   alimento.nome.toLowerCase().includes('boi') ||
                   alimento.nome.toLowerCase().includes('patinho');
          case 'Ovos':
            return alimento.nome.toLowerCase().includes('ovo');
          case 'Proteína vegetal (feijão, lentilha, grão-de-bico)':
            return alimento.nome.toLowerCase().includes('feijão') || 
                   alimento.nome.toLowerCase().includes('lentilha') ||
                   alimento.nome.toLowerCase().includes('grão');
          case 'Laticínios (queijo, iogurte)':
            return alimento.nome.toLowerCase().includes('queijo') || 
                   alimento.nome.toLowerCase().includes('iogurte') ||
                   alimento.nome.toLowerCase().includes('leite');
          default:
            return false;
        }
      });
      
      if (incluir) {
        alimentosFiltrados.proteinas.push(alimento);
      }
    });
  } else {
    // Se não há preferência específica, incluir todos
    alimentosFiltrados.proteinas = [...alimentos.proteinas];
  }
  
  // Filtrar carboidratos baseado nas preferências
  if (carboidratos_preferidos && carboidratos_preferidos.length > 0) {
    alimentos.carboidratos.forEach(alimento => {
      const incluir = carboidratos_preferidos.some(pref => {
        switch (pref) {
          case 'Arroz':
            return alimento.nome.toLowerCase().includes('arroz');
          case 'Batata (doce, inglesa)':
            return alimento.nome.toLowerCase().includes('batata');
          case 'Aveia':
            return alimento.nome.toLowerCase().includes('aveia');
          case 'Pão':
            return alimento.nome.toLowerCase().includes('pão');
          case 'Macarrão':
            return alimento.nome.toLowerCase().includes('macarrão') || 
                   alimento.nome.toLowerCase().includes('massa');
          case 'Frutas':
            return alimento.categoria === 'frutas';
          case 'Quinoa, amaranto':
            return alimento.nome.toLowerCase().includes('quinoa') || 
                   alimento.nome.toLowerCase().includes('amaranto');
          default:
            return false;
        }
      });
      
      if (incluir) {
        alimentosFiltrados.carboidratos.push(alimento);
      }
    });
  } else {
    alimentosFiltrados.carboidratos = [...alimentos.carboidratos];
  }
  
  // Incluir outras categorias sempre (gorduras, vegetais, frutas)
  alimentosFiltrados.gorduras = [...alimentos.gorduras];
  alimentosFiltrados.vegetais = [...alimentos.vegetais];
  alimentosFiltrados.frutas = [...alimentos.frutas];
  alimentosFiltrados.laticinios = [...alimentos.laticinios];
  
  // Aplicar restrições alimentares
  if (restricoes_alimentares && restricoes_alimentares !== 'Não tenho restrições') {
    Object.keys(alimentosFiltrados).forEach(categoria => {
      alimentosFiltrados[categoria] = alimentosFiltrados[categoria].filter(alimento => {
        // Remover alimentos baseado nas restrições
        if (restricoes_alimentares.includes('Lactose') && 
            (alimento.nome.toLowerCase().includes('leite') || 
             alimento.nome.toLowerCase().includes('queijo') ||
             alimento.nome.toLowerCase().includes('iogurte'))) {
          return false;
        }
        
        if (restricoes_alimentares.includes('Glúten') && 
            (alimento.nome.toLowerCase().includes('pão') || 
             alimento.nome.toLowerCase().includes('macarrão') ||
             alimento.nome.toLowerCase().includes('trigo'))) {
          return false;
        }
        
        return true;
      });
    });
  }
  
  return alimentosFiltrados;
}

/**
 * Seleciona alimentos para uma refeição específica
 */
function selecionarAlimentosRefeicao(alimentosFiltrados, tipoRefeicao, macrosRefeicao) {
  const refeicao = {
    nome: tipoRefeicao,
    alimentos: [],
    macros: {
      calorias: 0,
      proteinas: 0,
      carboidratos: 0,
      gorduras: 0
    }
  };
  
  // Estratégia de seleção baseada no tipo de refeição
  switch (tipoRefeicao) {
    case 'Café da Manhã':
      // Priorizar carboidratos e proteínas leves
      adicionarAlimento(refeicao, alimentosFiltrados.carboidratos, macrosRefeicao.carboidratos * 0.6);
      adicionarAlimento(refeicao, alimentosFiltrados.proteinas, macrosRefeicao.proteinas * 0.5);
      adicionarAlimento(refeicao, alimentosFiltrados.frutas, macrosRefeicao.carboidratos * 0.4);
      adicionarAlimento(refeicao, alimentosFiltrados.gorduras, macrosRefeicao.gorduras);
      break;
      
    case 'Lanche da Manhã':
      // Lanche leve com foco em frutas e proteínas
      adicionarAlimento(refeicao, alimentosFiltrados.frutas, macrosRefeicao.carboidratos * 0.7);
      adicionarAlimento(refeicao, alimentosFiltrados.proteinas, macrosRefeicao.proteinas);
      adicionarAlimento(refeicao, alimentosFiltrados.gorduras, macrosRefeicao.gorduras);
      break;
      
    case 'Almoço':
      // Refeição completa e balanceada
      adicionarAlimento(refeicao, alimentosFiltrados.proteinas, macrosRefeicao.proteinas);
      adicionarAlimento(refeicao, alimentosFiltrados.carboidratos, macrosRefeicao.carboidratos * 0.7);
      adicionarAlimento(refeicao, alimentosFiltrados.vegetais, macrosRefeicao.carboidratos * 0.3);
      adicionarAlimento(refeicao, alimentosFiltrados.gorduras, macrosRefeicao.gorduras);
      break;
      
    case 'Lanche da Tarde':
      // Lanche energético pré-treino
      adicionarAlimento(refeicao, alimentosFiltrados.carboidratos, macrosRefeicao.carboidratos);
      adicionarAlimento(refeicao, alimentosFiltrados.proteinas, macrosRefeicao.proteinas);
      adicionarAlimento(refeicao, alimentosFiltrados.gorduras, macrosRefeicao.gorduras);
      break;
      
    case 'Jantar':
      // Foco em proteínas e vegetais
      adicionarAlimento(refeicao, alimentosFiltrados.proteinas, macrosRefeicao.proteinas);
      adicionarAlimento(refeicao, alimentosFiltrados.vegetais, macrosRefeicao.carboidratos * 0.6);
      adicionarAlimento(refeicao, alimentosFiltrados.carboidratos, macrosRefeicao.carboidratos * 0.4);
      adicionarAlimento(refeicao, alimentosFiltrados.gorduras, macrosRefeicao.gorduras);
      break;
      
    case 'Ceia':
      // Proteínas de digestão lenta
      adicionarAlimento(refeicao, alimentosFiltrados.proteinas, macrosRefeicao.proteinas);
      adicionarAlimento(refeicao, alimentosFiltrados.gorduras, macrosRefeicao.gorduras);
      adicionarAlimento(refeicao, alimentosFiltrados.vegetais, macrosRefeicao.carboidratos);
      break;
      
    default:
      // Refeição balanceada padrão
      adicionarAlimento(refeicao, alimentosFiltrados.proteinas, macrosRefeicao.proteinas);
      adicionarAlimento(refeicao, alimentosFiltrados.carboidratos, macrosRefeicao.carboidratos);
      adicionarAlimento(refeicao, alimentosFiltrados.gorduras, macrosRefeicao.gorduras);
  }
  
  return refeicao;
}

/**
 * Adiciona um alimento à refeição baseado na meta de macronutriente
 */
function adicionarAlimento(refeicao, categoria, metaGramas) {
  if (!categoria || categoria.length === 0 || metaGramas <= 0) return;
  
  // Selecionar alimento aleatório da categoria
  const alimento = categoria[Math.floor(Math.random() * categoria.length)];
  
  // Calcular porção necessária para atingir a meta
  const macroAlimento = obterMacroAlimento(alimento);
  const porcaoNecessaria = calcularPorcao(macroAlimento, metaGramas);
  
  // Adicionar à refeição
  refeicao.alimentos.push({
    nome: alimento.nome,
    quantidade: porcaoNecessaria.quantidade,
    unidade: porcaoNecessaria.unidade,
    calorias: porcaoNecessaria.calorias,
    proteinas: porcaoNecessaria.proteinas,
    carboidratos: porcaoNecessaria.carboidratos,
    gorduras: porcaoNecessaria.gorduras
  });
  
  // Atualizar totais da refeição
  refeicao.macros.calorias += porcaoNecessaria.calorias;
  refeicao.macros.proteinas += porcaoNecessaria.proteinas;
  refeicao.macros.carboidratos += porcaoNecessaria.carboidratos;
  refeicao.macros.gorduras += porcaoNecessaria.gorduras;
}

/**
 * Obtém o macronutriente principal de um alimento
 */
function obterMacroAlimento(alimento) {
  if (alimento.proteinas > alimento.carboidratos && alimento.proteinas > alimento.gorduras) {
    return 'proteinas';
  } else if (alimento.carboidratos > alimento.gorduras) {
    return 'carboidratos';
  } else {
    return 'gorduras';
  }
}

/**
 * Calcula a porção necessária para atingir uma meta de macronutriente
 */
function calcularPorcao(alimento, metaGramas) {
  const macro = obterMacroAlimento(alimento);
  const valorMacro = alimento[macro];
  
  if (valorMacro === 0) {
    return {
      quantidade: 0,
      unidade: 'g',
      calorias: 0,
      proteinas: 0,
      carboidratos: 0,
      gorduras: 0
    };
  }
  
  // Calcular multiplicador baseado na meta
  const multiplicador = metaGramas / valorMacro;
  
  return {
    quantidade: Math.round(100 * multiplicador), // Base 100g
    unidade: 'g',
    calorias: Math.round(alimento.calorias * multiplicador),
    proteinas: Math.round(alimento.proteinas * multiplicador),
    carboidratos: Math.round(alimento.carboidratos * multiplicador),
    gorduras: Math.round(alimento.gorduras * multiplicador)
  };
}

/**
 * Gera plano alimentar completo baseado na anamnese
 */
function gerarDietaPersonalizada(anamnese) {
  console.log('🍽️ Gerando dieta personalizada...');
  
  // 1. Aplicar algoritmos compensatórios
  const resultadosCompensatorios = aplicarAlgoritmosCompensatorios(anamnese);
  
  // 2. Filtrar alimentos por preferências
  const alimentosFiltrados = filtrarAlimentosPorPreferencias(anamnese);
  
  // 3. Obter distribuição de refeições
  const distribuicaoRefeicoes = resultadosCompensatorios.distribuicaoRefeicoes;
  
  // 4. Calcular macros por refeição
  const macrosTotais = resultadosCompensatorios.macronutrientes;
  
  const planoAlimentar = {
    informacoes: {
      caloriasAlvo: resultadosCompensatorios.caloriasAlvo,
      macronutrientes: macrosTotais,
      numeroRefeicoes: distribuicaoRefeicoes.length,
      fatoresAplicados: resultadosCompensatorios.fatoresAplicados
    },
    refeicoes: []
  };
  
  // 5. Gerar cada refeição
  distribuicaoRefeicoes.forEach(refeicao => {
    const macrosRefeicao = {
      calorias: Math.round(resultadosCompensatorios.caloriasAlvo * refeicao.percentual),
      proteinas: Math.round(macrosTotais.proteina.gramas * refeicao.percentual),
      carboidratos: Math.round(macrosTotais.carboidrato.gramas * refeicao.percentual),
      gorduras: Math.round(macrosTotais.gordura.gramas * refeicao.percentual)
    };
    
    const refeicaoGerada = selecionarAlimentosRefeicao(
      alimentosFiltrados, 
      refeicao.nome, 
      macrosRefeicao
    );
    
    refeicaoGerada.metaMacros = macrosRefeicao;
    refeicaoGerada.percentualDia = Math.round(refeicao.percentual * 100);
    
    planoAlimentar.refeicoes.push(refeicaoGerada);
  });
  
  // 6. Adicionar observações personalizadas
  planoAlimentar.observacoes = gerarObservacoesDieta(anamnese, resultadosCompensatorios);
  
  console.log('✅ Dieta personalizada gerada:', planoAlimentar);
  
  return planoAlimentar;
}

/**
 * Gera observações personalizadas para a dieta
 */
function gerarObservacoesDieta(anamnese, resultados) {
  const observacoes = [];
  
  // Observações baseadas no objetivo
  if (anamnese.objetivo_principal?.includes('Emagrecer')) {
    observacoes.push('🎯 Dieta focada em déficit calórico para perda de gordura');
    observacoes.push('💧 Mantenha-se bem hidratado para otimizar o metabolismo');
  } else if (anamnese.objetivo_principal?.includes('Ganhar massa')) {
    observacoes.push('💪 Dieta com superávit calórico para ganho de massa muscular');
    observacoes.push('⏰ Consuma proteína a cada 3-4 horas para síntese proteica');
  }
  
  // Observações baseadas em recursos ergogênicos
  if (anamnese.recursos_ergogenicos === 'Sim') {
    observacoes.push('⚡ Dieta ajustada para metabolismo acelerado por recursos ergogênicos');
    observacoes.push('🥩 Priorize proteínas de alta qualidade para síntese muscular');
  }
  
  // Observações baseadas na experiência de treino
  if (anamnese.experiencia_treino?.includes('Avançado')) {
    observacoes.push('🏋️ Distribuição de macros otimizada para atletas avançados');
  } else if (anamnese.experiencia_treino?.includes('Iniciante')) {
    observacoes.push('🔰 Dieta simples e prática para iniciantes');
  }
  
  // Observações baseadas no número de refeições
  if (anamnese.refeicoes_dia?.includes('1 a 2')) {
    observacoes.push('🍽️ Refeições maiores e mais saciantes conforme sua preferência');
  } else if (anamnese.refeicoes_dia?.includes('6 ou mais')) {
    observacoes.push('⏰ Refeições menores e frequentes para melhor digestão');
  }
  
  // Observações sobre fatores compensatórios aplicados
  if (resultados.fatoresAplicados.mentalidade?.includes('agressiva')) {
    observacoes.push('🔥 Abordagem mais agressiva aplicada conforme sua mentalidade');
  }
  
  observacoes.push('📱 Use o sistema de check-in para acompanhar seu progresso');
  
  return observacoes;
}

/**
 * Gera variações da dieta para outros dias
 */
function gerarVariacoesDieta(planoBase, numeroDias = 7) {
  const variacoes = [planoBase]; // Dia 1 é o plano base
  
  for (let dia = 2; dia <= numeroDias; dia++) {
    const variacao = JSON.parse(JSON.stringify(planoBase)); // Deep copy
    
    // Variar alimentos mantendo macros similares
    variacao.refeicoes = variacao.refeicoes.map(refeicao => {
      const novaRefeicao = { ...refeicao };
      
      // Trocar alguns alimentos por equivalentes
      novaRefeicao.alimentos = refeicao.alimentos.map(alimento => {
        // 30% de chance de trocar o alimento
        if (Math.random() < 0.3) {
          return gerarAlimentoEquivalente(alimento);
        }
        return alimento;
      });
      
      return novaRefeicao;
    });
    
    variacoes.push(variacao);
  }
  
  return variacoes;
}

/**
 * Gera um alimento equivalente com macros similares
 */
function gerarAlimentoEquivalente(alimentoOriginal) {
  // Lógica simplificada - em produção, usar base de equivalências
  const variacoes = {
    'Peito de frango': ['Filé de peixe', 'Carne magra', 'Ovo'],
    'Arroz branco': ['Batata doce', 'Aveia', 'Quinoa'],
    'Azeite': ['Castanhas', 'Abacate', 'Amendoim']
  };
  
  const equivalentes = variacoes[alimentoOriginal.nome];
  if (equivalentes && equivalentes.length > 0) {
    const novoNome = equivalentes[Math.floor(Math.random() * equivalentes.length)];
    return {
      ...alimentoOriginal,
      nome: novoNome
    };
  }
  
  return alimentoOriginal;
}

module.exports = {
  gerarDietaPersonalizada,
  filtrarAlimentosPorPreferencias,
  selecionarAlimentosRefeicao,
  gerarVariacoesDieta,
  gerarObservacoesDieta
};

