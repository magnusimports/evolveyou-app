/**
 * ALGORITMOS COMPENSATÓRIOS AVANÇADOS - EVOLVEYOU
 * 
 * Baseados nas 22 perguntas da anamnese inteligente
 * Diferencial competitivo único no mercado
 */

/**
 * Calcula TMB usando fórmula Mifflin-St Jeor com fatores compensatórios
 */
function calcularTMBCompensatorio(anamnese) {
  const { sexo, idade, peso, altura, descricao_corpo, recursos_ergogenicos, uso_suplementos } = anamnese;
  
  // TMB base usando Mifflin-St Jeor
  let tmb;
  if (sexo === 'Masculino') {
    tmb = (10 * peso) + (6.25 * altura) - (5 * idade) + 5;
  } else {
    tmb = (10 * peso) + (6.25 * altura) - (5 * idade) - 161;
  }
  
  // FATOR COMPENSATÓRIO 1: Composição Corporal Visual
  let fatorComposicao = 1.0;
  switch (descricao_corpo) {
    case 'Muito magro(a), com ossos e músculos bem visíveis':
      fatorComposicao = 1.15; // Metabolismo acelerado, ectomorfo
      break;
    case 'Magro(a), com pouca gordura aparente e um visual "seco"':
      fatorComposicao = 1.10; // Metabolismo ligeiramente acelerado
      break;
    case 'Atlético(a), com músculos definidos e pouca gordura':
      fatorComposicao = 1.05; // Mais massa muscular = maior TMB
      break;
    case 'Normal ou mediano, com um pouco de gordura cobrindo os músculos':
      fatorComposicao = 1.0; // Padrão
      break;
    case 'Acima do peso, com acúmulo de gordura notável na barriga, quadris ou outras áreas':
      fatorComposicao = 0.95; // Metabolismo mais lento
      break;
  }
  
  // FATOR COMPENSATÓRIO 2: Recursos Ergogênicos (DIFERENCIAL ÚNICO)
  let fatorErgogenico = 1.0;
  if (recursos_ergogenicos === 'Sim') {
    fatorErgogenico = 1.20; // Aumento significativo no metabolismo
  }
  
  // FATOR COMPENSATÓRIO 3: Suplementação
  let fatorSuplemento = 1.0;
  if (uso_suplementos === 'Sim' && anamnese.tipos_suplementos) {
    const suplementos = anamnese.tipos_suplementos;
    if (suplementos.includes('Creatina')) fatorSuplemento += 0.02;
    if (suplementos.includes('Cafeína (cápsulas ou como pré-treino)')) fatorSuplemento += 0.03;
    if (suplementos.includes('Beta-Alanina')) fatorSuplemento += 0.01;
    if (suplementos.includes('Hipercalórico / Massa')) fatorSuplemento += 0.05;
  }
  
  // Aplicar fatores compensatórios
  tmb = tmb * fatorComposicao * fatorErgogenico * fatorSuplemento;
  
  return Math.round(tmb);
}

/**
 * Calcula TDEE com fatores de atividade compensatórios avançados
 */
function calcularTDEECompensatorio(anamnese) {
  const tmb = calcularTMBCompensatorio(anamnese);
  
  // FATOR DE ATIVIDADE TRABALHO
  let fatorTrabalho = 1.0;
  switch (anamnese.atividade_trabalho) {
    case 'Nível 1 - Sedentário: Passo a maior parte do tempo sentado(a) (ex: escritório, motorista)':
      fatorTrabalho = 1.2;
      break;
    case 'Nível 2 - Leve: Fico parte do tempo sentado(a), mas caminho um pouco ou fico em pé (ex: professor, vendedor)':
      fatorTrabalho = 1.375;
      break;
    case 'Nível 3 - Moderado: Estou em constante movimento, caminhando bastante (ex: garçom, estoquista)':
      fatorTrabalho = 1.55;
      break;
    case 'Nível 4 - Intenso: Meu trabalho exige muito esforço físico e carregar pesos (ex: construção civil)':
      fatorTrabalho = 1.725;
      break;
  }
  
  // FATOR DE ATIVIDADE TEMPO LIVRE
  let fatorTempoLivre = 1.0;
  switch (anamnese.atividade_tempo_livre) {
    case 'Nível 1 - Muito tranquila: Passo a maior parte do tempo em atividades de baixo esforço (ler, ver TV)':
      fatorTempoLivre = 1.0;
      break;
    case 'Nível 2 - Levemente ativa: Faço tarefas domésticas leves e pequenas caminhadas':
      fatorTempoLivre = 1.1;
      break;
    case 'Nível 3 - Ativa: Estou sempre fazendo algo, como limpeza pesada, jardinagem, passeios longos':
      fatorTempoLivre = 1.2;
      break;
  }
  
  // FATOR DE TREINO
  let fatorTreino = 1.0;
  const frequencia = parseInt(anamnese.frequencia_treino?.split(' ')[0]) || 0;
  
  switch (anamnese.experiencia_treino) {
    case 'Iniciante: Nunca treinei ou treinei por menos de 6 meses':
      fatorTreino = 1.0 + (frequencia * 0.05); // 5% por dia de treino
      break;
    case 'Intermediário: Treino de forma consistente há mais de 6 meses a 2 anos':
      fatorTreino = 1.0 + (frequencia * 0.08); // 8% por dia de treino
      break;
    case 'Avançado: Treino de forma séria e consistente há vários anos':
      fatorTreino = 1.0 + (frequencia * 0.12); // 12% por dia de treino
      break;
  }
  
  // FATOR DE INTENSIDADE
  let fatorIntensidade = 1.0;
  switch (anamnese.intensidade_treino) {
    case '3-4 (Leve): Consigo conversar normalmente':
      fatorIntensidade = 1.0;
      break;
    case '5-6 (Moderado): Conversar se torna um desafio':
      fatorIntensidade = 1.05;
      break;
    case '7-8 (Intenso): Só consigo falar frases curtas':
      fatorIntensidade = 1.15;
      break;
    case '9-10 (Muito Intenso): Falar é quase impossível, esforço máximo':
      fatorIntensidade = 1.25;
      break;
  }
  
  // Calcular TDEE combinando todos os fatores
  const tdee = tmb * fatorTrabalho * fatorTempoLivre * fatorTreino * fatorIntensidade;
  
  return Math.round(tdee);
}

