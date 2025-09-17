"""
Sistema Full-time - Serviço de Rebalanceamento Automático
Monitora atividades extras e recalcula planos em tempo real
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import json

from ..models.tracking import UserProfile, ActivityRecord, CalorieRebalance
from ..services.firebase_service import FirebaseService
from ..services.calorie_service import CalorieService

logger = logging.getLogger(__name__)

@dataclass
class ActivityType:
    """Tipo de atividade com suas características"""
    name: str
    calories_per_minute: Dict[str, float]  # low, moderate, high
    description: str
    category: str

@dataclass
class RebalanceResult:
    """Resultado de um rebalanceamento"""
    success: bool
    original_calories: int
    extra_calories_burned: int
    new_calorie_target: int
    rebalance_factor: float
    reason: str
    timestamp: datetime

class FulltimeService:
    """Serviço principal do Sistema Full-time"""
    
    def __init__(self, firebase_service: FirebaseService, calorie_service: CalorieService):
        self.firebase = firebase_service
        self.calorie_service = calorie_service
        
        # Tipos de atividades suportadas
        self.activity_types = {
            "walking": ActivityType(
                name="Caminhada",
                calories_per_minute={"low": 3, "moderate": 4, "high": 5},
                description="Caminhada em diferentes intensidades",
                category="cardio"
            ),
            "stairs": ActivityType(
                name="Subir escadas",
                calories_per_minute={"low": 8, "moderate": 10, "high": 12},
                description="Subir e descer escadas",
                category="cardio"
            ),
            "housework": ActivityType(
                name="Tarefas domésticas",
                calories_per_minute={"low": 2, "moderate": 3, "high": 4},
                description="Limpeza, organização, etc.",
                category="daily"
            ),
            "sports": ActivityType(
                name="Esportes",
                calories_per_minute={"low": 5, "moderate": 8, "high": 12},
                description="Prática de esportes diversos",
                category="sports"
            ),
            "cycling": ActivityType(
                name="Ciclismo",
                calories_per_minute={"low": 4, "moderate": 6, "high": 10},
                description="Pedalar em diferentes intensidades",
                category="cardio"
            ),
            "running": ActivityType(
                name="Corrida",
                calories_per_minute={"low": 8, "moderate": 12, "high": 16},
                description="Corrida em diferentes ritmos",
                category="cardio"
            ),
            "dancing": ActivityType(
                name="Dança",
                calories_per_minute={"low": 3, "moderate": 5, "high": 7},
                description="Dança em diferentes estilos",
                category="cardio"
            ),
            "gardening": ActivityType(
                name="Jardinagem",
                calories_per_minute={"low": 3, "moderate": 4, "high": 5},
                description="Trabalhos de jardinagem",
                category="daily"
            ),
            "cleaning": ActivityType(
                name="Limpeza",
                calories_per_minute={"low": 2, "moderate": 3, "high": 4},
                description="Limpeza pesada",
                category="daily"
            ),
            "shopping": ActivityType(
                name="Compras",
                calories_per_minute={"low": 2, "moderate": 3, "high": 3},
                description="Fazer compras caminhando",
                category="daily"
            ),
            "yoga": ActivityType(
                name="Yoga",
                calories_per_minute={"low": 2, "moderate": 3, "high": 4},
                description="Prática de yoga",
                category="flexibility"
            ),
            "swimming": ActivityType(
                name="Natação",
                calories_per_minute={"low": 6, "moderate": 10, "high": 14},
                description="Natação em diferentes ritmos",
                category="cardio"
            ),
            "weight_training": ActivityType(
                name="Musculação",
                calories_per_minute={"low": 4, "moderate": 6, "high": 8},
                description="Treino com pesos",
                category="strength"
            ),
            "hiking": ActivityType(
                name="Caminhada na natureza",
                calories_per_minute={"low": 5, "moderate": 7, "high": 9},
                description="Trilhas e caminhadas na natureza",
                category="cardio"
            ),
            "tennis": ActivityType(
                name="Tênis",
                calories_per_minute={"low": 6, "moderate": 9, "high": 12},
                description="Prática de tênis",
                category="sports"
            ),
            "basketball": ActivityType(
                name="Basquete",
                calories_per_minute={"low": 7, "moderate": 10, "high": 13},
                description="Prática de basquete",
                category="sports"
            ),
            "football": ActivityType(
                name="Futebol",
                calories_per_minute={"low": 8, "moderate": 11, "high": 14},
                description="Prática de futebol",
                category="sports"
            ),
            "volleyball": ActivityType(
                name="Vôlei",
                calories_per_minute={"low": 5, "moderate": 7, "high": 9},
                description="Prática de vôlei",
                category="sports"
            ),
            "martial_arts": ActivityType(
                name="Artes marciais",
                calories_per_minute={"low": 6, "moderate": 9, "high": 12},
                description="Prática de artes marciais",
                category="sports"
            ),
            "pilates": ActivityType(
                name="Pilates",
                calories_per_minute={"low": 3, "moderate": 4, "high": 5},
                description="Prática de pilates",
                category="flexibility"
            )
        }
        
        # Configurações do sistema
        self.rebalance_threshold = 50  # Calorias mínimas para rebalancear
        self.max_daily_rebalances = 5  # Máximo de rebalanceamentos por dia
        self.rebalance_factor = 0.7  # Fator de rebalanceamento (70% das calorias extras)
        
    async def register_activity(
        self, 
        user_id: str, 
        activity_type: str, 
        duration_minutes: int, 
        intensity: str,
        description: Optional[str] = None
    ) -> RebalanceResult:
        """
        Registra uma atividade extra e calcula rebalanceamento automático
        """
        try:
            # Validar tipo de atividade
            if activity_type not in self.activity_types:
                raise ValueError(f"Tipo de atividade '{activity_type}' não suportado")
            
            if intensity not in ["low", "moderate", "high"]:
                raise ValueError(f"Intensidade '{intensity}' inválida. Use: low, moderate, high")
            
            # Calcular calorias queimadas
            activity = self.activity_types[activity_type]
            calories_per_minute = activity.calories_per_minute[intensity]
            extra_calories = int(calories_per_minute * duration_minutes)
            
            # Verificar se vale a pena rebalancear
            if extra_calories < self.rebalance_threshold:
                return RebalanceResult(
                    success=False,
                    original_calories=0,
                    extra_calories_burned=extra_calories,
                    new_calorie_target=0,
                    rebalance_factor=0,
                    reason=f"Atividade registrada mas não rebalanceou (menos de {self.rebalance_threshold} cal)",
                    timestamp=datetime.now()
                )
            
            # Obter perfil do usuário
            user_profile = await self._get_user_profile(user_id)
            if not user_profile:
                raise ValueError(f"Perfil do usuário {user_id} não encontrado")
            
            # Verificar limite diário de rebalanceamentos
            daily_rebalances = await self._get_daily_rebalances(user_id)
            if len(daily_rebalances) >= self.max_daily_rebalances:
                return RebalanceResult(
                    success=False,
                    original_calories=user_profile.daily_calorie_target,
                    extra_calories_burned=extra_calories,
                    new_calorie_target=user_profile.daily_calorie_target,
                    rebalance_factor=0,
                    reason=f"Limite diário de rebalanceamentos atingido ({self.max_daily_rebalances})",
                    timestamp=datetime.now()
                )
            
            # Calcular novo alvo de calorias
            original_calories = user_profile.daily_calorie_target
            rebalance_calories = int(extra_calories * self.rebalance_factor)
            new_calorie_target = original_calories + rebalance_calories
            
            # Criar registro de atividade
            activity_record = ActivityRecord(
                user_id=user_id,
                activity_type=activity_type,
                duration_minutes=duration_minutes,
                intensity=intensity,
                calories_burned=extra_calories,
                description=description or activity.description,
                timestamp=datetime.now()
            )
            
            # Salvar atividade
            await self._save_activity(activity_record)
            
            # Criar rebalanceamento
            rebalance = CalorieRebalance(
                user_id=user_id,
                original_calories=original_calories,
                extra_calories_burned=extra_calories,
                new_calorie_target=new_calorie_target,
                rebalance_factor=self.rebalance_factor,
                reason=f"Atividade extra: {activity.name} ({intensity}) por {duration_minutes} min",
                timestamp=datetime.now()
            )
            
            # Salvar rebalanceamento
            await self._save_rebalance(rebalance)
            
            # Atualizar perfil do usuário
            await self._update_user_calorie_target(user_id, new_calorie_target)
            
            logger.info(f"Atividade registrada para {user_id}: {activity_type} - {extra_calories} cal")
            
            return RebalanceResult(
                success=True,
                original_calories=original_calories,
                extra_calories_burned=extra_calories,
                new_calorie_target=new_calorie_target,
                rebalance_factor=self.rebalance_factor,
                reason=rebalance.reason,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Erro ao registrar atividade: {str(e)}")
            raise
    
    async def get_user_status(self, user_id: str) -> Dict:
        """Retorna status atual do Sistema Full-time para o usuário"""
        try:
            # Status básico
            status = {
                "user_id": user_id,
                "is_active": True,
                "daily_extra_calories": 0,
                "total_rebalances_today": 0,
                "last_rebalance": None,
                "daily_calorie_target": 0,
                "current_calorie_target": 0
            }
            
            # Obter perfil do usuário
            user_profile = await self._get_user_profile(user_id)
            if user_profile:
                status["daily_calorie_target"] = user_profile.daily_calorie_target
                status["current_calorie_target"] = user_profile.daily_calorie_target
            
            # Calcular estatísticas do dia
            today = datetime.now().date()
            today_activities = await self._get_activities_by_date(user_id, today)
            today_rebalances = await self._get_rebalances_by_date(user_id, today)
            
            status["daily_extra_calories"] = sum(a.calories_burned for a in today_activities)
            status["total_rebalances_today"] = len(today_rebalances)
            
            if today_rebalances:
                status["last_rebalance"] = max(r.timestamp for r in today_rebalances)
            
            return status
            
        except Exception as e:
            logger.error(f"Erro ao obter status do usuário {user_id}: {str(e)}")
            return {
                "user_id": user_id,
                "is_active": False,
                "error": str(e)
            }
    
    async def get_dashboard_data(self, user_id: str) -> Dict:
        """Retorna dados completos para o dashboard do Sistema Full-time"""
        try:
            # Status atual
            status = await self.get_user_status(user_id)
            
            # Atividades de hoje
            today = datetime.now().date()
            today_activities = await self._get_activities_by_date(user_id, today)
            
            # Rebalanceamentos de hoje
            today_rebalances = await self._get_rebalances_by_date(user_id, today)
            
            # Estatísticas da semana
            week_ago = datetime.now() - timedelta(days=7)
            week_activities = await self._get_activities_since(user_id, week_ago)
            week_rebalances = await self._get_rebalances_since(user_id, week_ago)
            
            total_week_calories = sum(a.calories_burned for a in week_activities)
            total_week_rebalances = len(week_rebalances)
            
            # Atividades mais comuns
            activity_counts = {}
            for activity in week_activities:
                activity_counts[activity.activity_type] = activity_counts.get(activity.activity_type, 0) + 1
            
            most_common_activities = sorted(
                activity_counts.items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:5]
            
            return {
                "status": status,
                "today": {
                    "activities": len(today_activities),
                    "rebalances": len(today_rebalances),
                    "extra_calories": sum(a.calories_burned for a in today_activities),
                    "activities_list": [self._activity_to_dict(a) for a in today_activities[-5:]]
                },
                "week": {
                    "activities": len(week_activities),
                    "rebalances": total_week_rebalances,
                    "total_calories": total_week_calories,
                    "average_daily": total_week_calories / 7,
                    "most_common": most_common_activities
                },
                "recent_activities": [self._activity_to_dict(a) for a in today_activities[-3:]],
                "recent_rebalances": [self._rebalance_to_dict(r) for r in today_rebalances[-3:]]
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter dados do dashboard para {user_id}: {str(e)}")
            return {"error": str(e)}
    
    async def get_supported_activities(self) -> Dict:
        """Retorna lista de atividades suportadas"""
        return {
            "activities": {
                name: {
                    "name": activity.name,
                    "calories_per_minute": activity.calories_per_minute,
                    "description": activity.description,
                    "category": activity.category
                }
                for name, activity in self.activity_types.items()
            },
            "intensity_levels": ["low", "moderate", "high"],
            "categories": list(set(activity.category for activity in self.activity_types.values())),
            "note": "Calorias são por minuto de atividade"
        }
    
    async def toggle_user_status(self, user_id: str) -> Dict:
        """Ativa/desativa o Sistema Full-time para o usuário"""
        try:
            # Implementar lógica de toggle
            # Por enquanto, sempre retorna ativo
            return {
                "user_id": user_id,
                "is_active": True,
                "message": "Sistema Full-time ativado!"
            }
        except Exception as e:
            logger.error(f"Erro ao alterar status do usuário {user_id}: {str(e)}")
            return {"error": str(e)}
    
    # Métodos auxiliares privados
    
    async def _get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Obtém perfil do usuário"""
        try:
            # Implementar busca no Firebase
            # Por enquanto, retorna perfil mock
            return UserProfile(
                user_id=user_id,
                daily_calorie_target=2000,
                weight=70,
                height=175,
                age=30,
                activity_level="moderate",
                goals=["lose_weight"]
            )
        except Exception as e:
            logger.error(f"Erro ao obter perfil do usuário {user_id}: {str(e)}")
            return None
    
    async def _get_daily_rebalances(self, user_id: str) -> List[CalorieRebalance]:
        """Obtém rebalanceamentos do dia"""
        today = datetime.now().date()
        return await self._get_rebalances_by_date(user_id, today)
    
    async def _get_activities_by_date(self, user_id: str, date: datetime.date) -> List[ActivityRecord]:
        """Obtém atividades de uma data específica"""
        # Implementar busca no Firebase
        return []
    
    async def _get_rebalances_by_date(self, user_id: str, date: datetime.date) -> List[CalorieRebalance]:
        """Obtém rebalanceamentos de uma data específica"""
        # Implementar busca no Firebase
        return []
    
    async def _get_activities_since(self, user_id: str, since: datetime) -> List[ActivityRecord]:
        """Obtém atividades desde uma data"""
        # Implementar busca no Firebase
        return []
    
    async def _get_rebalances_since(self, user_id: str, since: datetime) -> List[CalorieRebalance]:
        """Obtém rebalanceamentos desde uma data"""
        # Implementar busca no Firebase
        return []
    
    async def _save_activity(self, activity: ActivityRecord) -> None:
        """Salva atividade no banco de dados"""
        # Implementar salvamento no Firebase
        pass
    
    async def _save_rebalance(self, rebalance: CalorieRebalance) -> None:
        """Salva rebalanceamento no banco de dados"""
        # Implementar salvamento no Firebase
        pass
    
    async def _update_user_calorie_target(self, user_id: str, new_target: int) -> None:
        """Atualiza alvo de calorias do usuário"""
        # Implementar atualização no Firebase
        pass
    
    def _activity_to_dict(self, activity: ActivityRecord) -> Dict:
        """Converte ActivityRecord para dicionário"""
        return {
            "id": activity.id,
            "activity_type": activity.activity_type,
            "duration_minutes": activity.duration_minutes,
            "intensity": activity.intensity,
            "calories_burned": activity.calories_burned,
            "description": activity.description,
            "timestamp": activity.timestamp.isoformat()
        }
    
    def _rebalance_to_dict(self, rebalance: CalorieRebalance) -> Dict:
        """Converte CalorieRebalance para dicionário"""
        return {
            "id": rebalance.id,
            "original_calories": rebalance.original_calories,
            "extra_calories_burned": rebalance.extra_calories_burned,
            "new_calorie_target": rebalance.new_calorie_target,
            "rebalance_factor": rebalance.rebalance_factor,
            "reason": rebalance.reason,
            "timestamp": rebalance.timestamp.isoformat()
        }
