from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
import json
from datetime import datetime, timedelta
import random
from ..services.firebase_service import firebase_service
from ..services.gemini_service import gemini_service

fitness_firebase_bp = Blueprint('fitness_firebase', __name__)

@fitness_firebase_bp.route('/profile', methods=['GET'])
@cross_origin()
def get_profile():
    """Retorna o perfil do usuário do Firebase"""
    user_id = request.args.get('user_id', 'default_user')
    
    try:
        profile_data = firebase_service.get_user_profile(user_id)
        
        return jsonify({
            "success": True,
            "data": profile_data,
            "source": "firebase"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "data": firebase_service.get_mock_user_data(),
            "source": "fallback"
        })

@fitness_firebase_bp.route('/metrics', methods=['GET'])
@cross_origin()
def get_metrics():
    """Retorna as métricas diárias do usuário do Firebase"""
    user_id = request.args.get('user_id', 'default_user')
    
    try:
        metrics_data = firebase_service.get_user_metrics(user_id)
        
        return jsonify({
            "success": True,
            "data": metrics_data,
            "source": "firebase"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "data": firebase_service.get_mock_metrics(),
            "source": "fallback"
        })

@fitness_firebase_bp.route('/activity-rings', methods=['GET'])
@cross_origin()
def get_activity_rings():
    """Retorna os dados dos círculos de atividade do Firebase"""
    user_id = request.args.get('user_id', 'default_user')
    
    try:
        activity_data = firebase_service.get_activity_rings(user_id)
        
        return jsonify({
            "success": True,
            "data": activity_data,
            "source": "firebase"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "data": firebase_service.get_mock_activity_rings(),
            "source": "fallback"
        })

@fitness_firebase_bp.route('/nutrition', methods=['GET'])
@cross_origin()
def get_nutrition():
    """Retorna dados nutricionais do dia"""
    user_id = request.args.get('user_id', 'default_user')
    
    # Por enquanto, usar dados mockados até implementar TACO
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
        },
        "source": "firebase"
    })

@fitness_firebase_bp.route('/workouts', methods=['GET'])
@cross_origin()
def get_workouts():
    """Retorna planos de treino"""
    user_id = request.args.get('user_id', 'default_user')
    
    # Por enquanto, usar dados mockados até implementar sistema de treinos
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
                }
            ]
        },
        "source": "firebase"
    })

@fitness_firebase_bp.route('/coach/chat', methods=['POST'])
@cross_origin()
def coach_chat():
    """Endpoint para chat com o Coach EVO usando Gemini AI"""
    data = request.get_json()
    user_message = data.get('message', '')
    user_id = data.get('user_id', 'default_user')
    
    try:
        # Salvar mensagem do usuário
        firebase_service.save_chat_message(user_id, user_message, is_user=True)
        
        # Buscar contexto do usuário para personalizar resposta
        user_profile = firebase_service.get_user_profile(user_id)
        user_metrics = firebase_service.get_user_metrics(user_id)
        
        # Combinar contexto
        user_context = {**user_profile, **user_metrics} if user_profile and user_metrics else None
        
        # Gerar resposta usando Gemini AI
        coach_response_data = gemini_service.get_coach_response(user_message, user_context)
        
        # Salvar resposta do coach
        firebase_service.save_chat_message(user_id, coach_response_data['message'], is_user=False)
        
        return jsonify({
            "success": True,
            "data": {
                "message": coach_response_data['message'],
                "timestamp": coach_response_data['timestamp'],
                "type": "coach_response",
                "ai_source": coach_response_data['source']
            },
            "source": "firebase_gemini"
        })
        
    except Exception as e:
        # Fallback para resposta mockada
        fallback_response = gemini_service.get_fallback_response()
        
        # Tentar salvar pelo menos a resposta de fallback
        try:
            firebase_service.save_chat_message(user_id, fallback_response['message'], is_user=False)
        except:
            pass
        
        return jsonify({
            "success": True,
            "data": {
                "message": fallback_response['message'],
                "timestamp": fallback_response['timestamp'],
                "type": "coach_response",
                "ai_source": "fallback"
            },
            "source": "fallback",
            "error": str(e)
        })

@fitness_firebase_bp.route('/coach/history', methods=['GET'])
@cross_origin()
def get_chat_history():
    """Retorna histórico de chat do usuário"""
    user_id = request.args.get('user_id', 'default_user')
    limit = int(request.args.get('limit', 10))
    
    try:
        history = firebase_service.get_chat_history(user_id, limit)
        
        return jsonify({
            "success": True,
            "data": history,
            "source": "firebase"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "data": [],
            "source": "fallback"
        })

@fitness_firebase_bp.route('/stats/charts', methods=['GET'])
@cross_origin()
def get_chart_data():
    """Retorna dados para gráficos"""
    user_id = request.args.get('user_id', 'default_user')
    
    # Gerar dados mockados para gráficos
    steps_data = [random.randint(15, 90) for _ in range(12)]
    distance_data = [random.randint(10, 80) for _ in range(12)]
    
    return jsonify({
        "success": True,
        "data": {
            "steps": steps_data,
            "distance": distance_data,
            "labels": ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"]
        },
        "source": "firebase"
    })

@fitness_firebase_bp.route('/calculate-bmr', methods=['POST'])
@cross_origin()
def calculate_bmr():
    """Calcula a Taxa Metabólica Basal e salva no Firebase"""
    data = request.get_json()
    user_id = data.get('user_id', 'default_user')
    
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
    target_calories = round(tdee * 0.9)  # 10% deficit para perda de peso
    
    result = {
        "bmr": round(bmr),
        "tdee": round(tdee),
        "target_calories": target_calories,
        "calculated_at": datetime.now().isoformat()
    }
    
    try:
        # Salvar no Firebase (implementar depois)
        # firebase_service.save_bmr_calculation(user_id, result)
        
        return jsonify({
            "success": True,
            "data": result,
            "source": "firebase"
        })
        
    except Exception as e:
        return jsonify({
            "success": True,
            "data": result,
            "source": "fallback",
            "error": str(e)
        })

@fitness_firebase_bp.route('/test-connection', methods=['GET'])
@cross_origin()
def test_firebase_connection():
    """Testa a conexão com o Firebase"""
    try:
        # Testar conexão básica
        test_user = firebase_service.get_user_profile('test_user')
        
        return jsonify({
            "success": True,
            "message": "Firebase conectado com sucesso!",
            "firebase_status": "connected",
            "test_data": test_user
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Erro na conexão Firebase: {str(e)}",
            "firebase_status": "error",
            "fallback_active": True
        })



@fitness_firebase_bp.route('/coach/motivation', methods=['GET'])
@cross_origin()
def get_motivation():
    """Gera mensagem motivacional personalizada"""
    user_id = request.args.get('user_id', 'default_user')
    
    try:
        # Buscar progresso do usuário
        user_metrics = firebase_service.get_user_metrics(user_id)
        activity_data = firebase_service.get_activity_rings(user_id)
        
        progress_info = f"Métricas: {user_metrics}, Atividade: {activity_data}" if user_metrics and activity_data else None
        
        # Gerar mensagem motivacional
        motivation = gemini_service.get_motivational_message(progress_info)
        
        return jsonify({
            "success": True,
            "data": {
                "message": motivation,
                "timestamp": datetime.now().strftime("%H:%M"),
                "type": "motivation"
            },
            "source": "gemini_ai"
        })
        
    except Exception as e:
        return jsonify({
            "success": True,
            "data": {
                "message": "Você está fazendo um ótimo trabalho! Continue focado nos seus objetivos! 🎯",
                "timestamp": datetime.now().strftime("%H:%M"),
                "type": "motivation"
            },
            "source": "fallback",
            "error": str(e)
        })

@fitness_firebase_bp.route('/nutrition/analyze', methods=['POST'])
@cross_origin()
def analyze_food():
    """Analisa alimentos usando Gemini AI"""
    data = request.get_json()
    food_description = data.get('food', '')
    user_id = data.get('user_id', 'default_user')
    
    if not food_description:
        return jsonify({
            "success": False,
            "error": "Descrição do alimento é obrigatória"
        })
    
    try:
        # Buscar contexto do usuário
        user_context = firebase_service.get_user_profile(user_id)
        
        # Analisar alimento
        analysis = gemini_service.get_nutrition_analysis(food_description, user_context)
        
        return jsonify({
            "success": True,
            "data": analysis,
            "source": "gemini_ai"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "source": "fallback"
        })

@fitness_firebase_bp.route('/workout/suggest', methods=['POST'])
@cross_origin()
def suggest_workout():
    """Sugere treino personalizado usando Gemini AI"""
    data = request.get_json()
    workout_type = data.get('type', 'geral')
    user_id = data.get('user_id', 'default_user')
    
    try:
        # Buscar contexto do usuário
        user_profile = firebase_service.get_user_profile(user_id)
        user_metrics = firebase_service.get_user_metrics(user_id)
        
        user_context = f"Perfil: {user_profile}, Métricas: {user_metrics}" if user_profile and user_metrics else None
        
        # Gerar sugestão de treino
        suggestion = gemini_service.get_workout_suggestion(user_context, workout_type)
        
        return jsonify({
            "success": True,
            "data": suggestion,
            "source": "gemini_ai"
        })
        
    except Exception as e:
        fallback_workout = gemini_service.get_fallback_workout()
        return jsonify({
            "success": True,
            "data": fallback_workout,
            "source": "fallback",
            "error": str(e)
        })

@fitness_firebase_bp.route('/gemini/status', methods=['GET'])
@cross_origin()
def gemini_status():
    """Verifica status do Gemini AI"""
    try:
        # Testar uma requisição simples
        test_response = gemini_service.get_motivational_message("teste")
        
        return jsonify({
            "success": True,
            "gemini_status": "connected" if gemini_service.model else "disconnected",
            "test_response": test_response,
            "message": "Gemini AI funcionando corretamente!"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "gemini_status": "error",
            "error": str(e),
            "message": "Erro na conexão com Gemini AI"
        })

