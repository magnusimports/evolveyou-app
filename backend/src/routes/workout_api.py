"""
Workout API - EvolveYou Backend
Endpoints para planos de treino personalizados
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import random

workout_api = Blueprint('workout_api', __name__)

def generate_workout_plan(user_profile):
    """Gera plano de treino baseado no perfil do usuário"""
    
    # Exercícios por categoria
    exercises_db = {
        'peito': [
            {'name': 'Supino Reto', 'equipment': 'Barra', 'difficulty': 'intermediario'},
            {'name': 'Flexão de Braço', 'equipment': 'Peso Corporal', 'difficulty': 'iniciante'},
            {'name': 'Supino Inclinado', 'equipment': 'Halteres', 'difficulty': 'intermediario'},
            {'name': 'Crucifixo', 'equipment': 'Halteres', 'difficulty': 'iniciante'},
            {'name': 'Mergulho', 'equipment': 'Paralelas', 'difficulty': 'avancado'}
        ],
        'costas': [
            {'name': 'Puxada Frontal', 'equipment': 'Máquina', 'difficulty': 'iniciante'},
            {'name': 'Remada Curvada', 'equipment': 'Barra', 'difficulty': 'intermediario'},
            {'name': 'Barra Fixa', 'equipment': 'Peso Corporal', 'difficulty': 'avancado'},
            {'name': 'Remada Sentada', 'equipment': 'Cabo', 'difficulty': 'iniciante'},
            {'name': 'Levantamento Terra', 'equipment': 'Barra', 'difficulty': 'avancado'}
        ],
        'pernas': [
            {'name': 'Agachamento', 'equipment': 'Barra', 'difficulty': 'intermediario'},
            {'name': 'Leg Press', 'equipment': 'Máquina', 'difficulty': 'iniciante'},
            {'name': 'Afundo', 'equipment': 'Halteres', 'difficulty': 'iniciante'},
            {'name': 'Cadeira Extensora', 'equipment': 'Máquina', 'difficulty': 'iniciante'},
            {'name': 'Mesa Flexora', 'equipment': 'Máquina', 'difficulty': 'iniciante'}
        ],
        'ombros': [
            {'name': 'Desenvolvimento', 'equipment': 'Halteres', 'difficulty': 'intermediario'},
            {'name': 'Elevação Lateral', 'equipment': 'Halteres', 'difficulty': 'iniciante'},
            {'name': 'Elevação Frontal', 'equipment': 'Halteres', 'difficulty': 'iniciante'},
            {'name': 'Remada Alta', 'equipment': 'Barra', 'difficulty': 'intermediario'},
            {'name': 'Crucifixo Inverso', 'equipment': 'Halteres', 'difficulty': 'iniciante'}
        ],
        'bracos': [
            {'name': 'Rosca Direta', 'equipment': 'Barra', 'difficulty': 'iniciante'},
            {'name': 'Tríceps Testa', 'equipment': 'Halteres', 'difficulty': 'iniciante'},
            {'name': 'Rosca Martelo', 'equipment': 'Halteres', 'difficulty': 'iniciante'},
            {'name': 'Tríceps Pulley', 'equipment': 'Cabo', 'difficulty': 'iniciante'},
            {'name': 'Rosca Concentrada', 'equipment': 'Halteres', 'difficulty': 'intermediario'}
        ],
        'cardio': [
            {'name': 'Esteira', 'equipment': 'Máquina', 'difficulty': 'iniciante'},
            {'name': 'Bicicleta', 'equipment': 'Máquina', 'difficulty': 'iniciante'},
            {'name': 'Elíptico', 'equipment': 'Máquina', 'difficulty': 'iniciante'},
            {'name': 'Corrida', 'equipment': 'Peso Corporal', 'difficulty': 'intermediario'},
            {'name': 'HIIT', 'equipment': 'Peso Corporal', 'difficulty': 'avancado'}
        ]
    }
    
    # Determinar frequência e divisão baseado no nível
    experience = user_profile.get('experience', 'iniciante')
    goal = user_profile.get('goal', 'perder_peso')
    
    if experience == 'iniciante':
        frequency = 3
        split_type = 'full_body'
    elif experience == 'intermediario':
        frequency = 4
        split_type = 'upper_lower'
    else:
        frequency = 5
        split_type = 'push_pull_legs'
    
    # Gerar treinos da semana
    weekly_plan = []
    
    for day in range(frequency):
        if split_type == 'full_body':
            muscle_groups = ['peito', 'costas', 'pernas', 'ombros', 'bracos']
            if goal == 'perder_peso':
                muscle_groups.append('cardio')
        elif split_type == 'upper_lower':
            if day % 2 == 0:
                muscle_groups = ['peito', 'costas', 'ombros', 'bracos']
            else:
                muscle_groups = ['pernas']
                if goal == 'perder_peso':
                    muscle_groups.append('cardio')
        else:  # push_pull_legs
            if day % 3 == 0:
                muscle_groups = ['peito', 'ombros', 'bracos']  # Push
            elif day % 3 == 1:
                muscle_groups = ['costas', 'bracos']  # Pull
            else:
                muscle_groups = ['pernas']  # Legs
                if goal == 'perder_peso':
                    muscle_groups.append('cardio')
        
        # Selecionar exercícios
        workout_exercises = []
        for muscle_group in muscle_groups:
            available_exercises = [ex for ex in exercises_db[muscle_group] 
                                 if ex['difficulty'] in ['iniciante', experience]]
            
            if muscle_group == 'cardio':
                selected = random.choice(available_exercises)
                workout_exercises.append({
                    'name': selected['name'],
                    'muscle_group': muscle_group,
                    'sets': 1,
                    'reps': '20-30 min',
                    'rest': '60s',
                    'equipment': selected['equipment'],
                    'notes': 'Mantenha intensidade moderada'
                })
            else:
                num_exercises = 2 if split_type == 'full_body' else 3
                selected_exercises = random.sample(available_exercises, 
                                                 min(num_exercises, len(available_exercises)))
                
                for exercise in selected_exercises:
                    if experience == 'iniciante':
                        sets = random.randint(2, 3)
                        reps = f"{random.randint(10, 15)}-{random.randint(12, 15)}"
                    elif experience == 'intermediario':
                        sets = random.randint(3, 4)
                        reps = f"{random.randint(8, 12)}-{random.randint(10, 15)}"
                    else:
                        sets = random.randint(3, 5)
                        reps = f"{random.randint(6, 10)}-{random.randint(8, 12)}"
                    
                    workout_exercises.append({
                        'name': exercise['name'],
                        'muscle_group': muscle_group,
                        'sets': sets,
                        'reps': reps,
                        'rest': '60-90s',
                        'equipment': exercise['equipment'],
                        'notes': f'Foque na execução correta'
                    })
        
        # Determinar nome do treino
        if split_type == 'full_body':
            workout_name = f'Treino Full Body {day + 1}'
        elif split_type == 'upper_lower':
            workout_name = f'Treino {"Superior" if day % 2 == 0 else "Inferior"} {(day // 2) + 1}'
        else:
            names = ['Push', 'Pull', 'Legs']
            workout_name = f'Treino {names[day % 3]} {(day // 3) + 1}'
        
        weekly_plan.append({
            'day': day + 1,
            'name': workout_name,
            'muscle_groups': muscle_groups,
            'exercises': workout_exercises,
            'estimated_duration': f'{len(workout_exercises) * 3 + 10}-{len(workout_exercises) * 4 + 15} min',
            'difficulty': experience,
            'completed': False
        })
    
    return {
        'frequency': frequency,
        'split_type': split_type,
        'weekly_plan': weekly_plan,
        'total_exercises': sum(len(day['exercises']) for day in weekly_plan)
    }

@workout_api.route('/api/workout/plan/<user_id>', methods=['GET'])
def get_workout_plan(user_id):
    """Retorna plano de treino personalizado para o usuário"""
    try:
        # Simular perfil do usuário (em produção viria do Firestore)
        user_profile = {
            'experience': 'intermediario',
            'goal': 'perder_peso',
            'available_days': 4,
            'equipment_access': 'academia',
            'time_per_session': 60
        }
        
        # Gerar plano personalizado
        workout_plan = generate_workout_plan(user_profile)
        
        return jsonify({
            'success': True,
            'data': {
                'user_id': user_id,
                'plan': workout_plan,
                'created_at': datetime.now().isoformat(),
                'valid_until': (datetime.now() + timedelta(days=7)).isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@workout_api.route('/api/workout/progress/<user_id>', methods=['GET'])
def get_workout_progress(user_id):
    """Retorna progresso semanal de treinos"""
    try:
        # Simular progresso da semana
        today = datetime.now()
        week_start = today - timedelta(days=today.weekday())
        
        weekly_progress = []
        for i in range(7):
            date = week_start + timedelta(days=i)
            
            # Simular se houve treino neste dia
            has_workout = random.choice([True, False, False])  # 33% chance
            
            if has_workout:
                progress_data = {
                    'date': date.strftime('%Y-%m-%d'),
                    'day_name': date.strftime('%A'),
                    'completed': True,
                    'workout_name': random.choice(['Treino Superior', 'Treino Inferior', 'Treino Full Body']),
                    'duration': random.randint(45, 75),
                    'exercises_completed': random.randint(6, 10),
                    'calories_burned': random.randint(200, 400)
                }
            else:
                progress_data = {
                    'date': date.strftime('%Y-%m-%d'),
                    'day_name': date.strftime('%A'),
                    'completed': False,
                    'workout_name': None,
                    'duration': 0,
                    'exercises_completed': 0,
                    'calories_burned': 0
                }
            
            weekly_progress.append(progress_data)
        
        # Calcular estatísticas da semana
        completed_workouts = sum(1 for day in weekly_progress if day['completed'])
        total_duration = sum(day['duration'] for day in weekly_progress)
        total_calories = sum(day['calories_burned'] for day in weekly_progress)
        
        stats = {
            'completed_workouts': completed_workouts,
            'total_workouts_planned': 4,
            'completion_rate': round((completed_workouts / 4) * 100, 1),
            'total_duration': total_duration,
            'total_calories_burned': total_calories,
            'average_duration': round(total_duration / max(completed_workouts, 1), 1)
        }
        
        return jsonify({
            'success': True,
            'data': {
                'user_id': user_id,
                'week_start': week_start.strftime('%Y-%m-%d'),
                'weekly_progress': weekly_progress,
                'stats': stats
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@workout_api.route('/api/workout/complete', methods=['POST'])
def complete_workout():
    """Marca um treino como completo"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        workout_id = data.get('workout_id')
        duration = data.get('duration', 0)
        exercises_completed = data.get('exercises_completed', 0)
        
        # Em produção, salvaria no Firestore
        completion_data = {
            'user_id': user_id,
            'workout_id': workout_id,
            'completed_at': datetime.now().isoformat(),
            'duration': duration,
            'exercises_completed': exercises_completed,
            'calories_burned': duration * 5,  # Estimativa simples
        }
        
        return jsonify({
            'success': True,
            'message': 'Treino marcado como completo!',
            'data': completion_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@workout_api.route('/api/workout/exercises/<muscle_group>', methods=['GET'])
def get_exercises_by_muscle_group(muscle_group):
    """Retorna exercícios por grupo muscular"""
    try:
        exercises_db = {
            'peito': [
                {'name': 'Supino Reto', 'equipment': 'Barra', 'difficulty': 'intermediario', 'description': 'Exercício fundamental para peito'},
                {'name': 'Flexão de Braço', 'equipment': 'Peso Corporal', 'difficulty': 'iniciante', 'description': 'Exercício básico sem equipamentos'},
                {'name': 'Supino Inclinado', 'equipment': 'Halteres', 'difficulty': 'intermediario', 'description': 'Foca na parte superior do peito'},
            ],
            'costas': [
                {'name': 'Puxada Frontal', 'equipment': 'Máquina', 'difficulty': 'iniciante', 'description': 'Exercício básico para costas'},
                {'name': 'Remada Curvada', 'equipment': 'Barra', 'difficulty': 'intermediario', 'description': 'Exercício composto para costas'},
                {'name': 'Barra Fixa', 'equipment': 'Peso Corporal', 'difficulty': 'avancado', 'description': 'Exercício avançado com peso corporal'},
            ],
            # Adicionar outros grupos conforme necessário
        }
        
        exercises = exercises_db.get(muscle_group.lower(), [])
        
        return jsonify({
            'success': True,
            'data': {
                'muscle_group': muscle_group,
                'exercises': exercises,
                'total': len(exercises)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

