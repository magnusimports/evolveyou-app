"""
Middleware de logging estruturado para o Tracking Service
"""

import time
import uuid
from typing import Callable
import structlog
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


def setup_logging():
    """Configura logging estruturado"""
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware para logging de requisições"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Processa requisições com logging"""
        
        # Gerar ID único para a requisição
        request_id = str(uuid.uuid4())
        
        # Configurar contexto de logging
        logger = structlog.get_logger(__name__).bind(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            query_params=str(request.query_params),
            client_ip=request.client.host if request.client else None
        )
        
        # Adicionar request_id ao estado da requisição
        request.state.request_id = request_id
        request.state.logger = logger
        
        # Log de início da requisição
        start_time = time.time()
        logger.info("Request started")
        
        try:
            # Processar requisição
            response = await call_next(request)
            
            # Calcular tempo de processamento
            process_time = time.time() - start_time
            
            # Log de fim da requisição
            logger.info(
                "Request completed",
                status_code=response.status_code,
                process_time=round(process_time, 4)
            )
            
            # Adicionar headers de resposta
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = str(round(process_time, 4))
            
            return response
            
        except Exception as e:
            # Log de erro
            process_time = time.time() - start_time
            logger.error(
                "Request failed",
                error=str(e),
                process_time=round(process_time, 4),
                exc_info=True
            )
            raise

