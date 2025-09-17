"""
API do Coach EVO - Assistente de IA para fitness e nutrição
"""

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from src.services.gemini_simple import GeminiSimple
from firebase_admin import firestore
import logging
import json
from datetime import datetime

coach_bp = Blueprint('coach', __name__)
logger = logging.getLogger(__name__)

# Inicializar Gemini
gemini_service = GeminiSimple()

@coach_bp.route('/chat', methods=['POST'])
@cross_origin()
def chat_with_coach():
    """Chat com o Coach EVO"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                "success": False,
                "error": "Mensagem é obrigatória"
            }), 400
        
        user_message = data['message']
        user_context = data.get('context', {})
        
        # Construir contexto do usuário
        context_prompt = f"""
Você é o Coach EVO, um assistente de IA especializado em fitness e nutrição do aplicativo EvolveYou.

CONTEXTO DO USUÁRIO:
- Nome: {user_context.get('name', 'Usuário')}
- Idade: {user_context.get('age', 'Não informado')}
- Objetivo: {user_context.get('goal', 'Não informado')}
- Nível: {user_context.get('level', 'Iniciante')}
- Peso atual: {user_context.get('weight', 'Não informado')}
- Altura: {user_context.get('height', 'Não informado')}

DIRETRIZES:
1. Seja sempre motivacional e positivo
2. Forneça conselhos baseados em evidências científicas
3. Adapte as respostas ao nível e objetivo do usuário
4. Seja conciso mas informativo
5. Incentive hábitos saudáveis
6. Se necessário, sugira consultar profissionais de saúde

PERGUNTA DO USUÁRIO: {user_message}

Responda de forma personalizada e útil:
"""
        
        # Gerar resposta com Gemini
        response = gemini_service.generate_response(context_prompt)
        
        if response:
            return jsonify({
                "success": True,
                "data": {
                    "message": response,
                    "timestamp": datetime.now().isoformat(),
                    "coach": "EVO"
                }
            })
        else:
            return jsonify({
                "success": False,
                "error": "Não foi possível gerar resposta"
            }), 500
        
    except Exception as e:
        logger.error(f"Erro no chat com Coach: {e}")
        return jsonify({
            "success": False,
            "error": "Erro interno do servidor"
        }), 500

@coach_bp.route('/plano-nutricional', methods=['POST'])
@cross_origin()
def gerar_plano_nutricional():
    """Gera plano nutricional personalizado"""
    try:
        data = request.get_json()
        
        # Parâmetros obrigatórios
        required_fields = ['age', 'weight', 'height', 'goal', 'activity_level']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Campo '{field}' é obrigatório"
                }), 400
        
        age = data['age']
        weight = data['weight']
        height = data['height']
        goal = data['goal']
        activity_level = data['activity_level']
        gender = data.get('gender', 'masculino')
        restrictions = data.get('restrictions', [])
        
        # Calcular TMB (Taxa Metabólica Basal)
        if gender.lower() == 'masculino':
            tmb = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
        else:
            tmb = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
        
        # Fatores de atividade
        activity_factors = {
            'sedentario': 1.2,
            'leve': 1.375,
            'moderado': 1.55,
            'intenso': 1.725,
            'muito_intenso': 1.9
        }
        
        tdee = tmb * activity_factors.get(activity_level, 1.55)
        
        # Ajustar calorias baseado no objetivo
        if goal == 'emagrecimento':
            target_calories = tdee - 500  # Déficit de 500 kcal
        elif goal == 'ganho_massa':
            target_calories = tdee + 300  # Superávit de 300 kcal
        else:
            target_calories = tdee  # Manutenção
        
        # Distribuição de macronutrientes
        if goal == 'emagrecimento':
            protein_ratio = 0.30
            carb_ratio = 0.35
            fat_ratio = 0.35
        elif goal == 'ganho_massa':
            protein_ratio = 0.25
            carb_ratio = 0.45
            fat_ratio = 0.30
        else:
            protein_ratio = 0.25
            carb_ratio = 0.40
            fat_ratio = 0.35
        
        protein_calories = target_calories * protein_ratio
        carb_calories = target_calories * carb_ratio
        fat_calories = target_calories * fat_ratio
        
        protein_grams = protein_calories / 4
        carb_grams = carb_calories / 4
        fat_grams = fat_calories / 9
        
        # Gerar sugestões de alimentos com Gemini
        restrictions_text = ", ".join(restrictions) if restrictions else "Nenhuma"
        
        prompt = f"""
Como Coach EVO, crie um plano nutricional personalizado:

DADOS DO USUÁRIO:
- Idade: {age} anos
- Peso: {weight} kg
- Altura: {height} cm
- Objetivo: {goal}
- Nível de atividade: {activity_level}
- Restrições: {restrictions_text}

METAS CALCULADAS:
- Calorias diárias: {target_calories:.0f} kcal
- Proteínas: {protein_grams:.0f}g
- Carboidratos: {carb_grams:.0f}g
- Gorduras: {fat_grams:.0f}g

Forneça:
1. Sugestões de café da manhã (3 opções)
2. Sugestões de almoço (3 opções)
3. Sugestões de jantar (3 opções)
4. Lanches saudáveis (3 opções)
5. Dicas importantes para o objetivo

