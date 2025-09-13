"""
Sistema Full-time - EvolveYou Premium
Permite registro de alimentos e atividades não planejados com reajuste automático
"""

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import logging
from datetime import datetime, date
import json

fulltime_bp = Blueprint('fulltime', __name__)

# Simulação de banco de dados em memória (em produção usar Firebase/Firestore)
user_logs = {}
food_database = {
    'banana': {'calories_per_100g': 89, 'protein_per_100g': 1.1, 'carbs_per_100g': 23, 'fat_per_100g': 0.3},
    'arroz': {'calories_per_100g': 130, 'protein_per_100g': 2.7, 'carbs_per_100g': 28, 'fat_per_100g': 0.3},
    'frango': {'calories_per_100g': 165, 'protein_per_100g': 31, 'carbs_per_100g': 0, 'fat_per_100g': 3.6},
    'aveia': {'calories_per_100g': 389, 'protein_per_100g': 16.9, 'carbs_per_100g': 66, 'fat_per_100g': 6.9}
}

activity_database = {
    'caminhada': {'calories_per_minute': 4.5},
    'corrida': {'calories_per_minute': 12.0},
    'musculacao': {'calories_per_minute': 6.0},
    'natacao': {'calories_per_minute': 8.5},
    'ciclismo': {'calories_per_minute': 7.5}
}

def get_food_info(food_name):
    """
    Obtém informações nutricionais de um alimento
    """
    food_name_lower = food_name.lower()
    return food_database.get(food_name_lower, {
        'calories_per_100g': 100,  # Valor padrão
        'protein_per_100g': 5,
        'carbs_per_100g': 15,
        'fat_per_100g': 2
    })

def get_activity_info(activity_name):
    """
    Obtém informações de gasto calórico de uma atividade
    """
    activity_name_lower = activity_name.lower()
    return activity_database.get(activity_name_lower, {
        'calories_per_minute': 5.0  # Valor padrão
    })

def log_food(user_id, food_item, quantity, unit, calories, macros):
    """
    Registra um alimento no log do usuário
    """
    if user_id not in user_logs:
        user_logs[user_id] = {'foods': [], 'activities': []}
    
    food_log = {
        'timestamp': datetime.now().isoformat(),
        'date': date.today().isoformat(),
        'food_item': food_item,
        'quantity': quantity,
        'unit': unit,
        'calories': calories,
        'macros': macros
    }
    
    user_logs[user_id]['foods'].append(food_log)
    return food_log

def log_activity(user_id, activity, duration, calories_burned):
    """
    Registra uma atividade no log do usuário
    """
    if user_id not in user_logs:
        user_logs[user_id] = {'foods': [], 'activities': []}
    
    activity_log = {
        'timestamp': datetime.now().isoformat(),
        'date': date.today().isoformat(),
        'activity': activity,
        'duration': duration,
        'calories_burned': calories_burned
    }
    
    user_logs[user_id]['activities'].append(activity_log)
    return activity_log

def recalculate_diet_plan(user_id):
    """
    Recalcula o plano alimentar baseado nos alimentos não planejados
    """
    if user_id not in user_logs:
        return {'adjustment': 'Nenhum ajuste necessário'}
    
    today = date.today().isoformat()
    today_foods = [f for f in user_logs[user_id]['foods'] if f['date'] == today]
    
    total_extra_calories = sum(f['calories'] for f in today_foods)
    
    if total_extra_calories > 0:
        # Sugerir redução nas próximas refeições
        adjustment = {
            'type': 'diet_adjustment',
            'extra_calories': total_extra_calories,
            'suggestion': f'Reduza {total_extra_calories} kcal nas próximas refeições para manter o déficit',
            'next_meal_reduction': round(total_extra_calories / 2)  # Dividir entre próximas refeições
        }
    else:
        adjustment = {'adjustment': 'Nenhum ajuste necessário'}
    
    return adjustment

def recalculate_energy_balance(user_id):
    """
    Recalcula o balanço energético baseado nas atividades não planejadas
    """
    if user_id not in user_logs:
        return {'adjustment': 'Nenhum ajuste necessário'}
    
    today = date.today().isoformat()
    today_activities = [a for a in user_logs[user_id]['activities'] if a['date'] == today]
    
    total_extra_burned = sum(a['calories_burned'] for a in today_activities)
    
    if total_extra_burned > 0:
        # Sugerir ajuste no consumo calórico
        adjustment = {
            'type': 'energy_adjustment',
            'extra_burned': total_extra_burned,
            'suggestion': f'Você queimou {total_extra_burned} kcal extras! Pode consumir mais {round(total_extra_burned * 0.5)} kcal hoje',
            'additional_calories_allowed': round(total_extra_burned * 0.5)
        }
    else:
        adjustment = {'adjustment': 'Nenhum ajuste necessário'}
    
    return adjustment

