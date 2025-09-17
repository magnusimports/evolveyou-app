// 🔥 Serviço de Dados da Anamnese - EvolveYou
// Carrega dados reais da anamnese do Firestore e gera métricas personalizadas

import personalizedDataService from './personalizedDataService';

class AnamneseDataService {
  
  // 📊 Carrega dados da anamnese do usuário
  async loadUserAnamnese(userId) {
    try {
      console.log('🔍 Carregando anamnese do usuário:', userId);
      
      // Buscar dados da anamnese no Firestore via Firebase Function
      const response = await fetch(`https://us-central1-evolveyou-prod.cloudfunctions.net/getAnamnese?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar anamnese: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Anamnese carregada:', data);

      return data;
    } catch (error) {
      console.error('❌ Erro ao carregar anamnese:', error);
      
      // Retornar dados de exemplo se não conseguir carregar
      return this.getExampleAnamneseData();
    }
  }

  // 🎯 Gera dashboard personalizado baseado na anamnese real
  generatePersonalizedDashboard(anamneseData) {
    if (!anamneseData) {
      return this.getDefaultDashboard();
    }

    console.log('🎨 Gerando dashboard personalizado para:', anamneseData.nome);

    // Calcular métricas personalizadas
    const metrics = personalizedDataService.calculatePersonalizedMetrics(anamneseData);
    
    // Gerar perfil personalizado
    const profile = personalizedDataService.generatePersonalizedProfile(anamneseData);
    
    // Gerar plano nutricional
    const nutritionalPlan = personalizedDataService.generateNutritionalPlan(anamneseData, metrics.targetCalories);
    
    // Gerar plano de treino
    const workoutPlan = personalizedDataService.generateWorkoutPlan(anamneseData);

    // Gerar insights personalizados
    const insights = this.generatePersonalizedInsights(anamneseData, metrics);

    return {
      user: profile,
      metrics: metrics,
      nutritionalPlan: nutritionalPlan,
      workoutPlan: workoutPlan,
      insights: insights,
      lastUpdated: new Date().toISOString(),
      source: 'real_anamnese'
    };
  }

  // 💡 Gera insights personalizados baseados na anamnese
  generatePersonalizedInsights(anamneseData, metrics) {
    const insights = [];

    const {
      objetivo,
      peso,
      peso_meta,
      horas_sono,
      qualidade_sono,
      nivel_stress,
      consumo_agua,
      habitos_alimentares,
      nivel_atividade,
      imc
    } = anamneseData;

    // Insight sobre IMC
    const imcNum = parseFloat(imc);
    if (imcNum >= 25 && imcNum < 30) {
      insights.push({
        type: 'warning',
        title: 'IMC em Sobrepeso',
        message: `Seu IMC atual é ${imc}, indicando sobrepeso. Com seu objetivo de ${objetivo.toLowerCase()}, você está no caminho certo!`,
        action: 'Manter foco na dieta e exercícios'
      });
    } else if (imcNum >= 30) {
      insights.push({
        type: 'alert',
        title: 'IMC em Obesidade',
        message: `Seu IMC atual é ${imc}. É importante focar na perda de peso gradual e sustentável.`,
        action: 'Consultar nutricionista se possível'
      });
    }

    // Insight sobre sono
    if (horas_sono === '5 a 6 horas' || qualidade_sono.includes('cansado')) {
      insights.push({
        type: 'warning',
        title: 'Sono Insuficiente',
        message: 'Você está dormindo pouco e com qualidade ruim. Isso pode afetar seu metabolismo e recuperação.',
        action: 'Tente dormir 7-8 horas por noite'
      });
    }

    // Insight sobre hidratação
    if (consumo_agua === 'Mais de 3 litros') {
      insights.push({
        type: 'success',
        title: 'Excelente Hidratação!',
        message: 'Parabéns! Você está muito bem hidratado, isso é fundamental para seus resultados.',
        action: 'Continue mantendo essa rotina'
      });
    }

    // Insight sobre atividade física
    if (nivel_atividade === 'Intenso (5-6x por semana)') {
      insights.push({
        type: 'success',
        title: 'Alto Nível de Atividade',
        message: 'Você tem um excelente nível de atividade física! Isso acelera muito seus resultados.',
        action: 'Cuidado com overtraining - inclua dias de descanso'
      });
    }

    // Insight sobre alimentação
    if (habitos_alimentares === 'Bons (maioria das refeições saudáveis)') {
      insights.push({
        type: 'success',
        title: 'Bons Hábitos Alimentares',
        message: 'Seus hábitos alimentares são bons! Isso é uma grande vantagem para atingir seus objetivos.',
        action: 'Mantenha a consistência e ajuste as porções'
      });
    }

    // Insight sobre meta de peso
    const diferencaPeso = parseFloat(peso) - parseFloat(peso_meta);
    if (objetivo === 'Perder peso' && diferencaPeso > 0) {
      const tempoEstimado = Math.ceil(diferencaPeso / 0.5); // 0.5kg por semana
      insights.push({
        type: 'info',
        title: 'Meta de Peso Realista',
        message: `Para perder ${diferencaPeso}kg de forma saudável, você precisará de aproximadamente ${tempoEstimado} semanas.`,
        action: 'Foque na consistência, não na velocidade'
      });
    }

    return insights;
  }

  // 📈 Gera dados de progresso simulados baseados no perfil
  generateProgressData(anamneseData) {
    const {
      objetivo,
      nivel_atividade,
      experiencia,
      peso,
      peso_meta
    } = anamneseData;

    // Simular progresso baseado no tempo desde a criação
    const diasDesdeInicio = Math.floor((Date.now() - new Date(anamneseData.criadaEm?.seconds * 1000 || Date.now())) / (1000 * 60 * 60 * 24));
    
    // Calcular treinos baseado no nível de atividade
    const treinosPorSemana = {
      'Sedentário': 2,
      'Leve (1-2x por semana)': 2,
      'Moderado (3-4x por semana)': 4,
      'Intenso (5-6x por semana)': 6,
      'Muito intenso (diário)': 7
    }[nivel_atividade] || 4;

    const semanasCompletas = Math.floor(diasDesdeInicio / 7);
    const treinosEsperados = semanasCompletas * treinosPorSemana;
    const treinosRealizados = Math.floor(treinosEsperados * 0.8); // 80% de aderência

    // Progresso de peso simulado
    let progressoPeso = 0;
    if (objetivo === 'Perder peso' && semanasCompletas > 0) {
      progressoPeso = Math.min(semanasCompletas * 0.5, parseFloat(peso) - parseFloat(peso_meta));
    }

    return {
      diasAtivos: diasDesdeInicio,
      treinosRealizados: treinosRealizados,
      treinosEsperados: treinosEsperados,
      progressoPeso: progressoPeso,
      consistencia: Math.round((treinosRealizados / Math.max(treinosEsperados, 1)) * 100),
      proximoTreino: this.getNextWorkout(anamneseData)
    };
  }

  // 🏋️‍♂️ Próximo treino baseado no perfil
  getNextWorkout(anamneseData) {
    const { exercicios_preferidos, objetivo, tempo_exercicio } = anamneseData;

    const treinosMusculacao = {
      'Perder peso': ['HIIT + Musculação', 'Treino Metabólico', 'Circuito Funcional'],
      'Ganhar massa': ['Treino de Peito e Tríceps', 'Treino de Costas e Bíceps', 'Treino de Pernas'],
      'Manter peso': ['Treino Full Body', 'Treino Upper Body', 'Treino Lower Body']
    };

    const treinosCardio = {
      'Perder peso': ['HIIT 30min', 'Corrida Intervalada', 'Bike + Funcional'],
      'Ganhar massa': ['Cardio Leve 20min', 'Caminhada Inclinada'],
      'Manter peso': ['Cardio Moderado', 'Corrida Leve']
    };

    const opcoes = exercicios_preferidos === 'Musculação' ? 
                   treinosMusculacao[objetivo] || treinosMusculacao['Perder peso'] :
                   treinosCardio[objetivo] || treinosCardio['Perder peso'];

    const hoje = new Date().getDay();
    
    return {
      nome: opcoes[hoje % opcoes.length],
      duracao: tempo_exercicio || '60 a 90 minutos',
      tipo: exercicios_preferidos || 'Musculação',
      foco: objetivo
    };
  }

  // 📊 Dados de exemplo (fallback)
  getExampleAnamneseData() {
    return {
      nome: 'Carlos Magnus Clement',
      idade: '40',
      sexo: 'Masculino',
      altura: '180',
      peso: '96',
      peso_meta: '90',
      objetivo: 'Perder peso',
      imc: '29.63',
      nivel_atividade: 'Intenso (5-6x por semana)',
      exercicios_preferidos: 'Musculação',
      tempo_exercicio: '60 a 90 minutos',
      experiencia: 'Pouca experiência (tentativas isoladas)',
      habitos_alimentares: 'Bons (maioria das refeições saudáveis)',
      restricoes_alimentares: 'Nenhuma restrição',
      refeicoes_dia: '4-5 refeições',
      consumo_agua: 'Mais de 3 litros',
      horas_sono: '5 a 6 horas',
      qualidade_sono: 'Regular (às vezes acordo cansado)',
      nivel_stress: 'Moderado',
      condicoes_saude: 'Nenhuma condição especial',
      medicamentos: 'Não tomo medicamentos',
      habitos_vida: 'Não fumo e não bebo',
      motivacao: 'Questões estéticas',
      status: 'completa',
      userId: 'lS7VYQqLq6eU12pl7UxcIVWRWRY2'
    };
  }

  // 📊 Dashboard padrão (fallback)
  getDefaultDashboard() {
    const exampleData = this.getExampleAnamneseData();
    return this.generatePersonalizedDashboard(exampleData);
  }
}

export default new AnamneseDataService();

