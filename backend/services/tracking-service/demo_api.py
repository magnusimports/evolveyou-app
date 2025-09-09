from fastapi import FastAPI
from datetime import datetime
import uvicorn

app = FastAPI(title="EvolveYou Tracking API", version="1.0.0")

@app.get("/")
async def root():
    return {
        "service": "EvolveYou Tracking API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "tracking-api",
        "uptime": "running"
    }

@app.post("/log/meal-checkin")
async def log_meal():
    return {
        "message": "Refeição registrada com sucesso",
        "log_id": "meal_123",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/log/workout-session/end")
async def log_workout():
    return {
        "message": "Treino registrado com sucesso", 
        "session_id": "workout_456",
        "calories_burned": 350,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/dashboard/summary")
async def dashboard():
    return {
        "user_id": "demo_user",
        "calories_consumed": 1850,
        "calories_burned": 420,
        "workouts_completed": 1,
        "date": datetime.utcnow().date().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
