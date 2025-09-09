from fastapi import APIRouter, HTTPException, Depends, status, Request
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import structlog

from services.firebase_service import FirebaseService
from middleware.auth import get_current_user

router = APIRouter()
logger = structlog.get_logger()

class AnamneseData(BaseModel):
    full_name: str = Field(..., min_length=3, max_length=100)
    birth_date: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}$', description='YYYY-MM-DD')
    gender: str = Field(..., pattern='^(Masculino|Feminino|Outro)$')
    weight_kg: float = Field(..., gt=0)
    height_cm: float = Field(..., gt=0)
    activity_level: str = Field(..., pattern='^(Sedentário|Levemente Ativo|Moderadamente Ativo|Muito Ativo)$')
    health_conditions: Optional[List[str]] = Field(default_factory=list)
    medications: Optional[List[str]] = Field(default_factory=list)
    allergies: Optional[List[str]] = Field(default_factory=list)
    dietary_preferences: Optional[List[str]] = Field(default_factory=list)
    goals: List[str] = Field(..., min_length=1)

@router.post("/onboarding")
async def submit_anamnese(
    request: Request,
    data: AnamneseData,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    firebase_service: FirebaseService = request.app.state.firebase_service
    user_id = current_user["id"]
    logger.info("Recebendo dados de anamnese", user_id=user_id)

    try:
        # Preparar dados para o Firestore
        anamnese_data_dict = data.model_dump()
        
        # Atualizar perfil do usuário no Firestore com os dados da anamnese
        await firebase_service.update_user(
            user_id,
            {"anamnese_data": anamnese_data_dict, "onboarding_completed": True}
        )
        logger.info("Dados de anamnese salvos no Firestore", user_id=user_id)

        return {"message": "Anamnese recebida e perfil atualizado com sucesso", "user_id": user_id}
    except Exception as e:
        logger.error("Erro ao salvar dados de anamnese no Firestore", user_id=user_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao processar anamnese"
        )