/**
 * Calcula ajuste calórico baseado no objetivo e mentalidade
 */
function calcularAjusteCaloricoCompensatorio(anamnese, tdee) {
  const { objetivo_principal, mentalidade, prazo_objetivo } = anamnese;
  
  let ajusteBase = 0;
  
  // Ajuste base por objetivo
  switch (objetivo_principal) {
    case 'Emagrecer e perder gordura corporal (preservar massa muscular)':
      ajusteBase = -500; // Déficit padrão
      break;
    case 'Ganhar massa muscular (hipertrofia)':
      ajusteBase = 300; // Superávit padrão
      break;
    case 'Melhorar minha saúde e condicionamento físico geral (performance)':
      ajusteBase = 0; // Manutenção
      break;
    case 'Manter meu peso e composição corporal atuais (manutenção)':
      ajusteBase = 0;
      break;
    case 'Reabilitação, melhora postural':
      ajusteBase = -100; // Déficit leve
      break;
  }
  
  // FATOR COMPENSATÓRIO: Mentalidade
  let fatorMentalidade = 1.0;
  if (mentalidade === 'Prefiro uma abordagem mais agressiva, mesmo que seja mais difícil') {
    fatorMentalidade = 1.5; // Aumenta o déficit/superávit
  } else {
    fatorMentalidade = 0.7; // Abordagem mais conservadora
  }
  
  // FATOR COMPENSATÓRIO: Prazo
  let fatorPrazo = 1.0;
  switch (prazo_objetivo) {
    case 'Curto Prazo: O mais rápido possível':
      fatorPrazo = 1.3;
      break;
    case 'Médio Prazo: Tenho um bom tempo':
      fatorPrazo = 1.0;
      break;
    case 'Longo Prazo: Sem pressa, focando na consistência':
      fatorPrazo = 0.8;
      break;
    case 'Contínuo: É um projeto de estilo de vida, sem um prazo final':
      fatorPrazo = 0.6;
      break;
  }
  
  // Aplicar fatores compensatórios
  const ajusteFinal = ajusteBase * fatorMentalidade * fatorPrazo;
  const caloriasAlvo = tdee + ajusteFinal;
  
  return Math.round(caloriasAlvo);
}

/**
 * Distribui macronutrientes baseado no objetivo e preferências
 */
function calcularMacronutrientesCompensatorios(anamnese, caloriasAlvo) {
  const { objetivo_principal, experiencia_treino, recursos_ergogenicos } = anamnese;
  
  let percProteina, percCarbo, percGordura;
  
  // Distribuição base por objetivo
  switch (objetivo_principal) {
    case 'Emagrecer e perder gordura corporal (preservar massa muscular)':
      percProteina = 0.35; // Alta proteína para preservar massa
      percCarbo = 0.30;
      percGordura = 0.35;
      break;
    case 'Ganhar massa muscular (hipertrofia)':
      percProteina = 0.25;
      percCarbo = 0.45; // Mais carboidratos para energia
      percGordura = 0.30;
      break;
    case 'Melhorar minha saúde e condicionamento físico geral (performance)':
      percProteina = 0.25;
      percCarbo = 0.45;
      percGordura = 0.30;
      break;
    default:
      percProteina = 0.25;
      percCarbo = 0.40;
      percGordura = 0.35;
  }
  
  // FATOR COMPENSATÓRIO: Experiência de treino
  if (experiencia_treino === 'Avançado: Treino de forma séria e consistente há vários anos') {
    percProteina += 0.05; // Mais proteína para avançados
    percCarbo -= 0.03;
    percGordura -= 0.02;
  }
  
  // FATOR COMPENSATÓRIO: Recursos ergogênicos
  if (recursos_ergogenicos === 'Sim') {
    percProteina += 0.05; // Mais proteína para síntese
    percCarbo += 0.05; // Mais energia para treinos intensos
    percGordura -= 0.10;
  }
  
  // Calcular gramas
  const proteina = Math.round((caloriasAlvo * percProteina) / 4);
  const carboidrato = Math.round((caloriasAlvo * percCarbo) / 4);
  const gordura = Math.round((caloriasAlvo * percGordura) / 9);
  
  return {
    proteina: { gramas: proteina, calorias: proteina * 4, percentual: Math.round(percProteina * 100) },
    carboidrato: { gramas: carboidrato, calorias: carboidrato * 4, percentual: Math.round(percCarbo * 100) },
    gordura: { gramas: gordura, calorias: gordura * 9, percentual: Math.round(percGordura * 100) }
  };
}

