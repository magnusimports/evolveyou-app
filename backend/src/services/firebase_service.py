import os
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud import firestore as firestore_client

class FirebaseService:
    def __init__(self):
        self.db = None
        self.initialize_firebase()
    
    def initialize_firebase(self):
        """Inicializa o Firebase usando as credenciais do projeto"""
        try:
            # Usar credenciais do ambiente ou service account
            if not firebase_admin._apps:
                # Configuração usando project_id diretamente
                cred = credentials.ApplicationDefault()
                firebase_admin.initialize_app(cred, {
                    'projectId': 'evolveyou-prod'
                })
            
            self.db = firestore.client()
            print("✅ Firebase inicializado com sucesso!")
            
        except Exception as e:
            print(f"❌ Erro ao inicializar Firebase: {e}")
            # Fallback para Firestore direto
            try:
                self.db = firestore_client.Client(project='evolveyou-prod')
                print("✅ Firestore inicializado diretamente!")
            except Exception as e2:
                print(f"❌ Erro no fallback: {e2}")
                self.db = None
    
    def get_user_profile(self, user_id):
        """Busca perfil do usuário no Firestore"""
        if not self.db:
            return None
            
        try:
            doc_ref = self.db.collection('users').document(user_id)
            doc = doc_ref.get()
            
            if doc.exists:
                return doc.to_dict()
            else:
                # Retornar dados padrão se usuário não existe
                return self.create_default_user(user_id)
                
        except Exception as e:
            print(f"Erro ao buscar usuário: {e}")
            return self.get_mock_user_data()
    
    def create_default_user(self, user_id):
        """Cria usuário padrão no Firestore"""
        default_user = {
            "name": "Usuário EvolveYou",
            "age": 30,
            "height": 175,
            "current_weight": 75,
            "target_weight": 70,
            "activity_level": "moderately_active",
            "goal": "weight_loss",
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        try:
            self.db.collection('users').document(user_id).set(default_user)
            return default_user
        except Exception as e:
            print(f"Erro ao criar usuário: {e}")
            return self.get_mock_user_data()
    
    def get_user_metrics(self, user_id):
        """Busca métricas do usuário"""
        if not self.db:
            return self.get_mock_metrics()
            
        try:
            # Buscar métricas do dia atual
            from datetime import datetime
            today = datetime.now().strftime('%Y-%m-%d')
            
            doc_ref = self.db.collection('users').document(user_id).collection('metrics').document(today)
            doc = doc_ref.get()
            
            if doc.exists:
                return doc.to_dict()
            else:
                # Criar métricas padrão para hoje
                return self.create_default_metrics(user_id, today)
                
        except Exception as e:
            print(f"Erro ao buscar métricas: {e}")
            return self.get_mock_metrics()
    
    def create_default_metrics(self, user_id, date):
        """Cria métricas padrão para o usuário"""
        default_metrics = {
            "bmr": 1763,
            "tdee": 2732,
            "target_calories": 2459,
            "current_calories": 1847,
            "water_intake": 1.8,
            "water_target": 2.5,
            "steps": 2453,
            "distance": 1.82,
            "date": date,
            "updated_at": firestore.SERVER_TIMESTAMP
        }
        
        try:
            self.db.collection('users').document(user_id).collection('metrics').document(date).set(default_metrics)
            return default_metrics
        except Exception as e:
            print(f"Erro ao criar métricas: {e}")
            return self.get_mock_metrics()
    
    def get_activity_rings(self, user_id):
        """Busca dados dos círculos de atividade"""
        if not self.db:
            return self.get_mock_activity_rings()
            
        try:
            from datetime import datetime
            today = datetime.now().strftime('%Y-%m-%d')
            
            doc_ref = self.db.collection('users').document(user_id).collection('activity').document(today)
            doc = doc_ref.get()
            
            if doc.exists:
                return doc.to_dict()
            else:
                return self.create_default_activity_rings(user_id, today)
                
        except Exception as e:
            print(f"Erro ao buscar atividade: {e}")
            return self.get_mock_activity_rings()
    
    def create_default_activity_rings(self, user_id, date):
        """Cria dados padrão dos círculos de atividade"""
        default_activity = {
            "movement": {
                "current": 268,
                "target": 1300,
                "percentage": 20.6,
                "unit": "CAL"
            },
            "exercise": {
                "current": 2,
                "target": 90,
                "percentage": 2.2,
                "unit": "MIN"
            },
            "stand": {
                "current": 5,
                "target": 8,
                "percentage": 62.5,
                "unit": "H"
            },
            "date": date,
            "updated_at": firestore.SERVER_TIMESTAMP
        }
        
        try:
            self.db.collection('users').document(user_id).collection('activity').document(date).set(default_activity)
            return default_activity
        except Exception as e:
            print(f"Erro ao criar atividade: {e}")
            return self.get_mock_activity_rings()
    
    def save_chat_message(self, user_id, message, is_user=True):
        """Salva mensagem do chat no Firestore"""
        if not self.db:
            return False
            
        try:
            from datetime import datetime
            
            chat_data = {
                "user_id": user_id,
                "message": message,
                "is_user": is_user,
                "timestamp": firestore.SERVER_TIMESTAMP,
                "created_at": datetime.now().isoformat()
            }
            
            self.db.collection('chat_history').add(chat_data)
            return True
            
        except Exception as e:
            print(f"Erro ao salvar mensagem: {e}")
            return False
    
    def get_chat_history(self, user_id, limit=10):
        """Busca histórico de chat do usuário"""
        if not self.db:
            return []
            
        try:
            query = (self.db.collection('chat_history')
                    .where('user_id', '==', user_id)
                    .order_by('timestamp', direction=firestore.Query.DESCENDING)
                    .limit(limit))
            
            docs = query.stream()
            messages = []
            
            for doc in docs:
                data = doc.to_dict()
                messages.append(data)
            
            return list(reversed(messages))  # Ordem cronológica
            
        except Exception as e:
            print(f"Erro ao buscar histórico: {e}")
            return []
    
    # Métodos de fallback com dados mockados
    def get_mock_user_data(self):
        return {
            "name": "Ana Silva",
            "age": 30,
            "height": 175,
            "current_weight": 75,
            "target_weight": 70,
            "activity_level": "moderately_active",
            "goal": "weight_loss"
        }
    
    def get_mock_metrics(self):
        return {
            "bmr": 1763,
            "tdee": 2732,
            "target_calories": 2459,
            "current_calories": 1847,
            "water_intake": 1.8,
            "water_target": 2.5,
            "steps": 2453,
            "distance": 1.82
        }
    
    def get_mock_activity_rings(self):
        return {
            "movement": {
                "current": 268,
                "target": 1300,
                "percentage": 20.6,
                "unit": "CAL"
            },
            "exercise": {
                "current": 2,
                "target": 90,
                "percentage": 2.2,
                "unit": "MIN"
            },
            "stand": {
                "current": 5,
                "target": 8,
                "percentage": 62.5,
                "unit": "H"
            }
        }

# Instância global do serviço
firebase_service = FirebaseService()

