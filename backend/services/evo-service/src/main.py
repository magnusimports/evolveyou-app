"""
EVO Service - Coach Virtual do EvolveYou
API principal para interações com o Coach EVO
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import openai
from datetime import datetime
import json

# Configuração da OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI(
    title="EVO Service",
    description="Coach Virtual do EvolveYou",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos de dados
class ChatMessage(BaseModel):
    message: str
    user_id: str
    context: Optional[dict] = None

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime
    context: dict

class UserProfile(BaseModel):
    user_id: str
    name: str
    goals: List[str]
    preferences: dict

# Personalidade do EVO
EVO_PERSONALITY = """
Você é o EVO, o coach virtual do EvolveYou. Sua personalidade:

- Motivador e encorajador
- Conhecimento profundo em fitness e nutrição
- Linguagem amigável e acessível
- Sempre positivo e construtivo
- Adapta-se ao nível do usuário
- Foca em resultados sustentáveis
- Celebra pequenas vitórias

Sempre responda em português brasileiro e mantenha o foco em fitness, nutrição e bem-estar.
"""

@app.get("/")
async def root():
    """Endpoint raiz do EVO Service"""
    return {
        "service": "EVO Service",
        "status": "active",
        "version": "1.0.0",
        "description": "Coach Virtual do EvolveYou"
    }

@app.get("/health")
async def health_check():
    """Health check do serviço"""
    return {
        "status": "healthy",
        "service": "evo-service",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/evo/chat", response_model=ChatResponse)
async def chat_with_evo(message: ChatMessage):
    """
    Chat principal com o Coach EVO
    """
    try:
        # Preparar contexto para a IA
        system_prompt = EVO_PERSONALITY
        
        if message.context:
            system_prompt += f"\n\nContexto do usuário: {json.dumps(message.context, ensure_ascii=False)}"
        
        # Chamar OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message.message}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        evo_response = response.choices[0].message.content
        
        return ChatResponse(
            response=evo_response,
            timestamp=datetime.now(),
            context=message.context or {}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no chat com EVO: {str(e)}")

@app.get("/evo/personality")
async def get_evo_personality():
    """
    Retorna informações sobre a personalidade do EVO
    """
    return {
        "name": "EVO",
        "role": "Coach Virtual",
        "personality_traits": [
            "Motivador",
            "Conhecedor",
            "Amigável",
            "Positivo",
            "Adaptável"
        ],
        "specialties": [
            "Fitness",
            "Nutrição",
            "Motivação",
            "Planejamento de treinos",
            "Orientação alimentar"
        ]
    }

@app.post("/evo/motivation")
async def get_motivation_message(user_profile: UserProfile):
    """
    Gera mensagem motivacional personalizada
    """
    try:
        prompt = f"""
        Gere uma mensagem motivacional personalizada para {user_profile.name}.
        
        Objetivos: {', '.join(user_profile.goals)}
        Preferências: {json.dumps(user_profile.preferences, ensure_ascii=False)}
        
        A mensagem deve ser:
        - Curta (máximo 2 frases)
        - Motivadora
        - Específica para os objetivos
        - Em português brasileiro
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": EVO_PERSONALITY},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.8
        )
        
        motivation = response.choices[0].message.content
        
        return {
            "message": motivation,
            "timestamp": datetime.now().isoformat(),
            "user_id": user_profile.user_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar motivação: {str(e)}")

@app.post("/evo/plan-presentation")
async def present_plan(plan_data: dict):
    """
    Apresenta um plano de treino ou dieta de forma didática
    """
    try:
        prompt = f"""
        Apresente este plano de forma didática e motivadora:
        
        {json.dumps(plan_data, ensure_ascii=False)}
        
        Explique:
        - O que o usuário vai fazer
        - Por que é importante
        - Como vai ajudar nos objetivos
        - Dicas para sucesso
        
        Use linguagem amigável e motivadora.
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": EVO_PERSONALITY},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.7
        )
        
        presentation = response.choices[0].message.content
        
        return {
            "presentation": presentation,
            "timestamp": datetime.now().isoformat(),
            "plan_type": plan_data.get("type", "unknown")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na apresentação do plano: {str(e)}")

@app.get("/evo/tips")
async def get_daily_tips():
    """
    Retorna dicas diárias de fitness e nutrição
    """
    tips = [
        "💧 Beba pelo menos 2 litros de água hoje! Hidratação é fundamental para o desempenho.",
        "🏃‍♂️ Que tal uma caminhada de 10 minutos? Pequenos passos levam a grandes resultados!",
        "🥗 Inclua uma porção extra de vegetais na sua próxima refeição. Seu corpo agradece!",
        "😴 Durma bem! O descanso é quando seus músculos se recuperam e crescem.",
        "🧘‍♀️ Reserve 5 minutos para respirar profundamente. Sua mente também precisa de treino!",
        "🍎 Troque um lanche processado por uma fruta. Energia natural é sempre melhor!",
        "💪 Celebre cada pequena vitória! Você está mais forte que ontem.",
        "🎯 Foque no progresso, não na perfeição. Cada dia é uma nova oportunidade!"
    ]
    
    import random
    daily_tip = random.choice(tips)
    
    return {
        "tip": daily_tip,
        "date": datetime.now().date().isoformat(),
        "category": "daily_motivation"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)

