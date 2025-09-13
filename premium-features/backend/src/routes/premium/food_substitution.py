"""
Substituição Inteligente de Alimentos - EvolveYou Premium
Permite substituir alimentos na dieta com cálculo automático de equivalência
"""

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import logging
import math

food_substitution_bp = Blueprint('food_substitution', __name__)

# Base de dados expandida de alimentos com categorias
FOOD_DATABASE = {
    # Proteínas
    'frango_peito': {
        'id': 1, 'name': 'Peito de Frango', 'category': 'protein',
        'calories_per_100g': 165, 'protein_per_100g': 31, 'carbs_per_100g': 0, 'fat_per_100g': 3.6,
        'unit': 'g'
    },
    'carne_bovina': {
        'id': 2, 'name': 'Carne Bovina Magra', 'category': 'protein',
        'calories_per_100g': 250, 'protein_per_100g': 26, 'carbs_per_100g': 0, 'fat_per_100g': 15,
        'unit': 'g'
    },
    'peixe_tilapia': {
        'id': 3, 'name': 'Tilápia', 'category': 'protein',
        'calories_per_100g': 96, 'protein_per_100g': 20, 'carbs_per_100g': 0, 'fat_per_100g': 1.7,
        'unit': 'g'
    },
    'ovo': {
        'id': 4, 'name': 'Ovo', 'category': 'protein',
        'calories_per_100g': 155, 'protein_per_100g': 13, 'carbs_per_100g': 1.1, 'fat_per_100g': 11,
        'unit': 'g'
    },
    
    # Carboidratos
    'arroz_integral': {
        'id': 5, 'name': 'Arroz Integral', 'category': 'carbohydrate',
        'calories_per_100g': 111, 'protein_per_100g': 2.6, 'carbs_per_100g': 23, 'fat_per_100g': 0.9,
        'unit': 'g'
    },
    'batata_doce': {
        'id': 6, 'name': 'Batata Doce', 'category': 'carbohydrate',
        'calories_per_100g': 86, 'protein_per_100g': 1.6, 'carbs_per_100g': 20, 'fat_per_100g': 0.1,
        'unit': 'g'
    },
    'aveia': {
        'id': 7, 'name': 'Aveia', 'category': 'carbohydrate',
        'calories_per_100g': 389, 'protein_per_100g': 16.9, 'carbs_per_100g': 66, 'fat_per_100g': 6.9,
        'unit': 'g'
    },
    'pao_integral': {
        'id': 8, 'name': 'Pão Integral', 'category': 'carbohydrate',
        'calories_per_100g': 247, 'protein_per_100g': 13, 'carbs_per_100g': 41, 'fat_per_100g': 4.2,
        'unit': 'g'
    },
    
    # Gorduras
    'abacate': {
        'id': 9, 'name': 'Abacate', 'category': 'fat',
        'calories_per_100g': 160, 'protein_per_100g': 2, 'carbs_per_100g': 9, 'fat_per_100g': 15,
        'unit': 'g'
    },
    'castanha_para': {
        'id': 10, 'name': 'Castanha do Pará', 'category': 'fat',
        'calories_per_100g': 656, 'protein_per_100g': 14, 'carbs_per_100g': 12, 'fat_per_100g': 66,
        'unit': 'g'
    },
    'azeite_oliva': {
        'id': 11, 'name': 'Azeite de Oliva', 'category': 'fat',
        'calories_per_100g': 884, 'protein_per_100g': 0, 'carbs_per_100g': 0, 'fat_per_100g': 100,
        'unit': 'ml'
    },
    
    # Frutas
    'banana': {
        'id': 12, 'name': 'Banana', 'category': 'fruit',
        'calories_per_100g': 89, 'protein_per_100g': 1.1, 'carbs_per_100g': 23, 'fat_per_100g': 0.3,
        'unit': 'g'
    },
    'maca': {
        'id': 13, 'name': 'Maçã', 'category': 'fruit',
        'calories_per_100g': 52, 'protein_per_100g': 0.3, 'carbs_per_100g': 14, 'fat_per_100g': 0.2,
        'unit': 'g'
    }
}

def get_food_by_id(food_id):
    """
    Obtém um alimento pelo ID
    """
    for key, food in FOOD_DATABASE.items():
        if food['id'] == int(food_id):
            return food
    return None

def get_foods_by_category(category, exclude_id=None):
    """
    Obtém alimentos de uma categoria específica
    """
    foods = []
    for key, food in FOOD_DATABASE.items():
        if food['category'] == category and (exclude_id is None or food['id'] != int(exclude_id)):
            foods.append(food)
    return foods

def calculate_nutritional_similarity(original_macros, substitute_macros):
    """
    Calcula a similaridade nutricional entre dois alimentos
    """
    protein_diff = abs(original_macros['protein'] - substitute_macros['protein'])
    carbs_diff = abs(original_macros['carbs'] - substitute_macros['carbs'])
    fat_diff = abs(original_macros['fat'] - substitute_macros['fat'])
    
    # Peso maior para proteína, depois carboidratos, depois gordura
    similarity_score = (protein_diff * 2) + (carbs_diff * 1.5) + (fat_diff * 1)
    return similarity_score

