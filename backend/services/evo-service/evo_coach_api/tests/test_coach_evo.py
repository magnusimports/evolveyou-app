import unittest
from unittest.mock import patch
import json
import os
from src.main import app

class CoachEvoAPITestCase(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        # Limpar o histórico de conversas e rate limiting para cada teste
        from src.routes.coach_evo import conversation_history, last_request_time
        conversation_history.clear()
        last_request_time.clear()
        os.environ["OPENAI_API_KEY"] = "test_key" # Definir uma chave de teste

    def tearDown(self):
        if "OPENAI_API_KEY" in os.environ:
            del os.environ["OPENAI_API_KEY"]

    @patch("openai.chat.completions.create")
    def test_chat_success(self, mock_openai_create):
        mock_openai_create.return_value.choices[0].message.content = "Olá! Como posso ajudar?"
        response = self.app.post(
            "/api/coach-evo/chat",
            data=json.dumps({"message": "Oi Coach!"}),
            content_type="application/json",
            headers={"X-User-ID": "test_user_1"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("Olá! Como posso ajudar?", response.json["response"])

    def test_chat_no_message(self):
        response = self.app.post(
            "/api/coach-evo/chat",
            data=json.dumps({}),
            content_type="application/json",
            headers={"X-User-ID": "test_user_1"}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Mensagem não fornecida", response.json["error"])

    def test_chat_no_user_id(self):
        response = self.app.post(
            "/api/coach-evo/chat",
            data=json.dumps({"message": "Oi Coach!"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 401)
        self.assertIn("User ID não fornecido", response.json["error"])

    @patch("openai.chat.completions.create")
    def test_rate_limiting(self, mock_openai_create):
        mock_openai_create.return_value.choices[0].message.content = "Resposta de teste."
        user_id = "rate_limit_user"

        # Fazer 5 requisições (dentro do limite)
        for _ in range(5):
            response = self.app.post(
                "/api/coach-evo/chat",
                data=json.dumps({"message": "Teste de rate limit"}),
                content_type="application/json",
                headers={"X-User-ID": user_id}
            )
            self.assertEqual(response.status_code, 200)

        # A 6ª requisição deve ser bloqueada
        response = self.app.post(
            "/api/coach-evo/chat",
            data=json.dumps({"message": "Teste de rate limit"}),
            content_type="application/json",
            headers={"X-User-ID": user_id}
        )
        self.assertEqual(response.status_code, 429)
        self.assertIn("Limite de requisições excedido", response.json["error"])

    @patch("openai.chat.completions.create")
    def test_conversation_history(self, mock_openai_create):
        user_id = "history_user"

        # Primeira mensagem
        mock_openai_create.return_value.choices[0].message.content = "Primeira resposta."
        self.app.post(
            "/api/coach-evo/chat",
            data=json.dumps({"message": "Primeira mensagem."}),
            content_type="application/json",
            headers={"X-User-ID": user_id}
        )

        # Segunda mensagem - deve incluir o histórico
        mock_openai_create.return_value.choices[0].message.content = "Segunda resposta."
        self.app.post(
            "/api/coach-evo/chat",
            data=json.dumps({"message": "Segunda mensagem."}),
            content_type="application/json",
            headers={"X-User-ID": user_id}
        )

        from src.routes.coach_evo import conversation_history
        history = conversation_history.get(user_id)
        self.assertIsNotNone(history)
        self.assertEqual(len(history), 4) # 2 user messages + 2 assistant responses
        self.assertEqual(history[0]["content"], "Primeira mensagem.")
        self.assertEqual(history[1]["content"], "Primeira resposta.")
        self.assertEqual(history[2]["content"], "Segunda mensagem.")
        self.assertEqual(history[3]["content"], "Segunda resposta.")

if __name__ == "__main__":
    unittest.main()


