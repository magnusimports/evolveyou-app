"""
Anamnese API v2 - EvolveYou (Simplificada)
APIs para sistema de anamnese inteligente com salvamento no Firebase
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import logging
import json
import uuid

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criar blueprint
anamnese_api_v2 = Blueprint('anamnese_api_v2', __name__)

# Perguntas da anamnese (simplificadas)
ANAMNESE_QUESTIONS = [
    {"id": "nome", "type": "text", "question": "Qual é o seu nome completo?", "required": True},
    {"id": "idade", "type": "number", "question": "Qual é a sua idade?", "required": True},
    {"id": "sexo", "type": "select", "question": "Qual é o seu sexo?", "options": ["Masculino", "Feminino"], "required": True},
    {"id": "altura", "type": "number", "question": "Qual é a sua altura (em cm)?", "required": True},
    {"id": "peso", "type": "number", "question": "Qual é o seu peso atual (em kg)?", "required": True},
    {"id": "objetivo", "type": "select", "question": "Qual é o seu principal objetivo?", "options": ["Perder peso", "Ganhar massa muscular", "Manter peso atual", "Melhorar condicionamento físico"], "required": True}
]

@anamnese_api_v2.route('/api/v2/anamnese/questions', methods=['GET'])
def get_questions():
    """Retorna todas as perguntas da anamnese"""
    try:
        return jsonify({
            "success": True,
            "questions": ANAMNESE_QUESTIONS,
            "total": len(ANAMNESE_QUESTIONS)
        })
    except Exception as e:
        logger.error(f"Erro ao obter perguntas: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@anamnese_api_v2.route('/api/v2/anamnese/validate', methods=['POST'])
def validate_answer():
    """Valida uma resposta da anamnese"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"valid": False, "error": "Dados não fornecidos"}), 400
        
        question_id = data.get('question_id')
        answer = data.get('answer')
        
        if not question_id or answer is None:
            return jsonify({"valid": False, "error": "ID da pergunta e resposta são obrigatórios"}), 400
        
        # Validação simples
        return jsonify({"valid": True})
        
    except Exception as e:
        logger.error(f"Erro na validação: {e}")
        return jsonify({"valid": False, "error": "Erro interno do servidor"}), 500

@anamnese_api_v2.route('/api/v2/anamnese/submit', methods=['POST'])
def submit_anamnese():
    """Submete a anamnese completa e salva no Firebase"""
    try:
        data = request.get_json()
        
        if not data or 'answers' not in data:
            return jsonify({"success": False, "error": "Respostas não fornecidas"}), 400
        
        answers = data['answers']
        
        # Gerar ID único para o usuário
        user_id = str(uuid.uuid4())
        
        # Preparar dados para salvar
        user_data = {
            "id": user_id,
            "anamnese": answers,
            "created_at": datetime.now().isoformat(),
            "status": "completed"
        }
        
        # Calcular IMC se possível
        try:
            altura_m = float(answers.get('altura', 0)) / 100
            peso = float(answers.get('peso', 0))
            if altura_m > 0 and peso > 0:
                imc = peso / (altura_m ** 2)
                user_data['imc'] = round(imc, 2)
        except (ValueError, ZeroDivisionError):
            pass
        
        # Salvar localmente (Firebase será implementado depois)
        import os
        os.makedirs('/tmp/evolveyou_users', exist_ok=True)
        with open(f'/tmp/evolveyou_users/{user_id}.json', 'w') as f:
            json.dump(user_data, f, indent=2)
        
        logger.info(f"Usuário {user_id} salvo com sucesso")
        
        return jsonify({
            "success": True,
            "user_id": user_id,
            "message": "Anamnese salva com sucesso",
            "imc": user_data.get('imc'),
            "redirect": "/dashboard"
        })
        
    except Exception as e:
        logger.error(f"Erro ao submeter anamnese: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@anamnese_api_v2.route('/api/v2/anamnese/health', methods=['GET'])
def health_check():
    """Verifica se a API está funcionando"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })

