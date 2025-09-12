"""
Gemini AI Contextual Service - EvolveYou
Sistema avançado de IA contextualizada para o Coach EVO
"""

import google.generativeai as genai
import os
from datetime import datetime, timedelta
import json
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiContextual:
    def __init__(self):
        self.model = None
        self.initialize_gemini()
    
    def initialize_gemini(self):
        """Inicializa Gemini AI com configuração otimizada"""
        try:
            # Configurar API key
            api_key = os.getenv('GEMINI_API_KEY')
            if api_key:
                genai.configure(api_key=api_key)
                
                # Configuração otimizada para Coach EVO
                generation_config = {
                    "temperature": 0.7,
                    "top_p": 0.8,
                    "top_k": 40,
                    "max_output_tokens": 1000,
                }
                
                safety_settings = [
                    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                ]
                
                self.model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    generation_config=generation_config,
                    safety_settings=safety_settings
                )
                
                logger.info("✅ Gemini AI Contextual inicializado com sucesso")
            else:
                logger.warning("⚠️ GEMINI_API_KEY não encontrada, usando fallback")
                
        except Exception as e:
            logger.error(f"❌ Erro ao inicializar Gemini: {e}")
            self.model = None
    
    def build_user_context(self, user_profile, recent_metrics, chat_history):
        """Constrói contexto completo do usuário"""
        try:
            # Contexto temporal
            now = datetime.now()
            time_context = self.get_time_context(now)
            
            # Análise de progresso
            progress_analysis = self.analyze_progress(user_profile, recent_metrics)
            
            # Histórico de conversas
            conversation_context = self.build_conversation_context(chat_history)
            
            context = {
                'user_profile': user_profile,
                'time_context': time_context,
                'progress_analysis': progress_analysis,
                'recent_metrics': recent_metrics[:3] if recent_metrics else [],
                'conversation_context': conversation_context,
                'current_datetime': now.strftime('%Y-%m-%d %H:%M'),
                'day_of_week': now.strftime('%A'),
                'week_number': now.isocalendar()[1]
            }
            
            return context
            
        except Exception as e:
            logger.error(f"❌ Erro ao construir contexto: {e}")
            return {}
    
    def get_time_context(self, current_time):
        """Determina contexto baseado no horário"""
        hour = current_time.hour
        
        if 5 <= hour < 12:
            return {
                'period': 'morning',
                'greeting': 'Bom dia',
                'focus': ['motivação matinal', 'café da manhã', 'planejamento do dia', 'hidratação'],
                'energy_level': 'rising',
                'meal_suggestion': 'café da manhã nutritivo'
            }
        elif 12 <= hour < 18:
            return {
                'period': 'afternoon',
                'greeting': 'Boa tarde',
                'focus': ['progresso do dia', 'almoço saudável', 'treino vespertino', 'energia'],
                'energy_level': 'peak',
                'meal_suggestion': 'almoço balanceado'
            }
        elif 18 <= hour < 22:
            return {
                'period': 'evening',
                'greeting': 'Boa noite',
                'focus': ['revisão do dia', 'jantar leve', 'relaxamento', 'preparação para amanhã'],
                'energy_level': 'declining',
                'meal_suggestion': 'jantar equilibrado'
            }
        else:
            return {
                'period': 'night',
                'greeting': 'Olá',
                'focus': ['descanso', 'recuperação', 'sono reparador', 'reflexão'],
                'energy_level': 'low',
                'meal_suggestion': 'lanche leve se necessário'
            }
    
    def analyze_progress(self, user_profile, recent_metrics):
        """Analisa progresso do usuário"""
        try:
            if not recent_metrics:
                return {'status': 'no_data', 'message': 'Dados insuficientes para análise'}
            
            # Análise de consistência
            days_with_data = len(recent_metrics)
            avg_steps = sum(m.get('steps', 0) for m in recent_metrics) / days_with_data
            avg_calories = sum(m.get('calories_burned', 0) for m in recent_metrics) / days_with_data
            avg_active_minutes = sum(m.get('active_minutes', 0) for m in recent_metrics) / days_with_data
            
            # Tendências
            if days_with_data >= 3:
                recent_steps = [m.get('steps', 0) for m in recent_metrics[:3]]
                step_trend = 'increasing' if recent_steps[0] > recent_steps[-1] else 'decreasing'
            else:
                step_trend = 'stable'
            
            # Avaliação geral
            goal = user_profile.get('goal', 'maintain')
            target_steps = 8000 if goal == 'lose_weight' else 6000
            
            analysis = {
                'consistency_score': min(100, (days_with_data / 7) * 100),
                'avg_steps': round(avg_steps),
                'avg_calories_burned': round(avg_calories),
                'avg_active_minutes': round(avg_active_minutes),
                'step_trend': step_trend,
                'meeting_step_goal': avg_steps >= target_steps,
                'overall_performance': self.calculate_performance_score(user_profile, recent_metrics),
                'recommendations': self.generate_recommendations(user_profile, recent_metrics)
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"❌ Erro na análise de progresso: {e}")
            return {'status': 'error', 'message': 'Erro na análise'}
    
    def calculate_performance_score(self, user_profile, recent_metrics):
        """Calcula score de performance geral"""
        if not recent_metrics:
            return 0
        
        goal = user_profile.get('goal', 'maintain')
        target_steps = 8000 if goal == 'lose_weight' else 6000
        target_active_minutes = 60 if goal == 'lose_weight' else 30
        
        scores = []
        for metric in recent_metrics:
            step_score = min(100, (metric.get('steps', 0) / target_steps) * 100)
            active_score = min(100, (metric.get('active_minutes', 0) / target_active_minutes) * 100)
            sleep_score = min(100, (metric.get('sleep_hours', 0) / 8) * 100)
            
            daily_score = (step_score + active_score + sleep_score) / 3
            scores.append(daily_score)
        
        return round(sum(scores) / len(scores))
    
    def generate_recommendations(self, user_profile, recent_metrics):
        """Gera recomendações personalizadas"""
        recommendations = []
        
        if not recent_metrics:
            return ['Comece registrando suas atividades diárias para receber recomendações personalizadas!']
        
        avg_steps = sum(m.get('steps', 0) for m in recent_metrics) / len(recent_metrics)
        avg_sleep = sum(m.get('sleep_hours', 0) for m in recent_metrics) / len(recent_metrics)
        avg_water = sum(m.get('water_intake', 0) for m in recent_metrics) / len(recent_metrics)
        
        goal = user_profile.get('goal', 'maintain')
        
        # Recomendações baseadas em passos
        if avg_steps < 6000:
            recommendations.append("Tente aumentar gradualmente seus passos diários. Comece com caminhadas de 10 minutos.")
        elif avg_steps > 12000:
            recommendations.append("Excelente atividade! Mantenha essa consistência e considere variar os tipos de exercício.")
        
        # Recomendações de sono
        if avg_sleep < 7:
            recommendations.append("Priorize dormir pelo menos 7-8 horas por noite para melhor recuperação.")
        
        # Recomendações de hidratação
        if avg_water < 2.0:
            recommendations.append("Aumente sua ingestão de água para pelo menos 2 litros por dia.")
        
        # Recomendações baseadas no objetivo
        if goal == 'lose_weight':
            recommendations.append("Para perda de peso, combine exercícios cardio com treino de força.")
        elif goal == 'gain_weight':
            recommendations.append("Foque em treinos de força e aumente a ingestão calórica com alimentos nutritivos.")
        
        return recommendations[:3]  # Máximo 3 recomendações
    
    def build_conversation_context(self, chat_history):
        """Constrói contexto das conversas anteriores"""
        if not chat_history:
            return {'status': 'new_user', 'topics': [], 'last_interaction': None}
        
        # Analisar tópicos recorrentes
        topics = []
        for chat in chat_history[:5]:  # Últimas 5 conversas
            message = chat.get('message', '').lower()
            if any(word in message for word in ['treino', 'exercício', 'musculação']):
                topics.append('treino')
            if any(word in message for word in ['dieta', 'alimentação', 'comida', 'calorias']):
                topics.append('nutrição')
            if any(word in message for word in ['peso', 'emagrecer', 'perder']):
                topics.append('peso')
            if any(word in message for word in ['motivação', 'desânimo', 'difícil']):
                topics.append('motivação')
        
        # Contar frequência dos tópicos
        topic_frequency = {}
        for topic in topics:
            topic_frequency[topic] = topic_frequency.get(topic, 0) + 1
        
        return {
            'status': 'returning_user',
            'frequent_topics': sorted(topic_frequency.items(), key=lambda x: x[1], reverse=True)[:3],
            'last_interaction': chat_history[0].get('timestamp') if chat_history else None,
            'conversation_count': len(chat_history)
        }
    
    def generate_contextual_prompt(self, user_message, context):
        """Gera prompt contextualizado para o Gemini"""
        user_profile = context.get('user_profile', {})
        time_context = context.get('time_context', {})
        progress_analysis = context.get('progress_analysis', {})
        conversation_context = context.get('conversation_context', {})
        
        prompt = f"""
Você é o Coach EVO, o assistente pessoal de fitness e nutrição do {user_profile.get('name', 'usuário')}.

PERFIL DO USUÁRIO:
- Nome: {user_profile.get('name', 'Usuário')}
- Idade: {user_profile.get('age', 25)} anos
- Objetivo: {self.translate_goal(user_profile.get('goal', 'maintain'))}
- Peso atual: {user_profile.get('weight', 70)}kg
- Meta de peso: {user_profile.get('target_weight', 65)}kg
- Nível de atividade: {self.translate_activity_level(user_profile.get('activity_level', 'moderate'))}
- TMB: {user_profile.get('bmr', 1650)} kcal/dia
- Calorias diárias: {user_profile.get('daily_calories', 2100)} kcal

CONTEXTO TEMPORAL:
- Horário: {time_context.get('period', 'dia')} ({context.get('current_datetime', '')})
- Saudação apropriada: {time_context.get('greeting', 'Olá')}
- Foco do período: {', '.join(time_context.get('focus', []))}

ANÁLISE DE PROGRESSO:
- Score de performance: {progress_analysis.get('overall_performance', 0)}/100
- Passos médios: {progress_analysis.get('avg_steps', 0)} por dia
- Tendência de atividade: {progress_analysis.get('step_trend', 'estável')}
- Atendendo meta de passos: {'Sim' if progress_analysis.get('meeting_step_goal') else 'Não'}

HISTÓRICO DE CONVERSAS:
- Status: {conversation_context.get('status', 'novo usuário')}
- Tópicos frequentes: {', '.join([t[0] for t in conversation_context.get('frequent_topics', [])])}
- Total de conversas: {conversation_context.get('conversation_count', 0)}

INSTRUÇÕES:
1. Responda de forma personalizada, usando o nome do usuário
2. Use a saudação apropriada para o horário
3. Considere o objetivo e progresso do usuário
4. Seja motivador, mas realista
5. Ofereça dicas práticas e específicas
6. Use linguagem brasileira natural e amigável
7. Mantenha respostas entre 100-300 palavras
8. Se relevante, mencione dados específicos do progresso

MENSAGEM DO USUÁRIO: {user_message}

Responda como Coach EVO de forma contextualizada e personalizada:
"""
        
        return prompt
    
    def translate_goal(self, goal):
        """Traduz objetivo para português"""
        translations = {
            'lose_weight': 'perder peso',
            'gain_weight': 'ganhar peso',
            'maintain': 'manter peso',
            'build_muscle': 'ganhar massa muscular',
            'improve_fitness': 'melhorar condicionamento'
        }
        return translations.get(goal, goal)
    
    def translate_activity_level(self, level):
        """Traduz nível de atividade para português"""
        translations = {
            'sedentary': 'sedentário',
            'light': 'levemente ativo',
            'moderate': 'moderadamente ativo',
            'active': 'ativo',
            'very_active': 'muito ativo'
        }
        return translations.get(level, level)
    
    def generate_response(self, user_message, context):
        """Gera resposta contextualizada usando Gemini AI"""
        try:
            if not self.model:
                return self.generate_fallback_response(user_message, context)
            
            # Construir prompt contextualizado
            prompt = self.generate_contextual_prompt(user_message, context)
            
            # Gerar resposta
            response = self.model.generate_content(prompt)
            
            if response and response.text:
                logger.info("✅ Resposta gerada pelo Gemini AI")
                return {
                    'response': response.text.strip(),
                    'source': 'gemini_ai',
                    'context_used': True,
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return self.generate_fallback_response(user_message, context)
                
        except Exception as e:
            logger.error(f"❌ Erro ao gerar resposta: {e}")
            return self.generate_fallback_response(user_message, context)
    
    def generate_fallback_response(self, user_message, context):
        """Gera resposta de fallback contextualizada"""
        user_profile = context.get('user_profile', {})
        time_context = context.get('time_context', {})
        progress_analysis = context.get('progress_analysis', {})
        
        name = user_profile.get('name', 'usuário')
        greeting = time_context.get('greeting', 'Olá')
        goal = self.translate_goal(user_profile.get('goal', 'maintain'))
        
        # Respostas baseadas em palavras-chave
        message_lower = user_message.lower()
        
        if any(word in message_lower for word in ['treino', 'exercício', 'musculação']):
            response = f"{greeting}, {name}! Para seu objetivo de {goal}, recomendo treinos regulares. "
            if progress_analysis.get('avg_active_minutes', 0) < 30:
                response += "Que tal começar com 30 minutos de atividade hoje?"
            else:
                response += "Você está indo bem com a atividade física! Continue assim."
                
        elif any(word in message_lower for word in ['dieta', 'alimentação', 'comida']):
            calories = user_profile.get('daily_calories', 2100)
            response = f"{greeting}, {name}! Sua meta calórica é de {calories} kcal/dia para {goal}. "
            response += "Foque em alimentos nutritivos e mantenha-se hidratado!"
            
        elif any(word in message_lower for word in ['peso', 'emagrecer', 'perder']):
            current = user_profile.get('weight', 70)
            target = user_profile.get('target_weight', 65)
            response = f"{greeting}, {name}! Seu peso atual é {current}kg e sua meta é {target}kg. "
            response += "Lembre-se: progresso sustentável é a chave!"
            
        elif any(word in message_lower for word in ['motivação', 'desânimo', 'difícil']):
            score = progress_analysis.get('overall_performance', 0)
            response = f"{greeting}, {name}! Entendo que pode ser desafiador. "
            if score > 70:
                response += f"Mas olhe seu progresso: {score}/100! Você está indo muito bem."
            else:
                response += "Cada pequeno passo conta. Vamos focar em uma meta simples para hoje?"
                
        else:
            response = f"{greeting}, {name}! Como seu coach pessoal, estou aqui para ajudar com fitness e nutrição. "
            response += "Como posso te apoiar hoje no seu objetivo de " + goal + "?"
        
        return {
            'response': response,
            'source': 'fallback_contextual',
            'context_used': True,
            'timestamp': datetime.now().isoformat()
        }
    
    def generate_daily_motivation(self, context):
        """Gera mensagem motivacional diária"""
        user_profile = context.get('user_profile', {})
        time_context = context.get('time_context', {})
        progress_analysis = context.get('progress_analysis', {})
        
        name = user_profile.get('name', 'usuário')
        greeting = time_context.get('greeting', 'Olá')
        period = time_context.get('period', 'day')
        
        motivations = {
            'morning': [
                f"{greeting}, {name}! Um novo dia, novas oportunidades de cuidar da sua saúde! 🌅",
                f"{greeting}! Que tal começar o dia com um copo d'água e alongamentos? 💪",
                f"Bom dia, {name}! Hoje é o dia perfeito para dar mais um passo em direção aos seus objetivos! ⭐"
            ],
            'afternoon': [
                f"{greeting}, {name}! Como está seu dia? Lembre-se de se manter hidratado! 💧",
                f"Boa tarde! Já pensou em fazer uma pausa ativa? Alguns minutos de movimento fazem diferença! 🚶‍♀️",
                f"{greeting}! Metade do dia já passou - como estão seus objetivos de hoje? 🎯"
            ],
            'evening': [
                f"{greeting}, {name}! Hora de refletir: o que você fez de bom pela sua saúde hoje? 🌟",
                f"Boa noite! Que tal preparar um jantar nutritivo e relaxar? 🍽️",
                f"{greeting}! O dia está terminando, mas seus cuidados com a saúde continuam! 💚"
            ],
            'night': [
                f"{greeting}, {name}! Hora de descansar e recuperar para um novo dia incrível! 😴",
                f"Boa noite! Um sono reparador é fundamental para seus objetivos de saúde! 🌙",
                f"{greeting}! Descanse bem - amanhã é um novo dia para cuidar de você! ✨"
            ]
        }
        
        import random
        base_message = random.choice(motivations.get(period, motivations['morning']))
        
        # Adicionar contexto de progresso se disponível
        if progress_analysis.get('overall_performance', 0) > 80:
            base_message += " Você está arrasando com uma performance de " + str(progress_analysis['overall_performance']) + "/100!"
        elif progress_analysis.get('overall_performance', 0) > 50:
            base_message += " Continue assim, você está no caminho certo!"
        
        return base_message

# Instância global
gemini_contextual = GeminiContextual()

