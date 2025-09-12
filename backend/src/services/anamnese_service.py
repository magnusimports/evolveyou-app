"""
Anamnese Inteligente Service - EvolveYou
Sistema de anamnese com 22 perguntas estratégicas conforme projeto original
"""

import json
from datetime import datetime
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AnamneseService:
    def __init__(self):
        self.questions = self.load_anamnese_questions()
    
    def load_anamnese_questions(self):
        """Carrega as 22 perguntas estratégicas da anamnese"""
        return [
            {
                "id": 1,
                "category": "dados_pessoais",
                "question": "Qual é o seu nome completo?",
                "type": "text",
                "required": True,
                "validation": {"min_length": 2, "max_length": 100}
            },
            {
                "id": 2,
                "category": "dados_pessoais",
                "question": "Qual é a sua idade?",
                "type": "number",
                "required": True,
                "validation": {"min": 16, "max": 100}
            },
            {
                "id": 3,
                "category": "dados_pessoais",
                "question": "Qual é o seu sexo biológico?",
                "type": "select",
                "required": True,
                "options": [
                    {"value": "masculino", "label": "Masculino"},
                    {"value": "feminino", "label": "Feminino"}
                ]
            },
            {
                "id": 4,
                "category": "antropometria",
                "question": "Qual é a sua altura? (em centímetros)",
                "type": "number",
                "required": True,
                "validation": {"min": 140, "max": 220},
                "unit": "cm"
            },
            {
                "id": 5,
                "category": "antropometria",
                "question": "Qual é o seu peso atual? (em quilogramas)",
                "type": "number",
                "required": True,
                "validation": {"min": 40, "max": 200},
                "unit": "kg"
            },
            {
                "id": 6,
                "category": "objetivos",
                "question": "Qual é o seu principal objetivo?",
                "type": "select",
                "required": True,
                "options": [
                    {"value": "perder_peso", "label": "Perder peso"},
                    {"value": "ganhar_massa", "label": "Ganhar massa muscular"},
                    {"value": "manter_peso", "label": "Manter peso atual"},
                    {"value": "melhorar_condicionamento", "label": "Melhorar condicionamento físico"},
                    {"value": "reabilitacao", "label": "Reabilitação/Recuperação"}
                ]
            },
            {
                "id": 7,
                "category": "objetivos",
                "question": "Qual é o seu peso ideal/meta? (em quilogramas)",
                "type": "number",
                "required": True,
                "validation": {"min": 40, "max": 200},
                "unit": "kg"
            },
            {
                "id": 8,
                "category": "atividade_fisica",
                "question": "Com que frequência você pratica atividade física atualmente?",
                "type": "select",
                "required": True,
                "options": [
                    {"value": "sedentario", "label": "Sedentário (nenhuma atividade)"},
                    {"value": "leve", "label": "Leve (1-2x por semana)"},
                    {"value": "moderado", "label": "Moderado (3-4x por semana)"},
                    {"value": "intenso", "label": "Intenso (5-6x por semana)"},
                    {"value": "muito_intenso", "label": "Muito intenso (todos os dias)"}
                ]
            },
            {
                "id": 9,
                "category": "atividade_fisica",
                "question": "Que tipos de exercício você prefere ou já pratica?",
                "type": "multiple_select",
                "required": False,
                "options": [
                    {"value": "musculacao", "label": "Musculação"},
                    {"value": "cardio", "label": "Exercícios cardiovasculares"},
                    {"value": "funcional", "label": "Treinamento funcional"},
                    {"value": "yoga", "label": "Yoga/Pilates"},
                    {"value": "esportes", "label": "Esportes coletivos"},
                    {"value": "caminhada", "label": "Caminhada/Corrida"},
                    {"value": "natacao", "label": "Natação"},
                    {"value": "danca", "label": "Dança"},
                    {"value": "lutas", "label": "Artes marciais/Lutas"}
                ]
            },
            {
                "id": 10,
                "category": "saude",
                "question": "Você possui alguma condição de saúde ou lesão que devemos considerar?",
                "type": "multiple_select",
                "required": False,
                "options": [
                    {"value": "diabetes", "label": "Diabetes"},
                    {"value": "hipertensao", "label": "Hipertensão"},
                    {"value": "cardiopatia", "label": "Problemas cardíacos"},
                    {"value": "lesao_joelho", "label": "Lesão no joelho"},
                    {"value": "lesao_coluna", "label": "Problemas na coluna"},
                    {"value": "lesao_ombro", "label": "Lesão no ombro"},
                    {"value": "asma", "label": "Asma"},
                    {"value": "artrite", "label": "Artrite/Artrose"},
                    {"value": "nenhuma", "label": "Nenhuma condição especial"}
                ]
            },
            {
                "id": 11,
                "category": "saude",
                "question": "Você toma algum medicamento regularmente?",
                "type": "select",
                "required": True,
                "options": [
                    {"value": "nao", "label": "Não tomo medicamentos"},
                    {"value": "sim_poucos", "label": "Sim, poucos medicamentos"},
                    {"value": "sim_varios", "label": "Sim, vários medicamentos"},
                    {"value": "prefiro_nao_informar", "label": "Prefiro não informar"}
                ]
            },
            {
                "id": 12,
                "category": "alimentacao",
                "question": "Como você descreveria seus hábitos alimentares atuais?",
                "type": "select",
                "required": True,
                "options": [
                    {"value": "muito_ruim", "label": "Muito ruins (fast food frequente)"},
                    {"value": "ruim", "label": "Ruins (alimentação irregular)"},
                    {"value": "regular", "label": "Regulares (algumas refeições saudáveis)"},
                    {"value": "bom", "label": "Bons (maioria das refeições saudáveis)"},
                    {"value": "excelente", "label": "Excelentes (alimentação muito equilibrada)"}
                ]
            },
            {
                "id": 13,
                "category": "alimentacao",
                "question": "Você possui alguma restrição alimentar ou alergia?",
                "type": "multiple_select",
                "required": False,
                "options": [
                    {"value": "lactose", "label": "Intolerância à lactose"},
                    {"value": "gluten", "label": "Intolerância ao glúten/Celíaco"},
                    {"value": "vegetariano", "label": "Vegetariano"},
                    {"value": "vegano", "label": "Vegano"},
                    {"value": "diabetes", "label": "Restrições por diabetes"},
                    {"value": "hipertensao", "label": "Restrições por hipertensão"},
                    {"value": "alergia_frutos_mar", "label": "Alergia a frutos do mar"},
                    {"value": "alergia_oleaginosas", "label": "Alergia a oleaginosas"},
                    {"value": "nenhuma", "label": "Nenhuma restrição"}
                ]
            },
            {
                "id": 14,
                "category": "alimentacao",
                "question": "Quantas refeições você faz por dia normalmente?",
                "type": "select",
                "required": True,
                "options": [
                    {"value": "1-2", "label": "1-2 refeições"},
                    {"value": "3", "label": "3 refeições"},
                    {"value": "4-5", "label": "4-5 refeições"},
                    {"value": "6+", "label": "6 ou mais refeições"}
                ]
            },
            {
                "id": 15,
                "category": "hidratacao",
                "question": "Quantos litros de água você bebe por dia aproximadamente?",
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
                "question": "Quantas horas você dorme por noite em média?",
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
                    {"value": "muito_ruim", "label": "Muito ruim (acordo várias vezes)"},
                    {"value": "ruim", "label": "Ruim (acordo cansado)"},
                    {"value": "regular", "label": "Regular (às vezes acordo cansado)"},
                    {"value": "boa", "label": "Boa (acordo descansado)"},
                    {"value": "excelente", "label": "Excelente (sono reparador)"}
                ]
            },
            {
                "id": 18,
                "category": "estilo_vida",
                "question": "Qual é o seu nível de estresse no dia a dia?",
                "type": "select",
                "required": True,
                "options": [
                    {"value": "muito_baixo", "label": "Muito baixo"},
                    {"value": "baixo", "label": "Baixo"},
                    {"value": "moderado", "label": "Moderado"},
                    {"value": "alto", "label": "Alto"},
                    {"value": "muito_alto", "label": "Muito alto"}
                ]
            },
            {
                "id": 19,
                "category": "estilo_vida",
                "question": "Você fuma ou consome álcool regularmente?",
                "type": "multiple_select",
                "required": True,
                "options": [
                    {"value": "nao_fumo_nao_bebo", "label": "Não fumo e não bebo"},
                    {"value": "fumo_ocasional", "label": "Fumo ocasionalmente"},
                    {"value": "fumo_regular", "label": "Fumo regularmente"},
                    {"value": "alcool_ocasional", "label": "Bebo ocasionalmente"},
                    {"value": "alcool_regular", "label": "Bebo regularmente"},
                    {"value": "ex_fumante", "label": "Ex-fumante"}
                ]
            },
            {
                "id": 20,
                "category": "motivacao",
                "question": "O que mais te motiva a buscar uma vida mais saudável?",
                "type": "multiple_select",
                "required": True,
                "options": [
                    {"value": "saude", "label": "Melhorar a saúde geral"},
                    {"value": "estetica", "label": "Questões estéticas"},
                    {"value": "autoestima", "label": "Aumentar autoestima"},
                    {"value": "energia", "label": "Ter mais energia"},
                    {"value": "longevidade", "label": "Viver mais e melhor"},
                    {"value": "familia", "label": "Ser exemplo para a família"},
                    {"value": "performance", "label": "Melhorar performance"},
                    {"value": "prevencao", "label": "Prevenir doenças"}
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
    
    def get_questions_by_category(self, category=None):
        """Retorna perguntas por categoria ou todas"""
        if category:
            return [q for q in self.questions if q['category'] == category]
        return self.questions
    
    def get_question_by_id(self, question_id):
        """Retorna pergunta específica por ID"""
        for question in self.questions:
            if question['id'] == question_id:
                return question
        return None
    
    def validate_answer(self, question_id, answer):
        """Valida resposta de uma pergunta"""
        question = self.get_question_by_id(question_id)
        if not question:
            return {"valid": False, "error": "Pergunta não encontrada"}
        
        # Verificar se é obrigatória
        if question['required'] and (answer is None or answer == ""):
            return {"valid": False, "error": "Esta pergunta é obrigatória"}
        
        # Validações por tipo
        if question['type'] == 'number':
            try:
                num_answer = float(answer)
                validation = question.get('validation', {})
                
                if 'min' in validation and num_answer < validation['min']:
                    return {"valid": False, "error": f"Valor mínimo: {validation['min']}"}
                
                if 'max' in validation and num_answer > validation['max']:
                    return {"valid": False, "error": f"Valor máximo: {validation['max']}"}
                    
            except (ValueError, TypeError):
                return {"valid": False, "error": "Valor numérico inválido"}
        
        elif question['type'] == 'text':
            validation = question.get('validation', {})
            
            if 'min_length' in validation and len(str(answer)) < validation['min_length']:
                return {"valid": False, "error": f"Mínimo {validation['min_length']} caracteres"}
            
            if 'max_length' in validation and len(str(answer)) > validation['max_length']:
                return {"valid": False, "error": f"Máximo {validation['max_length']} caracteres"}
        
        elif question['type'] == 'select':
            valid_options = [opt['value'] for opt in question['options']]
            if answer not in valid_options:
                return {"valid": False, "error": "Opção inválida"}
        
        elif question['type'] == 'multiple_select':
            if not isinstance(answer, list):
                return {"valid": False, "error": "Resposta deve ser uma lista"}
            
            valid_options = [opt['value'] for opt in question['options']]
            for item in answer:
                if item not in valid_options:
                    return {"valid": False, "error": f"Opção inválida: {item}"}
        
        return {"valid": True}
    
    def calculate_anamnese_score(self, answers):
        """Calcula score da anamnese baseado nas respostas"""
        try:
            score = {
                "saude_geral": 0,
                "atividade_fisica": 0,
                "alimentacao": 0,
                "sono_recuperacao": 0,
                "motivacao": 0,
                "total": 0
            }
            
            # Análise por categoria
            for answer in answers:
                question = self.get_question_by_id(answer['question_id'])
                if not question:
                    continue
                
                category = question['category']
                value = answer['answer']
                
                # Pontuação baseada nas respostas
                if category == 'atividade_fisica':
                    if question['id'] == 8:  # Frequência de atividade
                        activity_scores = {
                            'sedentario': 0,
                            'leve': 25,
                            'moderado': 50,
                            'intenso': 75,
                            'muito_intenso': 100
                        }
                        score['atividade_fisica'] += activity_scores.get(value, 0)
                
                elif category == 'alimentacao':
                    if question['id'] == 12:  # Hábitos alimentares
                        food_scores = {
                            'muito_ruim': 0,
                            'ruim': 25,
                            'regular': 50,
                            'bom': 75,
                            'excelente': 100
                        }
                        score['alimentacao'] += food_scores.get(value, 0)
                
                elif category == 'sono':
                    if question['id'] == 17:  # Qualidade do sono
                        sleep_scores = {
                            'muito_ruim': 0,
                            'ruim': 25,
                            'regular': 50,
                            'boa': 75,
                            'excelente': 100
                        }
                        score['sono_recuperacao'] += sleep_scores.get(value, 0)
                
                elif category == 'saude':
                    if question['id'] == 10:  # Condições de saúde
                        if isinstance(value, list) and 'nenhuma' in value:
                            score['saude_geral'] += 100
                        else:
                            score['saude_geral'] += 50  # Tem algumas condições
                
                elif category == 'motivacao':
                    if question['id'] == 20:  # Motivações
                        if isinstance(value, list):
                            score['motivacao'] += min(100, len(value) * 20)
            
            # Normalizar scores (máximo 100 por categoria)
            for key in score:
                if key != 'total':
                    score[key] = min(100, score[key])
            
            # Calcular score total
            score['total'] = sum(score[k] for k in score if k != 'total') / 5
            
            return score
            
        except Exception as e:
            logger.error(f"Erro ao calcular score da anamnese: {e}")
            return {"total": 0, "error": str(e)}
    
    def generate_recommendations(self, answers):
        """Gera recomendações baseadas na anamnese"""
        try:
            recommendations = {
                "prioridades": [],
                "cuidados": [],
                "sugestoes": [],
                "metas_iniciais": []
            }
            
            # Analisar respostas para gerar recomendações
            answers_dict = {a['question_id']: a['answer'] for a in answers}
            
            # Análise de atividade física
            atividade = answers_dict.get(8, 'sedentario')
            if atividade in ['sedentario', 'leve']:
                recommendations['prioridades'].append("Aumentar gradualmente a atividade física")
                recommendations['metas_iniciais'].append("Começar com 15-20 minutos de caminhada diária")
            
            # Análise de alimentação
            alimentacao = answers_dict.get(12, 'regular')
            if alimentacao in ['muito_ruim', 'ruim']:
                recommendations['prioridades'].append("Melhorar hábitos alimentares")
                recommendations['sugestoes'].append("Incluir mais frutas e vegetais nas refeições")
            
            # Análise de sono
            sono = answers_dict.get(17, 'regular')
            if sono in ['muito_ruim', 'ruim']:
                recommendations['prioridades'].append("Melhorar qualidade do sono")
                recommendations['sugestoes'].append("Estabelecer rotina de sono regular")
            
            # Análise de condições de saúde
            condicoes = answers_dict.get(10, [])
            if isinstance(condicoes, list) and 'nenhuma' not in condicoes:
                recommendations['cuidados'].append("Considerar condições de saúde no planejamento")
                if 'diabetes' in condicoes:
                    recommendations['cuidados'].append("Monitorar glicemia durante exercícios")
                if 'hipertensao' in condicoes:
                    recommendations['cuidados'].append("Evitar exercícios de alta intensidade inicialmente")
            
            # Análise de restrições alimentares
            restricoes = answers_dict.get(13, [])
            if isinstance(restricoes, list) and 'nenhuma' not in restricoes:
                recommendations['sugestoes'].append("Plano alimentar adaptado às restrições")
            
            # Análise de disponibilidade de tempo
            tempo = answers_dict.get(21, '30-45min')
            if tempo == '15-30min':
                recommendations['sugestoes'].append("Treinos curtos e intensos (HIIT)")
            elif tempo in ['60-90min', 'mais_90min']:
                recommendations['sugestoes'].append("Treinos mais completos com aquecimento e alongamento")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Erro ao gerar recomendações: {e}")
            return {"error": str(e)}
    
    def create_user_profile_from_anamnese(self, answers):
        """Cria perfil completo do usuário baseado na anamnese"""
        try:
            answers_dict = {a['question_id']: a['answer'] for a in answers}
            
            # Dados básicos
            profile = {
                'name': answers_dict.get(1, 'Usuário'),
                'age': answers_dict.get(2, 25),
                'gender': answers_dict.get(3, 'other'),
                'height': answers_dict.get(4, 170),
                'weight': answers_dict.get(5, 70),
                'target_weight': answers_dict.get(7, 65),
                'goal': answers_dict.get(6, 'perder_peso'),
                'activity_level': answers_dict.get(8, 'moderado'),
                'anamnese_completed': True,
                'anamnese_date': datetime.now().isoformat(),
                'anamnese_answers': answers
            }
            
            # Calcular métricas
            profile['bmr'] = self.calculate_bmr(profile)
            profile['daily_calories'] = self.calculate_daily_calories(profile, answers_dict)
            profile['macros'] = self.calculate_macros(profile, answers_dict)
            
            # Score da anamnese
            profile['anamnese_score'] = self.calculate_anamnese_score(answers)
            
            # Recomendações
            profile['recommendations'] = self.generate_recommendations(answers)
            
            # Configurações personalizadas
            profile['preferences'] = self.extract_preferences(answers_dict)
            
            return profile
            
        except Exception as e:
            logger.error(f"Erro ao criar perfil da anamnese: {e}")
            return None
    
    def calculate_bmr(self, profile):
        """Calcula TMB usando fórmula de Harris-Benedict"""
        weight = profile.get('weight', 70)
        height = profile.get('height', 170)
        age = profile.get('age', 25)
        gender = profile.get('gender', 'other')
        
        if gender == 'masculino':
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
        else:
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
        
        return round(bmr)
    
    def calculate_daily_calories(self, profile, answers_dict):
        """Calcula calorias diárias baseado na anamnese"""
        bmr = profile.get('bmr', 1650)
        activity_level = answers_dict.get(8, 'moderado')
        goal = profile.get('goal', 'perder_peso')
        
        # Fatores de atividade baseados na anamnese
        activity_factors = {
            'sedentario': 1.2,
            'leve': 1.375,
            'moderado': 1.55,
            'intenso': 1.725,
            'muito_intenso': 1.9
        }
        
        tdee = bmr * activity_factors.get(activity_level, 1.55)
        
        # Ajustar baseado no objetivo
        if goal == 'perder_peso':
            daily_calories = tdee - 500  # Déficit de 500 cal
        elif goal == 'ganhar_massa':
            daily_calories = tdee + 300  # Superávit de 300 cal
        else:
            daily_calories = tdee
        
        return round(daily_calories)
    
    def calculate_macros(self, profile, answers_dict):
        """Calcula macronutrientes baseado na anamnese"""
        daily_calories = profile.get('daily_calories', 2100)
        goal = profile.get('goal', 'perder_peso')
        activity_level = answers_dict.get(8, 'moderado')
        
        # Distribuição baseada no objetivo e atividade
        if goal == 'perder_peso':
            protein_ratio = 0.35  # Alto em proteína
            carb_ratio = 0.30
            fat_ratio = 0.35
        elif goal == 'ganhar_massa':
            protein_ratio = 0.30
            carb_ratio = 0.40  # Mais carboidratos
            fat_ratio = 0.30
        else:
            protein_ratio = 0.25
            carb_ratio = 0.45
            fat_ratio = 0.30
        
        # Ajustar baseado no nível de atividade
        if activity_level in ['intenso', 'muito_intenso']:
            carb_ratio += 0.05  # Mais carboidratos para atletas
            fat_ratio -= 0.05
        
        return {
            'protein': round((daily_calories * protein_ratio) / 4),
            'carbs': round((daily_calories * carb_ratio) / 4),
            'fats': round((daily_calories * fat_ratio) / 9)
        }
    
    def extract_preferences(self, answers_dict):
        """Extrai preferências do usuário da anamnese"""
        preferences = {
            'exercise_types': answers_dict.get(9, []),
            'meal_frequency': answers_dict.get(14, '3'),
            'water_intake': answers_dict.get(15, '1.5-2'),
            'sleep_hours': answers_dict.get(16, '7-8'),
            'stress_level': answers_dict.get(18, 'moderado'),
            'available_time': answers_dict.get(21, '30-45min'),
            'experience_level': answers_dict.get(22, 'pouca'),
            'dietary_restrictions': answers_dict.get(13, []),
            'health_conditions': answers_dict.get(10, []),
            'motivations': answers_dict.get(20, [])
        }
        
        return preferences

# Instância global
anamnese_service = AnamneseService()

