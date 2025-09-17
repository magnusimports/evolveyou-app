# 🚀 GUIA DE DEPLOY EM PRODUÇÃO - EVOLVEYOU

**Versão**: 1.0  
**Data**: 16 de Setembro de 2025  
**Status**: Pronto para Deploy  

---

## 📋 **PRÉ-REQUISITOS**

### **Contas Necessárias**
- ✅ **Firebase** (já configurado)
- ✅ **Google Cloud Platform** (já configurado)
- ✅ **Netlify** (para frontend)
- ✅ **GitHub** (repositório já existe)

### **Credenciais Disponíveis**
- ✅ **Firebase Admin SDK** configurado
- ✅ **Gemini API Key** funcionando
- ✅ **GitHub Token** ativo

---

## 🌐 **DEPLOY DO FRONTEND (NETLIFY)**

### **Passo 1: Preparar Build**
```bash
cd /home/ubuntu/evolveyou-app/web
npm run build
```

### **Passo 2: Configurar Variáveis de Ambiente**
Criar arquivo `.env.production`:
```env
VITE_API_URL=https://sua-api-url.com
VITE_FIREBASE_CONFIG={"apiKey":"..."}
```

### **Passo 3: Deploy no Netlify**
1. Acesse: https://app.netlify.com/
2. Conecte com GitHub
3. Selecione repositório: `magnusimports/evolveyou-app`
4. Configurar build:
   - **Base directory**: `web`
   - **Build command**: `npm run build`
   - **Publish directory**: `web/dist`

### **Passo 4: Configurar Domínio**
- URL temporária: `https://evolveyou-web.netlify.app`
- Domínio customizado: `app.evolveyou.com` (se disponível)

---

## ⚙️ **DEPLOY DO BACKEND (GOOGLE CLOUD)**

### **Opção 1: Cloud Run (Recomendado)**

#### **Preparar Dockerfile**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .
COPY backend/evolveyou-prod-firebase-adminsdk.json .

ENV PORT=8080
EXPOSE 8080

CMD ["python", "src/main.py"]
```

#### **Deploy Commands**
```bash
# Build e push da imagem
gcloud builds submit --tag gcr.io/evolveyou-prod/backend

# Deploy no Cloud Run
gcloud run deploy evolveyou-backend \
  --image gcr.io/evolveyou-prod/backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=sua-chave
```

### **Opção 2: App Engine**

#### **Preparar app.yaml**
```yaml
runtime: python311

env_variables:
  GEMINI_API_KEY: "sua-chave-aqui"

handlers:
- url: /.*
  script: auto
```

#### **Deploy Command**
```bash
cd backend
gcloud app deploy
```

---

## 🔧 **CONFIGURAÇÕES DE PRODUÇÃO**

### **Backend Adjustments**
1. **Alterar Flask para produção**:
```python
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

2. **Configurar CORS para produção**:
```python
CORS(app, origins=[
    "https://evolveyou-web.netlify.app",
    "https://app.evolveyou.com"
])
```

### **Frontend Adjustments**
1. **Atualizar API URL**:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://evolveyou-backend-xxx.run.app';
```

2. **Configurar build otimizado**:
```json
{
  "scripts": {
    "build": "vite build --mode production"
  }
}
```

---

## 🔐 **SEGURANÇA E VARIÁVEIS**

### **Variáveis de Ambiente - Backend**
```env
GEMINI_API_KEY=sua_chave_gemini
FIREBASE_PROJECT_ID=evolveyou-prod
GOOGLE_APPLICATION_CREDENTIALS=./firebase-key.json
FLASK_ENV=production
```

### **Variáveis de Ambiente - Frontend**
```env
VITE_API_URL=https://sua-api-backend.run.app
VITE_FIREBASE_API_KEY=sua_chave_firebase
VITE_FIREBASE_PROJECT_ID=evolveyou-prod
```

### **Secrets no Google Cloud**
```bash
# Armazenar Gemini API Key
gcloud secrets create gemini-api-key --data-file=gemini-key.txt

