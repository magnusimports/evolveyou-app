"""
Configuração Firebase para produção
"""

import os
from typing import Dict, Any

# Configurações do Firebase para o projeto EvolveYou
FIREBASE_CONFIG = {
    "project_id": "evolveyou-prod",
    "database_url": "https://evolveyou-prod-default-rtdb.firebaseio.com",
    "storage_bucket": "evolveyou-prod.appspot.com",
    "location_id": "us-central",
    "api_key": "AIzaSyBqJVJKJHGFDSAQWERTYUIOPLKJHGFDSAQ",
    "auth_domain": "evolveyou-prod.firebaseapp.com",
    "messaging_sender_id": "123456789012"
}

# Configurações de coleções Firestore
FIRESTORE_COLLECTIONS = {
    "users": "users",
    "daily_logs": "daily_logs", 
    "workout_sessions": "workout_sessions",
    "meal_plans": "meal_plans",
    "exercise_library": "exercise_library",
    "foods": "foods",
    "user_profiles": "user_profiles",
    "notifications": "notifications"
}

# Configurações de autenticação
AUTH_CONFIG = {
    "token_expiry_hours": 24,
    "refresh_token_expiry_days": 30,
    "password_min_length": 8,
    "max_login_attempts": 5,
    "lockout_duration_minutes": 15
}

# Configurações de rate limiting
RATE_LIMIT_CONFIG = {
    "requests_per_minute": 60,
    "requests_per_hour": 1000,
    "requests_per_day": 10000,
    "burst_limit": 10
}

# Configurações de logging
LOGGING_CONFIG = {
    "level": "INFO",
    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    "handlers": ["console", "firestore"]
}

def get_firebase_config() -> Dict[str, Any]:
    """
    Retorna configuração do Firebase baseada no ambiente
    """
    config = FIREBASE_CONFIG.copy()
    
    # Sobrescrever com variáveis de ambiente se disponíveis
    if os.getenv("FIREBASE_PROJECT_ID"):
        config["project_id"] = os.getenv("FIREBASE_PROJECT_ID")
    
    if os.getenv("FIREBASE_DATABASE_URL"):
        config["database_url"] = os.getenv("FIREBASE_DATABASE_URL")
    
    if os.getenv("FIREBASE_STORAGE_BUCKET"):
        config["storage_bucket"] = os.getenv("FIREBASE_STORAGE_BUCKET")
    
    return config

def get_firestore_collections() -> Dict[str, str]:
    """
    Retorna mapeamento de coleções Firestore
    """
    return FIRESTORE_COLLECTIONS.copy()

def get_auth_config() -> Dict[str, Any]:
    """
    Retorna configurações de autenticação
    """
    return AUTH_CONFIG.copy()

def get_rate_limit_config() -> Dict[str, Any]:
    """
    Retorna configurações de rate limiting
    """
    return RATE_LIMIT_CONFIG.copy()

def get_logging_config() -> Dict[str, Any]:
    """
    Retorna configurações de logging
    """
    return LOGGING_CONFIG.copy()

# Configurações específicas para diferentes ambientes
ENVIRONMENT_CONFIGS = {
    "development": {
        "debug": True,
        "use_emulator": True,
        "emulator_host": "localhost",
        "emulator_port": 8080,
        "log_level": "DEBUG"
    },
    "staging": {
        "debug": False,
        "use_emulator": False,
        "log_level": "INFO",
        "enable_monitoring": True
    },
    "production": {
        "debug": False,
        "use_emulator": False,
        "log_level": "WARNING",
        "enable_monitoring": True,
        "enable_analytics": True,
        "enable_crash_reporting": True
    }
}

def get_environment_config(environment: str = "production") -> Dict[str, Any]:
    """
    Retorna configurações específicas do ambiente
    """
    return ENVIRONMENT_CONFIGS.get(environment, ENVIRONMENT_CONFIGS["production"])

# Configurações de segurança
SECURITY_CONFIG = {
    "cors_origins": [
        "https://evolveyou-prod.web.app",
        "https://evolveyou-prod.firebaseapp.com",
        "https://app.evolveyou.com",
        "http://localhost:3000",  # Para desenvolvimento
        "http://localhost:5173"   # Para Vite dev server
    ],
    "allowed_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allowed_headers": [
        "Content-Type",
        "Authorization", 
        "X-Requested-With",
        "Accept",
        "Origin"
    ],
    "max_age": 3600
}

def get_security_config() -> Dict[str, Any]:
    """
    Retorna configurações de segurança
    """
    return SECURITY_CONFIG.copy()

# Configurações de cache
CACHE_CONFIG = {
    "default_ttl": 300,  # 5 minutos
    "user_data_ttl": 600,  # 10 minutos
    "static_data_ttl": 3600,  # 1 hora
    "max_cache_size": 1000
}

def get_cache_config() -> Dict[str, Any]:
    """
    Retorna configurações de cache
    """
    return CACHE_CONFIG.copy()

# Configurações de monitoramento
MONITORING_CONFIG = {
    "enable_metrics": True,
    "enable_tracing": True,
    "sample_rate": 0.1,
    "error_reporting": True,
    "performance_monitoring": True
}

def get_monitoring_config() -> Dict[str, Any]:
    """
    Retorna configurações de monitoramento
    """
    return MONITORING_CONFIG.copy()

# Validação de configuração
def validate_config() -> bool:
    """
    Valida se todas as configurações necessárias estão presentes
    """
    required_env_vars = [
        "FIREBASE_PROJECT_ID",
    ]
    
    missing_vars = []
    for var in required_env_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"Variáveis de ambiente faltando: {missing_vars}")
        return False
    
    return True

# Configurações padrão para inicialização
DEFAULT_CONFIG = {
    "firebase": get_firebase_config(),
    "firestore": get_firestore_collections(),
    "auth": get_auth_config(),
    "rate_limit": get_rate_limit_config(),
    "security": get_security_config(),
    "cache": get_cache_config(),
    "monitoring": get_monitoring_config(),
    "logging": get_logging_config()
}

def get_full_config(environment: str = "production") -> Dict[str, Any]:
    """
    Retorna configuração completa para o ambiente especificado
    """
    config = DEFAULT_CONFIG.copy()
    config["environment"] = get_environment_config(environment)
    return config

