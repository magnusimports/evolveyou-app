"""
Algoritmo de Gasto Calórico Aprimorado - EvolveYou Premium
Implementa o cálculo personalizado de GMB considerando fatores únicos
"""

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import logging

enhanced_bmr_bp = Blueprint('enhanced_bmr', __name__)

def calculate_enhanced_bmr(user_data):
    """
    Calcula o Gasto Metabólico Basal (GMB) aprimorado com base nos dados da anamnese.
    
    Args:
        user_data (dict): Dados do usuário da anamnese
        
    Returns:
        dict: GMB base, fatores de ajuste e GMB final ajustado
    """
    try:
        # Extrair dados básicos
        weight = float(user_data.get('weight', 0))
        height = float(user_data.get('height', 0))
        age = int(user_data.get('age', 0))
        gender = user_data.get('gender', 'male')
        
        # Validar dados básicos
        if weight <= 0 or height <= 0 or age <= 0:
            raise ValueError("Dados básicos inválidos")
        
        # Calcular GMB base usando a fórmula Mifflin-St Jeor
        if gender == 'male':
            bmr_base = (10 * weight) + (6.25 * height) - (5 * age) + 5
        else:
            bmr_base = (10 * weight) + (6.25 * height) - (5 * age) - 161
        
        # Definir fatores de ajuste
        body_composition = user_data.get('body_description', 'normal')
        body_composition_factor = {
            'very_thin': 1.0,
            'lean': 1.02,
            'athletic': 1.08,
            'normal': 1.0,
            'overweight': 0.97
        }.get(body_composition, 1.0)
        
        pharma_usage = user_data.get('uses_ergogenic_resources', False)
        pharma_factor = 1.10 if pharma_usage else 1.0
        
        training_experience = user_data.get('training_experience', 'beginner')
        experience_factor = {
            'beginner': 1.0,
            'intermediate': 1.02,
            'advanced': 1.05
        }.get(training_experience, 1.0)
        
        # Calcular GMB ajustado
        bmr_adjusted = bmr_base * body_composition_factor * pharma_factor * experience_factor
        
        # Calcular Gasto Calórico Diário (GCD)
        work_activity = user_data.get('work_activity_level', 'sedentary')
        leisure_activity = user_data.get('leisure_activity_level', 'lightly_active')
        
        activity_factor = calculate_activity_factor(work_activity, leisure_activity)
        daily_caloric_expenditure = bmr_adjusted * activity_factor
        
        return {
            'success': True,
            'bmr_base': round(bmr_base),
            'adjustment_factors': {
                'body_composition': body_composition_factor,
                'pharma_usage': pharma_factor,
                'training_experience': experience_factor
            },
            'bmr_adjusted': round(bmr_adjusted),
            'activity_factor': activity_factor,
            'daily_caloric_expenditure': round(daily_caloric_expenditure)
        }
        
    except Exception as e:
        logging.error(f"Erro no cálculo do GMB aprimorado: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def calculate_activity_factor(work_activity, leisure_activity):
    """
    Calcula o fator de atividade com base nas atividades de trabalho e lazer.
    
    Args:
        work_activity (str): Nível de atividade no trabalho
        leisure_activity (str): Nível de atividade no tempo livre
        
    Returns:
        float: Fator de atividade
    """
    # Mapear níveis de atividade para valores numéricos
    work_values = {
        'sedentary': 1.2,
        'lightly_active': 1.3,
        'moderately_active': 1.4,
        'very_active': 1.5
    }
    
    leisure_values = {
        'very_calm': 0.0,
        'lightly_active': 0.1,
        'active': 0.2
    }
    
    # Obter valores base ou padrão se não encontrados
    work_value = work_values.get(work_activity, 1.2)
    leisure_value = leisure_values.get(leisure_activity, 0.0)
    
    # Combinar os fatores
    return work_value + leisure_value

@enhanced_bmr_bp.route('/calculate', methods=['POST'])
@cross_origin()
def calculate_bmr_endpoint():
    """
    Endpoint para calcular o GMB aprimorado
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Dados não fornecidos'
            }), 400
        
        result = calculate_enhanced_bmr(data)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logging.error(f"Erro no endpoint de cálculo BMR: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@enhanced_bmr_bp.route('/factors', methods=['GET'])
@cross_origin()
def get_adjustment_factors():
    """
    Endpoint para obter os fatores de ajuste disponíveis
    """
    return jsonify({
        'success': True,
        'factors': {
            'body_composition': {
                'very_thin': 1.0,
                'lean': 1.02,
                'athletic': 1.08,
                'normal': 1.0,
                'overweight': 0.97
            },
            'pharma_usage': {
                'yes': 1.10,
                'no': 1.0
            },
            'training_experience': {
                'beginner': 1.0,
                'intermediate': 1.02,
                'advanced': 1.05
            }
        }
    }), 200

