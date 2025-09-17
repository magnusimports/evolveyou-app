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


/**
 * API para buscar dados da anamnese de um usuário
 */
exports.getAnamnese = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const userId = req.query.userId || req.body.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "UserId é obrigatório",
        });
      }

      // Buscar anamnese na coleção 'anamneses'
      const anamneseDoc = await admin.firestore()
          .collection("anamneses")
          .doc(userId)
          .get();

      if (!anamneseDoc.exists) {
        return res.status(404).json({
          success: false,
          error: "Anamnese não encontrada",
          userId: userId,
        });
      }

      const anamneseData = anamneseDoc.data();

      res.json({
        success: true,
        data: anamneseData,
        userId: userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Erro ao buscar anamnese:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
      });
    }
  });
});



/**
 * API para buscar plano alimentar do usuário
 */
exports.getPlanoAlimentar = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: "userId é obrigatório" });
      }

      // Buscar anamnese do usuário
      const anamneseDoc = await admin.firestore()
        .collection("anamneses")
        .doc(userId)
        .get();

      if (!anamneseDoc.exists) {
        return res.status(404).json({ error: "Anamnese não encontrada" });
      }

      const anamnese = anamneseDoc.data();
      
      // Calcular TMB e TDEE
      const { peso, altura, idade, sexo, objetivo, nivelAtividade } = anamnese;
      
      let tmb;
      if (sexo === 'masculino') {
        tmb = (10 * peso) + (6.25 * altura) - (5 * idade) + 5;
      } else {
        tmb = (10 * peso) + (6.25 * altura) - (5 * idade) - 161;
      }
      
      const fatoresAtividade = {
        'sedentario': 1.2,
        'leve': 1.375,
        'moderado': 1.55,
        'intenso': 1.725,
        'muito_intenso': 1.9
      };
      
      const fatorAtividade = fatoresAtividade[nivelAtividade] || 1.55;
      const tdee = tmb * fatorAtividade;
      
      let caloriasAlvo = tdee;
      if (objetivo === 'perder_peso') {
        caloriasAlvo = tdee - 500;
      } else if (objetivo === 'ganhar_peso') {
        caloriasAlvo = tdee + 300;
      }

      // Distribuir calorias nas refeições
      const cafeDaManha = Math.round(caloriasAlvo * 0.25);
      const lanche1 = Math.round(caloriasAlvo * 0.10);
      const almoco = Math.round(caloriasAlvo * 0.35);
      const lanche2 = Math.round(caloriasAlvo * 0.10);
      const jantar = Math.round(caloriasAlvo * 0.20);

      const planoAlimentar = {
        userId,
        totalCalorias: Math.round(caloriasAlvo),
        tmb: Math.round(tmb),
        tdee: Math.round(tdee),
        objetivo,
        refeicoes: [
          {
            id: 'cafe',
            nome: 'Café da Manhã',
            horario: '08:00',
            calorias: cafeDaManha,
            alimentos: await gerarAlimentosRefeicao('cafe', cafeDaManha, objetivo)
          },
          {
            id: 'lanche1',
            nome: 'Lanche da Manhã',
            horario: '10:30',
            calorias: lanche1,
            alimentos: await gerarAlimentosRefeicao('lanche', lanche1, objetivo)
          },
          {
            id: 'almoco',
            nome: 'Almoço',
            horario: '12:30',
            calorias: almoco,
            alimentos: await gerarAlimentosRefeicao('almoco', almoco, objetivo)
          },
          {
            id: 'lanche2',
            nome: 'Lanche da Tarde',
            horario: '15:30',
            calorias: lanche2,
            alimentos: await gerarAlimentosRefeicao('lanche', lanche2, objetivo)
          },
          {
            id: 'jantar',
            nome: 'Jantar',
            horario: '19:00',
            calorias: jantar,
            alimentos: await gerarAlimentosRefeicao('jantar', jantar, objetivo)
          }
        ],
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
        dataPlano: new Date().toISOString().split('T')[0]
      };

      // Salvar plano no Firestore
      await admin.firestore()
        .collection("planosAlimentares")
        .doc(`${userId}_${planoAlimentar.dataPlano}`)
        .set(planoAlimentar);

      res.json({ success: true, plano: planoAlimentar });
    } catch (error) {
      console.error("Erro ao gerar plano alimentar:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
});

