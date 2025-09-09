"""
Middleware de rate limiting avançado para Tracking API
"""

import time
import asyncio
from typing import Dict, Callable, Optional, Tuple
from collections import defaultdict, deque
from datetime import datetime, timedelta
import structlog
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
import hashlib

logger = structlog.get_logger(__name__)

class AdvancedRateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware avançado para controle de rate limiting"""
    
    def __init__(
        self, 
        app,
        requests_per_minute: int = 60,
        requests_per_hour: int = 1000,
        requests_per_day: int = 10000,
        burst_limit: int = 10,
        enable_user_based_limits: bool = True
    ):
        super().__init__(app)
        
        # Configurações de limite
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.requests_per_day = requests_per_day
        self.burst_limit = burst_limit
        self.enable_user_based_limits = enable_user_based_limits
        
        # Armazenamento de requisições por período
        self.minute_requests: Dict[str, deque] = defaultdict(deque)
        self.hour_requests: Dict[str, deque] = defaultdict(deque)
        self.day_requests: Dict[str, deque] = defaultdict(deque)
        
        # Controle de burst
        self.burst_requests: Dict[str, deque] = defaultdict(deque)
        
        # Whitelist de IPs/usuários
        self.whitelist: set = {
            "127.0.0.1",
            "localhost",
            "::1"
        }
        
        # Limites especiais por tipo de usuário
        self.user_limits = {
            "free": {
                "requests_per_minute": 30,
                "requests_per_hour": 500,
                "requests_per_day": 5000
            },
            "premium": {
                "requests_per_minute": 120,
                "requests_per_hour": 2000,
                "requests_per_day": 20000
            },
            "admin": {
                "requests_per_minute": 300,
                "requests_per_hour": 5000,
                "requests_per_day": 50000
            }
        }
    
    def _get_client_identifier(self, request: Request) -> Tuple[str, str]:
        """
        Obtém identificador do cliente e tipo
        
        Returns:
            Tuple[str, str]: (client_id, client_type)
        """
        # Tentar obter usuário autenticado
        user = getattr(request.state, 'user', None)
        
        if user and user.get('authenticated'):
            user_id = user.get('user_id')
            user_type = user.get('subscription', 'free')
            return f"user:{user_id}", user_type
        
        # Fallback para IP
        client_ip = "unknown"
        if request.client:
            client_ip = request.client.host
        elif "x-forwarded-for" in request.headers:
            client_ip = request.headers["x-forwarded-for"].split(",")[0].strip()
        elif "x-real-ip" in request.headers:
            client_ip = request.headers["x-real-ip"]
        
        return f"ip:{client_ip}", "anonymous"
    
    def _get_limits_for_client(self, client_type: str) -> Dict[str, int]:
        """
        Obtém limites específicos para o tipo de cliente
        
        Args:
            client_type: Tipo do cliente (free, premium, admin, anonymous)
            
        Returns:
            Dict: Limites aplicáveis
        """
        if client_type in self.user_limits:
            return self.user_limits[client_type]
        
        # Limites padrão para clientes anônimos
        return {
            "requests_per_minute": self.requests_per_minute,
            "requests_per_hour": self.requests_per_hour,
            "requests_per_day": self.requests_per_day
        }
    
    def _clean_old_requests(self, client_id: str):
        """Remove requisições antigas dos contadores"""
        now = time.time()
        
        # Limpar requisições de 1 minuto atrás
        minute_ago = now - 60
        while (self.minute_requests[client_id] and 
               self.minute_requests[client_id][0] < minute_ago):
            self.minute_requests[client_id].popleft()
        
        # Limpar requisições de 1 hora atrás
        hour_ago = now - 3600
        while (self.hour_requests[client_id] and 
               self.hour_requests[client_id][0] < hour_ago):
            self.hour_requests[client_id].popleft()
        
        # Limpar requisições de 1 dia atrás
        day_ago = now - 86400
        while (self.day_requests[client_id] and 
               self.day_requests[client_id][0] < day_ago):
            self.day_requests[client_id].popleft()
        
        # Limpar burst (10 segundos)
        burst_ago = now - 10
        while (self.burst_requests[client_id] and 
               self.burst_requests[client_id][0] < burst_ago):
            self.burst_requests[client_id].popleft()
    
    def _check_rate_limits(self, client_id: str, client_type: str) -> Optional[Dict[str, any]]:
        """
        Verifica se o cliente excedeu algum limite
        
        Returns:
            Optional[Dict]: Informações do limite excedido ou None
        """
        # Verificar whitelist
        if any(whitelist_item in client_id for whitelist_item in self.whitelist):
            return None
        
        # Obter limites para o cliente
        limits = self._get_limits_for_client(client_type)
        
        # Verificar burst limit
        if len(self.burst_requests[client_id]) >= self.burst_limit:
            return {
                "type": "burst",
                "limit": self.burst_limit,
                "window": "10 seconds",
                "retry_after": 10
            }
        
        # Verificar limite por minuto
        if len(self.minute_requests[client_id]) >= limits["requests_per_minute"]:
            return {
                "type": "minute",
                "limit": limits["requests_per_minute"],
                "window": "1 minute",
                "retry_after": 60
            }
        
        # Verificar limite por hora
        if len(self.hour_requests[client_id]) >= limits["requests_per_hour"]:
            return {
                "type": "hour",
                "limit": limits["requests_per_hour"],
                "window": "1 hour",
                "retry_after": 3600
            }
        
        # Verificar limite por dia
        if len(self.day_requests[client_id]) >= limits["requests_per_day"]:
            return {
                "type": "day",
                "limit": limits["requests_per_day"],
                "window": "1 day",
                "retry_after": 86400
            }
        
        return None
    
    def _record_request(self, client_id: str):
        """Registra uma nova requisição nos contadores"""
        now = time.time()
        
        self.minute_requests[client_id].append(now)
        self.hour_requests[client_id].append(now)
        self.day_requests[client_id].append(now)
        self.burst_requests[client_id].append(now)
    
    def _get_rate_limit_headers(self, client_id: str, client_type: str) -> Dict[str, str]:
        """
        Gera headers informativos sobre rate limiting
        
        Returns:
            Dict: Headers para incluir na resposta
        """
        limits = self._get_limits_for_client(client_type)
        
        headers = {
            "X-RateLimit-Limit-Minute": str(limits["requests_per_minute"]),
            "X-RateLimit-Limit-Hour": str(limits["requests_per_hour"]),
            "X-RateLimit-Limit-Day": str(limits["requests_per_day"]),
            "X-RateLimit-Remaining-Minute": str(max(0, limits["requests_per_minute"] - len(self.minute_requests[client_id]))),
            "X-RateLimit-Remaining-Hour": str(max(0, limits["requests_per_hour"] - len(self.hour_requests[client_id]))),
            "X-RateLimit-Remaining-Day": str(max(0, limits["requests_per_day"] - len(self.day_requests[client_id]))),
            "X-RateLimit-Reset-Minute": str(int(time.time()) + 60),
            "X-RateLimit-Reset-Hour": str(int(time.time()) + 3600),
            "X-RateLimit-Reset-Day": str(int(time.time()) + 86400)
        }
        
        return headers
    
    def _is_exempt_endpoint(self, request: Request) -> bool:
        """Verifica se o endpoint está isento de rate limiting"""
        exempt_paths = [
            "/health",
            "/metrics", 
            "/docs",
            "/redoc",
            "/openapi.json"
        ]
        
        return request.url.path in exempt_paths
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Processa requisições com rate limiting avançado"""
        
        try:
            # Verificar se endpoint está isento
            if self._is_exempt_endpoint(request):
                return await call_next(request)
            
            # Obter identificador do cliente
            client_id, client_type = self._get_client_identifier(request)
            
            # Limpar requisições antigas
            self._clean_old_requests(client_id)
            
            # Verificar limites
            limit_exceeded = self._check_rate_limits(client_id, client_type)
            
            if limit_exceeded:
                logger.warning(
                    "Rate limit exceeded",
                    client_id=client_id,
                    client_type=client_type,
                    path=request.url.path,
                    limit_type=limit_exceeded["type"],
                    limit=limit_exceeded["limit"]
                )
                
                # Headers de rate limiting
                headers = {
                    "Retry-After": str(limit_exceeded["retry_after"]),
                    "X-RateLimit-Limit": str(limit_exceeded["limit"]),
                    "X-RateLimit-Window": limit_exceeded["window"],
                    "X-RateLimit-Type": limit_exceeded["type"]
                }
                
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded: {limit_exceeded['limit']} requests per {limit_exceeded['window']}",
                    headers=headers
                )
            
            # Registrar requisição
            self._record_request(client_id)
            
            # Processar requisição
            response = await call_next(request)
            
            # Adicionar headers informativos
            rate_limit_headers = self._get_rate_limit_headers(client_id, client_type)
            for header_name, header_value in rate_limit_headers.items():
                response.headers[header_name] = header_value
            
            logger.debug(
                "Request processed",
                client_id=client_id,
                client_type=client_type,
                path=request.url.path,
                status_code=response.status_code
            )
            
            return response
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Error in rate limit middleware", error=str(e))
            # Em caso de erro, permitir a requisição
            return await call_next(request)

