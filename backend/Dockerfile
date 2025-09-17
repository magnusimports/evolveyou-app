FROM python:3.11-slim

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY . .

# Copiar chave do Firebase
COPY evolveyou-prod-firebase-adminsdk-fb*.json ./firebase-key.json

# Definir variáveis de ambiente
ENV PYTHONPATH=/app
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/firebase-key.json
ENV FLASK_ENV=production
ENV PORT=8080

# Expor porta
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["python", "src/main.py"]

