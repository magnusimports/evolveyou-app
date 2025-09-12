"""
Anamnese API Routes - EvolveYou
APIs para sistema de anamnese inteligente com 22 perguntas estratégicas
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import logging

# Importar serviços
try:
    from ..services.anamnese_service import anamnese_service
    from ..services.firebase_advanced import firebase_advanced
    from ..services.gemini_contextual import gemini_contextual
except ImportError:
    anamnese_service = None
    firebase_advanced = None
    gemini_contextual = None

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criar blueprint
anamnese_api = Blueprint('anamnese_api', __name__)

@anamnese_api.route('/api/v2/anamnese/questions', methods=['GET'])
def get_anamnese_questions():
    """Obtém todas as perguntas da anamnese"""
    try:
        category = request.args.get('category')
        
        if anamnese_service:
            questions = anamnese_service.get_questions_by_category(category)
        else:
            # Fallback com perguntas básicas
            questions = [
                {
                    "id": 1,
                    "category": "dados_pessoais",
                    "question": "Qual é o seu nome completo?",
                    "type": "text",
                    "required": True
                },
                {
                    "id": 2,
                    "category": "dados_pessoais",
                    "question": "Qual é a sua idade?",
                    "type": "number",
                    "required": True
                }
            ]
        
        # Organizar por categoria
        categories = {}
        for question in questions:
            cat = question['category']
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(question)
        
        return jsonify({
            'success': True,
            'questions': questions,
            'categories': categories,
            'total_questions': len(questions)
        })
        
    except Exception as e:
        logger.error(f"Erro ao obter perguntas da anamnese: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro ao obter perguntas'
        }), 500

@anamnese_api.route('/api/v2/anamnese/question/<int:question_id>', methods=['GET'])
def get_anamnese_question(question_id):
    """Obtém pergunta específica da anamnese"""
    try:
        if anamnese_service:
            question = anamnese_service.get_question_by_id(question_id)
        else:
            question = None
        
        if not question:
            return jsonify({
                'success': False,
                'message': 'Pergunta não encontrada'
            }), 404
        
        return jsonify({
            'success': True,
            'question': question
        })
        
    except Exception as e:
        logger.error(f"Erro ao obter pergunta {question_id}: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro ao obter pergunta'
        }), 500

@anamnese_api.route('/api/v2/anamnese/validate', methods=['POST'])
def validate_anamnese_answer():
    """Valida resposta de uma pergunta da anamnese"""
    try:
        data = request.get_json()
        question_id = data.get('question_id')
        answer = data.get('answer')
        
        if not question_id:
            return jsonify({
                'success': False,
                'message': 'ID da pergunta é obrigatório'
            }), 400
        
        if anamnese_service:
            validation = anamnese_service.validate_answer(question_id, answer)
        else:
            validation = {"valid": True}
        
        return jsonify({
            'success': True,
            'validation': validation
        })
        
    except Exception as e:
        logger.error(f"Erro ao validar resposta: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro na validação'
        }), 500

@anamnese_api.route('/api/v2/anamnese/submit', methods=['POST'])
def submit_anamnese():
    """Submete anamnese completa e cria perfil do usuário"""
    try:
        user_id = request.headers.get('X-User-ID', 'guest_user')
        data = request.get_json()
        answers = data.get('answers', [])
        
        if not answers:
            return jsonify({
                'success': False,
                'message': 'Respostas da anamnese são obrigatórias'
            }), 400
        
        # Validar todas as respostas
        validation_errors = []
        if anamnese_service:
            for answer in answers:
                validation = anamnese_service.validate_answer(
                    answer['question_id'], 
                    answer['answer']
                )
                if not validation['valid']:
                    validation_errors.append({
                        'question_id': answer['question_id'],
                        'error': validation['error']
                    })
        
        if validation_errors:
            return jsonify({
                'success': False,
                'message': 'Erros de validação encontrados',
                'validation_errors': validation_errors
            }), 400
        
        # Criar perfil baseado na anamnese
        if anamnese_service:
            profile = anamnese_service.create_user_profile_from_anamnese(answers)
            
            if not profile:
                return jsonify({
                    'success': False,
                    'message': 'Erro ao criar perfil'
                }), 500
            
            # Salvar no Firebase se disponível
            if firebase_advanced:
                try:
                    profile['uid'] = user_id
                    firebase_advanced.db.collection('users').document(user_id).set(profile)
                    logger.info(f"Perfil da anamnese salvo para {user_id}")
                except Exception as e:
                    logger.error(f"Erro ao salvar no Firebase: {e}")
            
            # Gerar mensagem de boas-vindas personalizada
            welcome_message = generate_welcome_message(profile)
            
            return jsonify({
                'success': True,
                'profile': profile,
                'welcome_message': welcome_message,
                'anamnese_score': profile.get('anamnese_score', {}),
                'recommendations': profile.get('recommendations', {}),
                'message': 'Anamnese concluída com sucesso!'
            })
        
        return jsonify({
            'success': False,
            'message': 'Serviço de anamnese indisponível'
        }), 503
        
    except Exception as e:
        logger.error(f"Erro ao submeter anamnese: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro ao processar anamnese'
        }), 500

@anamnese_api.route('/api/v2/anamnese/progress', methods=['GET'])
def get_anamnese_progress():
    """Obtém progresso da anamnese do usuário"""
    try:
        user_id = request.headers.get('X-User-ID', 'guest_user')
        
        # Verificar se usuário já completou anamnese
        if firebase_advanced:
            try:
                doc = firebase_advanced.db.collection('users').document(user_id).get()
                if doc.exists:
                    user_data = doc.to_dict()
                    anamnese_completed = user_data.get('anamnese_completed', False)
                    anamnese_date = user_data.get('anamnese_date')
                    anamnese_score = user_data.get('anamnese_score', {})
                    
                    return jsonify({
                        'success': True,
                        'completed': anamnese_completed,
                        'completion_date': anamnese_date,
                        'score': anamnese_score,
                        'total_questions': 22
                    })
            except Exception as e:
                logger.error(f"Erro ao verificar progresso no Firebase: {e}")
        
        # Fallback
        return jsonify({
            'success': True,
            'completed': False,
            'total_questions': 22
        })
        
    except Exception as e:
        logger.error(f"Erro ao obter progresso da anamnese: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro ao obter progresso'
        }), 500

@anamnese_api.route('/api/v2/anamnese/analysis', methods=['GET'])
def get_anamnese_analysis():
    """Obtém análise detalhada da anamnese do usuário"""
    try:
        user_id = request.headers.get('X-User-ID', 'guest_user')
        
        if firebase_advanced:
            try:
                doc = firebase_advanced.db.collection('users').document(user_id).get()
                if doc.exists:
                    user_data = doc.to_dict()
                    
                    if not user_data.get('anamnese_completed', False):
                        return jsonify({
                            'success': False,
                            'message': 'Anamnese não foi concluída'
                        }), 400
                    
                    analysis = {
                        'score': user_data.get('anamnese_score', {}),
                        'recommendations': user_data.get('recommendations', {}),
                        'profile_summary': {
                            'goal': user_data.get('goal'),
                            'activity_level': user_data.get('activity_level'),
                            'bmr': user_data.get('bmr'),
                            'daily_calories': user_data.get('daily_calories'),
                            'macros': user_data.get('macros')
                        },
                        'risk_factors': extract_risk_factors(user_data),
                        'strengths': extract_strengths(user_data),
                        'completion_date': user_data.get('anamnese_date')
                    }
                    
                    return jsonify({
                        'success': True,
                        'analysis': analysis
                    })
            except Exception as e:
                logger.error(f"Erro ao obter análise no Firebase: {e}")
        
        return jsonify({
            'success': False,
            'message': 'Análise não disponível'
        }), 404
        
    except Exception as e:
        logger.error(f"Erro ao obter análise da anamnese: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro ao obter análise'
        }), 500

@anamnese_api.route('/api/v2/anamnese/recommendations', methods=['GET'])
def get_anamnese_recommendations():
    """Obtém recomendações personalizadas baseadas na anamnese"""
    try:
        user_id = request.headers.get('X-User-ID', 'guest_user')
        category = request.args.get('category', 'all')  # all, nutrition, exercise, lifestyle
        
        if firebase_advanced:
            try:
                doc = firebase_advanced.db.collection('users').document(user_id).get()
                if doc.exists:
                    user_data = doc.to_dict()
                    recommendations = user_data.get('recommendations', {})
                    
                    # Filtrar por categoria se especificado
                    if category != 'all':
                        filtered_recommendations = filter_recommendations_by_category(
                            recommendations, category
                        )
                    else:
                        filtered_recommendations = recommendations
                    
                    # Gerar recomendações adicionais com IA se disponível
                    if gemini_contextual and user_data.get('anamnese_answers'):
                        ai_recommendations = generate_ai_recommendations(
                            user_data, category
                        )
                        filtered_recommendations['ai_suggestions'] = ai_recommendations
                    
                    return jsonify({
                        'success': True,
                        'recommendations': filtered_recommendations,
                        'category': category
                    })
            except Exception as e:
                logger.error(f"Erro ao obter recomendações no Firebase: {e}")
        
        # Fallback com recomendações genéricas
        fallback_recommendations = {
            'prioridades': ['Manter consistência nos exercícios'],
            'sugestoes': ['Beber mais água', 'Dormir 7-8 horas por noite'],
            'cuidados': ['Consultar médico antes de iniciar exercícios intensos']
        }
        
        return jsonify({
            'success': True,
            'recommendations': fallback_recommendations,
            'category': category
        })
        
    except Exception as e:
        logger.error(f"Erro ao obter recomendações: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro ao obter recomendações'
        }), 500

def generate_welcome_message(profile):
    """Gera mensagem de boas-vindas personalizada"""
    try:
        name = profile.get('name', 'Usuário')
        goal = profile.get('goal', 'melhorar saúde')
        score = profile.get('anamnese_score', {}).get('total', 0)
        
        goal_translations = {
            'perder_peso': 'perder peso',
            'ganhar_massa': 'ganhar massa muscular',
            'manter_peso': 'manter o peso',
            'melhorar_condicionamento': 'melhorar o condicionamento'
        }
        
        goal_text = goal_translations.get(goal, goal)
        
        if score >= 80:
            performance_text = "Você já tem uma base excelente!"
        elif score >= 60:
            performance_text = "Você está no caminho certo!"
        elif score >= 40:
            performance_text = "Há algumas áreas para melhorar, mas você pode conseguir!"
        else:
            performance_text = "Vamos começar devagar e construir hábitos sólidos!"
        
        message = f"""
