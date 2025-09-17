// 🎯 Serviço de Dados Personalizados - EvolveYou
// Gera informações personalizadas baseadas nos dados da anamnese

class PersonalizedDataService {
  
  // 📊 Calcula métricas personalizadas baseadas na anamnese
  calculatePersonalizedMetrics(anamneseData) {
    if (!anamneseData) return this.getDefaultMetrics();

    const {
      idade = 30,
      sexo = 'masculino',
      altura = 175,
      peso = 75,
      objetivo = 'ganhar_massa',
      peso_meta = 80,
      nivel_atividade = 'moderado',
      habitos_alimentares = 'regulares',
      consumo_agua = '2_3_litros',
      horas_sono = '7_8_horas'
    } = anamneseData;

    // Calcular IMC
    const alturaM = parseFloat(altura) / 100;
    const pesoNum = parseFloat(peso);
    const imc = (pesoNum / (alturaM * alturaM)).toFixed(1);

    // Calcular TMB (Taxa Metabólica Basal)
    let tmb;
    if (sexo === 'masculino') {
      tmb = 88.362 + (13.397 * pesoNum) + (4.799 * parseFloat(altura)) - (5.677 * parseFloat(idade));
    } else {
      tmb = 447.593 + (9.247 * pesoNum) + (3.098 * parseFloat(altura)) - (4.330 * parseFloat(idade));
    }

    // Fator de atividade
    const fatoresAtividade = {
      'sedentario': 1.2,
      'leve': 1.375,
      'moderado': 1.55,
      'intenso': 1.725,
      'muito_intenso': 1.9
    };

    const fatorAtividade = fatoresAtividade[nivel_atividade] || 1.55;
    const caloriasDiarias = Math.round(tmb * fatorAtividade);

    // Ajustar calorias baseado no objetivo
    let caloriasObjetivo = caloriasDiarias;
    if (objetivo === 'perder_peso') {
      caloriasObjetivo = Math.round(caloriasDiarias * 0.85); // Déficit de 15%
    } else if (objetivo === 'ganhar_massa') {
      caloriasObjetivo = Math.round(caloriasDiarias * 1.15); // Superávit de 15%
    }

    // Consumo de água recomendado
    const aguaRecomendada = this.calculateWaterIntake(pesoNum, nivel_atividade);

    // Progresso simulado baseado no tempo
    const progressoSimulado = this.generateProgressData(objetivo, pesoNum, parseFloat(peso_meta));

    return {
      currentWeight: pesoNum,
      targetWeight: parseFloat(peso_meta),
      bmi: parseFloat(imc),
      todayCalories: Math.round(caloriasObjetivo * 0.7), // 70% das calorias já consumidas
      targetCalories: caloriasObjetivo,
      waterIntake: aguaRecomendada * 0.8, // 80% da água já consumida
      targetWater: aguaRecomendada,
      workoutsCompleted: progressoSimulado.workoutsCompleted,
      totalWorkouts: progressoSimulado.totalWorkouts,
      weeklyProgress: progressoSimulado.weeklyProgress,
      tmb: Math.round(tmb),
      fatorAtividade: fatorAtividade
    };
  }

  // 💧 Calcula consumo de água recomendado
  calculateWaterIntake(peso, nivelAtividade) {
    let baseWater = peso * 0.035; // 35ml por kg de peso corporal
    
    // Ajustar baseado no nível de atividade
    const ajustesAtividade = {
      'sedentario': 1.0,
      'leve': 1.1,
      'moderado': 1.2,
      'intenso': 1.3,
      'muito_intenso': 1.4
    };

    const ajuste = ajustesAtividade[nivelAtividade] || 1.2;
    return Math.round((baseWater * ajuste) * 10) / 10; // Arredondar para 1 casa decimal
  }

  // 📈 Gera dados de progresso simulados
  generateProgressData(objetivo, pesoAtual, pesoMeta) {
    const diasSemana = 7;
    const workoutsRecomendados = {
      'perder_peso': 5,
      'ganhar_massa': 4,
      'manter_peso': 3,
      'melhorar_condicionamento': 5
    };

    const totalWorkouts = workoutsRecomendados[objetivo] || 4;
    const workoutsCompleted = Math.floor(totalWorkouts * 0.8); // 80% de conclusão

    // Progresso de peso simulado
    const diferencaPeso = Math.abs(pesoAtual - pesoMeta);
    const progressoPeso = Math.min(diferencaPeso * 0.3, 2.5); // Máximo 2.5kg por semana

    return {
      workoutsCompleted,
      totalWorkouts,
      weeklyProgress: {
        weightLoss: objetivo === 'perder_peso' ? progressoPeso : 0,
        weightGain: objetivo === 'ganhar_massa' ? progressoPeso : 0,
        consistency: workoutsCompleted
      }
    };
  }

