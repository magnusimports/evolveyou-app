"""
Versão simplificada da Tracking API para demonstração
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime, date
import json
import sys
import os

# Adicionar src ao path para importar rotas
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

# Modelos simplificados
class MealCheckin(BaseModel):
    meal_type: str
    food_items: List[str]
    calories: int
    timestamp: Optional[datetime] = None

class SetLog(BaseModel):
    exercise_name: str
    weight_kg: float
    reps_done: int
    set_number: int

class BodyWeightLog(BaseModel):
    weight_kg: float
    body_fat_percentage: Optional[float] = None

class WorkoutSession(BaseModel):
    workout_type: str
    duration_minutes: int
    calories_burned: int

# Criar aplicação FastAPI
app = FastAPI(
    title="EvolveYou Tracking API - Demo",
    description="API de tracking para o aplicativo EvolveYou",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dados mock para demonstração
mock_data = {
    "daily_logs": [],
    "user_stats": {
        "calories_consumed": 1850,
        "calories_burned": 420,
        "workouts_completed": 1,
        "current_weight": 75.5,
        "streak_days": 7
    }
}

# Endpoints principais

@app.get("/")
async def root():
    """Endpoint raiz da API"""
    return {
        "service": "EvolveYou Tracking API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "logging": "/log/*",
            "dashboard": "/dashboard/*",
            "progress": "/progress/*"
        }
    }

@app.get("/health")
async def health_check():
    """Health check da API"""
    return {
        "status": "healthy",
        "service": "tracking-api",
        "uptime": "running",
        "timestamp": datetime.now().isoformat(),
        "database": "connected",
        "cache": "active"
    }

# Endpoints de Logging

@app.post("/log/meal-checkin")
async def log_meal_checkin(meal: MealCheckin):
    """Registrar check-in de refeição"""
    log_entry = {
        "id": f"meal_{len(mock_data['daily_logs']) + 1}",
        "type": "meal_checkin",
        "data": meal.dict(),
        "timestamp": datetime.now().isoformat(),
        "user_id": "demo_user"
    }
    
    mock_data["daily_logs"].append(log_entry)
    mock_data["user_stats"]["calories_consumed"] += meal.calories
    
    return {
        "success": True,
        "message": "Refeição registrada com sucesso",
        "log_id": log_entry["id"],
        "calories_added": meal.calories,
        "total_calories_today": mock_data["user_stats"]["calories_consumed"]
    }

@app.post("/log/set")
async def log_set(set_data: SetLog):
    """Registrar série de exercício"""
    log_entry = {
        "id": f"set_{len(mock_data['daily_logs']) + 1}",
        "type": "set",
        "data": set_data.dict(),
        "timestamp": datetime.now().isoformat(),
        "user_id": "demo_user"
    }
    
    mock_data["daily_logs"].append(log_entry)
    
    return {
        "success": True,
        "message": "Série registrada com sucesso",
        "log_id": log_entry["id"],
        "exercise": set_data.exercise_name,
        "performance": f"{set_data.weight_kg}kg x {set_data.reps_done} reps"
    }

@app.post("/log/body-weight")
async def log_body_weight(weight_data: BodyWeightLog):
    """Registrar peso corporal"""
    log_entry = {
        "id": f"weight_{len(mock_data['daily_logs']) + 1}",
        "type": "body_weight",
        "data": weight_data.dict(),
        "timestamp": datetime.now().isoformat(),
        "user_id": "demo_user"
    }
    
    mock_data["daily_logs"].append(log_entry)
    mock_data["user_stats"]["current_weight"] = weight_data.weight_kg
    
    return {
        "success": True,
        "message": "Peso registrado com sucesso",
        "log_id": log_entry["id"],
        "weight": f"{weight_data.weight_kg}kg",
        "body_fat": f"{weight_data.body_fat_percentage}%" if weight_data.body_fat_percentage else "N/A"
    }

@app.post("/log/workout-session/end")
async def end_workout_session(session: WorkoutSession):
    """Finalizar sessão de treino"""
    log_entry = {
        "id": f"workout_{len(mock_data['daily_logs']) + 1}",
        "type": "workout_session",
        "data": session.dict(),
        "timestamp": datetime.now().isoformat(),
        "user_id": "demo_user"
    }
    
    mock_data["daily_logs"].append(log_entry)
    mock_data["user_stats"]["calories_burned"] += session.calories_burned
    mock_data["user_stats"]["workouts_completed"] += 1
    
    return {
        "success": True,
        "message": "Treino finalizado com sucesso",
        "log_id": log_entry["id"],
        "duration": f"{session.duration_minutes} minutos",
        "calories_burned": session.calories_burned,
        "total_workouts_today": mock_data["user_stats"]["workouts_completed"]
    }

@app.get("/log/history/{log_type}")
async def get_log_history(log_type: str, limit: int = 10):
    """Obter histórico de logs por tipo"""
    filtered_logs = [
        log for log in mock_data["daily_logs"] 
        if log["type"] == log_type
    ]
    
    # Ordenar por timestamp (mais recente primeiro)
    filtered_logs.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return {
        "log_type": log_type,
        "count": len(filtered_logs),
        "logs": filtered_logs[:limit],
        "user_id": "demo_user"
    }

# Endpoints de Dashboard

@app.get("/dashboard/")
async def get_dashboard():
    """Dashboard principal do usuário"""
    recent_logs = mock_data["daily_logs"][-5:] if mock_data["daily_logs"] else []
    
    return {
        "user_id": "demo_user",
        "date": date.today().isoformat(),
        "stats": mock_data["user_stats"],
        "recent_activity": recent_logs,
        "goals": {
            "daily_calories": 2000,
            "daily_workouts": 1,
            "weekly_weight_loss": 0.5
        },
        "achievements": [
            "7 dias consecutivos",
            "Meta de calorias atingida",
            "Primeiro treino da semana"
        ]
    }

@app.get("/dashboard/summary")
async def get_dashboard_summary():
    """Resumo do dashboard"""
    return {
        "user_id": "demo_user",
        "date": date.today().isoformat(),
        "calories_consumed": mock_data["user_stats"]["calories_consumed"],
        "calories_burned": mock_data["user_stats"]["calories_burned"],
        "net_calories": mock_data["user_stats"]["calories_consumed"] - mock_data["user_stats"]["calories_burned"],
        "workouts_completed": mock_data["user_stats"]["workouts_completed"],
        "current_weight": mock_data["user_stats"]["current_weight"],
        "streak_days": mock_data["user_stats"]["streak_days"],
        "completion_percentage": 85
    }

# Endpoints de Progress

@app.get("/progress/summary")
async def get_progress_summary():
    """Resumo de progresso do usuário"""
    return {
        "user_id": "demo_user",
        "period": "last_30_days",
        "weight_change": -2.3,
        "average_calories": 1950,
        "total_workouts": 18,
        "consistency_score": 87,
        "improvements": [
            "Peso reduzido em 2.3kg",
            "Consistência de 87%",
            "18 treinos completados"
        ],
        "next_goals": [
            "Manter consistência acima de 90%",
            "Reduzir mais 1kg este mês",
            "Aumentar intensidade dos treinos"
        ]
    }

@app.get("/progress/weight-trend")
async def get_weight_trend(days: int = 30):
    """Tendência de peso dos últimos dias"""
    # Gerar dados mock de tendência de peso
    import random
    base_weight = 77.8
    weight_data = []
    
    for i in range(days):
        day_date = date.today().replace(day=date.today().day - (days - i - 1))
        weight = base_weight - (i * 0.08) + random.uniform(-0.3, 0.3)
        
        weight_data.append({
            "date": day_date.isoformat(),
            "weight_kg": round(weight, 1),
            "body_fat_percentage": round(18.5 - (i * 0.02), 1),
            "muscle_mass_kg": round(58.2 + (i * 0.01), 1)
        })
    
    return {
        "user_id": "demo_user",
        "period_days": days,
        "data_points": len(weight_data),
        "weight_trend": weight_data,
        "trend_analysis": {
            "direction": "decreasing",
            "average_change_per_week": -0.56,
            "total_change": round(weight_data[-1]["weight_kg"] - weight_data[0]["weight_kg"], 1)
        }
    }

# Endpoints Full-time System

@app.get("/fulltime/dashboard/{user_id}")
async def get_fulltime_dashboard(user_id: str):
    """Dashboard do Sistema Full-time"""
    return {
        "status": {
            "is_active": True,
            "daily_extra_calories": 320,
            "total_rebalances_today": 2,
            "last_rebalance": "2025-09-10T14:30:00Z"
        },
        "recent_activities": [
            {
                "activity": {
                    "activity_type": "walking",
                    "duration_minutes": 45,
                    "intensity": "moderate",
                    "description": "Caminhada no parque"
                },
                "calories_burned": 180,
                "timestamp": "2025-09-10T15:00:00Z"
            },
            {
                "activity": {
                    "activity_type": "stairs",
                    "duration_minutes": 10,
                    "intensity": "high",
                    "description": "Subir escadas do prédio"
                },
                "calories_burned": 140,
                "timestamp": "2025-09-10T12:30:00Z"
            }
        ],
        "recent_rebalances": [
            {
                "original_calories": 2000,
                "new_calorie_target": 2180,
                "extra_calories_burned": 180,
                "rebalance_reason": "Atividade extra: Caminhada (45 min)"
            },
            {
                "original_calories": 2180,
                "new_calorie_target": 2320,
                "extra_calories_burned": 140,
                "rebalance_reason": "Atividade extra: Subir escadas (10 min)"
            }
        ]
    }

@app.post("/fulltime/register-activity")
async def register_extra_activity(user_id: str, activity: dict):
    """Registra atividade extra"""
    # Simular cálculo de calorias
    duration = activity.get("duration_minutes", 30)
    intensity = activity.get("intensity", "moderate")
    
    # Cálculo simplificado de calorias
    base_calories = {
        "walking": 4,
        "stairs": 14,
        "housework": 3,
        "sports": 8,
        "cycling": 6,
        "running": 10,
        "dancing": 5,
        "gardening": 4,
        "cleaning": 3,
        "shopping": 2
    }
    
    intensity_multiplier = {
        "low": 0.8,
        "moderate": 1.0,
        "high": 1.3
    }
    
    activity_type = activity.get("activity_type", "walking")
    calories = int(base_calories.get(activity_type, 4) * duration * intensity_multiplier.get(intensity, 1.0))
    
    return {
        "success": True,
        "message": f"Atividade registrada com sucesso! {calories} calorias queimadas.",
        "activity_logged": activity,
        "calories_burned": calories,
        "rebalance_triggered": True,
        "new_calorie_target": 2000 + calories
    }

@app.post("/fulltime/toggle-status/{user_id}")
async def toggle_fulltime_status(user_id: str):
    """Alterna status do Sistema Full-time"""
    return {
        "success": True,
        "message": "Sistema Full-time ativado com sucesso!",
        "new_status": True
    }

# Endpoints de sistema

@app.get("/metrics")
async def get_metrics():
    """Métricas do sistema"""
    return {
        "api_version": "1.0.0",
        "uptime": "2h 15m",
        "total_requests": 1247,
        "active_users": 1,
        "database_status": "healthy",
        "cache_hit_rate": 0.85,
        "average_response_time": "45ms",
        "error_rate": 0.02
    }

# Handler de erros
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "Erro interno do servidor",
            "status_code": 500,
            "timestamp": datetime.now().isoformat()
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

