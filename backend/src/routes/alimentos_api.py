"""
API para consulta de alimentos da Tabela TACO
"""

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from firebase_admin import firestore
import logging

alimentos_bp = Blueprint('alimentos', __name__)
logger = logging.getLogger(__name__)

@alimentos_bp.route('/search', methods=['GET'])
@cross_origin()
def search_alimentos():
    """Busca alimentos por nome ou categoria"""
    try:
        # Parâmetros da consulta
        query = request.args.get('q', '').strip()
        categoria = request.args.get('categoria', '').strip()
        limit = min(int(request.args.get('limit', 20)), 100)  # Máximo 100
        
        if not query and not categoria:
            return jsonify({
                "success": False,
                "error": "Parâmetro 'q' (busca) ou 'categoria' é obrigatório"
            }), 400
        
        # Conectar ao Firestore
        db = firestore.client()
        collection_ref = db.collection('evolveyou-foods')
        
        # Construir consulta
        if categoria:
            docs = collection_ref.where('categoria', '==', categoria).limit(limit).stream()
        else:
            # Para busca por texto, vamos buscar todos e filtrar (não é ideal, mas funciona para MVP)
            docs = collection_ref.limit(limit * 2).stream()
        
        # Processar resultados
        alimentos = []
        for doc in docs:
            data = doc.to_dict()
            
            # Filtrar por query se especificado
            if query:
                descricao = data.get('descricao', '').lower()
                if query.lower() not in descricao:
                    continue
            
            # Formatar dados para resposta
            alimento = {
                "id": doc.id,
                "nome": data.get('descricao', ''),
                "categoria": data.get('categoria', ''),
                "calorias": data.get('energia_kcal', 0),
                "proteinas": data.get('proteina_g', 0),
                "carboidratos": data.get('carboidrato_g', 0),
                "gorduras": data.get('lipideos_g', 0),
                "fibras": data.get('fibra_alimentar_g', 0),
                "sodio": data.get('sodio_mg', 0),
                "calcio": data.get('calcio_mg', 0),
                "ferro": data.get('ferro_mg', 0),
                "vitamina_c": data.get('vitamina_c_mg', 0)
            }
            alimentos.append(alimento)
            
            # Limitar resultados
            if len(alimentos) >= limit:
                break
        
        return jsonify({
            "success": True,
            "data": alimentos,
            "total": len(alimentos),
            "query": query,
            "categoria": categoria
        })
        
    except Exception as e:
        logger.error(f"Erro ao buscar alimentos: {e}")
        return jsonify({
            "success": False,
            "error": "Erro interno do servidor"
        }), 500

@alimentos_bp.route('/categorias', methods=['GET'])
@cross_origin()
def get_categorias():
    """Retorna lista de categorias de alimentos"""
    try:
        # Categorias conhecidas da Tabela TACO
        categorias = [
            "Cereais e derivados",
            "Verduras, hortaliças e derivados",
            "Frutas e derivados",
            "Gorduras e óleos",
            "Pescados e frutos do mar",
            "Carnes e derivados",
            "Leite e derivados",
            "Bebidas (alcoólicas e não alcoólicas)",
            "Ovos e derivados",
            "Produtos açucarados",
            "Miscelâneas",
            "Outros alimentos industrializados",
            "Alimentos preparados",
            "Leguminosas e derivados",
            "Nozes e sementes"
        ]
        
        return jsonify({
            "success": True,
            "data": categorias
        })
        
    except Exception as e:
        logger.error(f"Erro ao buscar categorias: {e}")
        return jsonify({
            "success": False,
            "error": "Erro interno do servidor"
        }), 500

