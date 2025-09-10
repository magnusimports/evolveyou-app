"""
Sistema Full-time - Rebalanceamento automático de calorias
Rotas para detecção de atividades extras e recálculo de planos
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import json

router = APIRouter(prefix="/fulltime", tags=["fulltime"])

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
        # Calcular calorias queimadas
        if activity.activity_type not in ACTIVITY_CALORIES:
            raise HTTPException(status_code=400, detail=f"Tipo de atividade '{activity.activity_type}' não suportado")
        
        calories_per_minute = ACTIVITY_CALORIES[activity.activity_type][activity.intensity]
        extra_calories = calories_per_minute * activity.duration_minutes
        
        # Registrar atividade
        activity_record = {
            "id": len(fulltime_data["activities"]) + 1,
            "user_id": user_id,
            "activity": activity.dict(),
            "calories_burned": extra_calories,
            "timestamp": datetime.now()
        }
        fulltime_data["activities"].append(activity_record)
        
        # Calcular rebalanceamento
        original_calories = 2000  # TODO: Pegar do plano do usuário
        new_calorie_target = original_calories + int(extra_calories * 0.7)  # 70% das calorias extras
        
        rebalance = CalorieRebalance(
            user_id=user_id,
            original_calories=original_calories,
            extra_calories_burned=extra_calories,
            new_calorie_target=new_calorie_target,
            rebalance_reason=f"Atividade extra: {activity.activity_type} por {activity.duration_minutes} min",
            timestamp=datetime.now()
        )
        
        fulltime_data["rebalances"].append(rebalance.dict())
        
        # Atualizar status do usuário
        if user_id not in fulltime_data["user_status"]:
            fulltime_data["user_status"][user_id] = {
                "is_active": True,
                "daily_extra_calories": 0,
                "total_rebalances_today": 0,
                "last_rebalance": None
            }
        
        status = fulltime_data["user_status"][user_id]
        status["daily_extra_calories"] += extra_calories
        status["total_rebalances_today"] += 1
        status["last_rebalance"] = datetime.now()
        
        return {
            "success": True,
            "activity_registered": activity_record,
            "rebalance": rebalance.dict(),
            "message": f"Atividade registrada! Você queimou {extra_calories} calorias extras. Seu novo alvo é {new_calorie_target} calorias."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao registrar atividade: {str(e)}")

@router.get("/status/{user_id}")
async def get_fulltime_status(user_id: str):
    """
    Retorna o status atual do Sistema Full-time para o usuário
    """
    if user_id not in fulltime_data["user_status"]:
        return FulltimeStatus(
            user_id=user_id,
            is_active=False,
            daily_extra_calories=0,
            total_rebalances_today=0
        )
    
    status = fulltime_data["user_status"][user_id]
    return FulltimeStatus(
        user_id=user_id,
        is_active=status["is_active"],
        daily_extra_calories=status["daily_extra_calories"],
        total_rebalances_today=status["total_rebalances_today"],
        last_rebalance=status["last_rebalance"]
    )

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
    return {
        "supported_activities": ACTIVITY_CALORIES,
        "intensity_levels": ["low", "moderate", "high"],
        "note": "Calorias são por minuto de atividade"
    }

@router.post("/toggle-status/{user_id}")
async def toggle_fulltime_status(user_id: str):
    """
    Ativa/desativa o Sistema Full-time para o usuário
    """
    if user_id not in fulltime_data["user_status"]:
        fulltime_data["user_status"][user_id] = {
            "is_active": True,
            "daily_extra_calories": 0,
            "total_rebalances_today": 0,
            "last_rebalance": None
        }
        return {"message": "Sistema Full-time ativado!", "is_active": True}
    
    status = fulltime_data["user_status"][user_id]
    status["is_active"] = not status["is_active"]
    
    return {
        "message": f"Sistema Full-time {'ativado' if status['is_active'] else 'desativado'}!",
        "is_active": status["is_active"]
    }

@router.get("/dashboard/{user_id}")
async def get_fulltime_dashboard(user_id: str):
    """
    Retorna dados completos para o dashboard do Sistema Full-time
    """
    # Status atual
    status = await get_fulltime_status(user_id)
    
    # Atividades de hoje
    today = datetime.now().date()
    today_activities = [
        a for a in fulltime_data["activities"] 
        if a["user_id"] == user_id and a["timestamp"].date() == today
    ]
    
    # Rebalanceamentos de hoje
    today_rebalances = [
        r for r in fulltime_data["rebalances"] 
        if r["user_id"] == user_id and datetime.fromisoformat(r["timestamp"]).date() == today
    ]
    
    # Estatísticas da semana
    week_ago = datetime.now() - timedelta(days=7)
    week_activities = [
        a for a in fulltime_data["activities"] 
        if a["user_id"] == user_id and a["timestamp"] >= week_ago
    ]
    
    total_week_calories = sum(a["calories_burned"] for a in week_activities)
    
    return {
        "status": status,
        "today": {
            "activities": len(today_activities),
            "rebalances": len(today_rebalances),
            "extra_calories": sum(a["calories_burned"] for a in today_activities)
        },
        "week": {
            "activities": len(week_activities),
            "total_calories": total_week_calories,
            "average_daily": total_week_calories / 7
        },
        "recent_activities": today_activities[-3:] if today_activities else [],
        "recent_rebalances": today_rebalances[-3:] if today_rebalances else []
    }

