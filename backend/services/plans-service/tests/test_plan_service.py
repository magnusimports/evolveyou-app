import unittest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import date

from src.services.plan_service import PlanService
from algorithms.workout_generator import WorkoutGenerator
from algorithms.diet_generator import DietGenerator
from models.plan import WorkoutPlan, DietPlan, AlgorithmConfig, WorkoutPreferences, DietPreferences, GoalType

class TestPlanService(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
        self.mock_firebase_service = AsyncMock()
        self.plan_service = PlanService()
        await self.plan_service.initialize(self.mock_firebase_service)

    async def test_initialize(self):
        self.assertIsNotNone(self.plan_service.firebase_service)
        self.assertIsInstance(self.plan_service.workout_generator, WorkoutGenerator)
        self.assertIsInstance(self.plan_service.diet_generator, DietGenerator)

    async def test_generate_workout_plan_success(self):
        mock_workout_plan = WorkoutPlan(
            user_id="test_user",
            date=date.today(),
            goal=GoalType.GANHAR_MASSA,
            sessions=[],
            total_estimated_duration_minutes=60,
            rest_day=False,
            last_performance=None,
            notes=""
        )
        self.plan_service.workout_generator.generate_workout_plan = AsyncMock(return_value=mock_workout_plan)

        plan = await self.plan_service.generate_workout_plan("test_user")

        self.assertEqual(plan, mock_workout_plan)
        self.plan_service.workout_generator.generate_workout_plan.assert_called_once()

    async def test_generate_diet_plan_success(self):
        mock_diet_plan = DietPlan(
            user_id="test_user",
            date=date.today(),
            goal="perder_peso",
            meals=[],
            total_calories=2000,
            target_calories=2000,
            target_protein=120,
            target_carbs=200,
            target_fat=60,
            total_protein=120,
            total_carbs=200,
            total_fat=60,
            notes=""
        )
        self.plan_service.diet_generator.generate_diet_plan = AsyncMock(return_value=mock_diet_plan)

        plan = await self.plan_service.generate_diet_plan("test_user")

        self.assertEqual(plan, mock_diet_plan)
        self.plan_service.diet_generator.generate_diet_plan.assert_called_once()

    async def test_generate_workout_plan_invalid_date(self):
        with self.assertRaisesRegex(ValueError, "Formato de data inválido"):
            await self.plan_service.generate_workout_plan("test_user", "invalid-date")

    async def test_generate_diet_plan_invalid_date(self):
        with self.assertRaisesRegex(ValueError, "Formato de data inválido"): 
            await self.plan_service.generate_diet_plan("test_user", "invalid-date")

    async def test_health_check(self):
        status = await self.plan_service.health_check()
        self.assertEqual(status, {"status": "ok"})

    async def test_health_check_services(self):
        status = await self.plan_service.health_check_services()
        self.assertEqual(status, {"content_service": "mock_ok"})

    async def test_get_metrics(self):
        metrics = await self.plan_service.get_metrics()
        self.assertEqual(metrics, {"generated_plans_count": 0})

    async def test_close(self):
        await self.plan_service.close()
        # No specific assertions needed for close in this mock setup

if __name__ == "__main__":
    unittest.main()


