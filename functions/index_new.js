const functions = require('firebase-functions');
const admin = require('firebase-admin');
const DietaGenerator = require('./algorithms/dietaGenerator');
const TreinoGenerator = require('./algorithms/treinoGenerator');

admin.initializeApp();
const db = admin.firestore();

// Função para salvar anamnese
exports.salvarAnamnese = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    const userId = context.auth.uid;
    const anamneseData = {
      ...data,
      userId: userId,
      dataPreenchimento: admin.firestore.FieldValue.serverTimestamp(),
      imc: calcularIMC(data.peso, data.altura)
    };

    await db.collection('anamneses').doc(userId).set(anamneseData);
    
    return { success: true, message: 'Anamnese salva com sucesso!' };
  } catch (error) {
    console.error('Erro ao salvar anamnese:', error);
    throw new functions.https.HttpsError('internal', 'Erro interno do servidor');
  }
});

// Função para gerar plano alimentar personalizado
exports.getPlanoAlimentar = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    const userId = context.auth.uid;
    
    // Buscar anamnese do usuário
    const anamneseDoc = await db.collection('anamneses').doc(userId).get();
    if (!anamneseDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Anamnese não encontrada');
    }

    const anamneseData = anamneseDoc.data();
    
    // Gerar plano alimentar usando o algoritmo
    const dietaGenerator = new DietaGenerator(anamneseData);
    const planoAlimentar = dietaGenerator.gerarPlanoAlimentar();
    
    // Salvar plano no Firestore
    await db.collection('planosAlimentares').doc(userId).set({
      ...planoAlimentar,
      dataGeracao: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return planoAlimentar;
  } catch (error) {
    console.error('Erro ao gerar plano alimentar:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao gerar plano alimentar');
  }
});

// Função para registrar check-in de refeição
exports.registrarCheckinRefeicao = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    const { refeicaoId, dataPlano, consumido } = data;
    const userId = context.auth.uid;
    
    const checkinData = {
      userId,
      refeicaoId,
      dataPlano,
      consumido,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('checkinsRefeicoes').add(checkinData);
    
    return { success: true, message: 'Check-in registrado com sucesso!' };
  } catch (error) {
    console.error('Erro ao registrar check-in:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao registrar check-in');
  }
});

// Função para gerar treino do dia
exports.getTreinoDoDia = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    const userId = context.auth.uid;
    const { diaSemana } = data; // Opcional, usa dia atual se não fornecido
    
    // Buscar anamnese do usuário
    const anamneseDoc = await db.collection('anamneses').doc(userId).get();
    if (!anamneseDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Anamnese não encontrada');
    }

    const anamneseData = anamneseDoc.data();
    
    // Gerar treino usando o algoritmo
    const treinoGenerator = new TreinoGenerator(anamneseData);
    const treinoDoDia = treinoGenerator.gerarTreinoDoDia(diaSemana);
    
    // Salvar treino no Firestore
    const treinoId = `${userId}_${treinoDoDia.data}`;
    await db.collection('treinosDoDia').doc(treinoId).set({
      ...treinoDoDia,
      userId,
      dataGeracao: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return treinoDoDia;
  } catch (error) {
    console.error('Erro ao gerar treino do dia:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao gerar treino do dia');
  }
});

// Função para iniciar sessão de treino
exports.iniciarTreino = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    const { treinoId } = data;
    const userId = context.auth.uid;
    
    const sessaoData = {
      userId,
      treinoId,
      dataInicio: admin.firestore.FieldValue.serverTimestamp(),
      status: 'em_andamento',
      exerciciosCompletos: [],
      tempoTotal: 0
    };

    const sessaoRef = await db.collection('sessoesTreino').add(sessaoData);
    
    return { 
      success: true, 
      sessaoId: sessaoRef.id,
      message: 'Treino iniciado com sucesso!' 
    };
  } catch (error) {
    console.error('Erro ao iniciar treino:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao iniciar treino');
  }
});

// Função para gerar programa semanal completo
exports.gerarProgramaSemanal = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    const userId = context.auth.uid;
    
    // Buscar anamnese do usuário
    const anamneseDoc = await db.collection('anamneses').doc(userId).get();
    if (!anamneseDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Anamnese não encontrada');
    }

    const anamneseData = anamneseDoc.data();
    
    // Gerar programa semanal
    const treinoGenerator = new TreinoGenerator(anamneseData);
    const programaSemanal = treinoGenerator.gerarProgramaSemanal();
    
    // Salvar programa no Firestore
    await db.collection('programasSemanais').doc(userId).set({
      ...programaSemanal,
      dataGeracao: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return programaSemanal;
  } catch (error) {
    console.error('Erro ao gerar programa semanal:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao gerar programa semanal');
  }
});

// Função para calcular dados do dashboard
exports.getDashboardData = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    const userId = context.auth.uid;
    
    // Buscar anamnese
    const anamneseDoc = await db.collection('anamneses').doc(userId).get();
    if (!anamneseDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Anamnese não encontrada');
    }

    const anamnese = anamneseDoc.data();
    
    // Gerar dados do dashboard usando o algoritmo de dieta
    const dietaGenerator = new DietaGenerator(anamnese);
    const planoBase = dietaGenerator.gerarPlanoAlimentar();
    
    // Simular consumo atual (em uma implementação real, isso viria dos check-ins)
    const consumoSimulado = {
      calorias: Math.round(planoBase.calorias_meta * 0.75),
      proteinas: Math.round(planoBase.macronutrientes_meta.proteinas.gramas * 0.8),
      carboidratos: Math.round(planoBase.macronutrientes_meta.carboidratos.gramas * 0.7),
      gorduras: Math.round(planoBase.macronutrientes_meta.gorduras.gramas * 0.85)
    };
    
    const dashboardData = {
      greeting: {
        nickname: `Olá, ${anamnese.nome?.split(' ')[0] || 'Usuário'}`,
        date: new Date().toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        })
      },
      energy_balance: {
        consumed_kcal: consumoSimulado.calorias,
        expended_kcal: planoBase.calorias_meta,
        deficit_kcal: planoBase.calorias_meta - consumoSimulado.calorias
      },
      caloric_expenditure: {
        basal_kcal: planoBase.tmb,
        activity_kcal: planoBase.tdee - planoBase.tmb
      },
      macronutrients: {
        carbs: {
          consumed: consumoSimulado.carboidratos,
          target: planoBase.macronutrientes_meta.carboidratos.gramas
        },
        protein: {
          consumed: consumoSimulado.proteinas,
          target: planoBase.macronutrientes_meta.proteinas.gramas
        },
        fat: {
          consumed: consumoSimulado.gorduras,
          target: planoBase.macronutrientes_meta.gorduras.gramas
        }
      },
      water_intake: {
        consumed_liters: 2.1,
        target_liters: 3.0
      }
    };
    
    return dashboardData;
  } catch (error) {
    console.error('Erro ao gerar dados do dashboard:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao gerar dados do dashboard');
  }
});

// Função auxiliar para calcular IMC
function calcularIMC(peso, altura) {
  const alturaMetros = altura / 100;
  const imc = peso / (alturaMetros * alturaMetros);
  return Math.round(imc * 10) / 10;
}

