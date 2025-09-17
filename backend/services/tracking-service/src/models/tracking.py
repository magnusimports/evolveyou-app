"""
Modelos de dados para o Tracking Service
"""

from datetime import datetime
from datetime import date as date_type
from typing import Dict, Any, List, Optional
from enum import Enum
import uuid

from pydantic import BaseModel, Field


class LogType(str, Enum):
    """Tipos de log disponíveis"""
    MEAL_CHECKIN = "meal_checkin"
    SET = "set"
    BODY_WEIGHT = "body_weight"
    WORKOUT_SESSION = "workout_session"
    WATER_INTAKE = "water_intake"
    SLEEP = "sleep"


class MealType(str, Enum):
    """Tipos de refeição"""
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"


# Modelos de requisição

class FoodItem(BaseModel):
    """Item de comida consumido"""
    food_id: str = Field(..., description="ID do alimento")
    food_name: str = Field(..., description="Nome do alimento")
    quantity_grams: float = Field(..., gt=0, description="Quantidade em gramas")
    calories_per_100g: float = Field(..., gt=0, description="Calorias por 100g")
    protein_per_100g: float = Field(default=0, ge=0, description="Proteína por 100g")
    carbs_per_100g: float = Field(default=0, ge=0, description="Carboidratos por 100g")
    fat_per_100g: float = Field(default=0, ge=0, description="Gordura por 100g")


class MealCheckinRequest(BaseModel):
    """Requisição para check-in de refeição"""
    meal_type: MealType = Field(..., description="Tipo da refeição")
    foods_consumed: List[FoodItem] = Field(..., min_items=1, description="Lista de alimentos consumidos")
    total_calories: float = Field(..., gt=0, description="Total de calorias da refeição")
    total_protein: float = Field(default=0, ge=0, description="Total de proteína")
    total_carbs: float = Field(default=0, ge=0, description="Total de carboidratos")
    total_fat: float = Field(default=0, ge=0, description="Total de gordura")
    notes: Optional[str] = Field(default=None, description="Observações sobre a refeição")


class SetRequest(BaseModel):
    """Requisição para log de série"""
    exercise_id: str = Field(..., description="ID do exercício")
    exercise_name: str = Field(..., description="Nome do exercício")
    weight_kg: Optional[float] = Field(default=None, ge=0, description="Peso utilizado em kg")
    reps_done: int = Field(..., gt=0, description="Repetições realizadas")
    set_number: int = Field(..., gt=0, description="Número da série")
    rpe: Optional[int] = Field(default=None, ge=1, le=10, description="Percepção de esforço (1-10)")
    notes: Optional[str] = Field(default=None, description="Observações sobre a série")


class BodyWeightRequest(BaseModel):
    """Requisição para log de peso corporal"""
    weight_kg: float = Field(..., gt=0, description="Peso em kg")
    body_fat_percentage: Optional[float] = Field(default=None, ge=0, le=100, description="Percentual de gordura")
    muscle_mass_kg: Optional[float] = Field(default=None, ge=0, description="Massa muscular em kg")
    notes: Optional[str] = Field(default=None, description="Observações sobre a pesagem")


class WorkoutSessionEndRequest(BaseModel):
    """Requisição para finalizar sessão de treino"""
    session_id: str = Field(..., description="ID da sessão de treino")
    duration_minutes: int = Field(..., gt=0, description="Duração do treino em minutos")
    exercises_performed: List[str] = Field(..., min_items=1, description="Lista de IDs dos exercícios realizados")
    perceived_intensity: Optional[int] = Field(default=None, ge=1, le=10, description="Intensidade percebida (1-10)")
    notes: Optional[str] = Field(default=None, description="Observações sobre o treino")


# Modelos de resposta

class SuccessResponse(BaseModel):
    """Resposta de sucesso padrão"""
    message: str = Field(..., description="Mensagem de sucesso")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Dados adicionais")


class ErrorResponse(BaseModel):
    """Resposta de erro padrão"""
    error_code: str = Field(..., description="Código do erro")
    message: str = Field(..., description="Mensagem de erro")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Detalhes adicionais do erro")


class ServiceHealthCheck(BaseModel):
    """Resposta do health check"""
    service_name: str = Field(..., description="Nome do serviço")
    status: str = Field(..., description="Status do serviço")
    version: str = Field(..., description="Versão do serviço")
    uptime_seconds: float = Field(..., description="Tempo de atividade em segundos")
    dependencies: Dict[str, str] = Field(..., description="Status das dependências")


# Modelos de dados internos

class DailyLog(BaseModel):
    """Modelo para logs diários"""
    log_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="ID único do log")
    user_id: str = Field(..., description="ID do usuário")
    log_type: LogType = Field(..., description="Tipo do log")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Timestamp do log")
    date: date_type = Field(default_factory=date_type.today, description="Data do log")
    value: Dict[str, Any] = Field(..., description="Dados específicos do log")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Metadados do log")


