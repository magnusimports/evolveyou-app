import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta

# Inicializa o Flask app
app = Flask(__name__)
CORS(app) # Habilita CORS para todas as rotas

# Variável global para o cliente Firestore
db_client = None

def get_firestore_client():
    global db_client
    if db_client is None:
        import firebase_admin
        from firebase_admin import credentials, firestore

        if not firebase_admin._apps:
            # Apenas inicializa o Firebase Admin SDK se não estiver em modo de teste
            # e se as credenciais estiverem disponíveis.
            if os.environ.get("FLASK_ENV") != "testing":
                try:
                    firebase_admin.initialize_app()
                except ValueError:
                    print("Firebase Admin SDK já inicializado.")
                except Exception as e:
                    print(f"Erro ao inicializar Firebase: {e}. Certifique-se de que as credenciais estão configuradas.")
        db_client = firestore.client()
    return db_client

@app.route("/", methods=["GET"])
def hello_world():
    return "Hello, EvolveYou Premium Backend!"

@app.route("/reavaliacao/agendar", methods=["POST"])
def agendar_reavaliacao():
    db = get_firestore_client()
    data = request.get_json()
    user_id = data.get("user_id")
    
    if not user_id:
        return jsonify({"error": "user_id é obrigatório"}), 400

    next_reavaliacao_date = datetime.now() + timedelta(days=45)
    
    try:
        doc_ref = db.collection("reavaliacoes").document(user_id)
        doc_ref.set({
            "user_id": user_id,
            "last_reavaliacao": datetime.now(),
            "next_reavaliacao": next_reavaliacao_date,
            "status": "agendada"
        })
        return jsonify({"message": "Reavaliação agendada com sucesso!", "next_reavaliacao": next_reavaliacao_date.isoformat()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/reavaliacao/status/<user_id>", methods=["GET"])
def get_reavaliacao_status(user_id):
    db = get_firestore_client()
    try:
        doc_ref = db.collection("reavaliacoes").document(user_id)
        doc = doc_ref.get()
        if doc.exists:
            return jsonify(doc.to_dict()), 200
        else:
            return jsonify({"message": "Nenhuma reavaliação encontrada para este usuário."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/reavaliacao/completar", methods=["POST"])
def completar_reavaliacao():
    db = get_firestore_client()
    data = request.get_json()
    user_id = data.get("user_id")
    progress_data = data.get("progress_data")

    if not user_id:
        return jsonify({"error": "user_id é obrigatório"}), 400

    try:
        doc_ref = db.collection("reavaliacoes").document(user_id)
        doc = doc_ref.get()
        if doc.exists:
            next_reavaliacao_date = datetime.now() + timedelta(days=45)
            doc_ref.update({
                "last_reavaliacao": datetime.now(),
                "next_reavaliacao": next_reavaliacao_date,
                "status": "completa",
                "progress_data": progress_data
            })
            return jsonify({"message": "Reavaliação completada e próxima agendada!", "next_reavaliacao": next_reavaliacao_date.isoformat()}), 200
        else:
            return jsonify({"message": "Nenhuma reavaliação encontrada para este usuário."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Apenas inicializa o Firebase quando o app é executado diretamente (não em testes)
    get_firestore_client() 
    app.run(debug=True, host="0.0.0.0", port=5000)


