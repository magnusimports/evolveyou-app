/**
 * EvolveYou Firebase Functions - Versão Simplificada
 * Funções HTTP básicas para o aplicativo de saúde e fitness
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

// Inicializar Firebase Admin
admin.initializeApp();

/**
 * API para buscar alimentos do banco de dados
 */
exports.getAlimentos = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {categoria, busca, limite = 20} = req.query;

      let query = admin.firestore().collection("alimentos");

      if (categoria) {
        query = query.where("categoria", "==", categoria);
      }

      if (busca) {
        query = query.where("nome", ">=", busca)
            .where("nome", "<=", busca + "\uf8ff");
      }

      const snapshot = await query.limit(parseInt(limite)).get();
      const alimentos = [];

      snapshot.forEach((doc) => {
        alimentos.push({id: doc.id, ...doc.data()});
      });

      res.json({success: true, data: alimentos});
    } catch (error) {
      console.error("Erro ao buscar alimentos:", error);
      res.status(500).json({error: "Erro interno do servidor"});
    }
  });
});

/**
 * API para buscar exercícios do banco de dados
 */
exports.getExercicios = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {categoria, musculo, limite = 20} = req.query;

      let query = admin.firestore().collection("exercicios");

      if (categoria) {
        query = query.where("categoria", "==", categoria);
      }

      if (musculo) {
        query = query.where("musculosPrimarios", "array-contains", musculo);
      }

      const snapshot = await query.limit(parseInt(limite)).get();
      const exercicios = [];

      snapshot.forEach((doc) => {
        exercicios.push({id: doc.id, ...doc.data()});
      });

      res.json({success: true, data: exercicios});
    } catch (error) {
      console.error("Erro ao buscar exercícios:", error);
      res.status(500).json({error: "Erro interno do servidor"});
    }
  });
});

/**
 * API para gerar plano nutricional personalizado
 */
exports.gerarPlanoNutricional = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {userId, peso, altura, idade, sexo, objetivo, atividade} = req.body;

      if (!userId || !peso || !altura || !idade) {
        return res.status(400).json({error: "Dados obrigatórios faltando"});
      }

      // Calcular TMB (Taxa Metabólica Basal)
      let tmb;
      if (sexo === "masculino") {
        tmb = 88.362 + (13.397 * peso) + (4.799 * altura) -
              (5.677 * idade);
      } else {
        tmb = 447.593 + (9.247 * peso) + (3.098 * altura) -
              (4.330 * idade);
      }

      // Calcular calorias diárias baseado no nível de atividade
      const fatoresAtividade = {
        sedentario: 1.2,
        leve: 1.375,
        moderado: 1.55,
        ativo: 1.725,
        muito_ativo: 1.9,
      };

      const caloriasDiarias = Math.round(tmb *
        (fatoresAtividade[atividade] || 1.2));

      // Distribuição de macronutrientes baseada no objetivo
      let distribuicao;
      switch (objetivo) {
        case "perder_peso":
          distribuicao = {proteina: 0.35, carboidrato: 0.35, gordura: 0.30};
          break;
        case "ganhar_massa":
          distribuicao = {proteina: 0.30, carboidrato: 0.45, gordura: 0.25};
          break;
        default:
          distribuicao = {proteina: 0.25, carboidrato: 0.50, gordura: 0.25};
      }

      const macros = {
        proteina: Math.round((caloriasDiarias * distribuicao.proteina) /
          4),
        carboidrato: Math.round((caloriasDiarias *
          distribuicao.carboidrato) / 4),
        gordura: Math.round((caloriasDiarias * distribuicao.gordura) /
          9),
      };

      const plano = {
        userId,
        caloriasDiarias,
        macros,
        objetivo,
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
        validoAte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      // Salvar no Firestore
      await admin.firestore()
          .collection("planosNutricionais")
          .doc(userId)
          .set(plano);

      res.json({success: true, plano});
    } catch (error) {
      console.error("Erro ao gerar plano nutricional:", error);
      res.status(500).json({error: "Erro interno do servidor"});
    }
  });
});

/**
 * API para gerar plano de treino personalizado
 */