class DashboardSummary(BaseModel):
    """Resumo do dashboard"""
    user_id: str = Field(..., description="ID do usuário")
    date: date_type = Field(..., description="Data do resumo")
    calories_consumed: float = Field(default=0, description="Calorias consumidas")
    calories_burned: float = Field(default=0, description="Calorias queimadas")
    protein_consumed: float = Field(default=0, description="Proteína consumida")
    workouts_completed: int = Field(default=0, description="Treinos completados")
    weight_kg: Optional[float] = Field(default=None, description="Peso atual")
    last_updated: datetime = Field(default_factory=datetime.utcnow, description="Última atualização")


class ProgressMetrics(BaseModel):
    """Métricas de progresso"""
    user_id: str = Field(..., description="ID do usuário")
    period_start: date_type = Field(..., description="Início do período")
    period_end: date_type = Field(..., description="Fim do período")
    weight_change_kg: Optional[float] = Field(default=None, description="Mudança de peso")
    avg_calories_consumed: float = Field(default=0, description="Média de calorias consumidas")
    avg_calories_burned: float = Field(default=0, description="Média de calorias queimadas")
    total_workouts: int = Field(default=0, description="Total de treinos")
    consistency_percentage: float = Field(default=0, description="Percentual de consistência")


class NutritionGoals(BaseModel):
    """Metas nutricionais"""
    user_id: str = Field(..., description="ID do usuário")
    daily_calories: float = Field(..., gt=0, description="Meta diária de calorias")
    daily_protein: float = Field(..., gt=0, description="Meta diária de proteína")
    daily_carbs: float = Field(..., gt=0, description="Meta diária de carboidratos")
    daily_fat: float = Field(..., gt=0, description="Meta diária de gordura")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Data de criação")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Data de atualização")


class WorkoutGoals(BaseModel):
    """Metas de treino"""
    user_id: str = Field(..., description="ID do usuário")
    weekly_workouts: int = Field(..., gt=0, description="Meta semanal de treinos")
    weekly_calories_burned: float = Field(..., gt=0, description="Meta semanal de calorias queimadas")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Data de criação")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Data de atualização")




# Modelos específicos para dashboard

class NutritionalSummary(BaseModel):
    """Resumo nutricional"""
    calories_consumed: float = Field(default=0, description="Calorias consumidas")
    calories_goal: float = Field(default=0, description="Meta de calorias")
    protein_consumed: float = Field(default=0, description="Proteína consumida")
    protein_goal: float = Field(default=0, description="Meta de proteína")
    carbs_consumed: float = Field(default=0, description="Carboidratos consumidos")
    carbs_goal: float = Field(default=0, description="Meta de carboidratos")
    fat_consumed: float = Field(default=0, description="Gordura consumida")
    fat_goal: float = Field(default=0, description="Meta de gordura")


class WorkoutSummary(BaseModel):
    """Resumo de treinos"""
    workouts_completed: int = Field(default=0, description="Treinos completados")
    workouts_goal: int = Field(default=0, description="Meta de treinos")
    calories_burned: float = Field(default=0, description="Calorias queimadas")
    total_duration_minutes: int = Field(default=0, description="Duração total em minutos")
    exercises_performed: int = Field(default=0, description="Exercícios realizados")


class EnergyBalance(BaseModel):
    """Balanço energético"""
    calories_in: float = Field(default=0, description="Calorias consumidas")
    calories_out: float = Field(default=0, description="Calorias queimadas")
    net_calories: float = Field(default=0, description="Balanço calórico")
    bmr_calories: float = Field(default=0, description="Taxa metabólica basal")


class ProgressMetric(BaseModel):
    """Métrica de progresso"""
    metric_name: str = Field(..., description="Nome da métrica")
    current_value: float = Field(..., description="Valor atual")
    previous_value: Optional[float] = Field(default=None, description="Valor anterior")
    change_percentage: Optional[float] = Field(default=None, description="Percentual de mudança")
    trend: str = Field(default="stable", description="Tendência (up, down, stable)")


class DashboardResponse(BaseModel):
    """Resposta completa do dashboard"""
    user_id: str = Field(..., description="ID do usuário")
    date: date_type = Field(..., description="Data do dashboard")
    nutritional_summary: NutritionalSummary = Field(..., description="Resumo nutricional")
    workout_summary: WorkoutSummary = Field(..., description="Resumo de treinos")
    energy_balance: EnergyBalance = Field(..., description="Balanço energético")
    progress_metrics: List[ProgressMetric] = Field(default=[], description="Métricas de progresso")
    last_updated: datetime = Field(default_factory=datetime.utcnow, description="Última atualização")



# Modelos específicos para progresso

class TrendDirection(str, Enum):
    """Direção da tendência"""
    UP = "up"
    DOWN = "down"
    STABLE = "stable"


class WeightDataPoint(BaseModel):
    """Ponto de dados de peso"""
    date: date_type = Field(..., description="Data da medição")
    weight_kg: float = Field(..., description="Peso em kg")
    body_fat_percentage: Optional[float] = Field(default=None, description="Percentual de gordura")
    muscle_mass_kg: Optional[float] = Field(default=None, description="Massa muscular")


