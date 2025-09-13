import firebase_admin
from firebase_admin import firestore
import os

class FirebaseService:
    def __init__(self):
        self._db = None

    @property
    def db(self):
        if self._db is None:
            # Verifica se está em um ambiente de teste (ex: rodando com unittest.mock)
            # Se sim, não tenta inicializar o Firebase, pois os mocks cuidarão disso.
            if os.environ.get("FLASK_ENV") == "testing":
                # Retorna um mock para evitar erros de inicialização real
                self._db = MockFirestoreClient()
                return self._db

            try:
                app = firebase_admin.get_app()
                self._db = firestore.client(app=app)
            except ValueError:
                raise Exception("Firebase Admin SDK não inicializado. Por favor, inicialize-o em main.py.")
        return self._db

    def get_collection(self, collection_name):
        return self.db.collection(collection_name)

    def get_document(self, collection_name, doc_id):
        return self.db.collection(collection_name).document(doc_id).get()

    def add_document(self, collection_name, data):
        return self.db.collection(collection_name).add(data)

    def update_document(self, collection_name, doc_id, data):
        return self.db.collection(collection_name).document(doc_id).update(data)

    def delete_document(self, collection_name, doc_id):
        self.db.collection(collection_name).document(doc_id).delete()

    def get_user_shopping_lists(self, user_id):
        return self.db.collection("shopping_lists").where("user_id", "==", user_id).stream()

    def get_user_preferences(self, user_id):
        return self.db.collection("user_preferences").document(user_id).get()

    def update_user_preferences(self, user_id, preferences):
        self.db.collection("user_preferences").document(user_id).set(preferences, merge=True)

# Mock para o cliente Firestore para uso em testes
class MockFirestoreClient:
    def __init__(self):
        self.collections = {
            "shopping_lists": {},
            "user_preferences": {}
        }

    def collection(self, collection_name):
        return MockCollectionReference(collection_name, self.collections)

class MockCollectionReference:
    def __init__(self, collection_name, collections):
        self.collection_name = collection_name
        self.collections = collections
        if collection_name not in self.collections:
            self.collections[collection_name] = {}

    def document(self, doc_id):
        return MockDocumentReference(doc_id, self.collections[self.collection_name])

    def add(self, data):
        import uuid
        doc_id = str(uuid.uuid4())
        self.collections[self.collection_name][doc_id] = data
        return MockDocumentReference(doc_id, self.collections[self.collection_name]), MockDocumentSnapshot(doc_id, data)

    def where(self, field, op, value):
        # Simples mock para where, apenas para o teste de get_user_shopping_lists
        if field == "user_id" and op == "==":
            mock_docs = []
            for doc_id, doc_data in self.collections[self.collection_name].items():
                if doc_data.get("user_id") == value:
                    mock_docs.append(MockDocumentSnapshot(doc_id, doc_data))
            return MockStream(mock_docs)
        return MockStream([])

class MockDocumentReference:
    def __init__(self, doc_id, collection_data):
        self.id = doc_id
        self.collection_data = collection_data

    def get(self):
        data = self.collection_data.get(self.id)
        return MockDocumentSnapshot(self.id, data)

    def update(self, data):
        # print(f"[MOCK] Atualizando documento {self.id} com {data}")
        if self.id in self.collection_data:
            self.collection_data[self.id].update(data)

    def delete(self):
        # print(f"[MOCK] Deletando documento {self.id}")
        if self.id in self.collection_data:
            del self.collection_data[self.id]

class MockDocumentSnapshot:
    def __init__(self, doc_id, data):
        self.id = doc_id
        self._data = data
        self.exists = data is not None

    def to_dict(self):
        return self._data

class MockStream:
    def __init__(self, data):
        self._data = data
        self._index = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self._index < len(self._data):
            item = self._data[self._index]
            self._index += 1
            return item
        raise StopIteration




