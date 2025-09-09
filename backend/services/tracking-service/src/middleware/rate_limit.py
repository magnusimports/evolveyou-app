"""
Middleware de rate limiting para o Tracking Service
"""

import time
from typing import Dict, Callable
from collections import defaultdict, deque
import structlog
from fastapi import Request, Response, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

logger = structlog.get_logger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware para controle de rate limiting"""
    
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, deque] = defaultdict(deque)
    
    def _get_client_id(self, request: Request) -> str:
        """Obtém identificador do cliente"""
        # Usar IP do cliente como identificador
        if request.client:
            return request.client.host
        return "unknown"
    
    def _is_rate_limited(self, client_id: str) -> bool:
        """Verifica se o cliente excedeu o limite"""
        now = time.time()
        minute_ago = now - 60
        
        # Remover requisições antigas (mais de 1 minuto)
        client_requests = self.requests[client_id]
        while client_requests and client_requests[0] < minute_ago:
            client_requests.popleft()
        
        # Verificar se excedeu o limite
        if len(client_requests) >= self.requests_per_minute:
            return True
        
        # Adicionar requisição atual
        client_requests.append(now)
        return False
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Processa requisições com rate limiting"""
        
        # Endpoints que não precisam de rate limiting
        exempt_paths = ["/health", "/metrics"]
        
        if request.url.path in exempt_paths:
            return await call_next(request)
        
        client_id = self._get_client_id(request)
        
        if self._is_rate_limited(client_id):
            logger.warning(
                "Rate limit exceeded",
                client_id=client_id,
                path=request.url.path,
                limit=self.requests_per_minute
            )
            
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Maximum {self.requests_per_minute} requests per minute.",
                headers={"Retry-After": "60"}
            )
        
        return await call_next(request)

