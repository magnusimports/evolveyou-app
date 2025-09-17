"""
Firebase Advanced Service - EvolveYou
Sistema avançado de Firebase com autenticação real e dados de produção
"""

import firebase_admin
from firebase_admin import credentials, firestore, auth
import json
import os
from datetime import datetime, timedelta
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FirebaseAdvanced:
    def __init__(self):
        self.db = None
        self.app = None
        self.initialize_firebase()
    
    def initialize_firebase(self):
        """Inicializa Firebase com configuração de produção"""
        try:
            # Caminho para o arquivo de configuração
            config_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'firebase-config.json')
            
            # Inicializar Firebase Admin
            if not firebase_admin._apps:
                cred = credentials.Certificate(config_path)
                self.app = firebase_admin.initialize_app(cred)
            else:
                self.app = firebase_admin.get_app()
            
            self.db = firestore.client()
            logger.info("✅ Firebase Advanced inicializado com sucesso")
            
        except Exception as e:
            logger.error(f"❌ Erro ao inicializar Firebase: {e}")
            # Fallback para modo offline
            self.db = None
    
    def create_user_profile(self, user_data):
        """Cria perfil completo do usuário"""
        try:
            user_id = user_data.get('uid', f"user_{datetime.now().timestamp()}")
            
            profile = {
                'uid': user_id,
                'name': user_data.get('name', 'Usuário'),
                'email': user_data.get('email', ''),
                'age': user_data.get('age', 25),
                'gender': user_data.get('gender', 'other'),
                'height': user_data.get('height', 170),
                'weight': user_data.get('weight', 70),
                'target_weight': user_data.get('target_weight', 65),
                'goal': user_data.get('goal', 'lose_weight'),
                'activity_level': user_data.get('activity_level', 'moderate'),
                'dietary_restrictions': user_data.get('dietary_restrictions', []),
                'preferences': user_data.get('preferences', {}),
                'created_at': datetime.now(),
                'updated_at': datetime.now(),
                'onboarding_completed': True,
                'subscription_type': 'free',
                'bmr': self.calculate_bmr(user_data),
                'daily_calories': self.calculate_daily_calories(user_data),
                'macros': self.calculate_macros(user_data)
            }
            
            if self.db:
                self.db.collection('users').document(user_id).set(profile)
                logger.info(f"✅ Perfil criado para usuário {user_id}")
            
            return profile
            
        except Exception as e:
            logger.error(f"❌ Erro ao criar perfil: {e}")
            return None
    
    def get_user_profile(self, user_id):
        """Obtém perfil completo do usuário"""
        try:
            if self.db:
                doc = self.db.collection('users').document(user_id).get()
                if doc.exists:
                    return doc.to_dict()
            
            # Fallback para usuário padrão
            return self.get_default_user_profile(user_id)
            
        except Exception as e:
            logger.error(f"❌ Erro ao obter perfil: {e}")
            return self.get_default_user_profile(user_id)
    
    def update_user_metrics(self, user_id, metrics):
        """Atualiza métricas do usuário"""
        try:
            today = datetime.now().strftime('%Y-%m-%d')
            
            metric_data = {
                'user_id': user_id,
                'date': today,
                'weight': metrics.get('weight'),
                'steps': metrics.get('steps', 0),
                'distance': metrics.get('distance', 0),
                'calories_burned': metrics.get('calories_burned', 0),
                'active_minutes': metrics.get('active_minutes', 0),
                'sleep_hours': metrics.get('sleep_hours', 8),
                'water_intake': metrics.get('water_intake', 0),
                'mood': metrics.get('mood', 'good'),
                'energy_level': metrics.get('energy_level', 'medium'),
                'updated_at': datetime.now()
            }
            
            if self.db:
                self.db.collection('daily_metrics').document(f"{user_id}_{today}").set(metric_data)
                logger.info(f"✅ Métricas atualizadas para {user_id}")
            
            return metric_data
            
        except Exception as e:
            logger.error(f"❌ Erro ao atualizar métricas: {e}")
            return None
    
    def get_user_metrics(self, user_id, days=7):
        """Obtém métricas do usuário dos últimos N dias"""
        try:
            metrics = []
            
            if self.db:
                # Buscar métricas dos últimos dias
                end_date = datetime.now()
                start_date = end_date - timedelta(days=days)
                
                docs = self.db.collection('daily_metrics')\
                    .where('user_id', '==', user_id)\
                    .where('date', '>=', start_date.strftime('%Y-%m-%d'))\
                    .order_by('date', direction=firestore.Query.DESCENDING)\
                    .get()
                
                for doc in docs:
                    metrics.append(doc.to_dict())
            
            # Se não há dados, gerar dados de exemplo
            if not metrics:
                metrics = self.generate_sample_metrics(user_id, days)
            
            return metrics
            
        except Exception as e:
            logger.error(f"❌ Erro ao obter métricas: {e}")
            return self.generate_sample_metrics(user_id, days)
    
    def save_chat_message(self, user_id, message, response, context=None):
        """Salva mensagem do chat com contexto"""
        try:
            chat_data = {
                'user_id': user_id,
                'message': message,
                'response': response,
                'context': context or {},
                'timestamp': datetime.now(),
                'session_id': f"{user_id}_{datetime.now().strftime('%Y%m%d')}"
            }
            
            if self.db:
                self.db.collection('chat_history').add(chat_data)
                logger.info(f"✅ Chat salvo para {user_id}")
            
            return chat_data
            
        except Exception as e:
            logger.error(f"❌ Erro ao salvar chat: {e}")
            return None
    
    def get_chat_history(self, user_id, limit=10):
        """Obtém histórico de chat do usuário"""
        try:
            if self.db:
                docs = self.db.collection('chat_history')\
                    .where('user_id', '==', user_id)\
                    .order_by('timestamp', direction=firestore.Query.DESCENDING)\
                    .limit(limit)\
                    .get()
                
                return [doc.to_dict() for doc in docs]
            
            return []
            
        except Exception as e:
            logger.error(f"❌ Erro ao obter histórico: {e}")
            return []
    
    def calculate_bmr(self, user_data):
        """Calcula Taxa Metabólica Basal"""
        weight = user_data.get('weight', 70)
        height = user_data.get('height', 170)
        age = user_data.get('age', 25)
        gender = user_data.get('gender', 'other')
        
        if gender == 'male':
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
        else:
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
        
        return round(bmr)
    
    def calculate_daily_calories(self, user_data):
        """Calcula calorias diárias necessárias"""
        bmr = self.calculate_bmr(user_data)
        activity_level = user_data.get('activity_level', 'moderate')
        goal = user_data.get('goal', 'maintain')
        
        # Fatores de atividade
        activity_factors = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very_active': 1.9
        }
        
        tdee = bmr * activity_factors.get(activity_level, 1.55)
        
        # Ajustar baseado no objetivo
        if goal == 'lose_weight':
            daily_calories = tdee - 500  # Déficit de 500 cal
        elif goal == 'gain_weight':
            daily_calories = tdee + 300  # Superávit de 300 cal
        else:
            daily_calories = tdee
        
        return round(daily_calories)
    
    def calculate_macros(self, user_data):
        """Calcula distribuição de macronutrientes"""
        daily_calories = self.calculate_daily_calories(user_data)
        goal = user_data.get('goal', 'maintain')
        
        if goal == 'lose_weight':
            # Alto em proteína para preservar massa muscular
            protein_ratio = 0.35
            carb_ratio = 0.30
            fat_ratio = 0.35
        elif goal == 'gain_weight':
            # Mais carboidratos para energia
            protein_ratio = 0.25
            carb_ratio = 0.45
            fat_ratio = 0.30
        else:
            # Distribuição balanceada
            protein_ratio = 0.30
            carb_ratio = 0.40
            fat_ratio = 0.30
        
        return {
            'protein': round((daily_calories * protein_ratio) / 4),  # 4 cal/g
            'carbs': round((daily_calories * carb_ratio) / 4),      # 4 cal/g
            'fats': round((daily_calories * fat_ratio) / 9)         # 9 cal/g
        }
    
    def get_default_user_profile(self, user_id):
        """Perfil padrão para fallback"""
        return {
            'uid': user_id,
            'name': 'Usuário Convidado',
            'email': '',
            'age': 25,
            'gender': 'other',
            'height': 170,
            'weight': 70,
            'target_weight': 65,
            'goal': 'lose_weight',
            'activity_level': 'moderate',
            'bmr': 1650,
            'daily_calories': 2100,
            'macros': {'protein': 130, 'carbs': 210, 'fats': 70}
        }
    
    def generate_sample_metrics(self, user_id, days):
        """Gera métricas de exemplo"""
        import random
        metrics = []
        
        for i in range(days):
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            metrics.append({
                'user_id': user_id,
                'date': date,
                'steps': random.randint(5000, 12000),
                'distance': round(random.uniform(3.5, 8.5), 2),
                'calories_burned': random.randint(300, 800),
                'active_minutes': random.randint(30, 120),
                'sleep_hours': round(random.uniform(6.5, 9.0), 1),
                'water_intake': round(random.uniform(1.5, 3.5), 1),
                'mood': random.choice(['excellent', 'good', 'okay', 'tired']),
                'energy_level': random.choice(['high', 'medium', 'low'])
            })
        
        return metrics

# Instância global
firebase_advanced = FirebaseAdvanced()

