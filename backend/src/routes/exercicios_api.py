"""
API para consulta de exercícios
"""

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from firebase_admin import firestore
import logging
import random
from datetime import datetime, timedelta

exercicios_bp = Blueprint('exercicios', __name__)
logger = logging.getLogger(__name__)

@exercicios_bp.route('/search', methods=['GET'])
@cross_origin()
def search_exercicios():
    """Busca exercícios por nome ou categoria"""
    try:
        # Parâmetros da consulta
        query = request.args.get('q', '').strip()
        categoria = request.args.get('categoria', '').strip()
        nivel = request.args.get('nivel', '').strip()
        equipamento = request.args.get('equipamento', '').strip()
        limit = min(int(request.args.get('limit', 20)), 100)
        
        # Conectar ao Firestore
        db = firestore.client()
        collection_ref = db.collection('exercicios')
        
        # Construir consulta base
        query_ref = collection_ref.where('ativo', '==', True)
        
        # Aplicar filtros
        if categoria:
            query_ref = query_ref.where('categoria', '==', categoria)
        if nivel:
            query_ref = query_ref.where('nivel', '==', nivel)
        if equipamento:
            query_ref = query_ref.where('equipamento', '==', equipamento)
        
        docs = query_ref.limit(limit).stream()
        
        # Processar resultados
        exercicios = []
        for doc in docs:
            data = doc.to_dict()
            
            # Filtrar por query se especificado
            if query:
                nome = data.get('nome', '').lower()
                if query.lower() not in nome:
                    continue
            
            # Formatar dados para resposta
            exercicio = {
                "id": doc.id,
                "nome": data.get('nome', ''),
                "categoria": data.get('categoria', ''),
                "grupo_muscular": data.get('grupo_muscular', ''),
                "equipamento": data.get('equipamento', ''),
                "nivel": data.get('nivel', ''),
                "descricao": data.get('descricao', ''),
                "musculos_primarios": data.get('musculos_primarios', []),
                "musculos_secundarios": data.get('musculos_secundarios', []),
                "calorias_por_minuto": data.get('calorias_por_minuto', 0),
                "tipo": data.get('tipo', '')
            }
            exercicios.append(exercicio)
        
        return jsonify({
            "success": True,
            "data": exercicios,
            "total": len(exercicios),
            "filtros": {
                "query": query,
                "categoria": categoria,
                "nivel": nivel,
                "equipamento": equipamento
            }
        })
        
    except Exception as e:
        logger.error(f"Erro ao buscar exercícios: {e}")
        return jsonify({
            "success": False,
            "error": "Erro interno do servidor"
        }), 500