  // 🍽️ Gera plano nutricional personalizado
  generateNutritionalPlan(anamneseData, calorias) {
    const {
      objetivo = 'ganhar_massa',
      restricoes_alimentares = 'nenhuma',
      refeicoes_dia = '3_refeicoes',
      habitos_alimentares = 'regulares'
    } = anamneseData || {};

    // Distribuição de macronutrientes baseada no objetivo
    const macroDistribution = {
      'perder_peso': { proteina: 0.35, carboidrato: 0.35, gordura: 0.30 },
      'ganhar_massa': { proteina: 0.30, carboidrato: 0.45, gordura: 0.25 },
      'manter_peso': { proteina: 0.25, carboidrato: 0.45, gordura: 0.30 },
      'melhorar_condicionamento': { proteina: 0.30, carboidrato: 0.50, gordura: 0.20 }
    };

    const macros = macroDistribution[objetivo] || macroDistribution['ganhar_massa'];

    // Calcular gramas de cada macronutriente
    const proteinaKcal = calorias * macros.proteina;
    const carboidratoKcal = calorias * macros.carboidrato;
    const gorduraKcal = calorias * macros.gordura;

    const proteinaG = Math.round(proteinaKcal / 4); // 4 kcal por grama
    const carboidratoG = Math.round(carboidratoKcal / 4); // 4 kcal por grama
    const gorduraG = Math.round(gorduraKcal / 9); // 9 kcal por grama

    // Número de refeições
    const numRefeicoes = {
      '3_refeicoes': 3,
      '4_refeicoes': 4,
      '5_refeicoes': 5,
      '6_refeicoes': 6
    }[refeicoes_dia] || 3;

    return {
      calorias,
      macronutrientes: {
        proteina: { gramas: proteinaG, kcal: proteinaKcal, percentual: Math.round(macros.proteina * 100) },
        carboidrato: { gramas: carboidratoG, kcal: carboidratoKcal, percentual: Math.round(macros.carboidrato * 100) },
        gordura: { gramas: gorduraG, kcal: gorduraKcal, percentual: Math.round(macros.gordura * 100) }
      },
      refeicoes: numRefeicoes,
      restricoes: restricoes_alimentares,
      objetivo: objetivo
    };
  }

  // 🏋️‍♂️ Gera plano de treino personalizado
  generateWorkoutPlan(anamneseData) {
    const {
      objetivo = 'ganhar_massa',
      nivel_atividade = 'moderado',
      tipo_exercicio = 'musculacao',
      tempo_disponivel = '45_60_min',
      experiencia_anterior = 'moderada'
    } = anamneseData || {};

    // Frequência semanal baseada no objetivo e nível
    const frequenciaSemanal = {
      'perder_peso': { 'sedentario': 3, 'leve': 4, 'moderado': 5, 'intenso': 6 },
      'ganhar_massa': { 'sedentario': 3, 'leve': 4, 'moderado': 4, 'intenso': 5 },
      'manter_peso': { 'sedentario': 2, 'leve': 3, 'moderado': 3, 'intenso': 4 },
      'melhorar_condicionamento': { 'sedentario': 3, 'leve': 4, 'moderado': 5, 'intenso': 6 }
    };

    const frequencia = frequenciaSemanal[objetivo]?.[nivel_atividade] || 4;

    // Duração do treino
    const duracaoMinutos = {
      '30_45_min': 40,
      '45_60_min': 55,
      '60_90_min': 75,
      'mais_90_min': 90
    }[tempo_disponivel] || 55;

    // Tipo de treino baseado na experiência
    const tipoTreino = experiencia_anterior === 'nenhuma' ? 'Iniciante' :
                      experiencia_anterior === 'pouca' ? 'Básico' :
                      experiencia_anterior === 'moderada' ? 'Intermediário' : 'Avançado';

    return {
      frequenciaSemanal: frequencia,
      duracaoMinutos: duracaoMinutos,
      tipoTreino: tipoTreino,
      foco: objetivo,
      modalidade: tipo_exercicio,
      proximoTreino: this.getNextWorkout(objetivo, tipo_exercicio)
    };
  }

