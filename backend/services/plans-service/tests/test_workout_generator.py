import unittest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import date, timedelta

from algorithms.workout_generator import WorkoutGenerator, WorkoutTemplate, MuscleGroup, WorkoutType, DifficultyLevel, GoalType, WorkoutPreferences, AlgorithmConfig, ExerciseCandidate
from models.plan import DietPreferences
from models.plan import WorkoutPlan, WorkoutSession, Exercise, ExerciseSet, Warmup, WarmupExercise

class TestWorkoutGenerator(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
        self.mock_content_service = AsyncMock()
        self.mock_firebase_service = AsyncMock()
        self.workout_generator = WorkoutGenerator(self.mock_content_service, self.mock_firebase_service)

        # Mock para _get_user_data
        self.workout_generator._get_user_data = AsyncMock(return_value={
            "user_id": "test_user",
            "preferences": {
                "workout": {
                    "available_days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                    "preferred_duration_minutes": 60,
                    "preferred_equipment": ["halteres", "barra", "maquinas"],
                    "intensity_level": "moderado"
                }
            }
        })

        # Mock para _get_available_exercises
        self.workout_generator._get_available_exercises = AsyncMock(return_value=[
            ExerciseCandidate(exercise_id="ex1", name="Supino Reto", muscle_groups=["peito", "ombros", "triceps"], primary_muscle="peito", secondary_muscles=["ombros", "triceps"], equipment="barra", difficulty=DifficultyLevel.INTERMEDIATE, movement_pattern="compound", safety_rating=0.8, effectiveness_rating=0.9, location_compatibility=["gym"], time_efficiency=0.7),
            ExerciseCandidate(exercise_id="ex2", name="Remada Curvada", muscle_groups=["costas", "biceps"], primary_muscle="costas", secondary_muscles=["biceps"], equipment="barra", difficulty=DifficultyLevel.INTERMEDIATE, movement_pattern="compound", safety_rating=0.8, effectiveness_rating=0.9, location_compatibility=["gym"], time_efficiency=0.7),
            ExerciseCandidate(exercise_id="ex3", name="Agachamento", muscle_groups=["quadriceps", "gluteos", "posterior"], primary_muscle="quadriceps", secondary_muscles=["gluteos", "posterior"], equipment="barra", difficulty=DifficultyLevel.ADVANCED, movement_pattern="compound", safety_rating=0.7, effectiveness_rating=0.9, location_compatibility=["gym"], time_efficiency=0.8),
            ExerciseCandidate(exercise_id="ex4", name="Rosca Direta", muscle_groups=["biceps"], primary_muscle="biceps", secondary_muscles=[], equipment="halteres", difficulty=DifficultyLevel.BEGINNER, movement_pattern="isolation", safety_rating=0.9, effectiveness_rating=0.8, location_compatibility=["gym", "home"], time_efficiency=0.5),
            ExerciseCandidate(exercise_id="ex5", name="Tríceps Testa", muscle_groups=["triceps"], primary_muscle="triceps", secondary_muscles=[], equipment="halteres", difficulty=DifficultyLevel.BEGINNER, movement_pattern="isolation", safety_rating=0.9, effectiveness_rating=0.8, location_compatibility=["gym", "home"], time_efficiency=0.5),
            ExerciseCandidate(exercise_id="ex6", name="Elevação Lateral", muscle_groups=["ombros"], primary_muscle="ombros", secondary_muscles=[], equipment="halteres", difficulty=DifficultyLevel.BEGINNER, movement_pattern="isolation", safety_rating=0.9, effectiveness_rating=0.8, location_compatibility=["gym", "home"], time_efficiency=0.5),
            ExerciseCandidate(exercise_id="ex7", name="Prancha", muscle_groups=["core"], primary_muscle="core", secondary_muscles=[], equipment="nenhum", difficulty=DifficultyLevel.BEGINNER, movement_pattern="isolation", safety_rating=0.9, effectiveness_rating=0.8, location_compatibility=["gym", "home", "outdoor"], time_efficiency=0.3),
        ])

        # Mock para _get_existing_plan
        self.workout_generator._get_existing_plan = AsyncMock(return_value=None)

        # Mock para _save_workout_plan
        self.workout_generator._save_workout_plan = AsyncMock()

        # Mock para _get_last_performance
        self.workout_generator._get_last_performance = AsyncMock(return_value=None)

    async def test_generate_workout_plan_full_body_success(self):
        user_id = "test_user_full_body"
        target_date = date(2025, 9, 8) # Monday
        algorithm_config = AlgorithmConfig(
            user_id=user_id,
            goal=GoalType.GANHAR_MASSA,
            experience_level=DifficultyLevel.INTERMEDIATE,
            target_calories=2000,
            target_protein=150,
            target_carbs=200,
            target_fat=60,
            workout_preferences=WorkoutPreferences(
                available_days=["monday"],
                preferred_duration_minutes=60,
                preferred_equipment=["halteres", "barra"],
                intensity_level="moderado"
            ),
            diet_preferences=DietPreferences(
                allergies=[],
                dietary_restrictions=[],
                disliked_foods=[],
                preferred_foods=[],
                cooking_time_preference="medium",
                budget_level="medium"
            )
        )

        workout_plan = await self.workout_generator.generate_workout_plan(
            user_id, target_date, algorithm_config
        )

        self.assertIsInstance(workout_plan, WorkoutPlan)
        self.assertEqual(workout_plan.user_id, user_id)
        self.assertEqual(workout_plan.date, target_date)
        self.assertFalse(workout_plan.rest_day)
        self.assertGreater(len(workout_plan.sessions), 0)
        self.assertGreater(workout_plan.total_estimated_duration_minutes, 0)
        self.workout_generator._save_workout_plan.assert_called_once_with(workout_plan)

    async def test_generate_workout_plan_rest_day(self):
        user_id = "test_user_rest_day"
        target_date = date(2025, 9, 8) # Monday
        algorithm_config = AlgorithmConfig(
            user_id="test_user_rest_day",
            goal=GoalType.GANHAR_MASSA,
            experience_level=DifficultyLevel.INTERMEDIATE,
            target_calories=2000,
            target_protein=150,
            target_carbs=200,
            target_fat=60,
            workout_preferences=WorkoutPreferences(
                available_days=["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                preferred_duration_minutes=60,
                preferred_equipment=["halteres", "barra"],
                intensity_level="moderado"
            ),
            diet_preferences=DietPreferences(
                allergies=[],
                dietary_restrictions=[],
                disliked_foods=[],
                preferred_foods=[],
                cooking_time_preference="medium",
                budget_level="medium"
            )
        )

        workout_plan = await self.workout_generator.generate_workout_plan(
            user_id, target_date, algorithm_config
        )

        self.assertIsInstance(workout_plan, WorkoutPlan)
        self.assertEqual(workout_plan.user_id, user_id)
        self.assertEqual(workout_plan.date, target_date)
        self.assertTrue(workout_plan.rest_day)
        self.assertEqual(len(workout_plan.sessions), 0)
        self.assertEqual(workout_plan.total_estimated_duration_minutes, 0)
        self.assertIn("Dia de descanso", workout_plan.notes)
        self.workout_generator._save_workout_plan.assert_called_once_with(workout_plan)

    async def test_generate_workout_plan_existing_plan(self):
        user_id = "test_user_existing"
        target_date = date(2025, 9, 8)
        algorithm_config = AlgorithmConfig(
            user_id=user_id,
            goal=GoalType.GANHAR_MASSA,
            experience_level=DifficultyLevel.INTERMEDIATE,
            target_calories=2000,
            target_protein=150,
            target_carbs=200,
            target_fat=60,
            workout_preferences=WorkoutPreferences(
                available_days=["monday"],
                preferred_duration_minutes=60,
                preferred_equipment=["halteres", "barra"],
                intensity_level="moderado"
            ),
            diet_preferences=DietPreferences(
                allergies=[],
                dietary_restrictions=[],
                disliked_foods=[],
                preferred_foods=[],
                cooking_time_preference="medium",
                budget_level="medium"
            )
        )

        existing_plan = WorkoutPlan(
            user_id=user_id,
            date=target_date,
            goal=GoalType.GANHAR_MASSA,
            sessions=[],
            total_estimated_duration_minutes=60,
            rest_day=False,
            last_performance=None,
            notes="Existing plan"
        )
        self.workout_generator._get_existing_plan.return_value = existing_plan

        workout_plan = await self.workout_generator.generate_workout_plan(
            user_id, target_date, algorithm_config
        )

        self.assertEqual(workout_plan, existing_plan)
        self.workout_generator._save_workout_plan.assert_not_called()

    async def test_generate_workout_plan_upper_lower_split(self):
        user_id = "test_user_upper_lower"
        target_date = date(2025, 9, 8) # Monday
        algorithm_config = AlgorithmConfig(
            user_id=user_id,
            goal=GoalType.GANHAR_MASSA,
            experience_level=DifficultyLevel.INTERMEDIATE,
            target_calories=2000,
            target_protein=150,
            target_carbs=200,
            target_fat=60,
            workout_preferences=WorkoutPreferences(
                available_days=["monday", "tuesday"],
                preferred_duration_minutes=60,
                preferred_equipment=["halteres", "barra"],
                intensity_level="moderado"
            ),
            diet_preferences=DietPreferences(
                allergies=[],
                dietary_restrictions=[],
                disliked_foods=[],
                preferred_foods=[],
                cooking_time_preference="medium",
                budget_level="medium"
            )
        )

        workout_plan = await self.workout_generator.generate_workout_plan(
            user_id, target_date, algorithm_config
        )

        self.assertIsInstance(workout_plan, WorkoutPlan)
        self.assertFalse(workout_plan.rest_day)
        self.assertGreater(len(workout_plan.sessions), 0)
        self.assertIn(workout_plan.sessions[0].name, ["Upper Body", "Lower Body"])

    async def test_generate_workout_plan_push_pull_legs_split(self):
        user_id = "test_user_ppl"
        target_date = date(2025, 9, 8) # Monday
        algorithm_config = AlgorithmConfig(
            user_id=user_id,
            goal=GoalType.GANHAR_MASSA,
            experience_level=DifficultyLevel.INTERMEDIATE,
            target_calories=2000,
            target_protein=150,
            target_carbs=200,
            target_fat=60,
            workout_preferences=WorkoutPreferences(
                available_days=["monday", "tuesday", "wednesday"],
                preferred_duration_minutes=60,
                preferred_equipment=["halteres", "barra"],
                intensity_level="moderado"
            ),
            diet_preferences=DietPreferences(
                allergies=[],
                dietary_restrictions=[],
                disliked_foods=[],
                preferred_foods=[],
                cooking_time_preference="medium",
                budget_level="medium"
            )
        )

        workout_plan = await self.workout_generator.generate_workout_plan(
            user_id, target_date, algorithm_config
        )

        self.assertIsInstance(workout_plan, WorkoutPlan)
        self.assertFalse(workout_plan.rest_day)
        self.assertGreater(len(workout_plan.sessions), 0)
        self.assertIn(workout_plan.sessions[0].name, ["Push (Empurrar)", "Pull (Puxar)", "Legs (Pernas)"])

    async def test_select_exercises_for_slot(self):
        # Mock de um slot de exercício
        slot = {"type": "compound", "muscle_groups": ["peito"], "sets": 3}
        user_id = "test_user_slot"
        available_exercises = self.workout_generator._get_available_exercises.return_value
        algorithm_config = AlgorithmConfig(
            user_id=user_id,
            goal=GoalType.GANHAR_MASSA,
            experience_level=DifficultyLevel.INTERMEDIATE,
            target_calories=2000,
            target_protein=150,
            target_carbs=200,
            target_fat=60,
            workout_preferences=WorkoutPreferences(
                available_days=["monday"],
                preferred_duration_minutes=60,
                preferred_equipment=["halteres", "barra"],
                intensity_level="moderado"
            ),
            diet_preferences=DietPreferences(
                allergies=[],
                dietary_restrictions=[],
                disliked_foods=[],
                preferred_foods=[],
                cooking_time_preference="medium",
                budget_level="medium"
            )
        )
        user_data = {"user_id": "test_user"}
        algorithm_config.target_calories = 2000
        algorithm_config.target_protein = 150
        algorithm_config.target_carbs = 200
        algorithm_config.target_fat = 60

        selected_exercises = self.workout_generator._select_exercises_for_slot(
            slot, available_exercises, set(), algorithm_config
        )

        self.assertIsInstance(selected_exercises, Exercise)
        self.assertIn("peito", selected_exercises.muscle_groups)

    async def test_generate_warmup(self):
        warmup_type = "upper_body"
        warmup = self.workout_generator._generate_warmup(warmup_type)

        self.assertIsInstance(warmup, Warmup)
        self.assertGreater(len(warmup.exercises), 0)
        self.assertIsInstance(warmup.exercises[0], WarmupExercise)

if __name__ == "__main__":
    unittest.main()


