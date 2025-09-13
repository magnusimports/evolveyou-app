import google.generativeai as genai
import os

class GeminiAIService:
    def __init__(self):
        # A chave da API Gemini AI deve ser carregada de forma segura.
        # No contexto do EvolveYou, a Gemini AI já está integrada, então assumimos que a chave está disponível.
        # Para este exercício, usaremos a variável de ambiente OPENAI_API_KEY, que é configurada globalmente.
        # Em um ambiente real, seria uma chave específica da Gemini AI.
        genai.configure(api_key=os.environ.get("OPENAI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-pro")

    def generate_shopping_list_suggestions(self, user_preferences, purchase_history, current_list=None):
        prompt = f"Com base nas seguintes preferências do usuário: {user_preferences}, e histórico de compras: {purchase_history}."
        if current_list:
            prompt += f" A lista de compras atual é: {current_list}."
        prompt += " Sugira itens para uma lista de compras inteligente. Formate a saída como uma lista de itens separados por vírgula, sem numeração ou marcadores."
        
        try:
            response = self.model.generate_content(prompt)
            # A resposta da Gemini AI pode vir com formatação extra, vamos tentar extrair apenas o texto da lista.
            # Assumimos que a resposta será um texto simples com itens separados por vírgula.
            return response.text.strip()
        except Exception as e:
            print(f"Erro ao gerar sugestões com Gemini AI: {e}")
            return ""


