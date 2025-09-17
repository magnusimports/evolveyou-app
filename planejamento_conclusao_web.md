# 🚀 Planejamento para Conclusão da Versão Web - EvolveYou

## 🎯 Objetivo Principal

Finalizar o desenvolvimento da versão web do EvolveYou, garantindo que todas as funcionalidades essenciais estejam implementadas, testadas e prontas para o início dos testes com usuários reais. O foco será em completar as integrações de backend, finalizar a interface do usuário e garantir a estabilidade da plataforma.

---

## 📊 Análise do Estado Atual

Com base na análise do código-fonte, auditoria do Firebase e testes locais, a situação atual da versão web é a seguinte:

- **Frontend (Web):** A base está sólida, com React, Vite e Tailwind CSS. A estrutura de rotas e componentes principais (Login, Anamnese, Dashboards) está implementada. A autenticação com Firebase está integrada e funcional.
- **Backend (Functions):** As Cloud Functions para operações essenciais como `salvarAnamnese`, `getAnamnese`, e `chatCoachEvo` estão implantadas, mas precisam de testes de integração completos com a interface web.
- **Firebase:** A configuração geral está adequada (Auth, Firestore, Hosting), mas faltam otimizações de segurança (MFA) e rotinas de backup.
- **Funcionalidades Faltantes:** Embora a estrutura exista, muitas telas de funcionalidades avançadas (Nutrição, Treino, Coach) ainda são *placeholders* ou não estão totalmente conectadas ao backend.

---

## 📅 Cronograma de Implementação (Sprint de 2 Semanas)

Propõe-se um sprint focado de duas semanas para finalizar a versão web.

### **Semana 1: Integração Backend e Funcionalidades Essenciais**

**Foco:** Conectar o frontend existente às Cloud Functions e APIs do backend, dando vida às funcionalidades principais.

**Dia 1-2: Dashboard Principal e Métricas**
- **Tarefa:** Integrar o `DashboardPersonalizado.jsx` com as Cloud Functions para buscar e exibir dados reais do usuário (metas calóricas, macronutrientes, progresso).
- **Entregável:** Dashboard exibindo dados dinâmicos após a conclusão da anamnese.

**Dia 3-4: Módulo de Nutrição**
- **Tarefa:** Implementar a funcionalidade de registro de refeições (`MealRegistration.jsx`) e conectá-la à função `getAlimentos` e a uma função de salvar refeição (a ser criada ou validada).
- **Entregável:** Usuário consegue buscar alimentos, registrar uma refeição e ver seu balanço calórico ser atualizado no dashboard.

**Dia 5: Módulo de Treino**
- **Tarefa:** Conectar a tela `WorkoutManus.jsx` à função `getExercicios` para listar os treinos do dia. Implementar a lógica do `WorkoutPlayer` para simular a execução de um treino.
- **Entregável:** Usuário consegue visualizar seu treino do dia e iniciar o player de treino.

**Dia 6-7: Coach EVO (Chat)**
- **Tarefa:** Finalizar a integração do componente `CoachEVOManus.jsx` com a Cloud Function `chatCoachEvo`, permitindo uma conversa funcional com a IA.
- **Entregável:** Interface de chat 100% funcional, com histórico de conversas e respostas contextuais da IA.

---

### **Semana 2: Finalização, Testes e Refinamento**

**Foco:** Polir a experiência do usuário, corrigir bugs, realizar testes completos e preparar para o deploy.

**Dia 8-9: Testes de Integração e Correção de Bugs**
- **Tarefa:** Realizar testes completos em todo o fluxo do usuário: Cadastro -> Anamnese -> Dashboard -> Nutrição -> Treino -> Coach. Identificar e corrigir bugs de integração e de interface.
- **Entregável:** Lista de bugs corrigidos e um fluxo de usuário estável.

**Dia 10-11: Refinamento da Interface (UI/UX)**
- **Tarefa:** Revisar todas as telas para garantir consistência visual, responsividade e usabilidade. Adicionar feedbacks visuais (loaders, toasts, mensagens de erro/sucesso) em todas as interações assíncronas.
- **Entregável:** Experiência de usuário aprimorada e mais profissional.

**Dia 12: Otimizações de Segurança e Firebase**
- **Tarefa:** Implementar as recomendações da auditoria: configurar regras de segurança mais restritivas no Firestore e habilitar a autenticação multifator (MFA) como uma opção para os usuários.
- **Entregável:** Projeto Firebase com segurança reforçada.

**Dia 13-14: Build Final e Deploy para Testes**
- **Tarefa:** Gerar a build de produção da aplicação web (`pnpm run build`) e realizar o deploy em um ambiente de testes (pode ser um canal de preview do Firebase Hosting ou um novo site no Netlify).
- **Entregável:** URL da versão de testes para validação e início dos testes com usuários reais.

---

## ✅ Marcos de Entrega

1.  **Final da Semana 1:** Todas as funcionalidades essenciais (Dashboard, Nutrição, Treino, Coach) estão integradas com o backend e minimamente funcionais.
2.  **Final da Semana 2:** Aplicação web estável, segura, com interface refinada e implantada em um ambiente de testes, pronta para o feedback dos primeiros usuários.


