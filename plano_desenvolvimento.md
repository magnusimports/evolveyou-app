# Plano de Desenvolvimento para a Conclusão da Versão Web do EvolveYou

## 1. Visão Geral e Objetivos

O objetivo deste plano é delinear as etapas necessárias para finalizar a versão web do aplicativo EvolveYou, garantindo que todas as funcionalidades estejam implementadas, testadas e prontas para o lançamento. O foco principal será a integração do frontend com o backend e o Firebase, a alimentação dos bancos de dados e a implementação das lógicas de negócio que ainda não foram finalizadas.

## 2. Estratégia de Desenvolvimento

A estratégia será dividida em fases, começando pela resolução das ambiguidades no código, passando pela implementação das funcionalidades do backend e, por fim, a integração e testes completos da aplicação.

### Fase 1: Resolução de Incertezas e Preparação do Ambiente

**Objetivo:** Esclarecer a estrutura do projeto e preparar o ambiente de desenvolvimento para o trabalho.

**Tarefas:**

1.  **Análise e Decisão sobre as Pastas `frontend` e `web`:**
    *   **Descrição:** Existe uma duplicidade de projetos React (`frontend` e `web`). É crucial determinar qual deles é a versão mais recente e que deve ser utilizada como base para o desenvolvimento.
    *   **Ação:** Analisar o histórico de commits, a estrutura e o conteúdo de ambas as pastas para tomar uma decisão informada. A pasta `web` parece ser a mais completa, mas uma confirmação é necessária.

2.  **Configuração do Backend:**
    *   **Descrição:** O backend em Flask precisa ser configurado e executado localmente para permitir o desenvolvimento e teste das APIs.
    *   **Ação:** Criar um ambiente virtual, instalar as dependências do `requirements.txt` e garantir que o servidor Flask inicie sem erros.

### Fase 2: Alimentação dos Bancos de Dados

**Objetivo:** Popular os bancos de dados do Firebase com os dados necessários para o funcionamento do aplicativo.

**Tarefas:**

1.  **Banco de Dados de Alimentos (`evolveyou-foods`):**
    *   **Descrição:** O banco de dados de alimentos está vazio. É necessário encontrar e importar uma base de dados de alimentos, preferencialmente a Tabela Brasileira de Composição de Alimentos (TACO).
    *   **Ação:** Pesquisar por uma versão digital da tabela TACO, formatá-la (se necessário) e criar um script para importar os dados para o Firestore.

2.  **Banco de Dados de Exercícios (`exercicios`):**
    *   **Descrição:** O banco de dados de exercícios também está vazio. É preciso criar uma lista de exercícios com informações como nome, descrição, grupo muscular, etc.
    *   **Ação:** Definir uma estrutura para os dados de exercícios e criar um script para popular o banco de dados com uma lista inicial de exercícios.

### Fase 3: Desenvolvimento do Backend e Cloud Functions

**Objetivo:** Implementar a lógica de negócio no backend e criar as Cloud Functions necessárias.

**Tarefas:**

1.  **Desenvolvimento das APIs:**
    *   **Descrição:** As APIs do backend em Flask precisam ser finalizadas para suportar todas as funcionalidades do frontend.
    *   **Ação:** Implementar as rotas e a lógica para funcionalidades como registro de refeições, acompanhamento de treinos, chat com o Coach EVO, etc.

2.  **Criação das Cloud Functions:**
    *   **Descrição:** Nenhuma Cloud Function está implantada. É necessário criar funções para lidar com eventos do Firebase, como a criação de um novo usuário (para inicializar seus dados no Firestore, por exemplo).
    *   **Ação:** Desenvolver e implantar as Cloud Functions necessárias para a automação de tarefas e gatilhos do Firebase.

### Fase 4: Integração e Testes

**Objetivo:** Integrar o frontend com o backend e o Firebase, e realizar testes completos para garantir a qualidade e o bom funcionamento da aplicação.

**Tarefas:**

1.  **Integração Frontend-Backend:**
    *   **Descrição:** O frontend precisa ser conectado às APIs do backend para buscar e enviar dados.
    *   **Ação:** Substituir os dados mockados/demo por chamadas reais às APIs do backend.

2.  **Testes Funcionais:**
    *   **Descrição:** Testar todas as funcionalidades da aplicação de ponta a ponta para garantir que tudo está funcionando como esperado.
    *   **Ação:** Criar um plano de testes e executá-lo, cobrindo todos os fluxos de usuário.

