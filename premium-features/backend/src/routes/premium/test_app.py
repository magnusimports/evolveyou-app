import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta

# Mock firebase_admin.initialize_app e firebase_admin.firestore.client antes de importar 'app'
# Isso garante que a inicialização do Firebase dentro de app.py use os mocks.
# Para evitar problemas de importação circular, vamos fazer os patches no nível do módulo
# e então importar o 'app'.

mock_initialize_app_patch = patch("firebase_admin.initialize_app")
mock_firestore_client_patch = patch("firebase_admin.firestore.client")

mock_initialize_app = mock_initialize_app_patch.start()
mock_firestore_client = mock_firestore_client_patch.start()

# Importa o app após os mocks serem aplicados
from app import app

# Configura o mock do cliente Firestore
mock_db = MagicMock()
mock_firestore_client.return_value = mock_db

# Mock os métodos de collection e document
mock_doc_ref = MagicMock()
mock_db.collection.return_value.document.return_value = mock_doc_ref

# Mock o método get() de uma referência de documento
mock_doc_get = MagicMock()
mock_doc_ref.get.return_value = mock_doc_get

class TestReavaliacaoAPI(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        self.USER_ID = "test_user_123"

        # Reset mocks antes de cada teste
        mock_db.reset_mock()
        mock_doc_ref.reset_mock()
        mock_doc_get.reset_mock()

        # Simula o estado inicial: documento não existe a menos que explicitamente definido
        mock_doc_get.exists = False
        mock_doc_get.to_dict.return_value = {}

    def tearDown(self):
        # Os patches globais são parados uma vez no final de todos os testes
        pass

    def test_01_agendar_reavaliacao(self):
        print("\n--- Teste 01: Agendar Reavaliação ---")
        response = self.app.post("/reavaliacao/agendar", json={"user_id": self.USER_ID})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("message", data)
        self.assertEqual(data["message"], "Reavaliação agendada com sucesso!")
        self.assertIn("next_reavaliacao", data)
        print(f"Resposta: {data}")

        # Verifica a interação com o Firestore
        mock_db.collection.assert_called_with("reavaliacoes")
        mock_db.collection.return_value.document.assert_called_with(self.USER_ID)
        mock_doc_ref.set.assert_called_once()
        args, kwargs = mock_doc_ref.set.call_args
        self.assertEqual(args[0]["user_id"], self.USER_ID)
        self.assertEqual(args[0]["status"], "agendada")

        # Simula a existência do documento para chamadas subsequentes no mesmo contexto de teste
        mock_doc_get.exists = True
        mock_doc_get.to_dict.return_value = {
            "user_id": self.USER_ID,
            "last_reavaliacao": datetime.now(),
            "next_reavaliacao": datetime.now() + timedelta(days=45),
            "status": "agendada"
        }

    def test_02_get_reavaliacao_status(self):
        print("\n--- Teste 02: Obter Status da Reavaliação ---")
        # Simula a existência do documento para este teste
        mock_doc_get.exists = True
        mock_doc_get.to_dict.return_value = {
            "user_id": self.USER_ID,
            "last_reavaliacao": datetime.now(),
            "next_reavaliacao": datetime.now() + timedelta(days=45),
            "status": "agendada"
        }

        response = self.app.get(f"/reavaliacao/status/{self.USER_ID}")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("user_id", data)
        self.assertEqual(data["user_id"], self.USER_ID)
        self.assertIn("status", data)
        self.assertEqual(data["status"], "agendada")
        print(f"Resposta: {data}")

        mock_doc_ref.get.assert_called_once()

    def test_03_completar_reavaliacao(self):
        print("\n--- Teste 03: Completar Reavaliação ---")
        # Simula a existência do documento para este teste
        mock_doc_get.exists = True
        mock_doc_get.to_dict.return_value = {
            "user_id": self.USER_ID,
            "last_reavaliacao": datetime.now() - timedelta(days=45),
            "next_reavaliacao": datetime.now(),
            "status": "agendada"
        }

        progress_data = {"weight": 75, "height": 180, "bmi": 23.1}
        response = self.app.post("/reavaliacao/completar", json={
            "user_id": self.USER_ID,
            "progress_data": progress_data
        })
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("message", data)
        self.assertEqual(data["message"], "Reavaliação completada e próxima agendada!")
        self.assertIn("next_reavaliacao", data)
        print(f"Resposta: {data}")

        mock_doc_ref.update.assert_called_once()
        args, kwargs = mock_doc_ref.update.call_args
        self.assertEqual(args[0]["status"], "completa")
        self.assertEqual(args[0]["progress_data"], progress_data)

        # Simula a existência do documento para chamadas subsequentes no mesmo contexto de teste
        mock_doc_get.exists = True
        mock_doc_get.to_dict.return_value = {
            "user_id": self.USER_ID,
            "last_reavaliacao": datetime.now(),
            "next_reavaliacao": datetime.now() + timedelta(days=45),
            "status": "completa",
            "progress_data": progress_data
        }

    def test_04_get_reavaliacao_status_after_completion(self):
        print("\n--- Teste 04: Obter Status da Reavaliação Após Conclusão ---")
        # Simula a existência do documento e sua conclusão para este teste
        progress_data = {"weight": 75, "height": 180, "bmi": 23.1}
        mock_doc_get.exists = True
        mock_doc_get.to_dict.return_value = {
            "user_id": self.USER_ID,
            "last_reavaliacao": datetime.now() - timedelta(days=1),
            "next_reavaliacao": datetime.now() + timedelta(days=44),
            "status": "completa",
            "progress_data": progress_data
        }

        response = self.app.get(f"/reavaliacao/status/{self.USER_ID}")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("user_id", data)
        self.assertEqual(data["user_id"], self.USER_ID)
        self.assertIn("status", data)
        self.assertEqual(data["status"], "completa")
        self.assertIn("progress_data", data)
        self.assertEqual(data["progress_data"]["weight"], 75)
        print(f"Resposta: {data}")

        mock_doc_ref.get.assert_called_once()

if __name__ == '__main__':
    unittest.main()

mock_initialize_app_patch.stop()
mock_firestore_client_patch.stop()