@alimentos_bp.route('/<alimento_id>', methods=['GET'])
@cross_origin()
def get_alimento_detalhes(alimento_id):
    """Retorna detalhes completos de um alimento"""
    try:
        db = firestore.client()
        doc_ref = db.collection('evolveyou-foods').document(alimento_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({
                "success": False,
                "error": "Alimento não encontrado"
            }), 404
        
        data = doc.to_dict()
        
        # Formatar resposta completa
        alimento = {
            "id": doc.id,
            "nome": data.get('descricao', ''),
            "categoria": data.get('categoria', ''),
            "numero_taco": data.get('numero_alimento', ''),
            "composicao_nutricional": {
                "energia": {
                    "kcal": data.get('energia_kcal', 0),
                    "kj": data.get('energia_kj', 0)
                },
                "macronutrientes": {
                    "proteinas_g": data.get('proteina_g', 0),
                    "carboidratos_g": data.get('carboidrato_g', 0),
                    "gorduras_g": data.get('lipideos_g', 0),
                    "fibras_g": data.get('fibra_alimentar_g', 0),
                    "colesterol_mg": data.get('colesterol_mg', 0)
                },
                "minerais": {
                    "calcio_mg": data.get('calcio_mg', 0),
                    "ferro_mg": data.get('ferro_mg', 0),
                    "magnesio_mg": data.get('magnesio_mg', 0),
                    "fosforo_mg": data.get('fosforo_mg', 0),
                    "potassio_mg": data.get('potassio_mg', 0),
                    "sodio_mg": data.get('sodio_mg', 0),
                    "zinco_mg": data.get('zinco_mg', 0),
                    "cobre_mg": data.get('cobre_mg', 0),
                    "manganes_mg": data.get('manganes_mg', 0)
                },
                "vitaminas": {
                    "vitamina_c_mg": data.get('vitamina_c_mg', 0),
                    "tiamina_mg": data.get('tiamina_mg', 0),
                    "riboflavina_mg": data.get('riboflavina_mg', 0),
                    "niacina_mg": data.get('niacina_mg', 0),
                    "piridoxina_mg": data.get('piridoxina_mg', 0),
                    "retinol_mcg": data.get('retinol_mcg', 0),
                    "vitamina_a_rae_mcg": data.get('vitamina_a_rae_mcg', 0)
                }
            },
            "outros": {
                "umidade_g": data.get('umidade_g', 0),
                "cinzas_g": data.get('cinzas_g', 0)
            },
            "fonte": data.get('fonte', ''),
            "versao": data.get('versao', '')
        }
        
        return jsonify({
            "success": True,
            "data": alimento
        })
        
    except Exception as e:
        logger.error(f"Erro ao buscar detalhes do alimento: {e}")
        return jsonify({
            "success": False,
            "error": "Erro interno do servidor"
        }), 500

@alimentos_bp.route('/nutrientes/calcular', methods=['POST'])
@cross_origin()
def calcular_nutrientes():
    """Calcula nutrientes totais de uma lista de alimentos com quantidades"""
    try:
        data = request.get_json()
        
        if not data or 'alimentos' not in data:
            return jsonify({
                "success": False,
                "error": "Lista de alimentos é obrigatória"
            }), 400
        
        alimentos_lista = data['alimentos']
        
        # Validar formato
        for item in alimentos_lista:
            if 'id' not in item or 'quantidade_g' not in item:
                return jsonify({
                    "success": False,
                    "error": "Cada alimento deve ter 'id' e 'quantidade_g'"
                }), 400
        
        # Buscar dados dos alimentos
        db = firestore.client()
        totais = {
            "energia_kcal": 0,
            "proteinas_g": 0,
            "carboidratos_g": 0,
            "gorduras_g": 0,
            "fibras_g": 0,
            "sodio_mg": 0,
            "calcio_mg": 0,
            "ferro_mg": 0,
            "vitamina_c_mg": 0
        }
        
        alimentos_detalhes = []
        
        for item in alimentos_lista:
            doc_ref = db.collection('evolveyou-foods').document(item['id'])
            doc = doc_ref.get()
            
            if doc.exists:
                alimento_data = doc.to_dict()
                quantidade = item['quantidade_g']
                fator = quantidade / 100  # Dados TACO são por 100g
                
                # Calcular valores proporcionais
                valores = {
                    "energia_kcal": (alimento_data.get('energia_kcal', 0) or 0) * fator,
                    "proteinas_g": (alimento_data.get('proteina_g', 0) or 0) * fator,
                    "carboidratos_g": (alimento_data.get('carboidrato_g', 0) or 0) * fator,
                    "gorduras_g": (alimento_data.get('lipideos_g', 0) or 0) * fator,
                    "fibras_g": (alimento_data.get('fibra_alimentar_g', 0) or 0) * fator,
                    "sodio_mg": (alimento_data.get('sodio_mg', 0) or 0) * fator,
                    "calcio_mg": (alimento_data.get('calcio_mg', 0) or 0) * fator,
                    "ferro_mg": (alimento_data.get('ferro_mg', 0) or 0) * fator,
                    "vitamina_c_mg": (alimento_data.get('vitamina_c_mg', 0) or 0) * fator
                }
                
                # Somar aos totais
                for key in totais:
                    totais[key] += valores[key]
                
                # Adicionar aos detalhes
                alimentos_detalhes.append({
                    "id": item['id'],
                    "nome": alimento_data.get('descricao', ''),
                    "quantidade_g": quantidade,
                    "valores": valores
                })
        
        # Arredondar valores
        for key in totais:
            totais[key] = round(totais[key], 2)
        
        return jsonify({
            "success": True,
            "data": {
                "totais": totais,
                "alimentos": alimentos_detalhes
            }
        })
        
    except Exception as e:
        logger.error(f"Erro ao calcular nutrientes: {e}")
        return jsonify({
            "success": False,
            "error": "Erro interno do servidor"
        }), 500

