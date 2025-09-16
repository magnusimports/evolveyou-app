"""
Coach API - EvolveYou Backend
Endpoints para o Coach EVO com IA (Gemini)
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import os
import google.generativeai as genai

coach_api = Blueprint('coach_api', __name__)

# Configurar Gemini AI
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyD-PuRkqWjiz2Sbv0jLVq0b9NOp9kIFwdI')
genai.configure(api_key=GEMINI_API_KEY)

def get_user_context(user_id):
    """Simula contexto do usuário baseado na anamnese e progresso"""
    # Em produção, estes dados viriam do Firestore
    return {
        'name': 'Carlos',
        'age': 30,
        'goal': 'perder_peso',
        'experience': 'intermediario',
        'current_weight': 75,
        'target_weight': 70,
        'daily_calories': 2000,
        'workout_frequency': 4,
        'dietary_restrictions': [],
        'progress': {
            'workouts_this_week': 3,
            'calories_today': 1650,
            'water_intake': 1800
        }
    }

def create_coach_prompt(user_context, user_message, conversation_history):
    """Cria prompt contextualizado para o Gemini"""
    
    base_prompt = f"""
Você é o Coach EVO, um assistente pessoal de fitness e nutrição especializado em ajudar brasileiros a alcançarem seus objetivos de saúde.

CONTEXTO DO USUÁRIO:
- Nome: {user_context['name']}
- Idade: {user_context['age']} anos
- Objetivo: {user_context['goal']}
- Experiência: {user_context['experience']}
- Peso atual: {user_context['current_weight']}kg
- Meta de peso: {user_context['target_weight']}kg
- Calorias diárias: {user_context['daily_calories']} kcal
- Frequência de treino: {user_context['workout_frequency']}x por semana

PROGRESSO ATUAL:
- Treinos esta semana: {user_context['progress']['workouts_this_week']}
- Calorias consumidas hoje: {user_context['progress']['calories_today']} kcal
- Água consumida: {user_context['progress']['water_intake']} ml

PERSONALIDADE E ESTILO:
- Seja motivador, positivo e encorajador
- Use linguagem brasileira natural e acessível
- Seja específico e prático nas recomendações
- Celebre conquistas e progresso
- Ofereça soluções para desafios
- Mantenha foco em saúde e bem-estar

DIRETRIZES:
- Respostas entre 50-150 palavras
- Use emojis moderadamente (1-2 por resposta)
- Seja empático e compreensivo
- Baseie conselhos no contexto do usuário
- Incentive hábitos saudáveis sustentáveis
- Nunca dê conselhos médicos específicos

HISTÓRICO DA CONVERSA:
{conversation_history}

MENSAGEM DO USUÁRIO: {user_message}

Responda como Coach EVO:
"""
    
    return base_prompt

@coach_api.route('/api/coach/chat', methods=['POST'])
def chat_with_coach():
    """Processa mensagem do usuário e retorna resposta do Coach EVO"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        message = data.get('message', '').strip()
        conversation_history = data.get('history', [])
        
        if not message:
            return jsonify({
                'success': False,
                'error': 'Mensagem não pode estar vazia'
            }), 400
        
        # Obter contexto do usuário
        user_context = get_user_context(user_id)
        
        # Formatar histórico para o prompt
        history_text = ""
        for msg in conversation_history[-5:]:  # Últimas 5 mensagens
            role = "Usuário" if msg.get('sender') == 'user' else "Coach EVO"
            history_text += f"{role}: {msg.get('text', '')}\n"
        
        # Criar prompt contextualizado
        prompt = create_coach_prompt(user_context, message, history_text)
        
        # Gerar resposta com Gemini
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        coach_response = response.text.strip()
        
        # Criar objetos de mensagem
        user_message_obj = {
            'id': f"msg_{datetime.now().timestamp()}",
            'text': message,
            'sender': 'user',
            'timestamp': datetime.now().isoformat(),
            'type': 'text'
        }
        
        coach_message_obj = {
            'id': f"msg_{datetime.now().timestamp() + 1}",
            'text': coach_response,
            'sender': 'coach',
            'timestamp': datetime.now().isoformat(),
            'type': 'text'
        }
        
        return jsonify({
            'success': True,
            'data': {
                'user_message': user_message_obj,
                'coach_response': coach_message_obj,
                'conversation_id': f"conv_{user_id}_{datetime.now().strftime('%Y%m%d')}"
            }
        })
        
    except Exception as e:
        print(f"Erro no chat: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor',
            'fallback_response': {
                'id': f"msg_{datetime.now().timestamp()}",
                'text': "Desculpe, estou com dificuldades técnicas no momento. Tente novamente em alguns instantes! 💪",
                'sender': 'coach',
                'timestamp': datetime.now().isoformat(),
                'type': 'text'
            }
        }), 500

