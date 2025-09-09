import structlog
from datetime import date
from typing import Optional

from .firebase_service import FirebaseService
from algorithms.workout_generator import WorkoutGenerator
from algorithms.diet_generator import DietGenerator
from models.plan import WorkoutPlan, DietPlan, AlgorithmConfig, WorkoutPreferences, DietPreferences

logger = structlog.get_logger(__name__)

class PlanService:
    """Serviço central para orquestrar a geração de planos de treino e dieta."""

    def __init__(self):
        self.firebase_service: Optional[FirebaseService] = None
        self.workout_generator: Optional[WorkoutGenerator] = None
        self.diet_generator: Optional[DietGenerator] = None

    async def initialize(self, firebase_service: FirebaseService):
        """Inicializa o serviço de planos com as dependências necessárias."""
        self.firebase_service = firebase_service
        self.workout_generator = WorkoutGenerator(content_service=None, firebase_service=firebase_service) # content_service needs to be implemented
        self.diet_generator = DietGenerator(content_service=None, firebase_service=firebase_service) # content_service needs to be implemented
        logger.info("PlanService inicializado.")

    async def health_check(self) -> dict:
        """Verifica a saúde do serviço de planos."""
        status = {"status": "ok"}
        # Adicionar verificações de saúde para geradores se necessário
        return status

    async def health_check_services(self) -> dict:
        """Verifica a conectividade com serviços externos."""
        # Implementar verificações para Content Service, etc.
        return {"content_service": "mock_ok"}

    async def get_metrics(self) -> dict:
        """Retorna métricas do serviço."""
        return {"generated_plans_count": 0}

    async def generate_workout_plan(
        self, user_id: str, target_date: Optional[str] = None
    ) -> WorkoutPlan:
        """Gera um plano de treino para o usuário."""
        if not self.workout_generator:
            raise RuntimeError("WorkoutGenerator não inicializado.")
        
        # Mock de AlgorithmConfig - precisa ser obtido de forma real
        mock_algorithm_config = AlgorithmConfig(
            user_id=user_id,
            goal="ganhar_massa",
            experience_level="beginner",
            workout_preferences=WorkoutPreferences(available_days=["monday", "wednesday", "friday"], time_per_session=60, location="gym"),
            diet_preferences=DietPreferences(diet_type="balanced", allergies=[], intolerances=[], disliked_foods=[]),
            target_calories=2500,
            target_protein=150,
            target_carbs=300,
            target_fat=80
        )

        # Convert target_date string to date object if provided
        date_obj = date.today()
        if target_date:
            try:
                date_obj = date.fromisoformat(target_date)
            except ValueError:
                logger.error("Formato de data inválido", target_date=target_date)
                raise ValueError("Formato de data inválido. Use YYYY-MM-DD.")

        workout_plan = await self.workout_generator.generate_workout_plan(
            user_id, date_obj, mock_algorithm_config
        )
        return workout_plan

    async def generate_diet_plan(
        self, user_id: str, target_date: Optional[str] = None
    ) -> DietPlan:
        """Gera um plano de dieta para o usuário."""
        if not self.diet_generator:
            raise RuntimeError("DietGenerator não inicializado.")

        # Mock de AlgorithmConfig - precisa ser obtido de forma real
        mock_algorithm_config = AlgorithmConfig(
            user_id=user_id,
            goal="perder_peso",
            experience_level="beginner",
            workout_preferences=WorkoutPreferences(available_days=["monday", "wednesday", "friday"], time_per_session=60, location="gym"),
            diet_preferences=DietPreferences(diet_type="balanced", allergies=[], intolerances=[], disliked_foods=[]),
            target_calories=2000,
            target_protein=120,
            target_carbs=200,
            target_fat=60
        )

        # Convert target_date string to date object if provided
        date_obj = date.today()
        if target_date:
            try:
                date_obj = date.fromisoformat(target_date)
            except ValueError:
                logger.error("Formato de data inválido", target_date=target_date)
                raise ValueError("Formato de data inválido. Use YYYY-MM-DD.")

        diet_plan = await self.diet_generator.generate_diet_plan(
            user_id, date_obj, mock_algorithm_config
        )
        return diet_plan

    async def generate_plan_presentation(self, user_id: str, target_date: Optional[str] = None):
        """Gera uma apresentação do plano."""
        # Placeholder para a lógica de geração de apresentação
        logger.info("Gerando apresentação do plano (placeholder)", user_id=user_id, target_date=target_date)
        return {"message": "Apresentação do plano gerada com sucesso (placeholder)"}

    async def generate_weekly_schedule(self, user_id: str, week_start_date: Optional[str] = None):
        """Gera um cronograma semanal."""
        # Placeholder para a lógica de geração de cronograma semanal
        logger.info("Gerando cronograma semanal (placeholder)", user_id=user_id, week_start_date=week_start_date)
        return {"message": "Cronograma semanal gerado com sucesso (placeholder)"}

    async def regenerate_user_plans(self, user_id: str, force: bool = False):
        """Regenera todos os planos de um usuário."""
        logger.info("Regenerando planos do usuário (placeholder)", user_id=user_id, force=force)
        return {"message": "Planos regenerados com sucesso (placeholder)"}

    async def close(self):
        """Fecha o serviço de planos."""
        logger.info("PlanService fechado.")



