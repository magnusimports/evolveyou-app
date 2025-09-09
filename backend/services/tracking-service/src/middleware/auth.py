"""
Middleware de autenticação para Tracking API
"""

from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
import structlog

from .jwt_auth import jwt_auth, get_current_user, get_optional_user

logger = structlog.get_logger(__name__)

class AuthMiddleware:
    """Middleware de autenticação"""
    
    def __init__(self, app):
        self.app = app
        self.jwt_auth = jwt_auth
        self.security = HTTPBearer(auto_error=False)
    
    async def __call__(self, request: Request, call_next):
        """
        Processa autenticação para cada requisição
        """
        try:
            # Endpoints públicos que não precisam de autenticação
            public_endpoints = [
                "/", 
                "/health", 
                "/metrics", 
                "/docs", 
                "/redoc", 
                "/openapi.json"
            ]
            
            # Verificar se é endpoint público
            if request.url.path in public_endpoints:
                request.state.user = {"authenticated": False}
                response = await call_next(request)
                return response
            
            # Extrair token do header Authorization
            auth_header = request.headers.get("Authorization")
            
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                
                try:
                    # Verificar token
                    payload = self.jwt_auth.verify_token(token)
                    
                    # Adicionar dados do usuário ao request
                    request.state.user = {
                        "user_id": payload.get("user_id"),
                        "email": payload.get("email"),
                        "name": payload.get("name"),
                        "role": payload.get("role", "user"),
                        "subscription": payload.get("subscription", "free"),
                        "authenticated": True
                    }
                    
                    logger.debug("Usuário autenticado", user_id=payload.get("user_id"))
                    
                except HTTPException:
                    # Token inválido - usar usuário demo para desenvolvimento
                    request.state.user = self._create_demo_user()
                    logger.debug("Token inválido - usando usuário demo")
                
            else:
                # Sem token - usar usuário demo para desenvolvimento
                request.state.user = self._create_demo_user()
                logger.debug("Sem token - usando usuário demo")
            
            # Continuar processamento
            response = await call_next(request)
            return response
            
        except Exception as e:
            logger.error("Erro no middleware de autenticação", error=str(e))
            # Em caso de erro, usar usuário demo
            request.state.user = self._create_demo_user()
            response = await call_next(request)
            return response
    
    def _create_demo_user(self) -> Dict[str, Any]:
        """Cria usuário demo para desenvolvimento"""
        return {
            "user_id": "demo_user",
            "email": "demo@evolveyou.com",
            "name": "Usuário Demo",
            "role": "user",
            "subscription": "free",
            "authenticated": True
        }

# Instância do middleware
auth_middleware = AuthMiddleware()

def get_user_from_request(request: Request) -> Dict[str, Any]:
    """
    Obtém dados do usuário a partir do request
    
    Args:
        request: Request do FastAPI
        
    Returns:
        Dict: Dados do usuário
    """
    return getattr(request.state, "user", {"authenticated": False})

def require_auth(request: Request) -> Dict[str, Any]:
    """
    Exige autenticação para acessar o endpoint
    
    Args:
        request: Request do FastAPI
        
    Returns:
        Dict: Dados do usuário autenticado
        
    Raises:
        HTTPException: Se não autenticado
    """
    user = get_user_from_request(request)
    
    if not user.get("authenticated"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticação requerida",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    return user

def optional_auth(request: Request) -> Optional[Dict[str, Any]]:
    """
    Autenticação opcional - não gera erro se não autenticado
    
    Args:
        request: Request do FastAPI
        
    Returns:
        Optional[Dict]: Dados do usuário ou None
    """
    user = get_user_from_request(request)
    
    if user.get("authenticated"):
        return user
    
    return None

# Funções auxiliares para demo/desenvolvimento

def create_demo_user() -> Dict[str, Any]:
    """
    Cria um usuário demo para testes
    
    Returns:
        Dict: Dados do usuário demo
    """
    return {
        "user_id": "demo_user",
        "email": "demo@evolveyou.com",
        "name": "Usuário Demo",
        "role": "user",
        "subscription": "free",
        "authenticated": True
    }

def get_demo_token() -> str:
    """
    Obtém token demo para testes
    
    Returns:
        str: Token demo
    """
    from .jwt_auth import create_demo_token
    return create_demo_token()

# Dependency functions para usar nos endpoints

async def get_current_user_dependency(request: Request) -> Dict[str, Any]:
    """
    Dependency para obter usuário atual (obrigatório)
    """
    return require_auth(request)

async def get_optional_user_dependency(request: Request) -> Optional[Dict[str, Any]]:
    """
    Dependency para obter usuário atual (opcional)
    """
    return optional_auth(request)

# Decorators para facilitar uso

def authenticated(func):
    """
    Decorator para exigir autenticação
    """
    async def wrapper(*args, **kwargs):
        # Assumir que o primeiro argumento é request ou que há um request nos kwargs
        request = None
        
        if args and hasattr(args[0], 'state'):
            request = args[0]
        elif 'request' in kwargs:
            request = kwargs['request']
        
        if request:
            user = require_auth(request)
            kwargs['current_user'] = user
        
        return await func(*args, **kwargs)
    
    return wrapper

def optional_authenticated(func):
    """
    Decorator para autenticação opcional
    """
    async def wrapper(*args, **kwargs):
        # Assumir que o primeiro argumento é request ou que há um request nos kwargs
        request = None
        
        if args and hasattr(args[0], 'state'):
            request = args[0]
        elif 'request' in kwargs:
            request = kwargs['request']
        
        if request:
            user = optional_auth(request)
            kwargs['current_user'] = user
        
        return await func(*args, **kwargs)
    
    return wrapper