class StrengthDataPoint(BaseModel):
    """Ponto de dados de força"""
    date: date_type = Field(..., description="Data do treino")
    exercise_id: str = Field(..., description="ID do exercício")
    exercise_name: str = Field(..., description="Nome do exercício")
    max_weight_kg: float = Field(..., description="Peso máximo usado")
    total_volume_kg: float = Field(..., description="Volume total (peso x reps)")


class ProgressChart(BaseModel):
    """Dados para gráfico de progresso"""
    chart_type: str = Field(..., description="Tipo do gráfico")
    title: str = Field(..., description="Título do gráfico")
    x_axis_label: str = Field(..., description="Label do eixo X")
    y_axis_label: str = Field(..., description="Label do eixo Y")
    data_points: List[Dict[str, Any]] = Field(..., description="Pontos de dados")


class ProgressSummaryResponse(BaseModel):
    """Resposta do resumo de progresso"""
    user_id: str = Field(..., description="ID do usuário")
    period_start: date_type = Field(..., description="Início do período")
    period_end: date_type = Field(..., description="Fim do período")
    weight_progress: List[WeightDataPoint] = Field(default=[], description="Progresso de peso")
    strength_progress: List[StrengthDataPoint] = Field(default=[], description="Progresso de força")
    charts: List[ProgressChart] = Field(default=[], description="Gráficos de progresso")
    summary_metrics: List[ProgressMetric] = Field(default=[], description="Métricas resumo")
    generated_at: datetime = Field(default_factory=datetime.utcnow, description="Data de geração")


# Modelos específicos para Sistema Full-time

class UserProfile(BaseModel):
    """Perfil do usuário para cálculos"""
    user_id: str = Field(..., description="ID do usuário")
    daily_calorie_target: int = Field(..., description="Meta diária de calorias")
    weight: float = Field(..., description="Peso em kg")
    height: int = Field(..., description="Altura em cm")
    age: int = Field(..., description="Idade em anos")
    activity_level: str = Field(..., description="Nível de atividade")
    goals: List[str] = Field(default=[], description="Objetivos do usuário")


class ActivityRecord(BaseModel):
    """Registro de atividade extra"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="ID único")
    user_id: str = Field(..., description="ID do usuário")
    activity_type: str = Field(..., description="Tipo de atividade")
    duration_minutes: int = Field(..., gt=0, description="Duração em minutos")
    intensity: str = Field(..., description="Intensidade (low, moderate, high)")
    calories_burned: int = Field(..., ge=0, description="Calorias queimadas")
    description: str = Field(..., description="Descrição da atividade")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Timestamp da atividade")


class CalorieRebalance(BaseModel):
    """Rebalanceamento de calorias"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="ID único")
    user_id: str = Field(..., description="ID do usuário")
    original_calories: int = Field(..., description="Calorias originais")
    extra_calories_burned: int = Field(..., ge=0, description="Calorias extras queimadas")
    new_calorie_target: int = Field(..., description="Nova meta de calorias")
    rebalance_factor: float = Field(..., ge=0, le=1, description="Fator de rebalanceamento")
    reason: str = Field(..., description="Motivo do rebalanceamento")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Timestamp do rebalanceamento")


class FulltimeStatus(BaseModel):
    """Status do Sistema Full-time"""
    user_id: str = Field(..., description="ID do usuário")
    is_active: bool = Field(..., description="Sistema ativo")
    daily_extra_calories: int = Field(default=0, description="Calorias extras do dia")
    total_rebalances_today: int = Field(default=0, description="Total de rebalanceamentos hoje")
    last_rebalance: Optional[datetime] = Field(default=None, description="Último rebalanceamento")
    daily_calorie_target: int = Field(default=0, description="Meta diária de calorias")
    current_calorie_target: int = Field(default=0, description="Meta atual de calorias")


class ActivityTypeInfo(BaseModel):
    """Informações sobre tipo de atividade"""
    name: str = Field(..., description="Nome da atividade")
    calories_per_minute: Dict[str, float] = Field(..., description="Calorias por minuto por intensidade")
    description: str = Field(..., description="Descrição da atividade")
    category: str = Field(..., description="Categoria da atividade")


class FulltimeDashboard(BaseModel):
    """Dashboard do Sistema Full-time"""
    status: FulltimeStatus = Field(..., description="Status atual")
    today: Dict[str, Any] = Field(..., description="Dados de hoje")
    week: Dict[str, Any] = Field(..., description="Dados da semana")
    recent_activities: List[Dict[str, Any]] = Field(default=[], description="Atividades recentes")
    recent_rebalances: List[Dict[str, Any]] = Field(default=[], description="Rebalanceamentos recentes")


class RebalanceResult(BaseModel):
    """Resultado de rebalanceamento"""
    success: bool = Field(..., description="Sucesso do rebalanceamento")
    original_calories: int = Field(..., description="Calorias originais")
    extra_calories_burned: int = Field(..., description="Calorias extras queimadas")
    new_calorie_target: int = Field(..., description="Nova meta de calorias")
    rebalance_factor: float = Field(..., description="Fator de rebalanceamento")
    reason: str = Field(..., description="Motivo do rebalanceamento")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Timestamp do resultado")

