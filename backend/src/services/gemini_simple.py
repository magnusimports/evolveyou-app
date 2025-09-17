"""
Serviço Gemini Simplificado para APIs
"""

import google.generativeai as genai
import os
import logging

logger = logging.getLogger(__name__)

class GeminiSimple:
    def __init__(self):
        self.model = None
        self.initialize_gemini()
    
    def initialize_gemini(self):
        """Inicializa Gemini AI"""
        try:
            api_key = os.getenv('GEMINI_API_KEY')
            if api_key:
                genai.configure(api_key=api_key)
                
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
                
                logger.info("✅ Gemini Simple inicializado com sucesso")
            else:
                logger.warning("⚠️ GEMINI_API_KEY não encontrada")
                
        except Exception as e:
            logger.error(f"❌ Erro ao inicializar Gemini: {e}")
            self.model = None
    
    def generate_response(self, prompt):
        """Gera resposta simples usando Gemini AI"""
        try:
            if not self.model:
                return "Desculpe, o serviço de IA está temporariamente indisponível. Tente novamente mais tarde."
            
            response = self.model.generate_content(prompt)
            
            if response and response.text:
                return response.text.strip()
            else:
                return "Não foi possível gerar uma resposta. Tente reformular sua pergunta."
                
        except Exception as e:
            logger.error(f"❌ Erro ao gerar resposta: {e}")
            return "Ocorreu um erro ao processar sua solicitação. Tente novamente."

