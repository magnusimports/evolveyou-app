import pytest
from fastapi.testclient import TestClient
from main import app
from unittest.mock import AsyncMock, patch
from services.anamnese_api import AnamneseData
from middleware.auth import get_current_user

client = TestClient(app)

@pytest.fixture
def mock_firebase_service():
    with patch("services.firebase_service.FirebaseService", autospec=True) as MockFirebaseService:
        mock_service = MockFirebaseService.return_value
        mock_service.initialize = AsyncMock()
        mock_service.update_user = AsyncMock(return_value=True)
        app.state.firebase_service = mock_service  # Set the mocked service to app.state
        yield mock_service
        del app.state.firebase_service # Clean up after test

@pytest.fixture
def override_get_current_user():
    def _override():
        return {"id": "test_user_id"}
    app.dependency_overrides[get_current_user] = _override
    yield
    app.dependency_overrides = {}

@pytest.mark.asyncio
async def test_submit_anamnese_success(mock_firebase_service, override_get_current_user):
    anamnese_data = {
        "full_name": "Test User",
        "birth_date": "1990-01-01",
        "gender": "Masculino",
        "weight_kg": 70.5,
        "height_cm": 175.0,
        "activity_level": "Moderadamente Ativo",
        "health_conditions": [],
        "medications": [],
        "allergies": [],
        "dietary_preferences": [],
        "goals": ["Perder peso", "Ganhar massa muscular"]
    }
    response = client.post("/onboarding", json=anamnese_data)
    assert response.status_code == 200
    assert response.json() == {"message": "Anamnese recebida e perfil atualizado com sucesso", "user_id": "test_user_id"}
    mock_firebase_service.update_user.assert_called_once_with(
        "test_user_id",
        {"anamnese_data": anamnese_data, "onboarding_completed": True}
    )

@pytest.mark.asyncio
async def test_submit_anamnese_invalid_data(mock_firebase_service, override_get_current_user):
    anamnese_data = {
        "full_name": "",  # Invalid: min_length=3
        "birth_date": "01-01-1990",  # Invalid format
        "gender": "Invalid",
        "weight_kg": -10,
        "height_cm": 0,
        "activity_level": "Unknown",
        "goals": []
    }
    response = client.post("/onboarding", json=anamnese_data)
    assert response.status_code == 422  # Unprocessable Entity
    mock_firebase_service.update_user.assert_not_called()

@pytest.mark.asyncio
async def test_submit_anamnese_firebase_error(mock_firebase_service, override_get_current_user):
    mock_firebase_service.update_user.side_effect = Exception("Firestore error")
    anamnese_data = {
        "full_name": "Test User",
        "birth_date": "1990-01-01",
        "gender": "Masculino",
        "weight_kg": 70.5,
        "height_cm": 175.0,
        "activity_level": "Moderadamente Ativo",
        "health_conditions": [],
        "medications": [],
        "allergies": [],
        "dietary_preferences": [],
        "goals": ["Perder peso", "Ganhar massa muscular"]
    }
    response = client.post("/onboarding", json=anamnese_data)
    assert response.status_code == 500
    assert "Erro interno ao processar anamnese" in response.json()["detail"]
    mock_firebase_service.update_user.assert_called_once()