/**
 * Gera distribuição de refeições baseada nas preferências
 */
function gerarDistribuicaoRefeicoes(anamnese) {
  const { refeicoes_dia } = anamnese;
  
  let distribuicao;
  
  switch (refeicoes_dia) {
    case '1 a 2 refeições grandes':
      distribuicao = [
        { nome: 'Almoço', percentual: 0.60 },
        { nome: 'Jantar', percentual: 0.40 }
      ];
      break;
    case '3 refeições principais (café, almoço, jantar)':
      distribuicao = [
        { nome: 'Café da Manhã', percentual: 0.25 },
        { nome: 'Almoço', percentual: 0.45 },
        { nome: 'Jantar', percentual: 0.30 }
      ];
      break;
    case '4 a 5 refeições (as 3 principais + lanches)':
      distribuicao = [
        { nome: 'Café da Manhã', percentual: 0.20 },
        { nome: 'Lanche da Manhã', percentual: 0.10 },
        { nome: 'Almoço', percentual: 0.35 },
        { nome: 'Lanche da Tarde', percentual: 0.15 },
        { nome: 'Jantar', percentual: 0.20 }
      ];
      break;
    case '6 ou mais refeições pequenas ao longo do dia':
      distribuicao = [
        { nome: 'Café da Manhã', percentual: 0.18 },
        { nome: 'Lanche da Manhã', percentual: 0.12 },
        { nome: 'Almoço', percentual: 0.25 },
        { nome: 'Lanche da Tarde', percentual: 0.12 },
        { nome: 'Jantar', percentual: 0.20 },
        { nome: 'Ceia', percentual: 0.13 }
      ];
      break;
    default:
      // Padrão 5 refeições
      distribuicao = [
        { nome: 'Café da Manhã', percentual: 0.20 },
        { nome: 'Lanche da Manhã', percentual: 0.10 },
        { nome: 'Almoço', percentual: 0.35 },
        { nome: 'Lanche da Tarde', percentual: 0.15 },
        { nome: 'Jantar', percentual: 0.20 }
      ];
  }
  
  return distribuicao;
}

/**
 * Função principal que aplica todos os algoritmos compensatórios
 */
function aplicarAlgoritmosCompensatorios(anamnese) {
  console.log('🧠 Aplicando algoritmos compensatórios avançados...');
  
  // 1. Calcular TMB com fatores compensatórios
  const tmb = calcularTMBCompensatorio(anamnese);
  console.log('📊 TMB Compensatório:', tmb);
  
  // 2. Calcular TDEE com fatores avançados
  const tdee = calcularTDEECompensatorio(anamnese);
  console.log('📊 TDEE Compensatório:', tdee);
  
  // 3. Calcular calorias alvo com ajustes
  const caloriasAlvo = calcularAjusteCaloricoCompensatorio(anamnese, tdee);
  console.log('📊 Calorias Alvo:', caloriasAlvo);
  
  // 4. Distribuir macronutrientes
  const macros = calcularMacronutrientesCompensatorios(anamnese, caloriasAlvo);
  console.log('📊 Macronutrientes:', macros);
  
  // 5. Gerar distribuição de refeições
  const distribuicaoRefeicoes = gerarDistribuicaoRefeicoes(anamnese);
  console.log('📊 Distribuição de Refeições:', distribuicaoRefeicoes);
  
  return {
    tmb,
    tdee,
    caloriasAlvo,
    macronutrientes: macros,
    distribuicaoRefeicoes,
    fatoresAplicados: {
      composicaoCorporal: anamnese.descricao_corpo,
      recursosErgogenicos: anamnese.recursos_ergogenicos,
      experienciaTreino: anamnese.experiencia_treino,
      mentalidade: anamnese.mentalidade,
      prazoObjetivo: anamnese.prazo_objetivo
    }
  };
}

module.exports = {
  calcularTMBCompensatorio,
  calcularTDEECompensatorio,
  calcularAjusteCaloricoCompensatorio,
  calcularMacronutrientesCompensatorios,
  gerarDistribuicaoRefeicoes,
  aplicarAlgoritmosCompensatorios
};

