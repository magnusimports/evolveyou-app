"""
Middleware de autenticação JWT para Tracking API
"""

import os
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import structlog

logger = structlog.get_logger(__name__)

# Configurações JWT
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "evolveyou-super-secret-key-2025")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
JWT_REFRESH_EXPIRATION_DAYS = 30

# Instância do bearer token
security = HTTPBearer()

class JWTAuth:
    """Classe para gerenciar autenticação JWT"""
    
    def __init__(self):
        self.secret_key = JWT_SECRET_KEY
        self.algorithm = JWT_ALGORITHM
        self.expiration_hours = JWT_EXPIRATION_HOURS
        self.refresh_expiration_days = JWT_REFRESH_EXPIRATION_DAYS
    
    def create_access_token(self, user_id: str, user_data: Dict[str, Any] = None) -> str:
        """
        Cria um token de acesso JWT
        
        Args:
            user_id: ID do usuário
            user_data: Dados adicionais do usuário
            
        Returns:
            str: Token JWT
        """
        try:
            # Payload do token
            payload = {
                "user_id": user_id,
                "type": "access",
                "iat": datetime.utcnow(),
                "exp": datetime.utcnow() + timedelta(hours=self.expiration_hours),
                "iss": "evolveyou-api",
                "aud": "evolveyou-app"
            }
            
            # Adicionar dados do usuário se fornecidos
            if user_data:
                payload.update({
                    "email": user_data.get("email"),
                    "name": user_data.get("name"),
                    "role": user_data.get("role", "user"),
                    "subscription": user_data.get("subscription", "free")
                })
            
            # Gerar token
            token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
            
            logger.info("Token de acesso criado", user_id=user_id)
            return token
            
        except Exception as e:
            logger.error("Erro ao criar token de acesso", error=str(e), user_id=user_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro interno do servidor"
            )
    
    def create_refresh_token(self, user_id: str) -> str:
        """
        Cria um token de refresh JWT
        
        Args:
            user_id: ID do usuário
            
        Returns:
            str: Token de refresh
        """
        try:
            payload = {
                "user_id": user_id,
                "type": "refresh",
                "iat": datetime.utcnow(),
                "exp": datetime.utcnow() + timedelta(days=self.refresh_expiration_days),
                "iss": "evolveyou-api",
                "aud": "evolveyou-app"
            }
            
            token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
            
            logger.info("Token de refresh criado", user_id=user_id)
            return token
            
        except Exception as e:
            logger.error("Erro ao criar token de refresh", error=str(e), user_id=user_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro interno do servidor"
            )
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Verifica e decodifica um token JWT
        
        Args:
            token: Token JWT
            
        Returns:
            Dict: Payload do token
        """
        try:
            # Decodificar token
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=[self.algorithm],
                audience="evolveyou-app",
                issuer="evolveyou-api"
            )
            
            # Verificar se o token não expirou
            exp_timestamp = payload.get("exp")
            if exp_timestamp:
                exp_datetime = datetime.fromtimestamp(exp_timestamp)
                if datetime.utcnow() > exp_datetime:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Token expirado"
                    )
            
            logger.debug("Token verificado com sucesso", user_id=payload.get("user_id"))
            return payload
            
        except jwt.ExpiredSignatureError:
            logger.warning("Token expirado")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expirado"
            )
        except jwt.InvalidTokenError as e:
            logger.warning("Token inválido", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        except Exception as e:
            logger.error("Erro ao verificar token", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Erro de autenticação"
            )
    
    def refresh_access_token(self, refresh_token: str) -> str:
        """
        Gera um novo token de acesso usando um refresh token
        
        Args:
            refresh_token: Token de refresh
            
        Returns:
            str: Novo token de acesso
        """
        try:
            # Verificar refresh token
            payload = self.verify_token(refresh_token)
            
            # Verificar se é um refresh token
            if payload.get("type") != "refresh":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token de refresh inválido"
                )
            
            user_id = payload.get("user_id")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token de refresh inválido"
                )
            
            # Criar novo token de acesso
            new_token = self.create_access_token(user_id)
            
            logger.info("Token de acesso renovado", user_id=user_id)
            return new_token
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Erro ao renovar token", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Erro ao renovar token"
            )

# Instância global do JWT Auth
jwt_auth = JWTAuth()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Dependency para obter o usuário atual a partir do token JWT
    
    Args:
        credentials: Credenciais HTTP Bearer
        
    Returns:
        Dict: Dados do usuário
    """
    try:
        # Extrair token
        token = credentials.credentials
        
        # Verificar token
        payload = jwt_auth.verify_token(token)
        
        # Verificar se é um token de acesso
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de acesso requerido"
            )
        
        # Retornar dados do usuário
        user_data = {
            "user_id": payload.get("user_id"),
            "email": payload.get("email"),
            "name": payload.get("name"),
            "role": payload.get("role", "user"),
            "subscription": payload.get("subscription", "free")
        }
        
        return user_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao obter usuário atual", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Erro de autenticação"
        )