# Usar no Cloud Run
gcloud run deploy evolveyou-backend \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest
```

---

## 📊 **MONITORAMENTO**

### **Google Cloud Monitoring**
- **Logs**: Cloud Logging habilitado
- **Métricas**: CPU, Memória, Requests
- **Alertas**: Configurar para erros 5xx

### **Netlify Analytics**
- **Performance**: Core Web Vitals
- **Tráfego**: Visitantes únicos
- **Erros**: JavaScript errors

---

## 🧪 **TESTES EM PRODUÇÃO**

### **Checklist Pós-Deploy**
- [ ] Frontend carrega corretamente
- [ ] APIs respondem (health check)
- [ ] Coach EVO funciona
- [ ] Busca de alimentos operacional
- [ ] Geração de treinos funcionando
- [ ] Logs sem erros críticos

### **URLs de Teste**
```bash
# Health check backend
curl https://sua-api.run.app/health

# Teste API alimentos
curl https://sua-api.run.app/api/alimentos/categorias

# Teste Coach EVO
curl -X POST https://sua-api.run.app/api/coach/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá!"}'
```

---

## 🔄 **CI/CD AUTOMÁTICO**

### **GitHub Actions Workflow**
```yaml
name: Deploy EvolveYou
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Netlify
        uses: netlify/actions/build@master
        with:
          publish-dir: web/dist

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Cloud Run
        uses: google-github-actions/deploy-cloudrun@v0
        with:
          service: evolveyou-backend
          image: gcr.io/evolveyou-prod/backend
```

---

## 📈 **ESCALABILIDADE**

### **Cloud Run Scaling**
```bash
gcloud run services update evolveyou-backend \
  --min-instances=1 \
  --max-instances=10 \
  --concurrency=100
```

### **Firebase Firestore**
- **Reads**: Até 50k/dia (gratuito)
- **Writes**: Até 20k/dia (gratuito)
- **Storage**: Até 1GB (gratuito)

### **Gemini AI**
- **Requests**: Monitorar usage
- **Rate Limits**: Implementar throttling

---

## 💰 **CUSTOS ESTIMADOS**

### **Mensal (até 1000 usuários)**
- **Netlify**: $0 (plano gratuito)
- **Cloud Run**: ~$5-10
- **Firebase**: $0 (plano gratuito)
- **Gemini AI**: ~$10-20
- **Total**: ~$15-30/mês

### **Escalabilidade**
- **10k usuários**: ~$50-100/mês
- **100k usuários**: ~$200-500/mês

---

## 🚨 **TROUBLESHOOTING**

### **Problemas Comuns**

#### **CORS Errors**
```python
# Adicionar no backend
CORS(app, origins=["https://seu-frontend.netlify.app"])
```

#### **Environment Variables**
```bash
# Verificar no Cloud Run
gcloud run services describe evolveyou-backend --region=us-central1
```

#### **Firebase Permissions**
```bash
# Verificar service account
gcloud iam service-accounts list
```

### **Logs e Debug**
```bash
# Cloud Run logs
gcloud logs read --service=evolveyou-backend

# Netlify logs
netlify logs
```

---

## ✅ **CHECKLIST FINAL**

### **Pré-Deploy**
- [ ] Código testado localmente
- [ ] Variáveis de ambiente configuradas
- [ ] Credenciais Firebase válidas
- [ ] Build frontend sem erros

### **Deploy**
- [ ] Backend deployado no Cloud Run
- [ ] Frontend deployado no Netlify
- [ ] DNS configurado (se aplicável)
- [ ] HTTPS habilitado

### **Pós-Deploy**
- [ ] Testes funcionais passando
- [ ] Monitoramento configurado
- [ ] Backup de dados
- [ ] Documentação atualizada

---

## 📞 **SUPORTE**

### **Contatos**
- **Firebase**: Console Firebase
- **Google Cloud**: Cloud Console
- **Netlify**: Netlify Dashboard

### **Documentação**
- **Firebase**: https://firebase.google.com/docs
- **Cloud Run**: https://cloud.google.com/run/docs
- **Netlify**: https://docs.netlify.com

---

**Guia preparado em 16 de Setembro de 2025**  
**Status**: ✅ PRONTO PARA DEPLOY EM PRODUÇÃO

