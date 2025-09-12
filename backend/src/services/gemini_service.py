import os
import google.generativeai as genai
from datetime import datetime
import json

class GeminiService:
    def __init__(self):
        self.model = None
        self.initialize_gemini()
    
    def initialize_gemini(self):
        """Inicializa o Gemini AI"""
        try:
            # Usar a API key do ambiente
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                print("❌ GEMINI_API_KEY não encontrada no ambiente")
                return False
            
            genai.configure(api_key=api_key)
            
            # Configurar o modelo
            generation_config = {
                "temperature": 0.7,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 1000,
            }
            
            safety_settings = [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
            
            self.model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            
            print("✅ Gemini AI inicializado com sucesso!")
            return True
            
        except Exception as e:
            print(f"❌ Erro ao inicializar Gemini: {e}")
            return False
    
    def get_coach_response(self, user_message, user_context=None):
        """Gera resposta do Coach EVO usando Gemini AI"""
        if not self.model:
            return self.get_fallback_response()
        
        try:
            # Construir prompt contextualizado
            system_prompt = self.build_coach_prompt(user_context)
            full_prompt = f"{system_prompt}\n\nUsuário: {user_message}\n\nCoach EVO:"
            
            # Gerar resposta
            response = self.model.generate_content(full_prompt)
            
            if response.text:
                return {
                    "message": response.text.strip(),
                    "source": "gemini_ai",
                    "timestamp": datetime.now().strftime("%H:%M")
                }
            else:
                return self.get_fallback_response()
                
        except Exception as e:
            print(f"Erro no Gemini: {e}")
            return self.get_fallback_response()
    
    def build_coach_prompt(self, user_context=None):
        """Constrói o prompt contextualizado para o Coach EVO"""
        base_prompt = """
Você é o Coach EVO, um assistente virtual especializado em fitness e nutrição do aplicativo EvolveYou. 

PERSONALIDADE:
- Motivador, empático e encorajador
- Usa linguagem brasileira informal mas respeitosa
- Foca em resultados práticos e sustentáveis
- Sempre positivo e construtivo

ESPECIALIDADES:
- Nutrição personalizada com base TACO brasileira
- Treinos adaptativos e progressivos
- Cálculos metabólicos precisos
- Motivação e acompanhamento psicológico

DIRETRIZES:
- Respostas curtas e objetivas (máximo 2-3 frases)
- Use emojis moderadamente para engajamento
- Sempre baseie sugestões nos dados do usuário
- Incentive hábitos saudáveis sustentáveis
- Nunca dê conselhos médicos específicos
"""
        
        if user_context:
            context_info = f"""
CONTEXTO DO USUÁRIO:
- Nome: {user_context.get('name', 'Usuário')}
- Idade: {user_context.get('age', 'N/A')} anos
- Peso atual: {user_context.get('current_weight', 'N/A')} kg
- Meta: {user_context.get('goal', 'N/A')}
- Nível de atividade: {user_context.get('activity_level', 'N/A')}
- TMB: {user_context.get('bmr', 'N/A')} kcal/dia
- Meta calórica: {user_context.get('target_calories', 'N/A')} kcal/dia

DADOS DE HOJE:
- Calorias consumidas: {user_context.get('current_calories', 'N/A')} kcal
- Passos: {user_context.get('steps', 'N/A')}
- Distância: {user_context.get('distance', 'N/A')} km
- Exercício: {user_context.get('exercise_minutes', 'N/A')} min
"""
            return base_prompt + context_info
        
        return base_prompt
    
    def get_nutrition_analysis(self, food_description, user_context=None):
        """Analisa alimentos usando Gemini AI"""
        if not self.model:
            return {"error": "Gemini não disponível"}
        
        try:
            prompt = f"""
Como Coach EVO especialista em nutrição brasileira, analise este alimento:

ALIMENTO: {food_description}

Forneça uma análise nutricional estimada no formato JSON:
{{
    "nome": "nome do alimento",
    "calorias_por_100g": número,
    "proteinas": número,
    "carboidratos": número,
    "gorduras": número,
    "fibras": número,
    "categoria": "categoria do alimento",
    "recomendacao": "breve recomendação personalizada"
}}

Base suas estimativas na tabela TACO brasileira quando possível.
"""
            
            response = self.model.generate_content(prompt)
            
            if response.text:
                # Tentar extrair JSON da resposta
                try:
                    # Limpar a resposta para extrair apenas o JSON
                    json_start = response.text.find('{')
                    json_end = response.text.rfind('}') + 1
                    
                    if json_start != -1 and json_end != -1:
                        json_str = response.text[json_start:json_end]
                        return json.loads(json_str)
                    else:
                        return {"error": "Formato de resposta inválido"}
                        
                except json.JSONDecodeError:
                    return {"error": "Erro ao processar análise nutricional"}
            
            return {"error": "Nenhuma resposta gerada"}
            
        except Exception as e:
            print(f"Erro na análise nutricional: {e}")
            return {"error": str(e)}
    
    def get_workout_suggestion(self, user_context=None, workout_type="geral"):
        """Sugere treinos personalizados usando Gemini AI"""
        if not self.model:
            return self.get_fallback_workout()
        
        try:
            prompt = f"""
Como Coach EVO especialista em treinos, crie uma sugestão de treino personalizada:

TIPO DE TREINO: {workout_type}
CONTEXTO DO USUÁRIO: {user_context or "Usuário iniciante"}

Forneça uma sugestão no formato:
- Aquecimento (5 min)
- 3-4 exercícios principais
- Resfriamento (5 min)
- Dicas de execução

Mantenha a resposta concisa e motivadora.
"""
            
            response = self.model.generate_content(prompt)
            
            if response.text:
                return {
                    "suggestion": response.text.strip(),
                    "source": "gemini_ai",
                    "workout_type": workout_type
                }
            else:
                return self.get_fallback_workout()
                
        except Exception as e:
            print(f"Erro na sugestão de treino: {e}")
            return self.get_fallback_workout()
    
    def get_motivational_message(self, user_progress=None):
        """Gera mensagem motivacional personalizada"""
        if not self.model:
            return "Você está indo muito bem! Continue assim! 💪"
        
        try:
            prompt = f"""
Como Coach EVO, crie uma mensagem motivacional curta e personalizada baseada no progresso:

PROGRESSO: {user_progress or "Usuário ativo"}

Critérios:
- Máximo 2 frases
- Tom encorajador e brasileiro
- Use 1 emoji relevante
- Foque nos pontos positivos
"""
            
            response = self.model.generate_content(prompt)
            
            if response.text:
                return response.text.strip()
            else:
                return "Você está fazendo um ótimo trabalho! Continue focado nos seus objetivos! 🎯"
                
        except Exception as e:
            print(f"Erro na mensagem motivacional: {e}")
            return "Cada dia é uma nova oportunidade de evoluir! Vamos juntos! 🚀"
    
    def get_fallback_response(self):
        """Resposta de fallback quando Gemini não está disponível"""
        fallback_responses = [
            "Ótima pergunta! Baseado no seu perfil, recomendo manter o foco na consistência dos treinos. 💪",
            "Vi que você está progredindo bem! Que tal aumentarmos a intensidade gradualmente? 🔥",
            "Lembre-se de manter a hidratação em dia. Seu corpo precisa de água para funcionar bem! 💧",
            "Seu progresso está excelente! Continue assim e você alcançará sua meta em breve. 🎯",
            "Posso sugerir algumas alternativas saudáveis para suas refeições. Vamos otimizar sua nutrição! 🥗"
        ]
        
        import random
        return {
            "message": random.choice(fallback_responses),
            "source": "fallback",
            "timestamp": datetime.now().strftime("%H:%M")
        }
    
    def get_fallback_workout(self):
        """Sugestão de treino de fallback"""
        return {
            "suggestion": """
🔥 TREINO DO DIA - CORPO INTEIRO

Aquecimento (5 min):
- Polichinelos: 30 seg
- Rotação de braços: 30 seg

Exercícios principais:
1. Agachamento: 3x12
2. Flexão (joelhos se necessário): 3x8
3. Prancha: 3x30 seg
4. Burpee modificado: 3x5

Resfriamento (5 min):
- Alongamento geral

💡 Dica: Foque na execução correta antes da velocidade!
            """,
            "source": "fallback",
            "workout_type": "geral"
        }

# Instância global do serviço
gemini_service = GeminiService()

