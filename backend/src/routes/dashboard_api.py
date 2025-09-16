"""
Dashboard API - EvolveYou Backend
Endpoints para fornecer dados do dashboard (métricas, progresso, etc.)
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import random
import math

dashboard_api = Blueprint('dashboard_api', __name__)

def calculate_bmr(weight, height, age, gender):
    """Calcula Taxa Metabólica Basal usando fórmula de Mifflin-St Jeor"""
    if gender.lower() == 'masculino':
        return 10 * weight + 6.25 * height - 5 * age + 5
    else:
        return 10 * weight + 6.25 * height - 5 * age - 161

def calculate_daily_calories(bmr, activity_level, goal):
    """Calcula calorias diárias baseado no BMR, nível de atividade e objetivo"""
    activity_multipliers = {
        'sedentario': 1.2,
        'leve': 1.375,
        'moderado': 1.55,
        'intenso': 1.725,
        'muito_intenso': 1.9
    }
    
    base_calories = bmr * activity_multipliers.get(activity_level, 1.55)
    
    # Ajustar baseado no objetivo
    if goal == 'perder_peso':
        return int(base_calories * 0.85)  # Déficit de 15%
    elif goal == 'ganhar_peso':
        return int(base_calories * 1.15)  # Superávit de 15%
    else:
        return int(base_calories)  # Manutenção

def calculate_macros(calories, goal):
    """Calcula distribuição de macronutrientes"""
    if goal == 'ganhar_peso':
        # Mais proteína para ganho de massa
        protein_ratio = 0.30
        carbs_ratio = 0.45
        fat_ratio = 0.25
    elif goal == 'perder_peso':
        # Mais proteína para preservar massa magra
        protein_ratio = 0.35
        carbs_ratio = 0.35
        fat_ratio = 0.30
    else:
        # Distribuição equilibrada
        protein_ratio = 0.25
        carbs_ratio = 0.50
        fat_ratio = 0.25
    
    return {
        'protein': int((calories * protein_ratio) / 4),  # 4 cal/g
        'carbs': int((calories * carbs_ratio) / 4),      # 4 cal/g
        'fat': int((calories * fat_ratio) / 9)           # 9 cal/g
    }

@dashboard_api.route('/api/dashboard/metrics/<user_id>', methods=['GET'])
def get_dashboard_metrics(user_id):
    """Retorna métricas do dashboard para o usuário"""
    try:
        # Simular dados baseados no perfil do usuário
        # Em produção, estes dados viriam do Firestore
        
        # Dados base simulados (em produção viriam da anamnese)
        user_profile = {
            'weight': 75,
            'height': 175,
            'age': 30,
            'gender': 'masculino',
            'activity_level': 'moderado',
            'goal': 'perder_peso'
        }
        
        # Calcular métricas
        bmr = calculate_bmr(
            user_profile['weight'],
            user_profile['height'], 
            user_profile['age'],
            user_profile['gender']
        )
        
        daily_calories = calculate_daily_calories(
            bmr,
            user_profile['activity_level'],
            user_profile['goal']
        )
        
        macros = calculate_macros(daily_calories, user_profile['goal'])
        
        # Simular progresso atual do dia
        current_hour = datetime.now().hour
        progress_factor = min(current_hour / 24, 0.8)  # Máximo 80% de progresso
        
        current_intake = {
            'calories': int(daily_calories * progress_factor * random.uniform(0.7, 1.2)),
            'protein': int(macros['protein'] * progress_factor * random.uniform(0.6, 1.1)),
            'carbs': int(macros['carbs'] * progress_factor * random.uniform(0.8, 1.3)),
            'fat': int(macros['fat'] * progress_factor * random.uniform(0.7, 1.2))
        }
        
        # Círculos de atividade
        activity_rings = {
            'movement': {
                'current': int(400 * progress_factor * random.uniform(0.8, 1.2)),
                'goal': 400,
                'unit': 'cal'
            },
            'exercise': {
                'current': int(30 * progress_factor * random.uniform(0.5, 1.5)),
                'goal': 30,
                'unit': 'min'
            },
            'stand': {
                'current': int(12 * progress_factor * random.uniform(0.7, 1.0)),
                'goal': 12,
                'unit': 'h'
            }
        }
        
        # Métricas adicionais
        additional_metrics = {
            'steps': int(8000 * progress_factor * random.uniform(0.8, 1.3)),
            'distance': round(6.5 * progress_factor * random.uniform(0.8, 1.2), 1),
            'water_intake': int(2000 * progress_factor * random.uniform(0.6, 1.1)),
            'sleep_hours': round(7.5 + random.uniform(-1, 1), 1),
            'weight_current': user_profile['weight'] + random.uniform(-0.5, 0.5)
        }
        
        return jsonify({
            'success': True,
            'data': {
                'user_id': user_id,
                'date': datetime.now().isoformat(),
                'bmr': bmr,
                'daily_calories': daily_calories,
                'macros': macros,
                'current_intake': current_intake,
                'activity_rings': activity_rings,
                'metrics': additional_metrics,
                'profile': user_profile
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@dashboard_api.route('/api/dashboard/activity-rings/<user_id>', methods=['GET'])
def get_activity_rings(user_id):
    """Retorna dados específicos dos círculos de atividade"""
    try:
        current_hour = datetime.now().hour
        progress_factor = min(current_hour / 24, 0.9)
        
        rings = {
            'movement': {
                'current': int(400 * progress_factor * random.uniform(0.8, 1.2)),
                'goal': 400,
                'unit': 'cal',
                'percentage': min(100, int(100 * progress_factor * random.uniform(0.8, 1.2)))
            },
            'exercise': {
                'current': int(30 * progress_factor * random.uniform(0.5, 1.5)),
                'goal': 30,
                'unit': 'min',
                'percentage': min(100, int(100 * progress_factor * random.uniform(0.5, 1.5)))
            },
            'stand': {
                'current': int(12 * progress_factor * random.uniform(0.7, 1.0)),
                'goal': 12,
                'unit': 'h',
                'percentage': min(100, int(100 * progress_factor * random.uniform(0.7, 1.0)))
            }
        }
        
        return jsonify({
            'success': True,
            'data': rings
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@dashboard_api.route('/api/dashboard/weekly-progress/<user_id>', methods=['GET'])
def get_weekly_progress(user_id):
    """Retorna progresso semanal do usuário"""
    try:
        # Gerar dados dos últimos 7 dias
        weekly_data = []
        today = datetime.now()
        
        for i in range(7):
            date = today - timedelta(days=6-i)
            day_progress = {
                'date': date.strftime('%Y-%m-%d'),
                'day_name': date.strftime('%a'),
                'calories_consumed': random.randint(1800, 2200),
                'calories_goal': 2000,
                'exercise_minutes': random.randint(20, 60),
                'exercise_goal': 30,
                'steps': random.randint(6000, 12000),
                'steps_goal': 8000,
                'water_ml': random.randint(1500, 2500),
                'water_goal': 2000
            }
            weekly_data.append(day_progress)
        
        return jsonify({
            'success': True,
            'data': weekly_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@dashboard_api.route('/api/dashboard/achievements/<user_id>', methods=['GET'])
def get_achievements(user_id):
    """Retorna conquistas e prêmios do usuário"""
    try:
        achievements = [
            {
                'id': 'first_workout',
                'title': 'Primeiro Treino',
                'description': 'Complete seu primeiro treino',
                'icon': '🏃‍♂️',
                'unlocked': True,
                'date_unlocked': '2025-09-10'
            },
            {
                'id': 'week_streak',
                'title': 'Semana Consistente',
                'description': 'Treine por 7 dias seguidos',
                'icon': '🔥',
                'unlocked': True,
                'date_unlocked': '2025-09-14'
            },
            {
                'id': 'calorie_goal',
                'title': 'Meta de Calorias',
                'description': 'Atinja sua meta de calorias por 5 dias',
                'icon': '🎯',
                'unlocked': False,
                'progress': 3,
                'total': 5
            },
            {
                'id': 'water_master',
                'title': 'Mestre da Hidratação',
                'description': 'Beba 2L de água por 10 dias',
                'icon': '💧',
                'unlocked': False,
                'progress': 7,
                'total': 10
            }
        ]
        
        return jsonify({
            'success': True,
            'data': achievements
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

