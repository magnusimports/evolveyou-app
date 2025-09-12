from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
import json
from datetime import datetime, timedelta
import random

fitness_bp = Blueprint('fitness', __name__)

# Dados mockados para demonstração
MOCK_USER_DATA = {
    "profile": {
        "name": "Ana Silva",
        "age": 30,
        "height": 175,
        "current_weight": 75,
        "target_weight": 70,
        "activity_level": "moderately_active",
        "goal": "weight_loss"
    },
    "metrics": {
        "bmr": 1763,
        "tdee": 2732,
        "target_calories": 2459,
        "current_calories": 1847,
        "water_intake": 1.8,
        "water_target": 2.5,
        "steps": 2453,
        "distance": 1.82
    }
}

@fitness_bp.route('/profile', methods=['GET'])
@cross_origin()
def get_profile():
    """Retorna o perfil do usuário"""
    return jsonify({
        "success": True,
        "data": MOCK_USER_DATA["profile"]
    })

@fitness_bp.route('/metrics', methods=['GET'])
@cross_origin()
def get_metrics():
    """Retorna as métricas diárias do usuário"""
    return jsonify({
        "success": True,
        "data": MOCK_USER_DATA["metrics"]
    })

@fitness_bp.route('/activity-rings', methods=['GET'])
@cross_origin()
def get_activity_rings():
    """Retorna os dados dos círculos de atividade"""
    return jsonify({
        "success": True,
        "data": {
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
    })

@fitness_bp.route('/nutrition', methods=['GET'])
@cross_origin()
def get_nutrition():
    """Retorna dados nutricionais do dia"""
    return jsonify({
        "success": True,
        "data": {
            "calories": {
                "consumed": 1847,
                "target": 2459,
                "remaining": 612
            },
            "macros": {
                "protein": {"current": 89, "target": 123},
                "carbs": {"current": 156, "target": 199},
                "fat": {"current": 45, "target": 67}
            },
            "meals": [
                {
                    "name": "Café da Manhã",
                    "items": [
                        {"name": "Aveia com frutas", "calories": 320, "completed": True},
                        {"name": "Café com leite", "calories": 85, "completed": True}
                    ]
                },
                {
                    "name": "Almoço",
                    "items": [
                        {"name": "Peito de frango grelhado", "calories": 285, "completed": True},
                        {"name": "Arroz integral", "calories": 180, "completed": True},
                        {"name": "Salada verde", "calories": 45, "completed": True}
                    ]
                },
                {
                    "name": "Lanche",
                    "items": [
                        {"name": "Iogurte grego", "calories": 120, "completed": True},
                        {"name": "Castanhas", "calories": 95, "completed": False}
                    ]
                },
                {
                    "name": "Jantar",
                    "items": [
                        {"name": "Salmão grelhado", "calories": 250, "completed": False},
                        {"name": "Batata doce", "calories": 130, "completed": False},
                        {"name": "Brócolis", "calories": 35, "completed": False}
                    ]
                }
            ]
        }
    })

@fitness_bp.route('/workouts', methods=['GET'])
@cross_origin()
def get_workouts():
    """Retorna planos de treino"""
    return jsonify({
        "success": True,
        "data": {
            "progress": {
                "completed": 12,
                "total": 15,
                "percentage": 80,
                "streak": 7
            },
            "today": {
                "day": "Quinta-feira",
                "title": "Pernas • Moderado",
                "exercises": 6,
                "duration": 45,
                "calories": 380,
                "is_today": True
            },
            "upcoming": [
                {
                    "day": "Sexta-feira",
                    "title": "Cardio • Intenso",
                    "exercises": 1,
                    "duration": 30,
                    "calories": 320
                },
                {
                    "day": "Sábado",
                    "title": "Peito & Tríceps",
                    "exercises": 5,
                    "duration": 50,
                    "calories": 420
                },
                {
                    "day": "Domingo",
                    "title": "Descanso Ativo",
                    "exercises": 3,
                    "duration": 20,
                    "calories": None
                }
            ],
            "completed": [
                {
                    "day": "Quarta-feira",
                    "title": "Costas & Bíceps",
                    "exercises": 4,
                    "duration": 45,
                    "calories": 385,
                    "completed": True
                },
                {
                    "day": "Terça-feira",
                    "title": "Ombros & Core",
                    "exercises": 5,
                    "duration": 40,
                    "calories": 295,
                    "completed": True
                },
                {
                    "day": "Segunda-feira",
                    "title": "Peito & Tríceps",
                    "exercises": 4,
                    "duration": 45,
                    "calories": 410,
                    "completed": True
                }
            ]
        }
    })

@fitness_bp.route('/coach/chat', methods=['POST'])
@cross_origin()
def coach_chat():
    """Endpoint para chat com o Coach EVO"""
    data = request.get_json()
    user_message = data.get('message', '')
    
    # Respostas mockadas do Coach EVO
    responses = [
        "Ótima pergunta! Baseado no seu perfil, recomendo focar em exercícios compostos para maximizar a queima calórica.",
        "Vi que você está progredindo bem! Que tal aumentarmos a intensidade do treino de amanhã?",
        "Lembre-se de manter a hidratação em dia. Você já bebeu água suficiente hoje?",
        "Seu progresso está excelente! Continue assim e você alcançará sua meta em breve.",
        "Posso sugerir algumas alternativas saudáveis para o lanche da tarde. Quer ver as opções?"
    ]
    
    response = random.choice(responses)
    
    return jsonify({
        "success": True,
        "data": {
            "message": response,
            "timestamp": datetime.now().strftime("%H:%M"),
            "type": "coach_response"
        }
    })

@fitness_bp.route('/stats/charts', methods=['GET'])
@cross_origin()
def get_chart_data():
    """Retorna dados para gráficos"""
    # Gerar dados mockados para gráficos
    steps_data = [random.randint(15, 90) for _ in range(12)]
    distance_data = [random.randint(10, 80) for _ in range(12)]
    
    return jsonify({
        "success": True,
        "data": {
            "steps": steps_data,
            "distance": distance_data,
            "labels": ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"]
        }
    })

@fitness_bp.route('/calculate-bmr', methods=['POST'])
@cross_origin()
def calculate_bmr():
    """Calcula a Taxa Metabólica Basal"""
    data = request.get_json()
    
    weight = data.get('weight', 75)
    height = data.get('height', 175)
    age = data.get('age', 30)
    gender = data.get('gender', 'female')
    activity_level = data.get('activity_level', 'moderately_active')
    
    # Fórmula de Harris-Benedict
    if gender == 'male':
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    else:
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    
    # Fatores de atividade
    activity_factors = {
        'sedentary': 1.2,
        'lightly_active': 1.375,
        'moderately_active': 1.55,
        'very_active': 1.725,
        'extremely_active': 1.9
    }
    
    tdee = bmr * activity_factors.get(activity_level, 1.55)
    
    return jsonify({
        "success": True,
        "data": {
            "bmr": round(bmr),
            "tdee": round(tdee),
            "target_calories": round(tdee * 0.9)  # 10% deficit para perda de peso
        }
    })

