import unittest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import date, timedelta

from algorithms.diet_generator import DietGenerator, NutritionalTarget, FoodCandidate
from models.plan import DietPlan, Meal, FoodItem, MealType, GoalType, DietPreferences, AlgorithmConfig, WorkoutPreferences, DifficultyLevel

class TestDietGenerator(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
        self.mock_content_service = AsyncMock()
        self.mock_firebase_service = AsyncMock()
        self.diet_generator = DietGenerator(self.mock_content_service, self.mock_firebase_service)

        # Mock para _get_user_data
        self.diet_generator._get_user_data = AsyncMock(return_value={
            "user_id": "test_user",
            "preferences": {
                "diet": {
                    "allergies": [],
                    "dietary_restrictions": [],
                    "disliked_foods": [],
                    "preferred_foods": [],
                    "cooking_time_preference": "medium",
                    "budget_level": "medium"
                }
            }
        })

        # Mock para _get_available_foods
        self.mock_content_service.search_foods.return_value = {"data": [
            {"id": "food1", "name": "Frango", "nutrition": {"calories": 165, "protein": 31, "carbs": 0, "fat": 3.6}, "category": "carnes", "allergens": [], "dietary_tags": []},
            {"id": "food2", "name": "Arroz", "nutrition": {"calories": 130, "protein": 2.7, "carbs": 28, "fat": 0.3}, "category": "cereais", "allergens": [], "dietary_tags": []},
            {"id": "food3", "name": "Brócolis", "nutrition": {"calories": 55, "protein": 3.7, "carbs": 11.2, "fat": 0.6}, "category": "vegetais", "allergens": [], "dietary_tags": []},
            {"id": "food4", "name": "Ovo", "nutrition": {"calories": 155, "protein": 13, "carbs": 1.1, "fat": 11}, "category": "ovos", "allergens": [], "dietary_tags": []},
            {"id": "food5", "name": "Pão Integral", "nutrition": {"calories": 265, "protein": 13, "carbs": 49, "fat": 3.6}, "category": "pães", "allergens": [], "dietary_tags": []},
            {"id": "food6", "name": "Maçã", "nutrition": {"calories": 52, "protein": 0.3, "carbs": 14, "fat": 0.2}, "category": "frutas", "allergens": [], "dietary_tags": []},
        ]}
        self.diet_generator._get_available_foods = AsyncMock(side_effect=self._mock_get_available_foods)

        # Mock para _get_existing_plan
        self.diet_generator._get_existing_plan = AsyncMock(return_value=None)

        # Mock para _save_diet_plan
        self.diet_generator._save_diet_plan = AsyncMock()

    async def _mock_get_available_foods(self, preferences: DietPreferences):
        # Simula a lógica de filtragem do _get_available_foods real
        foods = self.mock_content_service.search_foods.return_value["data"]
        candidates = []
        for food in foods:
            if self.diet_generator._food_matches_restrictions(food, preferences):
                candidates.append(FoodCandidate(
                    food_id=food["id"],
                    name=food["name"],
                    calories_per_100g=food["nutrition"]["calories"],
                    protein_per_100g=food["nutrition"]["protein"],
                    carbs_per_100g=food["nutrition"]["carbs"],
                    fat_per_100g=food["nutrition"]["fat"],
                    category=food.get("category", "outros"),
                    preparation_time=food.get("preparation_time", 15),
                    cost_level=food.get("cost_level", "medium"),
                    availability_score=food.get("availability_score", 0.8),
                    preference_score=self.diet_generator._calculate_preference_score(food, preferences)
                ))
        return candidates

    async def test_generate_diet_plan_success(self):
        user_id = "test_user_diet"
        target_date = date(2025, 9, 9)
        algorithm_config = AlgorithmConfig(
            user_id=user_id,
            goal=GoalType.PERDER_PESO,
            experience_level=DifficultyLevel.INTERMEDIATE, # Assuming a default for testing
            target_calories=2000,
            target_protein=150,
            target_carbs=200,
            target_fat=60,
            diet_preferences=DietPreferences(
                allergies=[],
                dietary_restrictions=[],
                disliked_foods=[],
                preferred_foods=[],
                cooking_time_preference="medium",
                budget_level="medium"
            ),
            workout_preferences=WorkoutPreferences(
                fitness_level=DifficultyLevel.INTERMEDIATE,
                available_days=["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                workout_frequency=3,
                workout_duration=60,
                workout_type="strength",
                preferred_equipment=["dumbbells"],
                preferred_exercises=[],
                disliked_exercises=[]
            )
        )

        diet_plan = await self.diet_generator.generate_diet_plan(
            user_id, target_date, algorithm_config
        )

        self.assertIsInstance(diet_plan, DietPlan)
        self.assertEqual(diet_plan.user_id, user_id)
        self.assertEqual(diet_plan.date, target_date)
        self.assertGreater(len(diet_plan.meals), 0)
        self.assertAlmostEqual(diet_plan.total_calories, algorithm_config.target_calories, delta=algorithm_config.target_calories * 0.15)
        self.diet_generator._save_diet_plan.assert_called_once_with(diet_plan)

    async def test_generate_diet_plan_existing_plan(self):
        user_id = "test_user_existing_diet"
        target_date = date(2025, 9, 9)
        algorithm_config = AlgorithmConfig(
            user_id=user_id,
            goal=GoalType.PERDER_PESO,
            experience_level=DifficultyLevel.INTERMEDIATE, # Assuming a default for testing
            target_calories=2000,
            target_protein=150,
            target_carbs=200,
            target_fat=60,
            diet_preferences=DietPreferences(
                allergies=[],
                dietary_restrictions=[],
                disliked_foods=[],
                preferred_foods=[],
                cooking_time_preference="medium",
                budget_level="medium"
            ),
            workout_preferences=WorkoutPreferences(
                fitness_level=DifficultyLevel.INTERMEDIATE,
                available_days=["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                workout_frequency=3,
                workout_duration=60,
                workout_type="strength",
                preferred_equipment=["dumbbells"],
                preferred_exercises=[],
                disliked_exercises=[]
            )
        )

        existing_plan = DietPlan(
            user_id=user_id,
            date=target_date,
            goal=GoalType.PERDER_PESO,
            target_calories=2000,
            target_protein=150,
            target_carbs=200,
            target_fat=60,
            meals=[],
            total_calories=2000,
            total_protein=150,
            total_carbs=200,
            total_fat=60,
            water_intake_ml=3000,
            notes="Existing diet plan"
        )
        self.diet_generator._get_existing_plan.return_value = existing_plan

        diet_plan = await self.diet_generator.generate_diet_plan(
            user_id, target_date, algorithm_config
        )

        self.assertEqual(diet_plan, existing_plan)
        self.diet_generator._save_diet_plan.assert_not_called()

    def test_calculate_meal_targets(self):
        algorithm_config = AlgorithmConfig(
            user_id="test_user_calc_meal_targets",
            goal=GoalType.PERDER_PESO,
            experience_level=DifficultyLevel.INTERMEDIATE,
            target_calories=2000,
            target_protein=150,
            target_carbs=200,
            target_fat=60,
            diet_preferences=DietPreferences(
                allergies=[],
                dietary_restrictions=[],
                disliked_foods=[],
                preferred_foods=[],
                cooking_time_preference="medium",
                budget_level="medium"
            ),
            workout_preferences=WorkoutPreferences(
                available_days=["monday", "wednesday", "friday"],
                session_duration_preference=60,
                location="gym",
                equipment_available=["halteres"],
                preferred_workout_times=["morning"],
                intensity_preference="medium",
                focus_areas=["full_body"],
                workout_duration=60,
                workout_type="strength",
                preferred_equipment=["dumbbells"],
                preferred_exercises=[],
                disliked_exercises=[]
            )

        )
        targets = self.diet_generator._calculate_meal_targets(algorithm_config)

        self.assertIn(MealType.CAFE_DA_MANHA, targets)
        self.assertIn(MealType.ALMOCO, targets)
        self.assertIn(MealType.JANTAR, targets)
        self.assertIsInstance(targets[MealType.CAFE_DA_MANHA], NutritionalTarget)
        self.assertGreater(targets[MealType.CAFE_DA_MANHA].calories, 0)

    async def test_food_matches_restrictions(self):
        preferences = DietPreferences(
            allergies=["gluten"],
            dietary_restrictions=["vegetarian"],
            disliked_foods=["brócolis"],
            preferred_foods=[],
            cooking_time_preference="medium",
            budget_level="medium"
        )

        # Teste com alimento que viola restrição (glúten)
        food_with_gluten = {"name": "Pão", "allergens": ["gluten"], "dietary_tags": []}
        self.assertFalse(self.diet_generator._food_matches_restrictions(food_with_gluten, preferences))

        # Teste com alimento que viola restrição (vegetariano)
        food_meat = {"name": "Carne", "allergens": [], "dietary_tags": ["meat"]}
        self.assertFalse(self.diet_generator._food_matches_restrictions(food_meat, preferences))

        # Teste com alimento não desejado
        food_disliked = {"name": "Brócolis", "allergens": [], "dietary_tags": []}
        self.assertFalse(self.diet_generator._food_matches_restrictions(food_disliked, preferences))

        # Teste com alimento compatível
        food_compatible = {"name": "Arroz", "allergens": [], "dietary_tags": []}
        self.assertTrue(self.diet_generator._food_matches_restrictions(food_compatible, preferences))

    async def test_generate_meal(self):
        target = NutritionalTarget(calories=500, protein=40, carbs=50, fat=20)
        preferences = DietPreferences(
            allergies=[],
            dietary_restrictions=[],
            disliked_foods=[],
            preferred_foods=[],
            cooking_time_preference="medium",
            budget_level="medium"
        )
        user_data = {"user_id": "test_user"}
        available_foods = await self.diet_generator._get_available_foods(preferences)

        meal = await self.diet_generator._generate_meal(
            MealType.ALMOCO, target, available_foods, preferences, user_data
        )

        self.assertIsInstance(meal, Meal)
        self.assertEqual(meal.meal_type, MealType.ALMOCO)
        self.assertGreater(len(meal.foods), 0)
        self.assertAlmostEqual(meal.total_calories, target.calories, delta=target.calories * 0.2)

if __name__ == "__main__":
    unittest.main()


