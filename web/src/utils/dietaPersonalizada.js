/**
 * GERADOR DE DIETA PERSONALIZADA - EVOLVEYOU
 *
 * Utiliza a base de dados TACO e algoritmos compensatórios para gerar um plano alimentar personalizado.
 */

import alimentosDB from './alimentosDatabase';
import { aplicarAlgoritmosCompensatorios } from './algoritmosCompensatorios';

/**
 * Seleciona alimentos para uma refeição específica, respeitando as metas de macronutrientes.
 */
function selecionarAlimentosRefeicao(preferencias, tipoRefeicao, macrosRefeicao) {
  const refeicao = {
    nome: tipoRefeicao,
    alimentos: [],
    macros: { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
  };

  const alimentosDisponiveis = alimentosDB.selecionarParaRefeicao(tipoRefeicao, preferencias);

  // Adicionar fontes de proteína
  adicionarAlimento(refeicao, alimentosDisponiveis.filter(a => a.category === 'Carnes e derivados' || a.category === 'Pescados e frutos do mar' || a.category === 'Ovos e derivados' || a.category === 'Leguminosas e derivados'), 'proteina', macrosRefeicao.proteinas);

  // Adicionar fontes de carboidrato
  adicionarAlimento(refeicao, alimentosDisponiveis.filter(a => a.category === 'Cereais e derivados' || a.category === 'Tubérculos, raízes e derivados'), 'carboidrato', macrosRefeicao.carboidratos);

  // Adicionar frutas e vegetais
  adicionarAlimento(refeicao, alimentosDisponiveis.filter(a => a.category === 'Verduras, hortaliças e derivados'), 'carboidrato', macrosRefeicao.carboidratos * 0.2); // 20% de carboidratos de vegetais
  adicionarAlimento(refeicao, alimentosDisponiveis.filter(a => a.category === 'Frutas e derivados'), 'carboidrato', macrosRefeicao.carboidratos * 0.3); // 30% de carboidratos de frutas

  // Adicionar fontes de gordura
  adicionarAlimento(refeicao, alimentosDisponiveis.filter(a => a.category === 'Gorduras e óleos' || a.category === 'Nozes e sementes'), 'gordura', macrosRefeicao.gorduras);

  return refeicao;
}

/**
 * Adiciona um alimento à refeição para atingir a meta de um macronutriente.
 */
function adicionarAlimento(refeicao, categoria, macroPrincipal, metaGramas) {
  if (!categoria || categoria.length === 0 || metaGramas <= 0) return;

  // Ordenar alimentos pela quantidade do macro principal
  const alimentosOrdenados = [...categoria].sort((a, b) => b.base_nutrition_per_100g[`${macroPrincipal}_g`] - a.base_nutrition_per_100g[`${macroPrincipal}_g`]);

  const alimento = alimentosOrdenados[0]; // Pega o mais rico no macro
  if (!alimento) return; // Categoria pode estar vazia
  const porcao = alimentosDB.calcularPorcao(alimento, { [macroPrincipal]: metaGramas });
  const nutricaoPorcao = alimentosDB.obterNutricaoPorcao(alimento, porcao);

  refeicao.alimentos.push({
    nome: alimento.name,
    quantidade: porcao,
    unidade: 'g',
    ...nutricaoPorcao
  });

  // Atualizar totais da refeição
  refeicao.macros.calorias += nutricaoPorcao.calorias;
  refeicao.macros.proteinas += nutricaoPorcao.proteinas;
  refeicao.macros.carboidratos += nutricaoPorcao.carboidratos;
  refeicao.macros.gorduras += nutricaoPorcao.gorduras;
}

/**
 * Gera o plano alimentar completo baseado na anamnese.
 */
export function gerarDietaPersonalizada(anamnese) {
  console.log('🍽️  Gerando dieta personalizada com base TACO...');

  const resultadosCompensatorios = aplicarAlgoritmosCompensatorios(anamnese);
  const { caloriasAlvo, macronutrientes, distribuicaoRefeicoes, fatoresAplicados } = resultadosCompensatorios;

  const planoAlimentar = {
    informacoes: {
      caloriasAlvo,
      macronutrientes,
      numeroRefeicoes: distribuicaoRefeicoes.length,
      fatoresAplicados
    },
    refeicoes: []
  };

  distribuicaoRefeicoes.forEach(refeicaoInfo => {
    const macrosRefeicao = {
      calorias: Math.round(caloriasAlvo * refeicaoInfo.percentual),
      proteinas: Math.round(macronutrientes.proteina.gramas * refeicaoInfo.percentual),
      carboidratos: Math.round(macronutrientes.carboidrato.gramas * refeicaoInfo.percentual),
      gorduras: Math.round(macronutrientes.gordura.gramas * refeicaoInfo.percentual)
    };

    const refeicaoGerada = selecionarAlimentosRefeicao(
      anamnese, // Passar a anamnese para as preferências
      refeicaoInfo.nome.toLowerCase().replace(' ', '_'), // e.g., 'cafe_da_manha'
      macrosRefeicao
    );

    refeicaoGerada.metaMacros = macrosRefeicao;
    refeicaoGerada.percentualDia = Math.round(refeicaoInfo.percentual * 100);
    
    planoAlimentar.refeicoes.push(refeicaoGerada);
  });

  planoAlimentar.observacoes = gerarObservacoesDieta(anamnese, resultadosCompensatorios);

  console.log('✅ Dieta personalizada gerada:', planoAlimentar);
  return planoAlimentar;
}

/**
 * Gera observações personalizadas para a dieta.
 */
function gerarObservacoesDieta(anamnese, resultados) {
    const observacoes = [];
  
    if (anamnese.objetivo_principal?.includes('Emagrecer')) {
        observacoes.push('🎯 Dieta focada em déficit calórico para perda de gordura');
        observacoes.push('💧 Mantenha-se bem hidratado para otimizar o metabolismo');
    } else if (anamnese.objetivo_principal?.includes('Ganhar massa')) {
        observacoes.push('💪 Dieta com superávit calórico para ganho de massa muscular');
        observacoes.push('⏰ Consuma proteína a cada 3-4 horas para síntese proteica');
    }

    if (anamnese.recursos_ergogenicos === 'Sim') {
        observacoes.push('⚡ Dieta ajustada para metabolismo acelerado por recursos ergogênicos');
    }

    if (resultados.fatoresAplicados.mentalidade?.includes('agressiva')) {
        observacoes.push('🔥 Abordagem mais agressiva aplicada conforme sua mentalidade');
    }

    observacoes.push('📱 Use o sistema de check-in para acompanhar seu progresso');
    observacoes.push('💡 Este é um plano inicial, ajustes podem ser feitos com base no seu progresso.');

    return observacoes;
}