Seja específico com alimentos brasileiros e quantidades aproximadas.
"""
        
        suggestions = gemini_service.generate_response(prompt)
        
        return jsonify({
            "success": True,
            "data": {
                "metas_nutricionais": {
                    "calorias_diarias": round(target_calories),
                    "proteinas_g": round(protein_grams),
                    "carboidratos_g": round(carb_grams),
                    "gorduras_g": round(fat_grams),
                    "tmb": round(tmb),
                    "tdee": round(tdee)
                },
                "sugestoes": suggestions,
                "objetivo": goal,
                "gerado_em": datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Erro ao gerar plano nutricional: {e}")
        return jsonify({
            "success": False,
            "error": "Erro interno do servidor"
        }), 500

@coach_bp.route('/analise-progresso', methods=['POST'])
@cross_origin()
def analisar_progresso():
    """Analisa progresso do usuário e fornece feedback"""
    try:
        data = request.get_json()
        
        if not data or 'dados_progresso' not in data:
            return jsonify({
                "success": False,
                "error": "Dados de progresso são obrigatórios"
            }), 400
        
        progresso = data['dados_progresso']
        objetivo = data.get('objetivo', 'melhoria_geral')
        
        # Construir prompt para análise
        prompt = f"""
Como Coach EVO, analise o progresso do usuário:

OBJETIVO: {objetivo}

DADOS DE PROGRESSO:
{json.dumps(progresso, indent=2, ensure_ascii=False)}

Forneça uma análise detalhada incluindo:
1. Pontos positivos identificados
2. Áreas que precisam de atenção
3. Sugestões específicas de melhoria
4. Motivação personalizada
5. Próximos passos recomendados

Seja encorajador mas realista, focando em melhorias práticas.
"""
        
        analise = gemini_service.generate_response(prompt)
        
        return jsonify({
            "success": True,
            "data": {
                "analise": analise,
                "objetivo": objetivo,
                "analisado_em": datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Erro ao analisar progresso: {e}")
        return jsonify({
            "success": False,
            "error": "Erro interno do servidor"
        }), 500

@coach_bp.route('/dicas-diarias', methods=['GET'])
@cross_origin()
def get_dicas_diarias():
    """Retorna dicas diárias personalizadas"""
    try:
        # Parâmetros opcionais
        categoria = request.args.get('categoria', 'geral')  # fitness, nutricao, motivacao, geral
        nivel = request.args.get('nivel', 'iniciante')
        
        prompt = f"""
Como Coach EVO, forneça 3 dicas diárias sobre {categoria} para usuários de nível {nivel}.

As dicas devem ser:
1. Práticas e aplicáveis
2. Motivacionais
3. Baseadas em evidências
4. Adequadas ao nível do usuário

Formato: Uma dica por linha, numeradas de 1 a 3.
"""
        
        dicas = gemini_service.generate_response(prompt)
        
        return jsonify({
            "success": True,
            "data": {
                "dicas": dicas,
                "categoria": categoria,
                "nivel": nivel,
                "data": datetime.now().strftime("%Y-%m-%d")
            }
        })
        
    except Exception as e:
        logger.error(f"Erro ao buscar dicas diárias: {e}")
        return jsonify({
            "success": False,
            "error": "Erro interno do servidor"
        }), 500

@coach_bp.route('/avaliar-refeicao', methods=['POST'])
@cross_origin()
def avaliar_refeicao():
    """Avalia uma refeição e fornece feedback nutricional"""
    try:
        data = request.get_json()
        
        if not data or 'alimentos' not in data:
            return jsonify({
                "success": False,
                "error": "Lista de alimentos é obrigatória"
            }), 400
        
        alimentos = data['alimentos']
        objetivo = data.get('objetivo', 'equilibrio')
        refeicao_tipo = data.get('tipo', 'almoço')  # cafe, almoco, jantar, lanche
        
        # Buscar informações nutricionais dos alimentos
        db = firestore.client()
        alimentos_detalhes = []
        
        for alimento in alimentos:
            if 'id' in alimento:
                doc_ref = db.collection('evolveyou-foods').document(alimento['id'])
                doc = doc_ref.get()
                if doc.exists:
                    alimento_data = doc.to_dict()
                    alimentos_detalhes.append({
                        "nome": alimento_data.get('descricao', ''),
                        "quantidade": alimento.get('quantidade_g', 100),
                        "calorias": alimento_data.get('energia_kcal', 0),
                        "proteinas": alimento_data.get('proteina_g', 0),
                        "carboidratos": alimento_data.get('carboidrato_g', 0),
                        "gorduras": alimento_data.get('lipideos_g', 0)
                    })
        
        prompt = f"""
Como Coach EVO, avalie esta {refeicao_tipo} para um usuário com objetivo de {objetivo}:

ALIMENTOS CONSUMIDOS:
{json.dumps(alimentos_detalhes, indent=2, ensure_ascii=False)}

Forneça:
1. Avaliação geral da refeição (nota de 1-10)
2. Pontos positivos
3. Pontos de melhoria
4. Sugestões de ajustes
5. Adequação ao objetivo

Seja construtivo e educativo.
"""
        
        avaliacao = gemini_service.generate_response(prompt)
        
        return jsonify({
            "success": True,
            "data": {
                "avaliacao": avaliacao,
                "tipo_refeicao": refeicao_tipo,
                "objetivo": objetivo,
                "avaliado_em": datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Erro ao avaliar refeição: {e}")
        return jsonify({
            "success": False,
            "error": "Erro interno do servidor"
        }), 500

