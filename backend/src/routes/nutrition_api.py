"""
Nutrition API - EvolveYou Backend
Endpoints para planos nutricionais personalizados
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import random

nutrition_api = Blueprint('nutrition_api', __name__)

def calculate_nutrition_plan(user_profile):
    """Gera plano nutricional baseado no perfil do usuário"""
    
    # Base de alimentos brasileiros (TACO)
    foods_db = {
        'proteinas': [
            {'name': 'Peito de Frango', 'calories_per_100g': 165, 'protein': 31, 'carbs': 0, 'fat': 3.6, 'fiber': 0},
            {'name': 'Ovo Inteiro', 'calories_per_100g': 155, 'protein': 13, 'carbs': 1.6, 'fat': 11, 'fiber': 0},
            {'name': 'Salmão', 'calories_per_100g': 208, 'protein': 25, 'carbs': 0, 'fat': 12, 'fiber': 0},
            {'name': 'Carne Bovina Magra', 'calories_per_100g': 190, 'protein': 26, 'carbs': 0, 'fat': 9, 'fiber': 0},
            {'name': 'Tilápia', 'calories_per_100g': 96, 'protein': 20, 'carbs': 0, 'fat': 1.7, 'fiber': 0},
            {'name': 'Peito de Peru', 'calories_per_100g': 135, 'protein': 30, 'carbs': 0, 'fat': 1.2, 'fiber': 0}
        ],
        'carboidratos': [
            {'name': 'Arroz Integral', 'calories_per_100g': 124, 'protein': 2.6, 'carbs': 25, 'fat': 1, 'fiber': 2.7},
            {'name': 'Batata Doce', 'calories_per_100g': 118, 'protein': 2, 'carbs': 28, 'fat': 0.1, 'fiber': 3},
            {'name': 'Aveia', 'calories_per_100g': 394, 'protein': 13.9, 'carbs': 67, 'fat': 8.5, 'fiber': 9.1},
            {'name': 'Quinoa', 'calories_per_100g': 368, 'protein': 14.1, 'carbs': 64, 'fat': 6.1, 'fiber': 7},
            {'name': 'Pão Integral', 'calories_per_100g': 253, 'protein': 13, 'carbs': 43, 'fat': 4.2, 'fiber': 6.9},
            {'name': 'Macarrão Integral', 'calories_per_100g': 124, 'protein': 5, 'carbs': 25, 'fat': 1.1, 'fiber': 3.2}
        ],
        'gorduras': [
            {'name': 'Abacate', 'calories_per_100g': 96, 'protein': 1.2, 'carbs': 6, 'fat': 8.4, 'fiber': 6.3},
            {'name': 'Azeite Extra Virgem', 'calories_per_100g': 884, 'protein': 0, 'carbs': 0, 'fat': 100, 'fiber': 0},
            {'name': 'Castanha do Brasil', 'calories_per_100g': 643, 'protein': 14, 'carbs': 15, 'fat': 63, 'fiber': 7.9},
            {'name': 'Amendoim', 'calories_per_100g': 544, 'protein': 27, 'carbs': 20, 'fat': 43, 'fiber': 8.0},
            {'name': 'Salmão', 'calories_per_100g': 208, 'protein': 25, 'carbs': 0, 'fat': 12, 'fiber': 0},
            {'name': 'Azeite de Oliva', 'calories_per_100g': 884, 'protein': 0, 'carbs': 0, 'fat': 100, 'fiber': 0}
        ],
        'vegetais': [
            {'name': 'Brócolis', 'calories_per_100g': 25, 'protein': 3, 'carbs': 4, 'fat': 0.4, 'fiber': 3.4},
            {'name': 'Espinafre', 'calories_per_100g': 23, 'protein': 2.9, 'carbs': 3.6, 'fat': 0.4, 'fiber': 2.2},
            {'name': 'Couve', 'calories_per_100g': 24, 'protein': 2.9, 'carbs': 4.3, 'fat': 0.4, 'fiber': 3.1},
            {'name': 'Tomate', 'calories_per_100g': 15, 'protein': 1.1, 'carbs': 3.1, 'fat': 0.2, 'fiber': 1.2},
            {'name': 'Cenoura', 'calories_per_100g': 34, 'protein': 1.3, 'carbs': 7.7, 'fat': 0.2, 'fiber': 3.2},
            {'name': 'Abobrinha', 'calories_per_100g': 20, 'protein': 1.2, 'carbs': 4.3, 'fat': 0.2, 'fiber': 1.1}
        ],
        'frutas': [
            {'name': 'Banana', 'calories_per_100g': 98, 'protein': 1.1, 'carbs': 26, 'fat': 0.2, 'fiber': 2.3},
            {'name': 'Maçã', 'calories_per_100g': 56, 'protein': 0.3, 'carbs': 15, 'fat': 0.2, 'fiber': 2.7},
            {'name': 'Morango', 'calories_per_100g': 30, 'protein': 0.9, 'carbs': 6.8, 'fat': 0.4, 'fiber': 1.7},
            {'name': 'Laranja', 'calories_per_100g': 52, 'protein': 0.9, 'carbs': 13, 'fat': 0.2, 'fiber': 2.2},
            {'name': 'Mamão', 'calories_per_100g': 45, 'protein': 0.8, 'carbs': 11, 'fat': 0.1, 'fiber': 1.8},
            {'name': 'Abacaxi', 'calories_per_100g': 48, 'protein': 0.9, 'carbs': 12, 'fat': 0.1, 'fiber': 1.4}
        ]
    }
    
    # Calcular necessidades nutricionais
    daily_calories = user_profile.get('daily_calories', 2000)
    goal = user_profile.get('goal', 'manutencao')
    
    # Distribuição de macronutrientes baseada no objetivo
    if goal == 'ganhar_peso':
        protein_ratio = 0.25
        carbs_ratio = 0.50
        fat_ratio = 0.25
    elif goal == 'perder_peso':
        protein_ratio = 0.30
        carbs_ratio = 0.40
        fat_ratio = 0.30
    else:  # manutenção
        protein_ratio = 0.25
        carbs_ratio = 0.45
        fat_ratio = 0.30
    
    target_macros = {
        'protein': int((daily_calories * protein_ratio) / 4),  # 4 cal/g
        'carbs': int((daily_calories * carbs_ratio) / 4),      # 4 cal/g
        'fat': int((daily_calories * fat_ratio) / 9)           # 9 cal/g
    }
    
    # Gerar plano de refeições
    meals = []
    
    # Café da manhã (25% das calorias)
    breakfast_calories = int(daily_calories * 0.25)
    breakfast = {
        'name': 'Café da Manhã',
        'time': '07:00',
        'calories': breakfast_calories,
        'foods': [
            {
                'food': random.choice(foods_db['carboidratos']),
                'quantity': 50,
                'unit': 'g'
            },
            {
                'food': random.choice(foods_db['proteinas']),
                'quantity': 30,
                'unit': 'g'
            },
            {
                'food': random.choice(foods_db['frutas']),
                'quantity': 100,
                'unit': 'g'
            }
        ]
    }
    meals.append(breakfast)
    
    # Lanche da manhã (10% das calorias)
    morning_snack = {
        'name': 'Lanche da Manhã',
        'time': '10:00',
        'calories': int(daily_calories * 0.10),
        'foods': [
            {
                'food': random.choice(foods_db['frutas']),
                'quantity': 150,
                'unit': 'g'
            },
            {
                'food': random.choice(foods_db['gorduras']),
                'quantity': 10,
                'unit': 'g'
            }
        ]
    }
    meals.append(morning_snack)
    
    # Almoço (30% das calorias)
    lunch = {
        'name': 'Almoço',
        'time': '12:30',
        'calories': int(daily_calories * 0.30),
        'foods': [
            {
                'food': random.choice(foods_db['proteinas']),
                'quantity': 120,
                'unit': 'g'
            },
            {
                'food': random.choice(foods_db['carboidratos']),
                'quantity': 80,
                'unit': 'g'
            },
            {
                'food': random.choice(foods_db['vegetais']),
                'quantity': 150,
                'unit': 'g'
            },
            {
                'food': random.choice(foods_db['gorduras']),
                'quantity': 5,
                'unit': 'ml'
            }
        ]
    }
    meals.append(lunch)
    
    # Lanche da tarde (10% das calorias)
    afternoon_snack = {
        'name': 'Lanche da Tarde',
        'time': '15:30',
        'calories': int(daily_calories * 0.10),
        'foods': [
            {
                'food': random.choice(foods_db['proteinas']),
                'quantity': 30,
                'unit': 'g'
            },
            {
                'food': random.choice(foods_db['carboidratos']),
                'quantity': 25,
                'unit': 'g'
            }
        ]
    }
    meals.append(afternoon_snack)
    
    # Jantar (25% das calorias)
    dinner = {
        'name': 'Jantar',
        'time': '19:00',
        'calories': int(daily_calories * 0.25),
        'foods': [
            {
                'food': random.choice(foods_db['proteinas']),
                'quantity': 100,
                'unit': 'g'
            },
            {
                'food': random.choice(foods_db['vegetais']),
                'quantity': 200,
                'unit': 'g'
            },
            {
                'food': random.choice(foods_db['carboidratos']),
                'quantity': 50,
                'unit': 'g'
            },
            {
                'food': random.choice(foods_db['gorduras']),
                'quantity': 10,
                'unit': 'g'
            }
        ]
    }
    meals.append(dinner)
    
    # Calcular totais do plano
    total_calories = sum(meal['calories'] for meal in meals)
    
    return {
        'daily_calories': daily_calories,
        'target_macros': target_macros,
        'meals': meals,
        'total_calories': total_calories,
        'meal_count': len(meals)
    }

@nutrition_api.route('/api/nutrition/plan/<user_id>', methods=['GET'])
def get_nutrition_plan(user_id):
    """Retorna plano nutricional personalizado para o usuário"""
    try:
        # Simular perfil do usuário (em produção viria do Firestore)
        user_profile = {
            'daily_calories': 2000,
            'goal': 'perder_peso',
            'dietary_restrictions': [],
            'meal_preferences': 'tradicional'
        }
        
        # Gerar plano personalizado
        nutrition_plan = calculate_nutrition_plan(user_profile)
        
        return jsonify({
            'success': True,
            'data': {
                'user_id': user_id,
                'plan': nutrition_plan,
                'created_at': datetime.now().isoformat(),
                'valid_until': (datetime.now() + timedelta(days=7)).isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@nutrition_api.route('/api/nutrition/intake/<user_id>', methods=['GET'])
def get_current_intake(user_id):
    """Retorna consumo atual do dia"""
    try:
        # Simular consumo baseado no horário
        current_hour = datetime.now().hour
        progress_factor = min(current_hour / 24, 0.8)
        
        target_calories = 2000
        target_macros = {
            'protein': 150,
            'carbs': 200,
            'fat': 67
        }
        
        current_intake = {
            'calories': int(target_calories * progress_factor * random.uniform(0.7, 1.2)),
            'protein': int(target_macros['protein'] * progress_factor * random.uniform(0.6, 1.1)),
            'carbs': int(target_macros['carbs'] * progress_factor * random.uniform(0.8, 1.3)),
            'fat': int(target_macros['fat'] * progress_factor * random.uniform(0.7, 1.2)),
            'water': int(2000 * progress_factor * random.uniform(0.6, 1.1)),
            'fiber': int(25 * progress_factor * random.uniform(0.5, 1.0))
        }
        
        # Calcular percentuais
        percentages = {
            'calories': min(100, round((current_intake['calories'] / target_calories) * 100, 1)),
            'protein': min(100, round((current_intake['protein'] / target_macros['protein']) * 100, 1)),
            'carbs': min(100, round((current_intake['carbs'] / target_macros['carbs']) * 100, 1)),
            'fat': min(100, round((current_intake['fat'] / target_macros['fat']) * 100, 1)),
            'water': min(100, round((current_intake['water'] / 2000) * 100, 1))
        }
        
        return jsonify({
            'success': True,
            'data': {
                'user_id': user_id,
                'date': datetime.now().strftime('%Y-%m-%d'),
                'current_intake': current_intake,
                'targets': {
                    'calories': target_calories,
                    'protein': target_macros['protein'],
                    'carbs': target_macros['carbs'],
                    'fat': target_macros['fat'],
                    'water': 2000,
                    'fiber': 25
                },
                'percentages': percentages
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@nutrition_api.route('/api/nutrition/log-food', methods=['POST'])
def log_food():
    """Registra consumo de alimento"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        food_name = data.get('food_name')
        quantity = data.get('quantity', 100)
        meal_type = data.get('meal_type', 'lanche')
        
        # Em produção, salvaria no Firestore
        log_entry = {
            'user_id': user_id,
            'food_name': food_name,
            'quantity': quantity,
            'meal_type': meal_type,
            'logged_at': datetime.now().isoformat(),
            'date': datetime.now().strftime('%Y-%m-%d')
        }
        
        return jsonify({
            'success': True,
            'message': 'Alimento registrado com sucesso!',
            'data': log_entry
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@nutrition_api.route('/api/nutrition/foods/search', methods=['GET'])
def search_foods():
    """Busca alimentos na base TACO"""
    try:
        query = request.args.get('q', '').lower()
        
        # Base simplificada de alimentos
        all_foods = [
            {'name': 'Peito de Frango', 'calories_per_100g': 165, 'protein': 31, 'carbs': 0, 'fat': 3.6},
            {'name': 'Arroz Integral', 'calories_per_100g': 124, 'protein': 2.6, 'carbs': 25, 'fat': 1},
            {'name': 'Batata Doce', 'calories_per_100g': 118, 'protein': 2, 'carbs': 28, 'fat': 0.1},
            {'name': 'Ovo Inteiro', 'calories_per_100g': 155, 'protein': 13, 'carbs': 1.6, 'fat': 11},
            {'name': 'Banana', 'calories_per_100g': 98, 'protein': 1.1, 'carbs': 26, 'fat': 0.2},
            {'name': 'Aveia', 'calories_per_100g': 394, 'protein': 13.9, 'carbs': 67, 'fat': 8.5},
            {'name': 'Salmão', 'calories_per_100g': 208, 'protein': 25, 'carbs': 0, 'fat': 12},
            {'name': 'Brócolis', 'calories_per_100g': 25, 'protein': 3, 'carbs': 4, 'fat': 0.4}
        ]
        
        # Filtrar alimentos baseado na busca
        if query:
            filtered_foods = [food for food in all_foods if query in food['name'].lower()]
        else:
            filtered_foods = all_foods[:10]  # Limitar a 10 resultados
        
        return jsonify({
            'success': True,
            'data': {
                'query': query,
                'foods': filtered_foods,
                'total': len(filtered_foods)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@nutrition_api.route('/api/nutrition/weekly-progress/<user_id>', methods=['GET'])
def get_weekly_nutrition_progress(user_id):
    """Retorna progresso nutricional semanal"""
    try:
        # Gerar dados dos últimos 7 dias
        weekly_data = []
        today = datetime.now()
        
        for i in range(7):
            date = today - timedelta(days=6-i)
            day_progress = {
                'date': date.strftime('%Y-%m-%d'),
                'day_name': date.strftime('%a'),
                'calories_consumed': random.randint(1600, 2200),
                'calories_goal': 2000,
                'protein_consumed': random.randint(120, 180),
                'protein_goal': 150,
                'water_consumed': random.randint(1500, 2500),
                'water_goal': 2000,
                'meals_logged': random.randint(3, 6)
            }
            weekly_data.append(day_progress)
        
        return jsonify({
            'success': True,
            'data': {
                'user_id': user_id,
                'weekly_progress': weekly_data
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

