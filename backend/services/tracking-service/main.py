"""
Cloud Function para Tracking API do EvolveYou
"""

import os
import sys
from pathlib import Path

# Adicionar src ao path
current_dir = Path(__file__).parent
src_dir = current_dir / "src"
sys.path.insert(0, str(src_dir))

from src.main import app

# Configurações para Cloud Functions
os.environ.setdefault("ENVIRONMENT", "production")
os.environ.setdefault("LOG_LEVEL", "INFO")

# Função principal para Cloud Functions
def tracking_api(request):
    """
    Função principal para Cloud Functions
    """
    return app(request.environ, lambda status, headers: None)

# Para execução local
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