def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[Dict[str, Any]]:
    """
    Dependency para obter o usuário atual opcionalmente (não obrigatório)
    
    Args:
        credentials: Credenciais HTTP Bearer (opcional)
        
    Returns:
        Optional[Dict]: Dados do usuário ou None
    """
    try:
        if not credentials:
            return None
        
        return get_current_user(credentials)
        
    except HTTPException:
        # Se houver erro de autenticação, retornar None em vez de erro
        return None
    except Exception:
        return None

def require_role(required_role: str):
    """
    Decorator para exigir uma role específica
    
    Args:
        required_role: Role requerida
        
    Returns:
        Dependency function
    """
    def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = current_user.get("role", "user")
        
        # Hierarquia de roles: admin > premium > user
        role_hierarchy = {
            "user": 0,
            "premium": 1,
            "admin": 2
        }
        
        required_level = role_hierarchy.get(required_role, 0)
        user_level = role_hierarchy.get(user_role, 0)
        
        if user_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{required_role}' requerida"
            )
        
        return current_user
    
    return role_checker

def require_subscription(required_subscription: str):
    """
    Decorator para exigir uma assinatura específica
    
    Args:
        required_subscription: Assinatura requerida
        
    Returns:
        Dependency function
    """
    def subscription_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_subscription = current_user.get("subscription", "free")
        
        # Hierarquia de assinaturas: premium > free
        subscription_hierarchy = {
            "free": 0,
            "premium": 1
        }
        
        required_level = subscription_hierarchy.get(required_subscription, 0)
        user_level = subscription_hierarchy.get(user_subscription, 0)
        
        if user_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Assinatura '{required_subscription}' requerida"
            )
        
        return current_user
    
    return subscription_checker

# Funções auxiliares para autenticação

def create_demo_token(user_id: str = "demo_user") -> str:
    """
    Cria um token demo para testes
    
    Args:
        user_id: ID do usuário demo
        
    Returns:
        str: Token demo
    """
    demo_data = {
        "email": "demo@evolveyou.com",
        "name": "Usuário Demo",
        "role": "user",
        "subscription": "free"
    }
    
    return jwt_auth.create_access_token(user_id, demo_data)

def validate_api_key(api_key: str) -> bool:
    """
    Valida uma API key (para integrações externas)
    
    Args:
        api_key: Chave da API
        
    Returns:
        bool: Válida ou não
    """
    # Lista de API keys válidas (em produção, armazenar no banco)
    valid_api_keys = [
        "evolveyou-api-key-2025",
        "evolveyou-integration-key",
        "evolveyou-mobile-app-key"
    ]
    
    return api_key in valid_api_keys

def api_key_auth(api_key: str = None) -> Dict[str, Any]:
    """
    Autenticação via API key
    
    Args:
        api_key: Chave da API
        
    Returns:
        Dict: Dados do sistema/integração
    """
    if not api_key or not validate_api_key(api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key inválida"
        )
    
    return {
        "type": "api_key",
        "api_key": api_key,
        "permissions": ["read", "write"]
    }

