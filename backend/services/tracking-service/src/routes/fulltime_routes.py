"""
Sistema Full-time - Rebalanceamento automático de calorias
Rotas para detecção de atividades extras e recálculo de planos
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import json

from ..services.fulltime_service import FulltimeService
from ..services.firebase_service import FirebaseService
from ..services.calorie_service import CalorieService
from ..models.tracking import (
    ActivityRecord, 
    CalorieRebalance, 
    FulltimeStatus, 
    RebalanceResult,
    FulltimeDashboard
)

router = APIRouter(prefix="/fulltime", tags=["fulltime"])

# Inicializar serviços
firebase_service = FirebaseService()
calorie_service = CalorieService()
fulltime_service = FulltimeService(firebase_service, calorie_service)

# Modelos de dados
class ExtraActivity(BaseModel):
    activity_type: str  # "walking", "stairs", "housework", "sports", etc.
    duration_minutes: int
    intensity: str  # "low", "moderate", "high"
    description: Optional[str] = None
    timestamp: Optional[datetime] = None

class CalorieRebalance(BaseModel):
    user_id: str
    original_calories: int
    extra_calories_burned: int
    new_calorie_target: int
    rebalance_reason: str
    timestamp: datetime

class FulltimeStatus(BaseModel):
    user_id: str
    is_active: bool
    daily_extra_calories: int
    total_rebalances_today: int
    last_rebalance: Optional[datetime] = None

# Banco de dados simulado (em produção seria Firebase)
fulltime_data = {
    "activities": [],
    "rebalances": [],
    "user_status": {}
}

# Tabela de calorias por atividade (por minuto)
ACTIVITY_CALORIES = {
    "walking": {"low": 3, "moderate": 4, "high": 5},
    "stairs": {"low": 8, "moderate": 10, "high": 12},
    "housework": {"low": 2, "moderate": 3, "high": 4},
    "sports": {"low": 5, "moderate": 8, "high": 12},
    "cycling": {"low": 4, "moderate": 6, "high": 10},
    "running": {"low": 8, "moderate": 12, "high": 16},
    "dancing": {"low": 3, "moderate": 5, "high": 7},
    "gardening": {"low": 3, "moderate": 4, "high": 5},
    "cleaning": {"low": 2, "moderate": 3, "high": 4},
    "shopping": {"low": 2, "moderate": 3, "high": 3}
}

@router.get("/")
async def fulltime_info():
    """Informações sobre o Sistema Full-time"""
    return {
        "service": "Sistema Full-time",
        "description": "Rebalanceamento automático de calorias baseado em atividades extras",
        "version": "1.0.0",
        "features": [
            "Detecção de atividades extras",
            "Cálculo automático de calorias queimadas",
            "Rebalanceamento do plano alimentar",
            "Histórico de rebalanceamentos",
            "Status em tempo real"
        ]
    }

@router.post("/register-activity")
async def register_extra_activity(activity: ExtraActivity, user_id: str = "demo_user"):
    """
    Registra uma atividade extra e calcula rebalanceamento automático
    """
    try:
        result = await fulltime_service.register_activity(
            user_id=user_id,
            activity_type=activity.activity_type,
            duration_minutes=activity.duration_minutes,
            intensity=activity.intensity,
            description=activity.description
        )
        
        if result.success:
            return {
                "success": True,
                "activity_registered": {
                    "activity_type": activity.activity_type,
                    "duration_minutes": activity.duration_minutes,
                    "intensity": activity.intensity,
                    "calories_burned": result.extra_calories_burned,
                    "timestamp": result.timestamp.isoformat()
                },
                "rebalance": {
                    "original_calories": result.original_calories,
                    "extra_calories_burned": result.extra_calories_burned,
                    "new_calorie_target": result.new_calorie_target,
                    "rebalance_factor": result.rebalance_factor,
                    "reason": result.reason,
                    "timestamp": result.timestamp.isoformat()
                },
                "message": f"Atividade registrada! Você queimou {result.extra_calories_burned} calorias extras. Seu novo alvo é {result.new_calorie_target} calorias."
            }
        else:
        return {
                "success": False,
                "message": result.reason,
                "calories_burned": result.extra_calories_burned
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao registrar atividade: {str(e)}")

@router.get("/status/{user_id}")
async def get_fulltime_status(user_id: str):
    """
    Retorna o status atual do Sistema Full-time para o usuário
    """
    try:
        status_data = await fulltime_service.get_user_status(user_id)
        return FulltimeStatus(**status_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter status: {str(e)}")

@router.get("/history/{user_id}")
async def get_rebalance_history(user_id: str, limit: int = 10):
    """
    Retorna o histórico de rebalanceamentos do usuário
    """
    user_rebalances = [
        r for r in fulltime_data["rebalances"] 
        if r["user_id"] == user_id
    ]
    
    # Ordenar por timestamp (mais recente primeiro)
    user_rebalances.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return {
        "user_id": user_id,
        "total_rebalances": len(user_rebalances),
        "history": user_rebalances[:limit]
    }

@router.get("/activities/{user_id}")
async def get_user_activities(user_id: str, limit: int = 10):
    """
    Retorna as atividades extras registradas pelo usuário
    """
    user_activities = [
        a for a in fulltime_data["activities"] 
        if a["user_id"] == user_id
    ]
    
    # Ordenar por timestamp (mais recente primeiro)
    user_activities.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return {
        "user_id": user_id,
        "total_activities": len(user_activities),
        "activities": user_activities[:limit]
    }

@router.get("/supported-activities")
async def get_supported_activities():
    """
    Retorna lista de atividades suportadas e suas calorias
    """
    try:
        activities_data = await fulltime_service.get_supported_activities()
        return activities_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter atividades suportadas: {str(e)}")

@router.post("/toggle-status/{user_id}")
async def toggle_fulltime_status(user_id: str):
    """
    Ativa/desativa o Sistema Full-time para o usuário
    """
    try:
        result = await fulltime_service.toggle_user_status(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao alterar status: {str(e)}")

@router.get("/dashboard/{user_id}")
async def get_fulltime_dashboard(user_id: str):
    """
    Retorna dados completos para o dashboard do Sistema Full-time
    """
    try:
        dashboard_data = await fulltime_service.get_dashboard_data(user_id)
        return FulltimeDashboard(**dashboard_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter dashboard: {str(e)}")