/**
 * Função auxiliar para gerar alimentos de uma refeição
 */
async function gerarAlimentosRefeicao(tipoRefeicao, calorias, objetivo) {
  const alimentosPorTipo = {
    cafe: [
      { nome: 'Aveia com banana', categoria: 'carboidrato', caloriaPor100g: 68 },
      { nome: 'Ovos mexidos', categoria: 'proteina', caloriaPor100g: 155 },
      { nome: 'Suco de laranja natural', categoria: 'carboidrato', caloriaPor100g: 45 },
      { nome: 'Pão integral', categoria: 'carboidrato', caloriaPor100g: 247 },
      { nome: 'Iogurte grego', categoria: 'proteina', caloriaPor100g: 59 }
    ],
    lanche: [
      { nome: 'Iogurte grego', categoria: 'proteina', caloriaPor100g: 59 },
      { nome: 'Castanhas mistas', categoria: 'gordura', caloriaPor100g: 607 },
      { nome: 'Banana', categoria: 'carboidrato', caloriaPor100g: 89 },
      { nome: 'Whey protein', categoria: 'proteina', caloriaPor100g: 400 },
      { nome: 'Maçã', categoria: 'carboidrato', caloriaPor100g: 52 }
    ],
    almoco: [
      { nome: 'Peito de frango grelhado', categoria: 'proteina', caloriaPor100g: 165 },
      { nome: 'Arroz integral', categoria: 'carboidrato', caloriaPor100g: 111 },
      { nome: 'Brócolis refogado', categoria: 'vegetal', caloriaPor100g: 34 },
      { nome: 'Salada verde mista', categoria: 'vegetal', caloriaPor100g: 20 },
      { nome: 'Azeite extra virgem', categoria: 'gordura', caloriaPor100g: 884 }
    ],
    jantar: [
      { nome: 'Salmão grelhado', categoria: 'proteina', caloriaPor100g: 208 },
      { nome: 'Batata doce assada', categoria: 'carboidrato', caloriaPor100g: 86 },
      { nome: 'Aspargos grelhados', categoria: 'vegetal', caloriaPor100g: 20 },
      { nome: 'Quinoa cozida', categoria: 'carboidrato', caloriaPor100g: 120 },
      { nome: 'Abacate', categoria: 'gordura', caloriaPor100g: 160 }
    ]
  };

  const alimentosDisponiveis = alimentosPorTipo[tipoRefeicao] || alimentosPorTipo.lanche;
  const alimentosSelecionados = [];
  let caloriasRestantes = calorias;

  // Selecionar 2-4 alimentos para a refeição
  const numAlimentos = Math.min(alimentosDisponiveis.length, Math.max(2, Math.floor(calorias / 100)));
  
  for (let i = 0; i < numAlimentos && caloriasRestantes > 0; i++) {
    const alimento = alimentosDisponiveis[i];
    const caloriasAlimento = Math.min(caloriasRestantes, calorias / numAlimentos);
    const quantidade = Math.round((caloriasAlimento / alimento.caloriaPor100g) * 100);
    
    if (quantidade > 0) {
      alimentosSelecionados.push({
        nome: alimento.nome,
        quantidade: `${quantidade}g`,
        calorias: Math.round(caloriasAlimento),
        categoria: alimento.categoria
      });
      
      caloriasRestantes -= caloriasAlimento;
    }
  }

  return alimentosSelecionados;
}

/**
 * API para registrar check-in de refeição
 */
