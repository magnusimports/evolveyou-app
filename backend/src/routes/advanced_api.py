"""
Advanced API Routes - EvolveYou Fase 1
APIs avançadas com Firebase real, Gemini contextualizado e métricas dinâmicas
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import logging
import json

# Importar serviços avançados
try:
    from ..services.firebase_advanced import firebase_advanced
    from ..services.gemini_contextual import gemini_contextual
except ImportError:
    # Fallback para desenvolvimento
    firebase_advanced = None
    gemini_contextual = None

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criar blueprint
advanced_api = Blueprint('advanced_api', __name__)

@advanced_api.route('/api/v2/auth/login', methods=['POST'])
def advanced_login():
    """Login avançado com criação de perfil"""
    try:
        data = request.get_json()
        email = data.get('email', '')
        password = data.get('password', '')
        
        # Para demo, aceitar qualquer login
        if email and password:
            user_id = f"user_{hash(email) % 10000}"
            
            # Criar ou obter perfil do usuário
            if firebase_advanced:
                profile = firebase_advanced.get_user_profile(user_id)
                if not profile:
                    # Criar novo perfil
                    user_data = {
                        'uid': user_id,
                        'name': data.get('name', email.split('@')[0]),
                        'email': email,
                        'age': data.get('age', 25),
                        'gender': data.get('gender', 'other'),
                        'height': data.get('height', 170),
                        'weight': data.get('weight', 70),
                        'target_weight': data.get('target_weight', 65),
                        'goal': data.get('goal', 'lose_weight'),
                        'activity_level': data.get('activity_level', 'moderate')
                    }
                    profile = firebase_advanced.create_user_profile(user_data)
            else:
                profile = {
                    'uid': user_id,
                    'name': email.split('@')[0],
                    'email': email,
                    'goal': 'lose_weight'
                }
            
            return jsonify({
                'success': True,
                'user': profile,
                'token': f"token_{user_id}",
                'message': 'Login realizado com sucesso!'
            })
        
        return jsonify({
            'success': False,
            'message': 'Email e senha são obrigatórios'
        }), 400
        
    except Exception as e:
        logger.error(f"Erro no login avançado: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500

@advanced_api.route('/api/v2/auth/guest', methods=['POST'])
def advanced_guest_login():
    """Login como convidado com perfil personalizado"""
    try:
        data = request.get_json() or {}
        user_id = "guest_user"
        
        # Criar perfil de convidado personalizado
        guest_profile = {
            'uid': user_id,
            'name': data.get('name', 'Usuário Convidado'),
            'email': '',
            'age': data.get('age', 25),
            'gender': data.get('gender', 'other'),
            'height': data.get('height', 170),
            'weight': data.get('weight', 70),
            'target_weight': data.get('target_weight', 65),
            'goal': data.get('goal', 'lose_weight'),
            'activity_level': data.get('activity_level', 'moderate'),
            'is_guest': True
        }
        
        # Calcular métricas personalizadas
        if firebase_advanced:
            guest_profile['bmr'] = firebase_advanced.calculate_bmr(guest_profile)
            guest_profile['daily_calories'] = firebase_advanced.calculate_daily_calories(guest_profile)
            guest_profile['macros'] = firebase_advanced.calculate_macros(guest_profile)
        
        return jsonify({
            'success': True,
            'user': guest_profile,
            'token': 'guest_token',
            'message': 'Bem-vindo como convidado!'
        })
        
    except Exception as e:
        logger.error(f"Erro no login de convidado: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500

@advanced_api.route('/api/v2/user/profile', methods=['GET'])
def get_advanced_profile():
    """Obtém perfil avançado do usuário"""
    try:
        user_id = request.headers.get('X-User-ID', 'guest_user')
        
        if firebase_advanced:
            profile = firebase_advanced.get_user_profile(user_id)
        else:
            profile = {
                'uid': user_id,
                'name': 'Usuário Convidado',
                'goal': 'lose_weight',
                'weight': 70,
                'target_weight': 65,
                'daily_calories': 2100,
                'bmr': 1650
            }
        
        return jsonify({
            'success': True,
            'profile': profile
        })
        
    except Exception as e:
        logger.error(f"Erro ao obter perfil: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro ao obter perfil'
        }), 500

@advanced_api.route('/api/v2/user/profile', methods=['PUT'])
def update_advanced_profile():
    """Atualiza perfil do usuário"""
    try:
        user_id = request.headers.get('X-User-ID', 'guest_user')
        data = request.get_json()
        
        if firebase_advanced:
            # Obter perfil atual
            current_profile = firebase_advanced.get_user_profile(user_id)
            
            # Atualizar campos fornecidos
            updated_profile = {**current_profile, **data}
            updated_profile['updated_at'] = datetime.now()
            
            # Recalcular métricas se necessário
            if any(key in data for key in ['weight', 'height', 'age', 'gender', 'goal', 'activity_level']):
                updated_profile['bmr'] = firebase_advanced.calculate_bmr(updated_profile)
                updated_profile['daily_calories'] = firebase_advanced.calculate_daily_calories(updated_profile)
                updated_profile['macros'] = firebase_advanced.calculate_macros(updated_profile)
            
            # Salvar no Firebase
            firebase_advanced.db.collection('users').document(user_id).set(updated_profile)
            
            return jsonify({
                'success': True,
                'profile': updated_profile,
                'message': 'Perfil atualizado com sucesso!'
            })
        
        return jsonify({
            'success': False,
            'message': 'Serviço indisponível'
        }), 503
        
    except Exception as e:
        logger.error(f"Erro ao atualizar perfil: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro ao atualizar perfil'
        }), 500

@advanced_api.route('/api/v2/metrics/daily', methods=['GET'])
def get_advanced_metrics():
    """Obtém métricas diárias avançadas"""
    try:
        user_id = request.headers.get('X-User-ID', 'guest_user')
        days = int(request.args.get('days', 7))
        
        if firebase_advanced:
            metrics = firebase_advanced.get_user_metrics(user_id, days)
        else:
            # Gerar métricas de exemplo
            metrics = []
            for i in range(days):
                date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
                metrics.append({
                    'date': date,
                    'steps': 8500 - (i * 200),
                    'distance': 6.2 - (i * 0.3),
                    'calories_burned': 450 - (i * 20),
                    'active_minutes': 75 - (i * 5),
                    'sleep_hours': 7.5,
                    'water_intake': 2.3,
                    'mood': 'good',
                    'energy_level': 'medium'
                })
        
        # Calcular estatísticas
        if metrics:
            total_steps = sum(m.get('steps', 0) for m in metrics)
            avg_steps = total_steps / len(metrics)
            total_distance = sum(m.get('distance', 0) for m in metrics)
            avg_calories = sum(m.get('calories_burned', 0) for m in metrics) / len(metrics)
            
            stats = {
                'total_steps': total_steps,
                'avg_steps_per_day': round(avg_steps),
                'total_distance': round(total_distance, 2),
                'avg_calories_per_day': round(avg_calories),
                'days_tracked': len(metrics),
                'consistency_score': min(100, (len(metrics) / days) * 100)
            }
        else:
            stats = {
                'total_steps': 0,
                'avg_steps_per_day': 0,
                'total_distance': 0,
                'avg_calories_per_day': 0,
                'days_tracked': 0,
                'consistency_score': 0
            }
        
        return jsonify({
            'success': True,
            'metrics': metrics,
            'statistics': stats,
            'period_days': days
        })
        
    except Exception as e:
        logger.error(f"Erro ao obter métricas: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro ao obter métricas'
        }), 500

@advanced_api.route('/api/v2/metrics/update', methods=['POST'])
def update_advanced_metrics():
    """Atualiza métricas do usuário"""
    try:
        user_id = request.headers.get('X-User-ID', 'guest_user')
        data = request.get_json()
        
        if firebase_advanced:
            updated_metrics = firebase_advanced.update_user_metrics(user_id, data)
            
            return jsonify({
                'success': True,
                'metrics': updated_metrics,
                'message': 'Métricas atualizadas com sucesso!'
            })
        
        return jsonify({
            'success': False,
            'message': 'Serviço indisponível'
        }), 503
        
    except Exception as e:
        logger.error(f"Erro ao atualizar métricas: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro ao atualizar métricas'
        }), 500

@advanced_api.route('/api/v2/coach/chat', methods=['POST'])
def advanced_coach_chat():
    """Chat avançado com Coach EVO contextualizado"""
    try:
        user_id = request.headers.get('X-User-ID', 'guest_user')
        data = request.get_json()
        message = data.get('message', '')
        
        if not message:
            return jsonify({
                'success': False,
                'message': 'Mensagem é obrigatória'
            }), 400
        
        # Obter contexto do usuário
        context = {}
        
        if firebase_advanced:
            # Perfil do usuário
            user_profile = firebase_advanced.get_user_profile(user_id)
            
            # Métricas recentes
            recent_metrics = firebase_advanced.get_user_metrics(user_id, 7)
            
            # Histórico de chat
            chat_history = firebase_advanced.get_chat_history(user_id, 10)
            
            context = {
                'user_profile': user_profile,
                'recent_metrics': recent_metrics,
                'chat_history': chat_history
            }
        
        # Gerar resposta contextualizada
        if gemini_contextual:
            # Construir contexto completo
            full_context = gemini_contextual.build_user_context(
                context.get('user_profile', {}),
                context.get('recent_metrics', []),
                context.get('chat_history', [])
            )
            
            # Gerar resposta
            response_data = gemini_contextual.generate_response(message, full_context)
            response_text = response_data.get('response', '')
            
        else:
            # Fallback simples
            response_text = f"Olá! Como seu Coach EVO, estou aqui para ajudar. Sobre '{message}', posso dizer que é importante manter consistência nos seus objetivos de saúde!"
            response_data = {
                'response': response_text,
                'source': 'fallback',
                'context_used': False
            }
        
        # Salvar conversa
        if firebase_advanced:
            firebase_advanced.save_chat_message(
                user_id, 
                message, 
                response_text, 
                context
            )
        
        return jsonify({
            'success': True,
            'response': response_text,
            'metadata': {
                'source': response_data.get('source', 'unknown'),
                'context_used': response_data.get('context_used', False),
                'timestamp': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Erro no chat avançado: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro no chat',
            'response': 'Desculpe, estou com dificuldades técnicas. Tente novamente em alguns instantes.'
        }), 500

@advanced_api.route('/api/v2/coach/motivation', methods=['GET'])
def get_daily_motivation():
    """Obtém mensagem motivacional diária"""
    try:
        user_id = request.headers.get('X-User-ID', 'guest_user')
        
        # Obter contexto
        context = {}
        if firebase_advanced:
            user_profile = firebase_advanced.get_user_profile(user_id)
            recent_metrics = firebase_advanced.get_user_metrics(user_id, 3)
            
            context = {
                'user_profile': user_profile,
                'recent_metrics': recent_metrics,
                'chat_history': []
            }
        
        # Gerar motivação
        if gemini_contextual:
            full_context = gemini_contextual.build_user_context(
                context.get('user_profile', {}),
                context.get('recent_metrics', []),
                []
            )
            motivation = gemini_contextual.generate_daily_motivation(full_context)
        else:
            motivation = "Olá! Hoje é um ótimo dia para cuidar da sua saúde! 💪"
        
        return jsonify({
            'success': True,
            'motivation': motivation,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erro ao gerar motivação: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro ao gerar motivação'
        }), 500

@advanced_api.route('/api/v2/analytics/progress', methods=['GET'])
def get_progress_analytics():
    """Obtém análise avançada de progresso"""
    try:
        user_id = request.headers.get('X-User-ID', 'guest_user')
        period = request.args.get('period', '30')  # dias
        
        if firebase_advanced:
            user_profile = firebase_advanced.get_user_profile(user_id)
            metrics = firebase_advanced.get_user_metrics(user_id, int(period))
            
            # Análise de progresso
            if gemini_contextual:
                progress_analysis = gemini_contextual.analyze_progress(user_profile, metrics)
            else:
                progress_analysis = {
                    'overall_performance': 75,
                    'consistency_score': 80,
                    'recommendations': ['Continue assim!']
                }
        else:
            progress_analysis = {
                'overall_performance': 75,
                'consistency_score': 80,
                'avg_steps': 8500,
                'meeting_step_goal': True,
                'recommendations': [
                    'Mantenha a consistência nos exercícios',
                    'Aumente gradualmente a intensidade',
                    'Foque na hidratação adequada'
                ]
            }
        
        return jsonify({
            'success': True,
            'analysis': progress_analysis,
            'period_days': int(period),
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Erro na análise de progresso: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro na análise de progresso'
        }), 500

@advanced_api.route('/api/v2/system/status', methods=['GET'])
def get_system_status():
    """Status do sistema avançado"""
    try:
        status = {
            'firebase_advanced': firebase_advanced is not None,
            'gemini_contextual': gemini_contextual is not None,
            'services': {
                'authentication': True,
                'user_profiles': firebase_advanced is not None,
                'metrics_tracking': firebase_advanced is not None,
                'ai_chat': gemini_contextual is not None,
                'progress_analytics': True
            },
            'version': '2.0.0',
            'phase': 'Fase 1 - Dados Reais e IA Avançada',
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'status': status
        })
        
    except Exception as e:
        logger.error(f"Erro no status do sistema: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro no status do sistema'
        }), 500