@food_substitution_bp.route('/substitute', methods=['GET'])
@cross_origin()
def get_food_substitutes():
    """
    Retorna substitutos para um alimento específico com quantidades equivalentes
    """
    try:
        food_id = request.args.get('food_id')
        quantity = float(request.args.get('quantity', 0))
        
        if not food_id or quantity <= 0:
            return jsonify({
                'success': False,
                'message': 'Parâmetros inválidos'
            }), 400
        
        # Obter informações do alimento original
        original_food = get_food_by_id(food_id)
        
        if not original_food:
            return jsonify({
                'success': False,
                'message': 'Alimento não encontrado'
            }), 404
        
        # Calcular calorias e macros do alimento original
        original_calories = original_food['calories_per_100g'] * (quantity / 100)
        original_macros = {
            'protein': original_food['protein_per_100g'] * (quantity / 100),
            'carbs': original_food['carbs_per_100g'] * (quantity / 100),
            'fat': original_food['fat_per_100g'] * (quantity / 100)
        }
        
        # Encontrar substitutos na mesma categoria
        category = original_food['category']
        substitutes = get_foods_by_category(category, exclude_id=food_id)
        
        # Calcular quantidades equivalentes para cada substituto
        result = []
        for sub in substitutes:
            if sub['calories_per_100g'] > 0:
                # Calcular quantidade necessária para igualar calorias
                equivalent_quantity = (original_calories / sub['calories_per_100g']) * 100
                
                # Calcular macros com a quantidade equivalente
                equivalent_macros = {
                    'protein': sub['protein_per_100g'] * (equivalent_quantity / 100),
                    'carbs': sub['carbs_per_100g'] * (equivalent_quantity / 100),
                    'fat': sub['fat_per_100g'] * (equivalent_quantity / 100)
                }
                
                # Calcular diferenças
                difference = {
                    'protein': equivalent_macros['protein'] - original_macros['protein'],
                    'carbs': equivalent_macros['carbs'] - original_macros['carbs'],
                    'fat': equivalent_macros['fat'] - original_macros['fat']
                }
                
                # Calcular score de similaridade
                similarity_score = calculate_nutritional_similarity(original_macros, equivalent_macros)
                
                result.append({
                    'food_id': sub['id'],
                    'name': sub['name'],
                    'equivalent_quantity': round(equivalent_quantity, 1),
                    'unit': sub['unit'],
                    'calories': round(original_calories, 1),
                    'macros': {
                        'protein': round(equivalent_macros['protein'], 1),
                        'carbs': round(equivalent_macros['carbs'], 1),
                        'fat': round(equivalent_macros['fat'], 1)
                    },
                    'difference': {
                        'protein': round(difference['protein'], 1),
                        'carbs': round(difference['carbs'], 1),
                        'fat': round(difference['fat'], 1)
                    },
                    'similarity_score': round(similarity_score, 2)
                })
        
        # Ordenar por similaridade nutricional (menor score = mais similar)
        result.sort(key=lambda x: x['similarity_score'])
        
        return jsonify({
            'success': True,
            'original': {
                'food_id': original_food['id'],
                'name': original_food['name'],
                'quantity': quantity,
                'unit': original_food['unit'],
                'calories': round(original_calories, 1),
                'macros': {
                    'protein': round(original_macros['protein'], 1),
                    'carbs': round(original_macros['carbs'], 1),
                    'fat': round(original_macros['fat'], 1)
                }
            },
            'substitutes': result[:5]  # Limitar a 5 substitutos
        }), 200
    
    except Exception as e:
        logging.error(f"Erro ao buscar substitutos: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500

@food_substitution_bp.route('/foods', methods=['GET'])
@cross_origin()
def get_all_foods():
    """
    Retorna todos os alimentos disponíveis
    """
    try:
        category_filter = request.args.get('category')
        
        foods = []
        for key, food in FOOD_DATABASE.items():
            if category_filter is None or food['category'] == category_filter:
                foods.append({
                    'id': food['id'],
                    'name': food['name'],
                    'category': food['category'],
                    'calories_per_100g': food['calories_per_100g'],
                    'unit': food['unit']
                })
        
        return jsonify({
            'success': True,
            'foods': foods
        }), 200
    
    except Exception as e:
        logging.error(f"Erro ao obter alimentos: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500

@food_substitution_bp.route('/categories', methods=['GET'])
@cross_origin()
def get_food_categories():
    """
    Retorna as categorias de alimentos disponíveis
    """
    categories = list(set(food['category'] for food in FOOD_DATABASE.values()))
    
    return jsonify({
        'success': True,
        'categories': categories
    }), 200

@food_substitution_bp.route('/food/<int:food_id>', methods=['GET'])
@cross_origin()
def get_food_details(food_id):
    """
    Retorna detalhes de um alimento específico
    """
    try:
        food = get_food_by_id(food_id)
        
        if not food:
            return jsonify({
                'success': False,
                'message': 'Alimento não encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'food': food
        }), 200
    
    except Exception as e:
        logging.error(f"Erro ao obter detalhes do alimento: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500

