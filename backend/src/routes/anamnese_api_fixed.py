"""
Anamnese API Routes - EvolveYou (Versão Corrigida)
APIs para sistema de anamnese inteligente com 22 perguntas estratégicas
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import logging
import json

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criar blueprint
anamnese_api = Blueprint('anamnese_api', __name__)

@anamnese_api.route('/api/v2/anamnese/questions', methods=['GET'])
def get_anamnese_questions():
    """Obtém todas as perguntas da anamnese"""
    try:
        questions = get_full_questions()
        categories = get_categories()
        
        return jsonify({
            'success': True,
            'questions': questions,
            'categories': categories,
            'total': len(questions)
        })
        
    except Exception as e:
        logger.error(f"Erro ao obter perguntas da anamnese: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro ao carregar perguntas'
        }), 500

@anamnese_api.route('/api/v2/anamnese/validate', methods=['POST'])
def validate_anamnese_answer():
    """Valida uma resposta da anamnese"""
    try:
        data = request.get_json()
        question_id = data.get('question_id')
        answer = data.get('answer')
        
        if question_id is None or answer is None:
            return jsonify({
                'valid': False,
                'error': 'ID da pergunta e resposta são obrigatórios'
            }), 400
        
        # Validação básica
        validation = validate_answer(question_id, answer)
        
        return jsonify(validation)
        
    except Exception as e:
        logger.error(f"Erro na validação: {e}")
        return jsonify({
            'valid': False,
            'error': 'Erro interno na validação'
        }), 500

@anamnese_api.route('/api/v2/anamnese/submit', methods=['POST'])
def submit_anamnese():
    """Submete anamnese completa e gera perfil personalizado"""
    try:
        data = request.get_json()
        user_id = request.headers.get('X-User-ID', 'guest_user')
        
        if not data or 'answers' not in data:
            return jsonify({
                'success': False,
                'message': 'Dados da anamnese são obrigatórios'
            }), 400
        
        answers = data['answers']
        logger.info(f"Processando anamnese para usuário {user_id} com {len(answers)} respostas")
        
        # Processar respostas e gerar perfil
        profile = process_anamnese_answers(answers, user_id)
        
        # Gerar prescrições personalizadas
        prescriptions = generate_prescriptions(profile)
        profile.update(prescriptions)
        
        return jsonify({
            'success': True,
            'profile': profile,
            'message': 'Anamnese concluída com sucesso! Seu perfil personalizado foi criado.'
        })
        
    except Exception as e:
        logger.error(f"Erro ao submeter anamnese: {e}")
        return jsonify({
            'success': False,
            'message': f'Erro ao processar anamnese: {str(e)}'
        }), 500

def get_full_questions():
    """Retorna todas as 22 perguntas da anamnese"""
    return [
        {
            "id": 1,
            "category": "dados_pessoais",
            "question": "Qual é o seu nome completo?",
            "type": "text",
            "required": True,
            "placeholder": "Digite seu nome completo"
        },
        {
            "id": 2,
            "category": "dados_pessoais",
            "question": "Qual é a sua idade?",
            "type": "number",
            "required": True,
            "min": 16,
            "max": 100,
            "placeholder": "Digite sua idade"
        },
        {
            "id": 3,
            "category": "dados_pessoais",
            "question": "Qual é o seu sexo?",
            "type": "select",
            "required": True,
            "options": [
                {"value": "masculino", "label": "Masculino"},
                {"value": "feminino", "label": "Feminino"}
            ]
        },
        {
            "id": 4,
            "category": "dados_pessoais",
            "question": "Qual é a sua altura (em cm)?",
            "type": "number",
            "required": True,
            "min": 140,
            "max": 220,
            "placeholder": "Ex: 175"
        },
        {
            "id": 5,
            "category": "antropometria",
            "question": "Qual é o seu peso atual (em kg)?",
            "type": "number",
            "required": True,
            "min": 40,
            "max": 200,
            "placeholder": "Ex: 70"
        },
        {
            "id": 6,
            "category": "objetivos",
            "question": "Qual é o seu objetivo principal?",
            "type": "select",
            "required": True,
            "options": [
                {"value": "perder_peso", "label": "Perder peso"},
                {"value": "ganhar_massa", "label": "Ganhar massa muscular"},
                {"value": "manter_peso", "label": "Manter peso atual"},
                {"value": "melhorar_condicionamento", "label": "Melhorar condicionamento físico"}
            ]
        },
        {
            "id": 7,
            "category": "objetivos",
            "question": "Qual é o seu peso ideal (em kg)?",
            "type": "number",
            "required": True,
            "min": 40,
            "max": 200,
            "placeholder": "Ex: 65"
        },
        {
            "id": 8,
            "category": "atividade_fisica",
            "question": "Qual é o seu nível atual de atividade física?",
            "type": "select",
            "required": True,
            "options": [
                {"value": "sedentario", "label": "Sedentário (pouco ou nenhum exercício)"},
                {"value": "leve", "label": "Leve (exercício leve 1-3 dias/semana)"},
                {"value": "moderado", "label": "Moderado (exercício moderado 3-5 dias/semana)"},
                {"value": "intenso", "label": "Intenso (exercício intenso 6-7 dias/semana)"},
                {"value": "muito_intenso", "label": "Muito intenso (exercício muito intenso, trabalho físico)"}
            ]
        },
        {
            "id": 9,
            "category": "atividade_fisica",
            "question": "Quais tipos de exercício você prefere?",
            "type": "multiple_select",
            "required": True,
            "options": [
                {"value": "musculacao", "label": "Musculação"},
                {"value": "cardio", "label": "Exercícios cardiovasculares"},
                {"value": "funcional", "label": "Treinamento funcional"},
                {"value": "yoga", "label": "Yoga/Pilates"},
                {"value": "esportes", "label": "Esportes"},
                {"value": "caminhada", "label": "Caminhada/Corrida"},
                {"value": "natacao", "label": "Natação"},
                {"value": "danca", "label": "Dança"}
            ]
        },
        {
            "id": 10,
            "category": "saude",
            "question": "Você possui alguma condição de saúde?",
            "type": "multiple_select",
            "required": True,
            "options": [
                {"value": "nenhuma", "label": "Nenhuma"},
                {"value": "diabetes", "label": "Diabetes"},
                {"value": "hipertensao", "label": "Hipertensão"},
                {"value": "problemas_cardiacos", "label": "Problemas cardíacos"},
                {"value": "problemas_articulares", "label": "Problemas articulares"},
                {"value": "problemas_respiratorios", "label": "Problemas respiratórios"},
                {"value": "outras", "label": "Outras condições"}
            ]
        },
        {
            "id": 11,
            "category": "saude",
            "question": "Você toma algum medicamento regularmente?",
            "type": "select",
            "required": True,
            "options": [
                {"value": "nao", "label": "Não"},
                {"value": "sim_poucos", "label": "Sim, poucos medicamentos"},
                {"value": "sim_varios", "label": "Sim, vários medicamentos"}
            ]
        },
        {
            "id": 12,
            "category": "alimentacao",
            "question": "Como você avalia seus hábitos alimentares atuais?",
            "type": "select",
            "required": True,
            "options": [
                {"value": "excelente", "label": "Excelente"},
                {"value": "bom", "label": "Bom"},
                {"value": "regular", "label": "Regular"},
                {"value": "ruim", "label": "Ruim"},
                {"value": "muito_ruim", "label": "Muito ruim"}
            ]
        },
        {
            "id": 13,
            "category": "alimentacao",
            "question": "Você possui alguma restrição alimentar?",
            "type": "multiple_select",
            "required": True,
            "options": [
                {"value": "nenhuma", "label": "Nenhuma"},
                {"value": "vegetariano", "label": "Vegetariano"},
                {"value": "vegano", "label": "Vegano"},
                {"value": "lactose", "label": "Intolerância à lactose"},
                {"value": "gluten", "label": "Intolerância ao glúten"},
                {"value": "diabetes", "label": "Restrições por diabetes"},
                {"value": "outras", "label": "Outras restrições"}
            ]
        },
        {
            "id": 14,
            "category": "alimentacao",
            "question": "Quantas refeições você faz por dia?",
            "type": "select",
            "required": True,
            "options": [
                {"value": "2", "label": "2 refeições"},
                {"value": "3", "label": "3 refeições"},
                {"value": "4-5", "label": "4-5 refeições"},
                {"value": "6+", "label": "6 ou mais refeições"}
            ]
        },
        {
            "id": 15,
            "category": "hidratacao",
            "question": "Quanto de água você bebe por dia?",
            "type": "select",
            "required": True,
            "options": [
                {"value": "menos_1", "label": "Menos de 1 litro"},
                {"value": "1-1.5", "label": "1 a 1,5 litros"},
                {"value": "1.5-2", "label": "1,5 a 2 litros"},
                {"value": "2-3", "label": "2 a 3 litros"},
                {"value": "mais_3", "label": "Mais de 3 litros"}
            ]
        },
        {
            "id": 16,
            "category": "sono",
            "question": "Quantas horas você dorme por noite?",
            "type": "select",
            "required": True,
            "options": [
                {"value": "menos_5", "label": "Menos de 5 horas"},
                {"value": "5-6", "label": "5 a 6 horas"},
                {"value": "6-7", "label": "6 a 7 horas"},
                {"value": "7-8", "label": "7 a 8 horas"},
                {"value": "8-9", "label": "8 a 9 horas"},
                {"value": "mais_9", "label": "Mais de 9 horas"}
            ]
        },
        {
            "id": 17,
            "category": "sono",
            "question": "Como você avalia a qualidade do seu sono?",
            "type": "select",
            "required": True,
            "options": [
                {"value": "excelente", "label": "Excelente"},
                {"value": "boa", "label": "Boa"},
                {"value": "regular", "label": "Regular"},
                {"value": "ruim", "label": "Ruim"},
                {"value": "muito_ruim", "label": "Muito ruim"}
            ]
        },
        {
            "id": 18,
            "category": "estilo_vida",
            "question": "Como você avalia seu nível de estresse?",
            "type": "select",
            "required": True,
            "options": [
                {"value": "baixo", "label": "Baixo"},
                {"value": "moderado", "label": "Moderado"},
                {"value": "alto", "label": "Alto"},
                {"value": "muito_alto", "label": "Muito alto"}
            ]
        },
        {
            "id": 19,
            "category": "estilo_vida",
            "question": "Você possui algum dos seguintes hábitos?",
            "type": "multiple_select",
            "required": True,
            "options": [
                {"value": "nenhum", "label": "Nenhum"},
                {"value": "fumo", "label": "Fumo"},
                {"value": "alcool_social", "label": "Consumo social de álcool"},
                {"value": "alcool_frequente", "label": "Consumo frequente de álcool"},
                {"value": "cafe_excessivo", "label": "Consumo excessivo de cafeína"}
            ]
        },
        {
            "id": 20,
            "category": "motivacao",
            "question": "O que mais te motiva a buscar uma vida mais saudável?",
            "type": "multiple_select",
            "required": True,
            "options": [
                {"value": "saude", "label": "Melhorar a saúde"},
                {"value": "estetica", "label": "Questões estéticas"},
                {"value": "energia", "label": "Ter mais energia"},
                {"value": "autoestima", "label": "Melhorar autoestima"},
                {"value": "longevidade", "label": "Viver mais e melhor"},
                {"value": "exemplo", "label": "Ser exemplo para família"},
                {"value": "performance", "label": "Melhorar performance"}
            ]
        },
        {
            "id": 21,
            "category": "disponibilidade",
            "question": "Quanto tempo você pode dedicar aos exercícios por dia?",
            "type": "select",
            "required": True,
            "options": [
                {"value": "15-30min", "label": "15 a 30 minutos"},
                {"value": "30-45min", "label": "30 a 45 minutos"},
                {"value": "45-60min", "label": "45 a 60 minutos"},
                {"value": "60-90min", "label": "60 a 90 minutos"},
                {"value": "mais_90min", "label": "Mais de 90 minutos"}
            ]
        },
        {
            "id": 22,
            "category": "experiencia",
            "question": "Qual é a sua experiência anterior com programas de fitness/nutrição?",
            "type": "select",
            "required": True,
            "options": [
                {"value": "nenhuma", "label": "Nenhuma experiência"},
                {"value": "pouca", "label": "Pouca experiência (tentativas isoladas)"},
                {"value": "moderada", "label": "Experiência moderada (alguns programas)"},
                {"value": "boa", "label": "Boa experiência (vários programas)"},
                {"value": "extensa", "label": "Experiência extensa (lifestyle)"}
            ]
        }
    ]

def get_categories():
    """Retorna categorias das perguntas"""
    return {
        "dados_pessoais": {
            "name": "Dados Pessoais",
            "icon": "👤",
            "description": "Informações básicas sobre você"
        },
        "antropometria": {
            "name": "Antropometria",
            "icon": "📏",
            "description": "Medidas corporais"
        },
        "objetivos": {
            "name": "Objetivos",
            "icon": "🎯",
            "description": "Suas metas e objetivos"
        },
        "atividade_fisica": {
            "name": "Atividade Física",
            "icon": "💪",
            "description": "Seu nível de atividade atual"
        },
        "saude": {
            "name": "Saúde",
            "icon": "🏥",
            "description": "Condições de saúde e medicamentos"
        },
        "alimentacao": {
            "name": "Alimentação",
            "icon": "🥗",
            "description": "Hábitos alimentares e restrições"
        },
        "hidratacao": {
            "name": "Hidratação",
            "icon": "💧",
            "description": "Consumo de água"
        },
        "sono": {
            "name": "Sono",
            "icon": "😴",
            "description": "Qualidade e quantidade do sono"
        },
        "estilo_vida": {
            "name": "Estilo de Vida",
            "icon": "🌟",
            "description": "Estresse e hábitos gerais"
        },
        "motivacao": {
            "name": "Motivação",
            "icon": "🔥",
            "description": "O que te motiva"
        },
        "disponibilidade": {
            "name": "Disponibilidade",
            "icon": "⏰",
            "description": "Tempo disponível para exercícios"
        },
        "experiencia": {
            "name": "Experiência",
            "icon": "🎓",
            "description": "Experiência anterior com fitness"
        }
    }

def validate_answer(question_id, answer):
    """Valida uma resposta específica"""
    try:
        questions = get_full_questions()
        question = next((q for q in questions if q['id'] == question_id), None)
        
        if not question:
            return {'valid': False, 'error': 'Pergunta não encontrada'}
        
        if question['required'] and (answer is None or answer == ''):
            return {'valid': False, 'error': 'Esta pergunta é obrigatória'}
        
        if question['type'] == 'number':
            try:
                num_answer = float(answer)
                if 'min' in question and num_answer < question['min']:
                    return {'valid': False, 'error': f'Valor mínimo: {question["min"]}'}
                if 'max' in question and num_answer > question['max']:
                    return {'valid': False, 'error': f'Valor máximo: {question["max"]}'}
            except (ValueError, TypeError):
                return {'valid': False, 'error': 'Valor numérico inválido'}
        
        return {'valid': True}
        
    except Exception as e:
        logger.error(f"Erro na validação da pergunta {question_id}: {e}")
        return {'valid': False, 'error': 'Erro na validação'}

def process_anamnese_answers(answers, user_id):
    """Processa respostas da anamnese e gera perfil completo"""
    try:
        # Converter respostas para dicionário
        answers_dict = {}
        for answer in answers:
            answers_dict[answer['question_id']] = answer['answer']
        
        # Extrair dados básicos
        profile = {
            'user_id': user_id,
            'name': answers_dict.get(1, 'Usuário'),
            'age': int(answers_dict.get(2, 30)),
            'gender': answers_dict.get(3, 'masculino'),
            'height': float(answers_dict.get(4, 170)),
            'weight': float(answers_dict.get(5, 70)),
            'goal': answers_dict.get(6, 'manter_peso'),
            'target_weight': float(answers_dict.get(7, 70)),
            'activity_level': answers_dict.get(8, 'moderado'),
            'exercise_preferences': answers_dict.get(9, []),
            'health_conditions': answers_dict.get(10, []),
            'medications': answers_dict.get(11, 'nao'),
            'eating_habits': answers_dict.get(12, 'regular'),
            'dietary_restrictions': answers_dict.get(13, []),
            'meals_per_day': answers_dict.get(14, '3'),
            'water_intake': answers_dict.get(15, '1.5-2'),
            'sleep_hours': answers_dict.get(16, '7-8'),
            'sleep_quality': answers_dict.get(17, 'boa'),
            'stress_level': answers_dict.get(18, 'moderado'),
            'lifestyle_habits': answers_dict.get(19, []),
            'motivation_factors': answers_dict.get(20, []),
            'available_time': answers_dict.get(21, '30-45min'),
            'fitness_experience': answers_dict.get(22, 'moderada')
        }
        
        # Calcular métricas metabólicas
        profile.update(calculate_metabolic_metrics(profile))
        
        # Calcular score da anamnese
        profile['anamnese_score'] = calculate_anamnese_score(profile)
        
        # Gerar recomendações
        profile['recommendations'] = generate_recommendations(profile)
        
        # Marcar anamnese como completa
        profile['anamnese_completed'] = True
        profile['anamnese_date'] = datetime.now().isoformat()
        
        return profile
        
    except Exception as e:
        logger.error(f"Erro ao processar respostas da anamnese: {e}")
        raise

def calculate_metabolic_metrics(profile):
    """Calcula métricas metabólicas baseadas no perfil"""
    try:
        # Fórmula de Harris-Benedict revisada
        if profile['gender'] == 'masculino':
            bmr = 88.362 + (13.397 * profile['weight']) + (4.799 * profile['height']) - (5.677 * profile['age'])
        else:
            bmr = 447.593 + (9.247 * profile['weight']) + (3.098 * profile['height']) - (4.330 * profile['age'])
        
        # Fator de atividade
        activity_factors = {
            'sedentario': 1.2,
            'leve': 1.375,
            'moderado': 1.55,
            'intenso': 1.725,
            'muito_intenso': 1.9
        }
        
        activity_factor = activity_factors.get(profile['activity_level'], 1.55)
        daily_calories = bmr * activity_factor
        
        # Ajustar calorias baseado no objetivo
        if profile['goal'] == 'perder_peso':
            daily_calories *= 0.85  # Déficit de 15%
        elif profile['goal'] == 'ganhar_massa':
            daily_calories *= 1.15  # Superávit de 15%
        
        # Calcular macronutrientes
        protein_ratio = 0.25 if profile['goal'] == 'ganhar_massa' else 0.20
        fat_ratio = 0.25
        carb_ratio = 1 - protein_ratio - fat_ratio
        
        macros = {
            'protein': round((daily_calories * protein_ratio) / 4),  # 4 cal/g
            'carbs': round((daily_calories * carb_ratio) / 4),      # 4 cal/g
            'fat': round((daily_calories * fat_ratio) / 9)          # 9 cal/g
        }
        
        return {
            'bmr': round(bmr),
            'daily_calories': round(daily_calories),
            'macros': macros,
            'activity_factor': activity_factor
        }
        
    except Exception as e:
        logger.error(f"Erro ao calcular métricas metabólicas: {e}")
        return {
            'bmr': 1800,
            'daily_calories': 2200,
            'macros': {'protein': 110, 'carbs': 275, 'fat': 61},
            'activity_factor': 1.55
        }

def calculate_anamnese_score(profile):
    """Calcula score da anamnese por categoria"""
    try:
        scores = {
            'saude_geral': 85,
            'atividade_fisica': 70,
            'alimentacao': 75,
            'sono_recuperacao': 80,
            'motivacao': 90
        }
        
        # Ajustar scores baseado nas respostas
        if 'nenhuma' in str(profile.get('health_conditions', [])):
            scores['saude_geral'] = 95
        
        if profile.get('activity_level') in ['intenso', 'muito_intenso']:
            scores['atividade_fisica'] = 90
        elif profile.get('activity_level') == 'sedentario':
            scores['atividade_fisica'] = 40
        
        if profile.get('eating_habits') == 'excelente':
            scores['alimentacao'] = 95
        elif profile.get('eating_habits') == 'muito_ruim':
            scores['alimentacao'] = 30
        
        if profile.get('sleep_quality') == 'excelente':
            scores['sono_recuperacao'] = 95
        elif profile.get('sleep_quality') == 'muito_ruim':
            scores['sono_recuperacao'] = 40
        
        scores['score_total'] = round(sum(scores.values()) / len(scores))
        
        return scores
        
    except Exception as e:
        logger.error(f"Erro ao calcular score da anamnese: {e}")
        return {
            'saude_geral': 75,
            'atividade_fisica': 70,
            'alimentacao': 75,
            'sono_recuperacao': 75,
            'motivacao': 80,
            'score_total': 75
        }

def generate_recommendations(profile):
    """Gera recomendações personalizadas baseadas no perfil"""
    try:
        recommendations = {
            'prioridades': [],
            'cuidados': [],
            'sugestoes': [],
            'metas_iniciais': []
        }
        
        # Prioridades baseadas no objetivo
        if profile['goal'] == 'perder_peso':
            recommendations['prioridades'].append("Criar déficit calórico controlado")
            recommendations['prioridades'].append("Combinar exercícios cardio e musculação")
        elif profile['goal'] == 'ganhar_massa':
            recommendations['prioridades'].append("Manter superávit calórico")
            recommendations['prioridades'].append("Focar em treinamento de força")
        
        # Cuidados baseados na saúde
        health_conditions = profile.get('health_conditions', [])
        if 'diabetes' in health_conditions:
            recommendations['cuidados'].append("Monitorar glicemia antes e após exercícios")
        if 'hipertensao' in health_conditions:
            recommendations['cuidados'].append("Evitar exercícios muito intensos inicialmente")
        
        # Sugestões baseadas no nível de atividade
        if profile['activity_level'] == 'sedentario':
            recommendations['sugestoes'].append("Começar com caminhadas de 15-20 minutos")
            recommendations['sugestoes'].append("Aumentar atividade gradualmente")
        
        # Metas iniciais
        recommendations['metas_iniciais'].append(f"Consumir {profile['daily_calories']} calorias por dia")
        recommendations['metas_iniciais'].append(f"Exercitar-se {profile['available_time']} por dia")
        
        return recommendations
        
    except Exception as e:
        logger.error(f"Erro ao gerar recomendações: {e}")
        return {
            'prioridades': ["Manter consistência nos exercícios"],
            'cuidados': ["Respeitar limites do corpo"],
            'sugestoes': ["Começar gradualmente"],
            'metas_iniciais': ["Estabelecer rotina saudável"]
        }

def generate_prescriptions(profile):
    """Gera prescrições de treino e dieta baseadas na anamnese"""
    try:
        prescriptions = {}
        
        # Prescrição de Treino
        workout_plan = generate_workout_plan(profile)
        prescriptions['workout_plan'] = workout_plan
        
        # Prescrição Nutricional
        nutrition_plan = generate_nutrition_plan(profile)
        prescriptions['nutrition_plan'] = nutrition_plan
        
        # Plano de Hidratação
        hydration_plan = generate_hydration_plan(profile)
        prescriptions['hydration_plan'] = hydration_plan
        
        return prescriptions
        
    except Exception as e:
        logger.error(f"Erro ao gerar prescrições: {e}")
        return {}

def generate_workout_plan(profile):
    """Gera plano de treino personalizado"""
    try:
        plan = {
            'frequency': '3-4x por semana',
            'duration': profile['available_time'],
            'type': 'Misto (Cardio + Musculação)',
            'weekly_schedule': []
        }
        
        if profile['goal'] == 'perder_peso':
            plan['weekly_schedule'] = [
                {'day': 'Segunda', 'type': 'Cardio + Core', 'duration': '45min'},
                {'day': 'Quarta', 'type': 'Musculação (Corpo todo)', 'duration': '45min'},
                {'day': 'Sexta', 'type': 'HIIT + Alongamento', 'duration': '30min'}
            ]
        elif profile['goal'] == 'ganhar_massa':
            plan['weekly_schedule'] = [
                {'day': 'Segunda', 'type': 'Peito + Tríceps', 'duration': '60min'},
                {'day': 'Quarta', 'type': 'Costas + Bíceps', 'duration': '60min'},
                {'day': 'Sexta', 'type': 'Pernas + Ombros', 'duration': '60min'}
            ]
        else:
            plan['weekly_schedule'] = [
                {'day': 'Segunda', 'type': 'Corpo todo', 'duration': '45min'},
                {'day': 'Quarta', 'type': 'Cardio', 'duration': '30min'},
                {'day': 'Sexta', 'type': 'Funcional', 'duration': '45min'}
            ]
        
        return plan
        
    except Exception as e:
        logger.error(f"Erro ao gerar plano de treino: {e}")
        return {'frequency': '3x por semana', 'type': 'Misto'}

def generate_nutrition_plan(profile):
    """Gera plano nutricional personalizado"""
    try:
        plan = {
            'daily_calories': profile['daily_calories'],
            'macros': profile['macros'],
            'meals': [],
            'restrictions': profile.get('dietary_restrictions', []),
            'meal_timing': []
        }
        
        # Distribuição de refeições
        meals_per_day = profile.get('meals_per_day', '3')
        if meals_per_day == '3':
            plan['meal_timing'] = [
                {'meal': 'Café da manhã', 'time': '07:00', 'calories': round(profile['daily_calories'] * 0.25)},
                {'meal': 'Almoço', 'time': '12:00', 'calories': round(profile['daily_calories'] * 0.40)},
                {'meal': 'Jantar', 'time': '19:00', 'calories': round(profile['daily_calories'] * 0.35)}
            ]
        elif meals_per_day == '4-5':
            plan['meal_timing'] = [
                {'meal': 'Café da manhã', 'time': '07:00', 'calories': round(profile['daily_calories'] * 0.20)},
                {'meal': 'Lanche manhã', 'time': '10:00', 'calories': round(profile['daily_calories'] * 0.10)},
                {'meal': 'Almoço', 'time': '12:30', 'calories': round(profile['daily_calories'] * 0.35)},
                {'meal': 'Lanche tarde', 'time': '15:30', 'calories': round(profile['daily_calories'] * 0.10)},
                {'meal': 'Jantar', 'time': '19:00', 'calories': round(profile['daily_calories'] * 0.25)}
            ]
        
        return plan
        
    except Exception as e:
        logger.error(f"Erro ao gerar plano nutricional: {e}")
        return {'daily_calories': 2000, 'macros': {'protein': 100, 'carbs': 250, 'fat': 67}}

def generate_hydration_plan(profile):
    """Gera plano de hidratação personalizado"""
    try:
        # Cálculo baseado no peso e atividade
        base_water = profile['weight'] * 35  # 35ml por kg
        
        activity_bonus = {
            'sedentario': 0,
            'leve': 300,
            'moderado': 500,
            'intenso': 700,
            'muito_intenso': 1000
        }
        
        total_water = base_water + activity_bonus.get(profile['activity_level'], 500)
        
        plan = {
            'daily_target': f"{total_water/1000:.1f}L",
            'schedule': [
                {'time': '07:00', 'amount': '300ml', 'note': 'Ao acordar'},
                {'time': '10:00', 'amount': '250ml', 'note': 'Meio da manhã'},
                {'time': '12:00', 'amount': '300ml', 'note': 'Antes do almoço'},
                {'time': '15:00', 'amount': '250ml', 'note': 'Meio da tarde'},
                {'time': '18:00', 'amount': '300ml', 'note': 'Antes do treino'},
                {'time': '21:00', 'amount': '200ml', 'note': 'Antes de dormir'}
            ],
            'tips': [
                'Beba água gelada para acelerar o metabolismo',
                'Adicione limão para melhorar o sabor',
                'Use aplicativo para lembrar de beber água'
            ]
        }
        
        return plan
        
    except Exception as e:
        logger.error(f"Erro ao gerar plano de hidratação: {e}")
        return {'daily_target': '2.5L', 'tips': ['Beba água regularmente']}

