# 🚀 EvolveYou Premium Features

## Funcionalidades Diferenciadoras Implementadas

Este diretório contém as funcionalidades premium que tornam o EvolveYou único no mercado de fitness e nutrição.

### ✨ Funcionalidades Implementadas

#### 1. 🧮 Algoritmo de GMB Aprimorado
- **Diferencial:** Considera fatores únicos como composição corporal, uso de recursos ergogênicos e experiência de treino
- **Localização:** `backend/src/routes/premium/enhanced_bmr.py` + `frontend/src/components/EnhancedBMRCalculator.jsx`
- **API:** `/api/bmr/calculate` e `/api/bmr/factors`

#### 2. ⏰ Sistema Full-time
- **Diferencial:** Registro de alimentos e atividades não planejados com reajuste automático do plano
- **Localização:** `backend/src/routes/premium/fulltime_system.py` + `frontend/src/components/FullTimeSystem.jsx`
- **APIs:** `/api/fulltime/log/food`, `/api/fulltime/log/activity`, `/api/fulltime/logs/{user_id}`

#### 3. 🔄 Substituição Inteligente de Alimentos
- **Diferencial:** Substitui alimentos na dieta com cálculo automático de equivalência calórica e nutricional
- **Localização:** `backend/src/routes/premium/food_substitution.py` + `frontend/src/components/FoodSubstitution.jsx`
- **APIs:** `/api/nutrition/substitute`, `/api/nutrition/foods`, `/api/nutrition/categories`

### 🏗️ Arquitetura

#### Backend (Flask)
```
premium-features/backend/
├── src/
│   ├── main.py                    # Servidor principal com rotas integradas
│   ├── routes/
│   │   └── premium/
│   │       ├── enhanced_bmr.py    # Algoritmo GMB Aprimorado
│   │       ├── fulltime_system.py # Sistema Full-time
│   │       └── food_substitution.py # Substituição Inteligente
│   └── models/                    # Modelos de dados
├── requirements.txt               # Dependências Python
└── venv/                         # Ambiente virtual
```

#### Frontend (React)
```
premium-features/frontend/
├── src/
│   ├── App.jsx                   # App principal com roteamento
│   ├── components/
│   │   ├── EnhancedBMRCalculator.jsx    # Calculadora GMB
│   │   ├── FullTimeSystem.jsx           # Sistema Full-time
│   │   ├── FoodSubstitution.jsx         # Substituição de Alimentos
│   │   └── ui/                          # Componentes UI (shadcn/ui)
│   └── assets/                   # Assets estáticos
├── package.json                  # Dependências Node.js
└── index.html                    # HTML principal
```

### 🚀 Como Executar

#### Backend
```bash
cd premium-features/backend
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```
Servidor rodará em: http://localhost:5000

#### Frontend
```bash
cd premium-features/frontend
pnpm install
pnpm run dev --host --port 3000
```
Aplicação rodará em: http://localhost:3000

### 🎯 Diferenciais Competitivos

1. **Algoritmo de GMB Aprimorado**: Único no mercado a considerar composição corporal, recursos ergogênicos e experiência de treino
2. **Sistema Full-time**: Reajuste automático inteligente baseado em atividades não planejadas
3. **Substituição Inteligente**: Cálculo automático de equivalências nutricionais com score de similaridade

### 🔧 Tecnologias Utilizadas

**Backend:**
- Flask + Python 3.11
- Flask-CORS para integração frontend
- Algoritmos proprietários de cálculo nutricional

**Frontend:**
- React 18 + Vite
- Tailwind CSS para styling
- shadcn/ui para componentes
- React Router para navegação
- Lucide React para ícones

### 📊 Status de Implementação

- ✅ **Algoritmo de GMB Aprimorado**: Completo e testado
- ✅ **Sistema Full-time**: Completo e testado  
- ✅ **Substituição Inteligente**: Completo e testado
- ✅ **Interface Premium**: Completa e responsiva
- ✅ **Integração Backend/Frontend**: Funcional
- ✅ **Testes Básicos**: Executados com sucesso

### 🎉 Resultado

O EvolveYou agora possui funcionalidades únicas que o diferenciam completamente da concorrência, oferecendo uma experiência premium baseada em algoritmos proprietários e inteligência artificial aplicada.

---

**Desenvolvido em:** 12 de Setembro de 2025  
**Status:** Pronto para produção  
**Versão:** Premium v1.0