exports.gerarPlanoTreino = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {userId, objetivo, experiencia, diasDisponiveis} = req.body;

      if (!userId || !objetivo || !experiencia) {
        return res.status(400).json({error: "Dados obrigatórios faltando"});
      }

      // Estrutura básica do plano baseado na experiência
      let estruturaPlano;
      switch (experiencia) {
        case "iniciante":
          estruturaPlano = {
            frequencia: Math.min(diasDisponiveis || 3, 3),
            seriesPorExercicio: "2-3",
            repeticoesPorSerie: "12-15",
            descansoEntreSeries: "60-90s",
          };
          break;
        case "intermediario":
          estruturaPlano = {
            frequencia: Math.min(diasDisponiveis || 4, 4),
            seriesPorExercicio: "3-4",
            repeticoesPorSerie: "8-12",
            descansoEntreSeries: "90-120s",
          };
          break;
        case "avancado":
          estruturaPlano = {
            frequencia: Math.min(diasDisponiveis || 5, 6),
            seriesPorExercicio: "4-5",
            repeticoesPorSerie: "6-10",
            descansoEntreSeries: "120-180s",
          };
          break;
        default:
          estruturaPlano = {
            frequencia: 3,
            seriesPorExercicio: "3",
            repeticoesPorSerie: "10-12",
            descansoEntreSeries: "90s",
          };
      }

      const plano = {
        userId,
        objetivo,
        experiencia,
        estrutura: estruturaPlano,
        cronograma: {
          segunda: {tipo: "Peito e Tríceps", duracao: 60},
          terca: {tipo: "Costas e Bíceps", duracao: 60},
          quarta: {tipo: "Descanso", duracao: 0},
          quinta: {tipo: "Pernas", duracao: 75},
          sexta: {tipo: "Ombros e Abdômen", duracao: 45},
          sabado: {tipo: "Cardio", duracao: 30},
          domingo: {tipo: "Descanso", duracao: 0},
        },
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
        validoAte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      // Salvar no Firestore
      await admin.firestore()
          .collection("planosTreino")
          .doc(userId)
          .set(plano);

      res.json({success: true, plano});
    } catch (error) {
      console.error("Erro ao gerar plano de treino:", error);
      res.status(500).json({error: "Erro interno do servidor"});
    }
  });
});

/**
 * API para chat com Coach EVO (versão simplificada)
 */
exports.chatCoachEvo = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {mensagem, userId} = req.body;

      if (!mensagem || !userId) {
        return res.status(400).json({
          error: "Mensagem e userId são obrigatórios",
        });
      }

      // Respostas pré-definidas do coach (versão simplificada)
      const respostas = [
        "Ótima pergunta! Lembre-se: consistência é a chave do sucesso.",
        "Baseado no seu perfil, recomendo focar em exercícios compostos.",
        "Sua alimentação está no caminho certo. Que tal incluir mais " +
          "proteínas?",
        "O descanso é tão importante quanto o treino. Durma bem!",
        "Hidratação é fundamental! Beba pelo menos 2 litros de água " +
          "por dia.",
        "Pequenos passos levam a grandes resultados. Continue assim!",
      ];

      const resposta = respostas[Math.floor(Math.random() * respostas.length)];

      // Salvar histórico do chat
      await admin.firestore()
          .collection("chatHistorico")
          .add({
            userId,
            mensagemUsuario: mensagem,
            respostaCoach: resposta,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });

      res.json({success: true, resposta});
    } catch (error) {
      console.error("Erro no chat com Coach EVO:", error);
      res.status(500).json({error: "Erro interno do servidor"});
    }
  });
});

/**
 * API para salvar dados da anamnese
 */
exports.salvarAnamnese = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {userId, dadosAnamnese} = req.body;

      if (!userId || !dadosAnamnese) {
        return res.status(400).json({error: "Dados obrigatórios faltando"});
      }

      const anamnese = {
        userId,
        ...dadosAnamnese,
        criadaEm: admin.firestore.FieldValue.serverTimestamp(),
        status: "completa",
      };

      // Salvar no Firestore
      await admin.firestore()
          .collection("anamneses")
          .doc(userId)
          .set(anamnese);

      res.json({success: true, message: "Anamnese salva com sucesso"});
    } catch (error) {
      console.error("Erro ao salvar anamnese:", error);
      res.status(500).json({error: "Erro interno do servidor"});
    }
  });
});

