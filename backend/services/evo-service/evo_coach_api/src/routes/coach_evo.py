from flask import Blueprint, request, jsonify, current_app
import openai
import os
from datetime import datetime, timedelta

coach_evo_bp = Blueprint("coach_evo", __name__)

# Configuração do OpenAI API
openai.api_key = os.environ.get("OPENAI_API_KEY")

# Simulação de banco de dados para histórico de conversas e rate limiting
conversation_history = {}
last_request_time = {}

# Configurações de Rate Limiting (5 requisições por minuto por usuário)
RATE_LIMIT_INTERVAL = 60  # segundos
RATE_LIMIT_COUNT = 5

@coach_evo_bp.route("/coach-evo/chat", methods=["POST"])
def chat():
    user_id = request.headers.get("X-User-ID") # Assumindo que o user_id virá no header
    if not user_id:
        return jsonify({"error": "User ID não fornecido"}), 401

    # Rate Limiting
    if user_id in last_request_time:
        time_since_last_request = (datetime.now() - last_request_time[user_id]["timestamp"]).total_seconds()
        if time_since_last_request < RATE_LIMIT_INTERVAL and last_request_time[user_id]["count"] >= RATE_LIMIT_COUNT:
            return jsonify({"error": "Limite de requisições excedido. Tente novamente mais tarde."}), 429
        elif time_since_last_request >= RATE_LIMIT_INTERVAL:
            last_request_time[user_id] = {"timestamp": datetime.now(), "count": 1}
        else:
            last_request_time[user_id]["count"] += 1
    else:
        last_request_time[user_id] = {"timestamp": datetime.now(), "count": 1}

    data = request.get_json()
    user_message = data.get("message")

    if not user_message:
        return jsonify({"error": "Mensagem não fornecida"}), 400

    # Simulação de perfil do usuário (em um cenário real, buscaria de um DB)
    user_profile = {
        "name": "João",
        "age": 30,
        "goal": "perder peso e ganhar massa muscular",
        "dietary_restrictions": "nenhuma",
        "fitness_level": "intermediário"
    }

    # Recuperar histórico de conversas
    current_conversation = conversation_history.get(user_id, [])
    current_conversation.append({"role": "user", "content": user_message})

    # Preparar prompt para OpenAI com personalização e histórico
    messages = [
        {"role": "system", "content": f"Você é um coach de fitness chamado Coach EVO. Seu objetivo é ajudar o usuário {user_profile['name']} ({user_profile['age']} anos, nível de fitness {user_profile['fitness_level']}) a alcançar seu objetivo de {user_profile['goal']}. Considere suas restrições alimentares: {user_profile['dietary_restrictions']}. Seja encorajador e informativo."}
    ] + current_conversation

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages
        )
        coach_response = response.choices[0].message.content
    except Exception as e:
        return jsonify({"error": f"Erro ao se comunicar com a OpenAI: {str(e)}"}), 500

    # Atualizar histórico de conversas
    current_conversation.append({"role": "assistant", "content": coach_response})
    conversation_history[user_id] = current_conversation

    return jsonify({"response": coach_response}), 200