Olá, {name}! 🎉

Parabéns por completar sua anamnese! Agora conheço melhor seus objetivos e posso te ajudar de forma mais personalizada.

🎯 **Seu objetivo**: {goal_text}
📊 **Score da anamnese**: {score:.0f}/100
💪 **Avaliação**: {performance_text}

Baseado nas suas respostas, criei um plano personalizado para você. Vamos começar essa jornada juntos!

Estou aqui para te apoiar em cada passo. Que tal começarmos hoje mesmo? 🚀
        """.strip()
        
        return message
        
    except Exception as e:
        logger.error(f"Erro ao gerar mensagem de boas-vindas: {e}")
        return "Bem-vindo ao EvolveYou! Sua anamnese foi concluída com sucesso."

def extract_risk_factors(user_data):
    """Extrai fatores de risco das respostas da anamnese"""
    risk_factors = []
    
    try:
        answers = user_data.get('anamnese_answers', [])
        answers_dict = {a['question_id']: a['answer'] for a in answers}
        
        # Verificar condições de saúde
        health_conditions = answers_dict.get(10, [])
        if isinstance(health_conditions, list) and 'nenhuma' not in health_conditions:
            for condition in health_conditions:
                if condition != 'nenhuma':
                    risk_factors.append(f"Condição de saúde: {condition}")
        
        # Verificar nível de atividade
        activity = answers_dict.get(8, 'moderado')
        if activity == 'sedentario':
            risk_factors.append("Sedentarismo")
        
        # Verificar sono
        sleep_quality = answers_dict.get(17, 'boa')
        if sleep_quality in ['muito_ruim', 'ruim']:
            risk_factors.append("Qualidade de sono ruim")
        
        # Verificar estresse
        stress = answers_dict.get(18, 'moderado')
        if stress in ['alto', 'muito_alto']:
            risk_factors.append("Alto nível de estresse")
        
        # Verificar hábitos
        habits = answers_dict.get(19, [])
        if isinstance(habits, list):
            if 'fumo_regular' in habits:
                risk_factors.append("Tabagismo")
            if 'alcool_regular' in habits:
                risk_factors.append("Consumo regular de álcool")
        
    except Exception as e:
        logger.error(f"Erro ao extrair fatores de risco: {e}")
    
    return risk_factors

def extract_strengths(user_data):
    """Extrai pontos fortes das respostas da anamnese"""
    strengths = []
    
    try:
        answers = user_data.get('anamnese_answers', [])
        answers_dict = {a['question_id']: a['answer'] for a in answers}
        
        # Verificar atividade física
        activity = answers_dict.get(8, 'moderado')
        if activity in ['intenso', 'muito_intenso']:
            strengths.append("Alto nível de atividade física")
        elif activity == 'moderado':
            strengths.append("Atividade física regular")
        
        # Verificar alimentação
        nutrition = answers_dict.get(12, 'regular')
        if nutrition in ['bom', 'excelente']:
            strengths.append("Bons hábitos alimentares")
        
        # Verificar sono
        sleep = answers_dict.get(17, 'boa')
        if sleep in ['boa', 'excelente']:
            strengths.append("Boa qualidade de sono")
        
        # Verificar motivação
        motivations = answers_dict.get(20, [])
        if isinstance(motivations, list) and len(motivations) >= 3:
            strengths.append("Alta motivação")
        
        # Verificar disponibilidade
        time = answers_dict.get(21, '30-45min')
        if time in ['60-90min', 'mais_90min']:
            strengths.append("Boa disponibilidade de tempo")
        
    except Exception as e:
        logger.error(f"Erro ao extrair pontos fortes: {e}")
    
    return strengths

def filter_recommendations_by_category(recommendations, category):
    """Filtra recomendações por categoria"""
    if category == 'nutrition':
        return {
            'alimentacao': recommendations.get('sugestoes', []),
            'hidratacao': ['Manter hidratação adequada']
        }
    elif category == 'exercise':
        return {
            'atividade_fisica': recommendations.get('prioridades', []),
            'treino': ['Manter consistência nos exercícios']
        }
    elif category == 'lifestyle':
        return {
            'sono': ['Manter rotina de sono regular'],
            'estresse': ['Gerenciar níveis de estresse']
        }
    
    return recommendations

def generate_ai_recommendations(user_data, category):
    """Gera recomendações adicionais usando IA"""
    try:
        if not gemini_contextual:
            return []
        
        # Construir contexto para IA
        context = {
            'user_profile': user_data,
            'recent_metrics': [],
            'chat_history': []
        }
        
        full_context = gemini_contextual.build_user_context(
            context['user_profile'],
            context['recent_metrics'],
            context['chat_history']
        )
        
        # Prompt específico para recomendações
        prompt = f"""
        Baseado na anamnese do usuário, gere 3 recomendações específicas para a categoria '{category}'.
        
        Perfil do usuário:
        - Objetivo: {user_data.get('goal')}
        - Nível de atividade: {user_data.get('activity_level')}
        - Score da anamnese: {user_data.get('anamnese_score', {}).get('total', 0)}
        
        Forneça recomendações práticas e específicas.
        """
        
        response = gemini_contextual.generate_response(prompt, full_context)
        
        if response and response.get('response'):
            # Extrair recomendações do texto da resposta
            recommendations_text = response['response']
            # Simplificar para retornar como lista
            return [recommendations_text]
        
    except Exception as e:
        logger.error(f"Erro ao gerar recomendações com IA: {e}")
    
    return []