  // 🎯 Próximo treino recomendado
  getNextWorkout(objetivo, tipo) {
    const treinos = {
      'musculacao': {
        'perder_peso': ['Treino HIIT + Musculação', 'Treino de Força', 'Cardio + Core'],
        'ganhar_massa': ['Treino de Peito e Tríceps', 'Treino de Costas e Bíceps', 'Treino de Pernas'],
        'manter_peso': ['Treino Full Body', 'Treino Upper Body', 'Treino Lower Body']
      },
      'cardio': {
        'perder_peso': ['HIIT 30min', 'Corrida Intervalada', 'Bike + Funcional'],
        'ganhar_massa': ['Cardio Leve 20min', 'Caminhada Inclinada', 'Bike Moderada'],
        'manter_peso': ['Cardio Moderado', 'Corrida Leve', 'Elíptico']
      }
    };

    const opcoes = treinos[tipo]?.[objetivo] || treinos['musculacao']['ganhar_massa'];
    const hoje = new Date().getDay(); // 0 = Domingo, 1 = Segunda, etc.
    
    return {
      nome: opcoes[hoje % opcoes.length],
      dia: this.getNextWorkoutDay(),
      duracao: '45-60 min'
    };
  }

  // 📅 Próximo dia de treino
  getNextWorkoutDay() {
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return dias[amanha.getDay()];
  }

  // 📊 Métricas padrão (fallback)
  getDefaultMetrics() {
    return {
      currentWeight: 75,
      targetWeight: 70,
      bmi: 24.5,
      todayCalories: 1800,
      targetCalories: 2200,
      waterIntake: 2.2,
      targetWater: 2.8,
      workoutsCompleted: 3,
      totalWorkouts: 4,
      weeklyProgress: {
        weightLoss: 0.5,
        consistency: 6
      },
      tmb: 1650,
      fatorAtividade: 1.55
    };
  }

  // 👤 Gera perfil personalizado
  generatePersonalizedProfile(anamneseData) {
    if (!anamneseData) return null;

    const {
      nome = 'Usuário',
      idade = 30,
      altura = 175,
      objetivo = 'ganhar_massa',
      nivel_atividade = 'moderado',
      condicoes_medicas = 'nenhuma',
      motivacao_principal = 'saude_geral'
    } = anamneseData;

    // Mapear objetivos para texto amigável
    const objetivosMap = {
      'perder_peso': 'Perder Peso',
      'ganhar_massa': 'Ganhar Massa Muscular',
      'manter_peso': 'Manter Peso',
      'melhorar_condicionamento': 'Melhorar Condicionamento'
    };

    const atividadeMap = {
      'sedentario': 'Sedentário',
      'leve': 'Atividade Leve',
      'moderado': 'Atividade Moderada',
      'intenso': 'Atividade Intensa',
      'muito_intenso': 'Muito Ativo'
    };

    // Gerar desafios baseados no perfil
    const desafios = this.generateChallenges(anamneseData);

    return {
      name: nome,
      age: parseInt(idade),
      height: parseInt(altura),
      goal: objetivosMap[objetivo] || 'Ganhar Massa Muscular',
      activity: atividadeMap[nivel_atividade] || 'Atividade Moderada',
      challenges: desafios,
      healthConditions: condicoes_medicas,
      motivation: motivacao_principal
    };
  }

  // 🎯 Gera desafios personalizados
  generateChallenges(anamneseData) {
    const desafios = [];
    
    const {
      habitos_alimentares,
      qualidade_sono,
      nivel_estresse,
      consumo_agua,
      experiencia_anterior
    } = anamneseData || {};

    if (habitos_alimentares === 'irregulares') {
      desafios.push('Regularizar alimentação');
    }

    if (qualidade_sono === 'ruim' || qualidade_sono === 'irregular') {
      desafios.push('Melhorar qualidade do sono');
    }

    if (nivel_estresse === 'alto') {
      desafios.push('Reduzir estresse');
    }

    if (consumo_agua === 'menos_1_litro' || consumo_agua === '1_2_litros') {
      desafios.push('Aumentar hidratação');
    }

    if (experiencia_anterior === 'nenhuma') {
      desafios.push('Criar hábito de exercícios');
    }

    // Adicionar desafios padrão se lista estiver vazia
    if (desafios.length === 0) {
      desafios.push('Manter consistência', 'Evoluir gradualmente');
    }

    return desafios;
  }
}

export default new PersonalizedDataService();

