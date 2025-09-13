import unittest
import json
from unittest.mock import patch, MagicMock
from src.main import app
from src.services.firebase_service import FirebaseService

class ShoppingListAPITestCase(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

        # Manter uma única instância do mock do serviço Firebase para todos os testes
        self.firebase_patch = patch("src.routes.shopping_list_routes.firebase_service", spec=FirebaseService)
        self.mock_firebase_service = self.firebase_patch.start()

        # Mocks para os outros serviços
        self.google_maps_patch = patch("src.routes.shopping_list_routes.google_maps_service")
        self.gemini_ai_patch = patch("src.routes.shopping_list_routes.gemini_ai_service")
        self.supermarket_api_patch = patch("src.routes.shopping_list_routes.supermarket_api_service")

        self.mock_google_maps_service = self.google_maps_patch.start()
        self.mock_gemini_ai_service = self.gemini_ai_patch.start()
        self.mock_supermarket_api_service = self.supermarket_api_patch.start()

        # Configurar retornos dos mocks
        self.mock_gemini_ai_service.generate_shopping_list_suggestions.return_value = "Maçã, Banana, Cenoura"
        self.mock_google_maps_service.find_nearby_supermarkets.return_value = [
            {"displayName": {"text": "Supermercado Teste"}, "formattedAddress": "Rua Teste, 123"}
        ]
        self.mock_supermarket_api_service.get_products_by_supermarket.return_value = [
            {"id": "prod1", "name": "Arroz", "price": 20.00}
        ]
        self.mock_supermarket_api_service.search_products.return_value = [
            {"id": "prod1", "name": "Arroz", "price": 20.00}
        ]

        # Usar um dicionário em memória para simular o Firestore
        self.mock_db = {}

        def mock_add_document(collection_name, data):
            import uuid
            if collection_name not in self.mock_db:
                self.mock_db[collection_name] = {}
            doc_id = str(uuid.uuid4())
            self.mock_db[collection_name][doc_id] = data
            mock_doc_ref = MagicMock()
            mock_doc_ref.id = doc_id
            return mock_doc_ref, None

        def mock_get_document(collection_name, doc_id):
            mock_doc = MagicMock()
            if collection_name in self.mock_db and doc_id in self.mock_db[collection_name]:
                mock_doc.exists = True
                mock_doc.to_dict.return_value = self.mock_db[collection_name][doc_id]
            else:
                mock_doc.exists = False
            return mock_doc

        def mock_update_document(collection_name, doc_id, data):
            if collection_name in self.mock_db and doc_id in self.mock_db[collection_name]:
                self.mock_db[collection_name][doc_id].update(data)

        def mock_delete_document(collection_name, doc_id):
            if collection_name in self.mock_db and doc_id in self.mock_db[collection_name]:
                del self.mock_db[collection_name][doc_id]

        self.mock_firebase_service.add_document.side_effect = mock_add_document
        self.mock_firebase_service.get_document.side_effect = mock_get_document
        self.mock_firebase_service.update_document.side_effect = mock_update_document
        self.mock_firebase_service.delete_document.side_effect = mock_delete_document

    def tearDown(self):
        self.firebase_patch.stop()
        self.google_maps_patch.stop()
        self.gemini_ai_patch.stop()
        self.supermarket_api_patch.stop()

    def test_create_shopping_list(self):
        response = self.app.post(
            "/api/shopping-list/lists",
            data=json.dumps({"user_id": "test_user", "name": "Minha Nova Lista"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.get_data(as_text=True))
        self.assertIn(data["id"], self.mock_db["shopping_lists"])

    def test_get_shopping_list(self):
        list_id = "test-list-1"
        self.mock_db["shopping_lists"] = {list_id: {"user_id": "test_user", "name": "Lista Existente"}}
        response = self.app.get(f"/api/shopping-list/lists/{list_id}")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.get_data(as_text=True))
        self.assertEqual(data["name"], "Lista Existente")

    def test_update_shopping_list(self):
        list_id = "test-list-2"
        self.mock_db["shopping_lists"] = {list_id: {"user_id": "test_user", "name": "Lista Antiga"}}
        response = self.app.put(
            f"/api/shopping-list/lists/{list_id}",
            data=json.dumps({"name": "Lista Atualizada"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.mock_db["shopping_lists"][list_id]["name"], "Lista Atualizada")

    def test_delete_shopping_list(self):
        list_id = "test-list-3"
        self.mock_db["shopping_lists"] = {list_id: {"user_id": "test_user", "name": "Lista para Deletar"}}
        response = self.app.delete(f"/api/shopping-list/lists/{list_id}")
        self.assertEqual(response.status_code, 204)
        self.assertNotIn(list_id, self.mock_db["shopping_lists"])

    def test_get_suggestions(self):
        response = self.app.post(
            "/api/shopping-list/suggestions",
            data=json.dumps({"user_id": "test_user", "current_list": []}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.get_data(as_text=True))
        self.assertIn("Maçã", data["suggestions"])

    def test_get_nearby_supermarkets(self):
        response = self.app.get("/api/shopping-list/supermarkets/nearby?latitude=-23.5&longitude=-46.6")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.get_data(as_text=True))
        self.assertEqual(len(data["supermarkets"]), 1)

    def test_get_supermarket_products(self):
        response = self.app.get("/api/shopping-list/supermarkets/super_a/products")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.get_data(as_text=True))
        self.assertEqual(len(data["products"]), 1)

    def test_search_products(self):
        response = self.app.get("/api/shopping-list/products/search?query=Arroz")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.get_data(as_text=True))
        self.assertEqual(data["products"][0]["name"], "Arroz")

if __name__ == "__main__":
    unittest.main()