exports.registrarCheckinRefeicao = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { userId, refeicaoId, dataPlano, consumido = true } = req.body;

      if (!userId || !refeicaoId || !dataPlano) {
        return res.status(400).json({ error: "Dados obrigatórios faltando" });
      }

      const checkinData = {
        userId,
        refeicaoId,
        dataPlano,
        consumido,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };

      // Salvar check-in
      await admin.firestore()
        .collection("checkinsRefeicoes")
        .doc(`${userId}_${dataPlano}_${refeicaoId}`)
        .set(checkinData);

      res.json({ success: true, checkin: checkinData });
    } catch (error) {
      console.error("Erro ao registrar check-in:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
});

/**
 * API para buscar treino do dia
 */
exports.getTreinoDoDia = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { userId, data } = req.query;

      if (!userId) {
        return res.status(400).json({ error: "userId é obrigatório" });
      }

      const dataPlano = data || new Date().toISOString().split('T')[0];

      // Buscar anamnese para personalizar treino
      const anamneseDoc = await admin.firestore()
        .collection("anamneses")
        .doc(userId)
        .get();

      if (!anamneseDoc.exists) {
        return res.status(404).json({ error: "Anamnese não encontrada" });
      }

      const anamnese = anamneseDoc.data();
      const { objetivo, experienciaTreino, diasTreinoSemana } = anamnese;

      // Determinar tipo de treino baseado no dia da semana
      const diaSemana = new Date(dataPlano).getDay();
      const tiposTreino = ['A', 'B', 'C', 'A', 'B', 'Descanso', 'Descanso'];
      const tipoTreino = tiposTreino[diaSemana];

      if (tipoTreino === 'Descanso') {
        return res.json({
          success: true,
          treino: {
            tipo: 'descanso',
            titulo: 'Dia de Descanso',
            descricao: 'Aproveite para descansar e se recuperar!'
          }
        });
      }

      const treinoData = await gerarTreinoDoDia(tipoTreino, objetivo, experienciaTreino);

      // Salvar treino no Firestore
      const treino = {
        userId,
        dataPlano,
        tipo: tipoTreino,
        ...treinoData,
        criadoEm: admin.firestore.FieldValue.serverTimestamp()
      };

      await admin.firestore()
        .collection("treinosDoDia")
        .doc(`${userId}_${dataPlano}`)
        .set(treino);

      res.json({ success: true, treino });
    } catch (error) {
      console.error("Erro ao buscar treino do dia:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
});

/**
 * Função auxiliar para gerar treino do dia
 */