@coach_api.route('/api/coach/history/<user_id>', methods=['GET'])
def get_chat_history(user_id):
    """Retorna histórico de conversas do usuário"""
    try:
        # Em produção, carregaria do Firestore
        # Por enquanto, retorna histórico simulado
        sample_history = [
            {
                'id': 'msg_1',
                'text': 'Olá! Como posso te ajudar hoje?',
                'sender': 'coach',
                'timestamp': datetime.now().isoformat(),
                'type': 'text'
            }
        ]
        
        return jsonify({
            'success': True,
            'data': {
                'user_id': user_id,
                'messages': sample_history,
                'total': len(sample_history)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@coach_api.route('/api/coach/suggestions/<user_id>', methods=['GET'])
def get_suggestions(user_id):
    """Retorna sugestões de perguntas baseadas no contexto do usuário"""
    try:
        user_context = get_user_context(user_id)
        
        # Sugestões baseadas no objetivo e progresso
        suggestions = []
        
        if user_context['goal'] == 'perder_peso':
            suggestions.extend([
                "Como posso acelerar minha perda de peso?",
                "Quais exercícios queimam mais calorias?",
                "Dicas para controlar a fome?"
            ])
        elif user_context['goal'] == 'ganhar_massa':
            suggestions.extend([
                "Como ganhar massa muscular mais rápido?",
                "Qual a melhor dieta para hipertrofia?",
                "Quantas vezes devo treinar por semana?"
            ])
        
        # Sugestões baseadas no progresso
        if user_context['progress']['workouts_this_week'] < 2:
            suggestions.append("Como me motivar para treinar mais?")
        
        if user_context['progress']['water_intake'] < 2000:
            suggestions.append("Como beber mais água durante o dia?")
        
        # Sugestões gerais
        suggestions.extend([
            "Qual meu progresso esta semana?",
            "Dicas de alimentação saudável",
            "Como melhorar meu sono?"
        ])
        
        return jsonify({
            'success': True,
            'data': {
                'suggestions': suggestions[:6],  # Máximo 6 sugestões
                'user_id': user_id
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@coach_api.route('/api/coach/motivational-quote', methods=['GET'])
def get_motivational_quote():
    """Retorna frase motivacional do dia"""
    try:
        quotes = [
            "💪 Cada treino é um passo mais próximo do seu objetivo!",
            "🌟 Você é mais forte do que imagina!",
            "🔥 A consistência é a chave do sucesso!",
            "🎯 Foque no progresso, não na perfeição!",
            "💚 Cuide do seu corpo, ele é o único lugar que você tem para viver!",
            "🚀 Grandes resultados exigem grandes esforços!",
            "⭐ Acredite em você mesmo e tudo será possível!",
            "🏆 O sucesso é a soma de pequenos esforços repetidos diariamente!"
        ]
        
        import random
        quote = random.choice(quotes)
        
        return jsonify({
            'success': True,
            'data': {
                'quote': quote,
                'date': datetime.now().strftime('%Y-%m-%d')
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@coach_api.route('/api/coach/quick-tips/<category>', methods=['GET'])
def get_quick_tips(category):
    """Retorna dicas rápidas por categoria"""
    try:
        tips_db = {
            'nutrition': [
                "🥗 Inclua vegetais em todas as refeições",
                "💧 Beba água antes das refeições",
                "🍎 Prefira frutas inteiras ao invés de sucos",
                "🥜 Inclua gorduras boas como castanhas e abacate"
            ],
            'workout': [
                "🏃‍♂️ Aqueça sempre antes do treino",
                "💪 Foque na execução correta dos exercícios",
                "⏰ Descanse 48h entre treinos do mesmo grupo muscular",
                "📈 Aumente a carga progressivamente"
            ],
            'lifestyle': [
                "😴 Durma pelo menos 7-8 horas por noite",
                "🧘‍♂️ Pratique técnicas de relaxamento",
                "📱 Evite telas 1h antes de dormir",
                "🚶‍♂️ Caminhe pelo menos 10.000 passos por dia"
            ]
        }
        
        tips = tips_db.get(category, [])
        
        return jsonify({
            'success': True,
            'data': {
                'category': category,
                'tips': tips,
                'total': len(tips)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

