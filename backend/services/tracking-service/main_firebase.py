"""
Firebase Function para Tracking API do EvolveYou
"""

import os
import sys
from pathlib import Path
from firebase_functions import https_fn
from firebase_admin import initialize_app

# Inicializar Firebase Admin
initialize_app()

# Adicionar src ao path
current_dir = Path(__file__).parent
src_dir = current_dir / "src"
sys.path.insert(0, str(src_dir))

# Configurações para produção
os.environ.setdefault("ENVIRONMENT", "production")
os.environ.setdefault("LOG_LEVEL", "INFO")

# Importar a aplicação FastAPI
try:
    from src.main import app
except ImportError:
    # Fallback para versão simplificada
    from demo_api import app

@https_fn.on_request(cors=True)
def tracking_api(req):
    """
    Função HTTP para Firebase Functions
    """
    # Configurar CORS
    if req.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)
    
    # Processar requisição através do FastAPI
    from fastapi.middleware.wsgi import WSGIMiddleware
    from werkzeug.serving import WSGIRequestHandler
    
    # Converter Flask request para ASGI
    import asyncio
    
    async def asgi_app(scope, receive, send):
        await app(scope, receive, send)
    
    # Executar aplicação ASGI
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Simular ASGI scope
        scope = {
            'type': 'http',
            'method': req.method,
            'path': req.path,
            'query_string': req.query_string.encode() if req.query_string else b'',
            'headers': [(k.lower().encode(), v.encode()) for k, v in req.headers.items()],
        }
        
        # Simular receive
        async def receive():
            return {
                'type': 'http.request',
                'body': req.get_data(),
                'more_body': False,
            }
        
        # Capturar response
        response_data = {}
        
        async def send(message):
            if message['type'] == 'http.response.start':
                response_data['status'] = message['status']
                response_data['headers'] = message.get('headers', [])
            elif message['type'] == 'http.response.body':
                response_data['body'] = message.get('body', b'')
        
        # Executar aplicação
        await asgi_app(scope, receive, send)
        
        # Retornar resposta
        headers = {}
        for name, value in response_data.get('headers', []):
            headers[name.decode()] = value.decode()
        
        # Adicionar CORS headers
        headers['Access-Control-Allow-Origin'] = '*'
        headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        
        return (
            response_data.get('body', b''),
            response_data.get('status', 200),
            headers
        )
        
    except Exception as e:
        # Fallback para resposta de erro
        import json
        error_response = {
            'error': str(e),
            'status': 'error',
            'service': 'tracking-api'
        }
        
        headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
        
        return (json.dumps(error_response), 500, headers)
    
    finally:
        loop.close()

