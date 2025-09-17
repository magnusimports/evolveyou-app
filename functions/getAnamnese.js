// 🔥 Firebase Function: getAnamnese
// Busca dados da anamnese de um usuário específico

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Inicializar Firebase Admin se ainda não foi inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.getAnamnese = functions.https.onRequest(async (req, res) => {
  // Configurar CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Responder a requisições OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    res.status(200).send();
    return;
  }

  try {
    console.log("🔍 Buscando anamnese - Método:", req.method);
    console.log("🔍 Query params:", req.query);
    console.log("🔍 Body:", req.body);

    // Extrair userId dos parâmetros
    const userId = req.query.userId || req.body.userId;

    if (!userId) {
      console.error("❌ UserId não fornecido");
      return res.status(400).json({
        success: false,
        error: "UserId é obrigatório",
      });
    }

    console.log("🔍 Buscando anamnese para userId:", userId);

    // Buscar anamnese na coleção 'anamneses'
    const anamneseRef = db.collection("anamneses").doc(userId);
    const anamneseDoc = await anamneseRef.get();

    if (!anamneseDoc.exists) {
      console.log("⚠️ Anamnese não encontrada para userId:",
          userId);
      return res.status(404).json({
        success: false,
        error: "Anamnese não encontrada",
        userId: userId,
      });
    }

    const anamneseData = anamneseDoc.data();
    console.log("✅ Anamnese encontrada:",
        anamneseData.nome || "Nome não informado");

    // Retornar dados da anamnese
    return res.status(200).json({
      success: true,
      data: anamneseData,
      userId: userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro ao buscar anamnese:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});