async function gerarTreinoDoDia(tipo, objetivo, experiencia) {
  const treinosPorTipo = {
    A: {
      titulo: 'Treino A: Peito & Tríceps',
      gruposMusculares: ['Peito', 'Tríceps'],
      exercicios: [
        {
          nome: 'Supino reto com barra',
          grupoMuscular: 'Peito',
          series: experiencia === 'iniciante' ? 3 : 4,
          repeticoes: experiencia === 'iniciante' ? '12-15' : '8-12',
          descanso: '90s',
          instrucoes: 'Mantenha os pés firmes no chão e controle o movimento'
        },
        {
          nome: 'Supino inclinado com halteres',
          grupoMuscular: 'Peito',
          series: 3,
          repeticoes: '10-12',
          descanso: '90s',
          instrucoes: 'Foque na contração do peito superior'
        },
        {
          nome: 'Crucifixo com halteres',
          grupoMuscular: 'Peito',
          series: 3,
          repeticoes: '12-15',
          descanso: '60s',
          instrucoes: 'Movimento amplo, sinta o alongamento do peito'
        },
        {
          nome: 'Tríceps testa com barra',
          grupoMuscular: 'Tríceps',
          series: 3,
          repeticoes: '10-12',
          descanso: '60s',
          instrucoes: 'Mantenha os cotovelos fixos'
        },
        {
          nome: 'Tríceps corda na polia',
          grupoMuscular: 'Tríceps',
          series: 3,
          repeticoes: '12-15',
          descanso: '60s',
          instrucoes: 'Abra a corda no final do movimento'
        }
      ]
    },
    B: {
      titulo: 'Treino B: Costas & Bíceps',
      gruposMusculares: ['Costas', 'Bíceps'],
      exercicios: [
        {
          nome: 'Puxada frontal',
          grupoMuscular: 'Costas',
          series: experiencia === 'iniciante' ? 3 : 4,
          repeticoes: experiencia === 'iniciante' ? '12-15' : '8-12',
          descanso: '90s',
          instrucoes: 'Puxe até o peito, contraia as escápulas'
        },
        {
          nome: 'Remada curvada com barra',
          grupoMuscular: 'Costas',
          series: 3,
          repeticoes: '10-12',
          descanso: '90s',
          instrucoes: 'Mantenha o core contraído'
        },
        {
          nome: 'Remada unilateral com halter',
          grupoMuscular: 'Costas',
          series: 3,
          repeticoes: '12-15',
          descanso: '60s',
          instrucoes: 'Foque na contração das costas'
        },
        {
          nome: 'Rosca direta com barra',
          grupoMuscular: 'Bíceps',
          series: 3,
          repeticoes: '10-12',
          descanso: '60s',
          instrucoes: 'Não balance o corpo'
        },
        {
          nome: 'Rosca martelo com halteres',
          grupoMuscular: 'Bíceps',
          series: 3,
          repeticoes: '12-15',
          descanso: '60s',
          instrucoes: 'Mantenha os punhos neutros'
        }
      ]
    },
    C: {
      titulo: 'Treino C: Pernas & Glúteos',
      gruposMusculares: ['Pernas', 'Glúteos'],
      exercicios: [
        {
          nome: 'Agachamento livre',
          grupoMuscular: 'Pernas',
          series: experiencia === 'iniciante' ? 3 : 4,
          repeticoes: experiencia === 'iniciante' ? '12-15' : '8-12',
          descanso: '120s',
          instrucoes: 'Desça até 90 graus, mantenha o peito ereto'
        },
        {
          nome: 'Leg press 45°',
          grupoMuscular: 'Pernas',
          series: 3,
          repeticoes: '12-15',
          descanso: '90s',
          instrucoes: 'Amplitude completa do movimento'
        },
        {
          nome: 'Stiff com halteres',
          grupoMuscular: 'Posterior',
          series: 3,
          repeticoes: '12-15',
          descanso: '90s',
          instrucoes: 'Sinta o alongamento dos posteriores'
        },
        {
          nome: 'Extensão de pernas',
          grupoMuscular: 'Quadríceps',
          series: 3,
          repeticoes: '15-20',
          descanso: '60s',
          instrucoes: 'Contração máxima no topo'
        },
        {
          nome: 'Panturrilha em pé',
          grupoMuscular: 'Panturrilha',
          series: 4,
          repeticoes: '15-20',
          descanso: '45s',
          instrucoes: 'Amplitude completa, pausa no topo'
        }
      ]
    }
  };

  return treinosPorTipo[tipo] || treinosPorTipo.A;
}

/**
 * API para registrar início de treino
 */
exports.iniciarTreino = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { userId, treinoId, dataPlano } = req.body;

      if (!userId || !treinoId || !dataPlano) {
        return res.status(400).json({ error: "Dados obrigatórios faltando" });
      }

      const sessaoTreino = {
        userId,
        treinoId,
        dataPlano,
        iniciadoEm: admin.firestore.FieldValue.serverTimestamp(),
        status: 'em_andamento',
        exerciciosCompletos: [],
        tempoTotal: 0
      };

      // Salvar sessão de treino
      const sessaoRef = await admin.firestore()
        .collection("sessoesTreino")
        .add(sessaoTreino);

      res.json({ 
        success: true, 
        sessaoId: sessaoRef.id,
        sessao: { id: sessaoRef.id, ...sessaoTreino }
      });
    } catch (error) {
      console.error("Erro ao iniciar treino:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
});