@exercicios_bp.route('/categorias', methods=['GET'])
@cross_origin()
def get_categorias():
    """Retorna lista de categorias de exercícios"""
    try:
        categorias = [
            "Peito",
            "Costas", 
            "Pernas",
            "Ombros",
            "Braços",
            "Core",
            "Cardio",
            "Funcional",
            "Alongamento"
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

@exercicios_bp.route('/equipamentos', methods=['GET'])
@cross_origin()
def get_equipamentos():
    """Retorna lista de equipamentos"""
    try:
        equipamentos = [
            "Peso Corporal",
            "Halteres",
            "Barra",
            "Máquina",
            "Polia",
            "Elástico",
            "Kettlebell",
            "Medicine Ball",
            "TRX",
            "Esteira",
            "Bicicleta"
        ]
        
        return jsonify({
            "success": True,
            "data": equipamentos
        })
        
    except Exception as e:
        logger.error(f"Erro ao buscar equipamentos: {e}")
        return jsonify({
            "success": False,
            "error": "Erro interno do servidor"
        }), 500

@exercicios_bp.route('/<exercicio_id>', methods=['GET'])
@cross_origin()
def get_exercicio_detalhes(exercicio_id):
    """Retorna detalhes completos de um exercício"""
    try:
        db = firestore.client()
        doc_ref = db.collection('exercicios').document(exercicio_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({
                "success": False,
                "error": "Exercício não encontrado"
            }), 404
        
        data = doc.to_dict()
        
        return jsonify({
            "success": True,
            "data": data
        })
        
    except Exception as e:
        logger.error(f"Erro ao buscar detalhes do exercício: {e}")
        return jsonify({
            "success": False,
            "error": "Erro interno do servidor"
        }), 500

@exercicios_bp.route('/treino/gerar', methods=['POST'])
@cross_origin()
def gerar_treino():
    """Gera um treino personalizado baseado nos parâmetros"""
    try:
        data = request.get_json()
        
        # Parâmetros padrão
        objetivo = data.get('objetivo', 'hipertrofia')  # hipertrofia, emagrecimento, força
        nivel = data.get('nivel', 'Iniciante')  # Iniciante, Intermediário, Avançado
        tempo_disponivel = data.get('tempo_minutos', 60)
        equipamentos = data.get('equipamentos', ['Peso Corporal', 'Halteres'])
        grupos_musculares = data.get('grupos_musculares', ['Peito', 'Costas', 'Pernas'])
        
        # Conectar ao Firestore
        db = firestore.client()
        
        # Buscar exercícios disponíveis
        exercicios_disponiveis = []
        for categoria in grupos_musculares:
            docs = db.collection('exercicios').where('categoria', '==', categoria).where('nivel', '==', nivel).limit(10).stream()
            for doc in docs:
                exercicio_data = doc.to_dict()
                exercicio_data['id'] = doc.id
                
                # Filtrar por equipamento disponível
                if exercicio_data.get('equipamento') in equipamentos:
                    exercicios_disponiveis.append(exercicio_data)
        
        if not exercicios_disponiveis:
            return jsonify({
                "success": False,
                "error": "Nenhum exercício encontrado com os critérios especificados"
            }), 400
        
        # Gerar treino baseado no objetivo
        treino = []
        tempo_usado = 0
        
        if objetivo == 'hipertrofia':
            # 3-4 exercícios por grupo muscular, 3-4 séries, 8-12 reps
            for categoria in grupos_musculares:
                exercicios_categoria = [e for e in exercicios_disponiveis if e['categoria'] == categoria]
                exercicios_selecionados = random.sample(exercicios_categoria, min(3, len(exercicios_categoria)))
                
                for exercicio in exercicios_selecionados:
                    series = random.randint(3, 4)
                    reps = random.randint(8, 12)
                    descanso = random.randint(60, 90)
                    tempo_exercicio = series * (reps * 3 + descanso)  # 3 segundos por rep + descanso
                    
                    if tempo_usado + tempo_exercicio <= tempo_disponivel * 60:
                        treino.append({
                            "exercicio": exercicio,
                            "series": series,
                            "repeticoes": reps,
                            "descanso_segundos": descanso,
                            "tempo_estimado_segundos": tempo_exercicio,
                            "observacoes": "Foque na execução correta e controle do movimento"
                        })
                        tempo_usado += tempo_exercicio
        
        elif objetivo == 'emagrecimento':
            # Mais exercícios, menos descanso, mais cardio
            exercicios_cardio = [e for e in exercicios_disponiveis if e['tipo'] == 'Cardio']
            exercicios_forca = [e for e in exercicios_disponiveis if e['tipo'] == 'Força']
            
            # Intercalar força e cardio
            for i in range(min(8, len(exercicios_forca))):
                exercicio = random.choice(exercicios_forca)
                series = random.randint(2, 3)
                reps = random.randint(12, 20)
                descanso = random.randint(30, 45)
                tempo_exercicio = series * (reps * 2 + descanso)
                
                if tempo_usado + tempo_exercicio <= tempo_disponivel * 60:
                    treino.append({
                        "exercicio": exercicio,
                        "series": series,
                        "repeticoes": reps,
                        "descanso_segundos": descanso,
                        "tempo_estimado_segundos": tempo_exercicio,
                        "observacoes": "Mantenha intensidade alta e descanso curto"
                    })
                    tempo_usado += tempo_exercicio
        
        elif objetivo == 'força':
            # Menos exercícios, mais séries, menos reps, mais descanso
            exercicios_compostos = [e for e in exercicios_disponiveis if 'Agachamento' in e['nome'] or 'Supino' in e['nome'] or 'Remada' in e['nome']]
            
            for exercicio in exercicios_compostos[:5]:
                series = random.randint(4, 5)
                reps = random.randint(3, 6)
                descanso = random.randint(120, 180)
                tempo_exercicio = series * (reps * 4 + descanso)
                
                if tempo_usado + tempo_exercicio <= tempo_disponivel * 60:
                    treino.append({
                        "exercicio": exercicio,
                        "series": series,
                        "repeticoes": reps,
                        "descanso_segundos": descanso,
                        "tempo_estimado_segundos": tempo_exercicio,
                        "observacoes": "Foque em cargas altas e execução perfeita"
                    })
                    tempo_usado += tempo_exercicio
        
        # Calcular estatísticas do treino
        total_exercicios = len(treino)
        tempo_total_minutos = round(tempo_usado / 60, 1)
        calorias_estimadas = sum([ex['exercicio'].get('calorias_por_minuto', 5) * (ex['tempo_estimado_segundos'] / 60) for ex in treino])
        
        return jsonify({
            "success": True,
            "data": {
                "treino": treino,
                "estatisticas": {
                    "total_exercicios": total_exercicios,
                    "tempo_total_minutos": tempo_total_minutos,
                    "calorias_estimadas": round(calorias_estimadas),
                    "objetivo": objetivo,
                    "nivel": nivel
                },
                "gerado_em": datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Erro ao gerar treino: {e}")
        return jsonify({
            "success": False,
            "error": "Erro interno do servidor"
        }), 500

@exercicios_bp.route('/historico', methods=['GET'])
@cross_origin()
def get_historico_treinos():
    """Retorna histórico de treinos (mock para demonstração)"""
    try:
        # Dados mock para demonstração
        historico = []
        for i in range(7):
            data_treino = datetime.now() - timedelta(days=i)
            historico.append({
                "id": f"treino_{i}",
                "data": data_treino.strftime("%Y-%m-%d"),
                "tipo": random.choice(["Peito e Tríceps", "Costas e Bíceps", "Pernas", "Ombros", "Cardio"]),
                "duracao_minutos": random.randint(45, 90),
                "exercicios_realizados": random.randint(6, 12),
                "calorias_queimadas": random.randint(200, 500),
                "status": "concluido" if i > 0 else "em_andamento"
            })
        
        return jsonify({
            "success": True,
            "data": historico
        })
        
    except Exception as e:
        logger.error(f"Erro ao buscar histórico: {e}")
        return jsonify({
            "success": False,
            "error": "Erro interno do servidor"
        }), 500

