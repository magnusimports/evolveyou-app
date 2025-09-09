import functions_framework
import requests
import os
import json
import structlog

logger = structlog.get_logger(__name__)

@functions_framework.http
def generate_workout_plan(request):
    """
    Cloud Function para gerar planos de treino e nutrição.
    Recebe um user_id e opcionalmente uma data.
    """
    logger.info("Cloud Function generate_workout_plan acionada.")

    # Configurações do Plans Service
    PLANS_SERVICE_URL = os.environ.get("PLANS_SERVICE_URL", "http://localhost:8000")
    PLANS_SERVICE_API_KEY = os.environ.get("PLANS_SERVICE_API_KEY", "your_plans_service_api_key")

    # Extrair dados da requisição
    request_json = request.get_json(silent=True)
    if not request_json or "user_id" not in request_json:
        logger.error("Requisição inválida: user_id é obrigatório.")
        return json.dumps({"error": "user_id é obrigatório"}), 400

    user_id = request_json["user_id"]
    target_date = request_json.get("target_date")

    try:
        # Chamar o Plans Service para gerar o plano de treino
        workout_plan_url = f"{PLANS_SERVICE_URL}/plan/workout"
        workout_payload = {"user_id": user_id}
        if target_date:
            workout_payload["date"] = target_date

        workout_headers = {
            "Content-Type": "application/json",
            "X-API-Key": PLANS_SERVICE_API_KEY
        }

        logger.info("Chamando Plans Service para gerar plano de treino.", url=workout_plan_url, user_id=user_id)
        workout_response = requests.get(workout_plan_url, headers=workout_headers, params=workout_payload)
        workout_response.raise_for_status()  # Levanta exceção para erros HTTP
        workout_plan_data = workout_response.json()
        logger.info("Plano de treino gerado com sucesso.", user_id=user_id)

        # Chamar o Plans Service para gerar o plano de dieta
        diet_plan_url = f"{PLANS_SERVICE_URL}/plan/diet"
        diet_payload = {"user_id": user_id}
        if target_date:
            diet_payload["date"] = target_date

        diet_headers = {
            "Content-Type": "application/json",
            "X-API-Key": PLANS_SERVICE_API_KEY
        }

        logger.info("Chamando Plans Service para gerar plano de dieta.", url=diet_plan_url, user_id=user_id)
        diet_response = requests.get(diet_plan_url, headers=diet_headers, params=diet_payload)
        diet_response.raise_for_status() # Levanta exceção para erros HTTP
        diet_plan_data = diet_response.json()
        logger.info("Plano de dieta gerado com sucesso.", user_id=user_id)

        # Salvar planos no Firestore (esta lógica deve ser implementada no Plans Service)
        # Por enquanto, a Cloud Function apenas orquestra a chamada ao Plans Service
        # O Plans Service já deve ter a lógica de salvar no Firestore

        return json.dumps({
            "message": "Planos de treino e dieta gerados e salvos com sucesso.",
            "workout_plan": workout_plan_data,
            "diet_plan": diet_plan_data
        }), 200

    except requests.exceptions.RequestException as e:
        logger.error("Erro ao chamar Plans Service.", error=str(e), user_id=user_id)
        return json.dumps({"error": f"Erro ao se comunicar com o Plans Service: {str(e)}"}), 500
    except Exception as e:
        logger.error("Erro inesperado na Cloud Function.", error=str(e), user_id=user_id)
        return json.dumps({"error": f"Erro interno do servidor: {str(e)}"}), 500