@fulltime_bp.route('/log/food', methods=['POST'])
@cross_origin()
def log_unplanned_food():
    """
    Registra um alimento não planejado e recalcula o plano alimentar
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        food_item = data.get('food_item')
        quantity = float(data.get('quantity', 0))
        unit = data.get('unit', 'g')
        
        # Validar dados
        if not all([user_id, food_item]) or quantity <= 0:
            return jsonify({
                'success': False,
                'message': 'Dados incompletos ou inválidos'
            }), 400
        
        # Obter informações nutricionais do alimento
        food_info = get_food_info(food_item)
        
        # Calcular calorias e macronutrientes
        calories = food_info['calories_per_100g'] * (quantity / 100)
        macros = {
            'protein': food_info['protein_per_100g'] * (quantity / 100),
            'carbs': food_info['carbs_per_100g'] * (quantity / 100),
            'fat': food_info['fat_per_100g'] * (quantity / 100)
        }
        
        # Registrar no log do usuário
        food_log = log_food(user_id, food_item, quantity, unit, calories, macros)
        
        # Recalcular plano alimentar
        adjustment = recalculate_diet_plan(user_id)
        
        return jsonify({
            'success': True,
            'message': 'Alimento registrado com sucesso',
            'food_log': food_log,
            'calories_added': round(calories, 1),
            'macros': {k: round(v, 1) for k, v in macros.items()},
            'adjustment': adjustment
        }), 200
    
    except Exception as e:
        logging.error(f"Erro ao registrar alimento: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500

@fulltime_bp.route('/log/activity', methods=['POST'])
@cross_origin()
def log_unplanned_activity():
    """
    Registra uma atividade não planejada e recalcula o gasto calórico
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        activity = data.get('activity')
        duration = float(data.get('duration', 0))  # em minutos
        
        # Validar dados
        if not all([user_id, activity]) or duration <= 0:
            return jsonify({
                'success': False,
                'message': 'Dados incompletos ou inválidos'
            }), 400
        
        # Obter gasto calórico da atividade
        activity_info = get_activity_info(activity)
        
        # Calcular calorias gastas
        calories_burned = activity_info['calories_per_minute'] * duration
        
        # Registrar no log do usuário
        activity_log = log_activity(user_id, activity, duration, calories_burned)
        
        # Recalcular balanço energético
        adjustment = recalculate_energy_balance(user_id)
        
        return jsonify({
            'success': True,
            'message': 'Atividade registrada com sucesso',
            'activity_log': activity_log,
            'calories_burned': round(calories_burned, 1),
            'duration_minutes': duration,
            'adjustment': adjustment
        }), 200
    
    except Exception as e:
        logging.error(f"Erro ao registrar atividade: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500

@fulltime_bp.route('/logs/<user_id>', methods=['GET'])
@cross_origin()
def get_user_logs(user_id):
    """
    Obtém os logs de alimentos e atividades de um usuário
    """
    try:
        if user_id not in user_logs:
            return jsonify({
                'success': True,
                'logs': {'foods': [], 'activities': []}
            }), 200
        
        # Filtrar por data se especificado
        date_filter = request.args.get('date')
        logs = user_logs[user_id]
        
        if date_filter:
            filtered_logs = {
                'foods': [f for f in logs['foods'] if f['date'] == date_filter],
                'activities': [a for a in logs['activities'] if a['date'] == date_filter]
            }
        else:
            filtered_logs = logs
        
        return jsonify({
            'success': True,
            'logs': filtered_logs
        }), 200
    
    except Exception as e:
        logging.error(f"Erro ao obter logs: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500

@fulltime_bp.route('/foods', methods=['GET'])
@cross_origin()
def get_food_database():
    """
    Obtém a lista de alimentos disponíveis
    """
    return jsonify({
        'success': True,
        'foods': list(food_database.keys())
    }), 200

@fulltime_bp.route('/activities', methods=['GET'])
@cross_origin()
def get_activity_database():
    """
    Obtém a lista de atividades disponíveis
    """
    return jsonify({
        'success': True,
        'activities': list(activity_database.keys())
    }), 200

