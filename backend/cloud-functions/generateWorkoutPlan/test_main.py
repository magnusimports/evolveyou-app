import unittest
from unittest.mock import patch, MagicMock
import json
import os
import requests

# Importar a função a ser testada
from main import generate_workout_plan

class TestGenerateWorkoutPlan(unittest.TestCase):

    @patch.dict(os.environ, {"PLANS_SERVICE_URL": "http://mock-plans-service", "PLANS_SERVICE_API_KEY": "mock_key"})
    @patch("main.requests.get")
    def test_generate_workout_plan_success(self, mock_get):
        # Mock da resposta do Plans Service para treino
        mock_workout_response = MagicMock()
        mock_workout_response.status_code = 200
        mock_workout_response.json.return_value = {"data": {"workout": "plan_details"}, "message": "Plano de treino gerado com sucesso"}

        # Mock da resposta do Plans Service para dieta
        mock_diet_response = MagicMock()
        mock_diet_response.status_code = 200
        mock_diet_response.json.return_value = {"data": {"diet": "plan_details"}, "message": "Plano de dieta gerado com sucesso"}

        # Configurar o mock para retornar as respostas na ordem correta
        mock_get.side_effect = [mock_workout_response, mock_diet_response]

        # Mock da requisição HTTP de entrada para a Cloud Function
        mock_request = MagicMock()
        mock_request.get_json.return_value = {"user_id": "test_user_123", "target_date": "2025-09-09"}

        # Chamar a função da Cloud Function
        response, status_code = generate_workout_plan(mock_request)

        # Verificar o status code da resposta
        self.assertEqual(status_code, 200)

        # Verificar o conteúdo da resposta
        response_data = json.loads(response)
        self.assertEqual(response_data["message"], "Planos de treino e dieta gerados e salvos com sucesso.")
        self.assertIn("workout_plan", response_data)
        self.assertIn("diet_plan", response_data)
        self.assertEqual(response_data["workout_plan"]["data"], {"workout": "plan_details"})
        self.assertEqual(response_data["diet_plan"]["data"], {"diet": "plan_details"})

        # Verificar se as chamadas ao Plans Service foram feitas corretamente
        mock_get.assert_any_call(
            "http://mock-plans-service/plan/workout",
            headers={
                "Content-Type": "application/json",
                "X-API-Key": "mock_key"
            },
            params={
                "user_id": "test_user_123",
                "date": "2025-09-09"
            }
        )
        mock_get.assert_any_call(
            "http://mock-plans-service/plan/diet",
            headers={
                "Content-Type": "application/json",
                "X-API-Key": "mock_key"
            },
            params={
                "user_id": "test_user_123",
                "date": "2025-09-09"
            }
        )

    @patch.dict(os.environ, {"PLANS_SERVICE_URL": "http://mock-plans-service", "PLANS_SERVICE_API_KEY": "mock_key"})
    def test_generate_workout_plan_missing_user_id(self):
        mock_request = MagicMock()
        mock_request.get_json.return_value = {}

        response, status_code = generate_workout_plan(mock_request)

        self.assertEqual(status_code, 400)
        response_data = json.loads(response)
        self.assertEqual(response_data["error"], "user_id é obrigatório")

    @patch.dict(os.environ, {"PLANS_SERVICE_URL": "http://mock-plans-service", "PLANS_SERVICE_API_KEY": "mock_key"})
    @patch("main.requests.get")
    def test_generate_workout_plan_service_error(self, mock_get):
        mock_get.side_effect = requests.exceptions.RequestException("Service Unavailable")

        mock_request = MagicMock()
        mock_request.get_json.return_value = {"user_id": "test_user_123"}

        response, status_code = generate_workout_plan(mock_request)

        self.assertEqual(status_code, 500)
        response_data = json.loads(response)
        self.assertIn("Erro ao se comunicar com o Plans Service", response_data["error"])

if __name__ == "__main__":
    unittest.main()


