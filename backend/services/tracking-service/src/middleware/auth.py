"""
Middleware de autenticação para o Tracking Service
"""

import jwt
from typing import Dict, Any, Optional
from fastapi import HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import structlog

logger = structlog.get_logger(__name__)
security = HTTPBearer()


class AuthMiddleware:
    """Middleware para autenticação JWT"""
    
    def __init__(self):
        self.jwt_secret = "evolveyou-secret-key"  # Em produção, usar variável de ambiente
        self.jwt_algorithm = "HS256"
    
    async def __call__(self, request: Request, call_next):
        """Processa requisições com autenticação"""
        
        # Endpoints que não precisam de autenticação
        public_endpoints = ["/", "/health", "/metrics", "/docs", "/redoc", "/openapi.json"]
        
        if request.url.path in public_endpoints:
            return await call_next(request)
        
        # Verificar token de autorização
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Token de autorização necessário"
            )
        
        token = auth_header.split(" ")[1]
        
        try:
            # Decodificar e validar token
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            request.state.user = payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=401,
                detail="Token expirado"
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=401,
                detail="Token inválido"
            )
        
        return await call_next(request)


async def get_current_user(request: Request) -> Dict[str, Any]:
    """Dependency para obter usuário atual da requisição"""
    
    if not hasattr(request.state, 'user'):
        # Para desenvolvimento, criar usuário mock
        return {
            "user_id": "test_user_123",
            "email": "test@evolveyou.com",
            "name": "Test User"
        }
    
    return request.state.user


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Verifica e decodifica token JWT"""
    
    try:
        payload = jwt.decode(
            credentials.credentials,
            "evolveyou-secret-key",  # Em produção, usar variável de ambiente
            algorithms=["HS256"]
        )
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token expirado"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Token inválido"
        )