# Configurações específicas por ambiente
class RateLimitConfig:
    """Configurações de rate limiting"""
    
    DEVELOPMENT = {
        "requests_per_minute": 120,
        "requests_per_hour": 2000,
        "requests_per_day": 20000,
        "burst_limit": 20
    }
    
    PRODUCTION = {
        "requests_per_minute": 60,
        "requests_per_hour": 1000,
        "requests_per_day": 10000,
        "burst_limit": 10
    }
    
    @classmethod
    def get_config(cls, environment: str = "production") -> Dict[str, int]:
        """Obtém configuração para o ambiente"""
        if environment == "development":
            return cls.DEVELOPMENT
        return cls.PRODUCTION

# Função para criar middleware com configuração
def create_rate_limit_middleware(app, environment: str = "production"):
    """
    Cria middleware de rate limiting com configuração específica
    
    Args:
        app: Aplicação FastAPI
        environment: Ambiente (development/production)
        
    Returns:
        AdvancedRateLimitMiddleware: Middleware configurado
    """
    config = RateLimitConfig.get_config(environment)
    
    return AdvancedRateLimitMiddleware(
        app,
        requests_per_minute=config["requests_per_minute"],
        requests_per_hour=config["requests_per_hour"],
        requests_per_day=config["requests_per_day"],
        burst_limit=config["burst_limit"]
    )

# Instância padrão
def get_rate_limit_middleware(environment: str = "production"):
    """Obtém instância do middleware de rate limiting"""
    config = RateLimitConfig.get_config(environment)
    
    class RateLimitMiddleware(BaseHTTPMiddleware):
        def __init__(self, app):
            super().__init__(app)
            self.advanced_middleware = AdvancedRateLimitMiddleware(
                app,
                **config
            )
        
        async def dispatch(self, request: Request, call_next: Callable) -> Response:
            return await self.advanced_middleware.dispatch(request, call_next)
    
    return RateLimitMiddleware

