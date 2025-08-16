# 🚀 EvolveYou - Aplicativo de Fitness e Nutrição Personalizado

## 🎯 Visão Geral

**EvolveYou** é um aplicativo revolucionário de fitness e nutrição que oferece planos personalizados com sistema **Full-time** (rebalanceamento automático) e **Coach Virtual EVO** disponível 24/7.

### 🌟 Diferenciais Únicos

- **🤖 Coach Virtual EVO**: Avatar inteligente que guia, motiva e acompanha o usuário
- **⚡ Sistema Full-time**: Rebalanceamento automático quando há atividades extras
- **🧠 Anamnese Inteligente**: 22 perguntas para personalização máxima
- **📊 Algoritmo Metabólico Avançado**: Considera composição corporal, fármacos e experiência
- **🔄 Ciclos de 45 dias**: Renovação automática para evitar estagnação
- **🇧🇷 Base TACO**: 3000+ alimentos brasileiros oficiais

---

## 🏗️ Arquitetura

### Backend (Microserviços)
- **users-service**: Usuários, autenticação e anamnese
- **plans-service**: Geração de planos de dieta e treino
- **content-service**: Base TACO e exercícios
- **tracking-service**: Acompanhamento diário e logs
- **evo-service**: Coach Virtual EVO
- **gateway-service**: API Gateway e controle de acesso

### Frontend
- **Flutter**: Aplicativo multiplataforma
- **Arquitetura por Features**: Organização modular
- **Provider**: Gerenciamento de estado
- **Firebase Auth**: Autenticação

### Infraestrutura
- **Google Cloud Platform**: Cloud Run, Firestore
- **CI/CD**: GitHub Actions + Cloud Build
- **Monitoramento**: Dashboard React em tempo real

---

## 🚀 Quick Start

### Pré-requisitos
- Flutter 3.0+
- Python 3.9+
- Node.js 18+
- Docker
- Google Cloud CLI

### Backend
```bash
cd backend
docker-compose up -d
```

### Frontend
```bash
cd frontend
flutter pub get
flutter run
```

### Monitoramento
```bash
cd monitoring
npm install
npm run dev
```

---

## 📱 Funcionalidades

### ✅ Implementadas
- [x] Arquitetura de microserviços
- [x] Base TACO com 16 alimentos
- [x] Autenticação JWT + Firebase
- [x] Dashboard de monitoramento
- [x] Estrutura Flutter completa

### 🔄 Em Desenvolvimento
- [ ] Coach Virtual EVO
- [ ] Anamnese Inteligente (22 perguntas)
- [ ] Algoritmo Metabólico Avançado
- [ ] Sistema Full-time
- [ ] Dashboard "Hoje" funcional

### 📋 Planejadas
- [ ] Equivalência Nutricional
- [ ] Lista de Compras Inteligente
- [ ] Ciclos de 45 dias
- [ ] Funcionalidades Premium

---

## 📊 Status do Projeto

**Progresso Geral**: 65% (Base técnica sólida)

### Backend: 75%
- Plans-Service: 90%
- Users-Service: 85%
- Tracking-Service: 70%
- Content-Service: 40%
- EVO-Service: 0% (novo)
- Gateway-Service: 0% (novo)

### Frontend: 30%
- Estrutura: 100%
- Funcionalidades: 10%
- Integração: 0%

### Infraestrutura: 95%
- CI/CD: 100%
- Monitoramento: 100%
- Deploy: 100%

---

## 🗂️ Estrutura do Projeto

```
evolveyou-app/
├── backend/                 # Microserviços backend
│   ├── services/           # Serviços individuais
│   ├── shared/             # Código compartilhado
│   └── infrastructure/     # Terraform e configs
├── frontend/               # Aplicativo Flutter
│   ├── lib/               # Código fonte
│   ├── assets/            # Recursos visuais
│   └── test/              # Testes
├── docs/                   # Documentação
├── tools/                  # Scripts e ferramentas
└── monitoring/             # Dashboard de monitoramento
```

---

## 🛠️ Desenvolvimento

### Padrões de Commit
```
feat: adicionar funcionalidade X
fix: corrigir bug Y
docs: atualizar documentação Z
refactor: refatorar código W
test: adicionar testes para V
```

### Branches
- `main` - Produção
- `develop` - Desenvolvimento
- `feature/nome` - Features
- `hotfix/nome` - Correções

### Testes
```bash
# Backend
cd backend && python -m pytest

# Frontend
cd frontend && flutter test

# E2E
cd tools && npm run test:e2e
```

---

## 📈 Roadmap

### Semana 1 (Dias 1-7)
- [x] Reorganização dos repositórios
- [ ] Coach Virtual EVO
- [ ] Anamnese Inteligente

### Semana 2 (Dias 8-14)
- [ ] Algoritmo Metabólico Avançado
- [ ] Dashboard "Hoje" funcional
- [ ] Sistema Full-time

### Semana 3 (Dias 15-21)
- [ ] Funcionalidades de Dieta
- [ ] Funcionalidades de Treino
- [ ] API Gateway

### Semana 4 (Dias 22-28)
- [ ] Integrações Frontend-Backend
- [ ] Equivalência Nutricional
- [ ] Lista de Compras

### Semana 5 (Dias 29-35)
- [ ] Ciclos de 45 dias
- [ ] Funcionalidades Premium
- [ ] Testes e Deploy Final

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📞 Contato

**EvolveYou Team**
- Email: dev@evolveyou.com.br
- Website: https://evolveyou.com.br

---

## 🙏 Agradecimentos

- **TACO (Tabela Brasileira de Composição de Alimentos)** - Dados nutricionais oficiais
- **Google Cloud Platform** - Infraestrutura robusta
- **Flutter Team** - Framework multiplataforma excepcional

---

**Transforme sua vida com o EvolveYou - Sua melhor versão está a um clique de distância! 🚀**