3.  **Testes de Integração:**
    *   **Descrição:** Garantir que a comunicação entre o frontend, o backend e o Firebase está funcionando corretamente.
    *   **Ação:** Testar a criação de usuários, o login, o registro de dados e outras interações que envolvam múltiplos componentes da arquitetura.

## 3. Cronograma e Prioridades

O cronograma será definido após a Fase 1, quando a complexidade do trabalho estiver mais clara. As prioridades iniciais são:

1.  **Alta Prioridade:**
    *   Resolver a duplicidade das pastas `frontend` e `web`.
    *   Alimentar os bancos de dados de alimentos e exercícios.

2.  **Média Prioridade:**
    *   Desenvolver as APIs do backend.
    *   Criar as Cloud Functions essenciais.

3.  **Baixa Prioridade:**
    *   Implementar funcionalidades não essenciais.
    *   Otimizações de performance.

## 4. Recursos Necessários

- **Desenvolvedor Frontend:** Para trabalhar na integração do frontend com o backend.
- **Desenvolvedor Backend:** Para finalizar as APIs e criar as Cloud Functions.
- **Acesso ao Firebase:** Acesso de administrador ao projeto do Firebase para configurar bancos de dados e Cloud Functions.
- **Base de Dados de Alimentos:** Acesso à Tabela TACO ou outra base de dados de alimentos.

## 5. Riscos e Mitigação

- **Risco:** A base de dados TACO não estar disponível em um formato fácil de importar.
  - **Mitigação:** Pesquisar por outras bases de dados de alimentos ou considerar a criação de uma base de dados menor para a versão inicial.

- **Risco:** A complexidade da integração ser maior do que o esperado.
  - **Mitigação:** Dividir a integração em etapas menores e testar cada parte de forma isolada.

- **Risco:** A falta de documentação detalhada sobre as APIs existentes.
  - **Mitigação:** Analisar o código do backend para entender o funcionamento das APIs e documentá-las antes de iniciar a integração.




## 6. Prioridades e Cronograma

### Prioridades

1.  **Resolução da Duplicidade de Pastas (`frontend` vs. `web`):** Essencial para evitar trabalho duplicado e garantir que todos estejam trabalhando na versão correta do código.
2.  **Alimentação dos Bancos de Dados:** A aplicação não pode funcionar sem dados. A importação de alimentos e exercícios é um pré-requisito para o desenvolvimento e teste de várias funcionalidades.
3.  **Desenvolvimento do Backend e Cloud Functions:** A lógica de negócio principal reside no backend. A finalização das APIs e a criação das Cloud Functions são cruciais para a funcionalidade do aplicativo.
4.  **Integração Frontend-Backend:** Conectar a interface do usuário com a lógica de negócio é o que torna a aplicação funcional.
5.  **Testes e Lançamento:** Garantir a qualidade e a estabilidade da aplicação antes de disponibilizá-la para os usuários.

### Cronograma Estimado

| Fase                               | Duração Estimada |
| ---------------------------------- | ---------------- |
| **Fase 1: Resolução e Preparação** | 1-2 dias         |
| **Fase 2: Alimentação dos Dados**  | 3-5 dias         |
| **Fase 3: Desenvolvimento Backend**| 5-7 dias         |
| **Fase 4: Integração e Testes**    | 5-7 dias         |
| **Total Estimado**                 | **14-21 dias**   |





## 7. Estimativa de Recursos

Para a conclusão bem-sucedida do projeto, os seguintes recursos são recomendados:

- **Equipe de Desenvolvimento:**
    - **1 Desenvolvedor Frontend:** Focado na implementação da interface do usuário, integração com o backend e garantia de uma experiência de usuário fluida e responsiva.
    - **1 Desenvolvedor Backend:** Responsável por construir e manter a lógica do servidor, APIs, bancos de dados e integrações com serviços de terceiros.

- **Ferramentas e Serviços:**
    - **Firebase:** Manter o plano Blaze para garantir a escalabilidade dos serviços de backend, como Firestore e Cloud Functions.
    - **Google Cloud Platform:** Para hospedar o backend e utilizar serviços como o Gemini AI.
    - **Netlify:** Para a implantação e hospedagem contínua da aplicação web frontend.

- **Dados:**
    - **Acesso à Tabela TACO:** Obter uma versão licenciada e atualizada da Tabela Brasileira de Composição de Alimentos para garantir a precisão dos dados nutricionais.
    - **Conteúdo de Exercícios:** Contratar um profissional de educação física para criar ou validar uma lista de exercícios, garantindo que as informações sejam seguras e eficazes para os usuários.


