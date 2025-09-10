"""
API Gateway do EvolveYou
Centralização de endpoints, autenticação JWT e roteamento inteligente
"""

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import jwt
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configurações
JWT_SECRET = os.getenv("JWT_SECRET", "evolveyou-secret-key-2025")
JWT_ALGORITHM = "HS256"

# URLs dos microserviços
SERVICES = {
    "users": "http://localhost:8000",
    "plans": "http://localhost:8001", 
    "tracking": "http://localhost:8001",
    "evo": "http://localhost:8002",
    "content": "http://localhost:8003"
}

app = FastAPI(
    title="EvolveYou API Gateway",
    description="Gateway centralizado para todos os serviços do EvolveYou",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Modelos
class LoginRequest:
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password

class TokenResponse:
    def __init__(self, access_token: str, token_type: str, expires_in: int):
        self.access_token = access_token
        self.token_type = token_type
        self.expires_in = expires_in

# Funções de autenticação
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Cria token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verifica token JWT"""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return {"user_id": user_id, "payload": payload}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

async def proxy_request(service: str, path: str, method: str, request: Request, user_data: dict = None):
    """Proxy para microserviços"""
    if service not in SERVICES:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    
    url = f"{SERVICES[service]}{path}"
    headers = dict(request.headers)
    
    # Adicionar informações do usuário
    if user_data:
        headers["X-User-ID"] = user_data["user_id"]
        headers["X-User-Data"] = str(user_data["payload"])
    
    # Remover headers problemáticos
    headers.pop("host", None)
    headers.pop("content-length", None)
    
    try:
        async with httpx.AsyncClient() as client:
            if method == "GET":
                response = await client.get(url, headers=headers, params=request.query_params)
            elif method == "POST":
                body = await request.body()
                response = await client.post(url, headers=headers, content=body)
            elif method == "PUT":
                body = await request.body()
                response = await client.put(url, headers=headers, content=body)
            elif method == "DELETE":
                response = await client.delete(url, headers=headers)
            else:
                raise HTTPException(status_code=405, detail="Método não permitido")
            
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
    except httpx.RequestError as e:
        logger.error(f"Erro ao conectar com {service}: {e}")
        raise HTTPException(status_code=503, detail=f"Serviço {service} indisponível")

# Endpoints públicos (sem autenticação)

@app.get("/")
async def root():
    """Status do API Gateway"""
    return {
        "service": "EvolveYou API Gateway",
        "version": "1.0.0",
        "status": "online",
        "timestamp": datetime.utcnow().isoformat(),
        "services": list(SERVICES.keys())
    }

@app.get("/health")
async def health_check():
    """Health check do gateway"""
    services_status = {}
    
    for service_name, service_url in SERVICES.items():
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{service_url}/health", timeout=5.0)
                services_status[service_name] = {
                    "status": "online" if response.status_code == 200 else "error",
                    "response_time": "< 5s"
                }
        except:
            services_status[service_name] = {
                "status": "offline",
                "response_time": "timeout"
            }
    
    return {
        "gateway": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": services_status
    }

@app.post("/auth/login")
async def login(request: Request):
    """Login de usuário"""
    body = await request.json()
    email = body.get("email")
    password = body.get("password")
    
    # Simular autenticação (integrar com users-service)
    if email and password:
        # Criar token
        access_token = create_access_token(
            data={"sub": email, "email": email, "role": "user"}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 86400,  # 24 horas
            "user": {
                "email": email,
                "role": "user"
            }
        }
    
    raise HTTPException(status_code=401, detail="Credenciais inválidas")

@app.post("/auth/refresh")
async def refresh_token(user_data: dict = Depends(verify_token)):
    """Renovar token"""
    new_token = create_access_token(data=user_data["payload"])
    return {
        "access_token": new_token,
        "token_type": "bearer",
        "expires_in": 86400
    }

# Rotas protegidas (com autenticação)

@app.api_route("/users/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def users_proxy(path: str, request: Request, user_data: dict = Depends(verify_token)):
    """Proxy para users-service"""
    return await proxy_request("users", f"/users/{path}", request.method, request, user_data)

@app.api_route("/plans/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def plans_proxy(path: str, request: Request, user_data: dict = Depends(verify_token)):
    """Proxy para plans-service"""
    return await proxy_request("plans", f"/plans/{path}", request.method, request, user_data)

@app.api_route("/tracking/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def tracking_proxy(path: str, request: Request, user_data: dict = Depends(verify_token)):
    """Proxy para tracking-service"""
    return await proxy_request("tracking", f"/{path}", request.method, request, user_data)

@app.api_route("/evo/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def evo_proxy(path: str, request: Request, user_data: dict = Depends(verify_token)):
    """Proxy para evo-service"""
    return await proxy_request("evo", f"/evo/{path}", request.method, request, user_data)

@app.api_route("/content/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def content_proxy(path: str, request: Request, user_data: dict = Depends(verify_token)):
    """Proxy para content-service"""
    return await proxy_request("content", f"/{path}", request.method, request, user_data)

# Rotas especiais

@app.get("/api/status")
async def api_status(user_data: dict = Depends(verify_token)):
    """Status completo da API para usuários autenticados"""
    return {
        "user": user_data["user_id"],
        "gateway_version": "1.0.0",
        "services_available": list(SERVICES.keys()),
        "timestamp": datetime.utcnow().isoformat(),
        "permissions": ["read", "write", "delete"]
    }

# Handler de erros
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

