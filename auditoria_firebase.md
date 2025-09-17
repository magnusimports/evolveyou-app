# Auditoria do Firebase Console - EvolveYou

## Autenticação

- **Provedores de Login:**
    - E-mail/Senha: Ativado
    - Google: Ativado
    - Apple: Ativado
- **Usuários:**
    - Existe 1 usuário de teste cadastrado.
- **Autenticação Multifator por SMS:**
    - Desativada.

## Firestore

- **Bancos de Dados:**
    - `(default)`: Localizado em `southamerica-east1`.
    - `evolveyou-db`: Localizado em `nam5`.
    - `evolveyou-foods`: Localizado em `nam5`.
    - `exercicios`: Localizado em `southamerica-east1`.
- **Backups:**
    - Nenhum backup programado está configurado para os bancos de dados.

## Cloud Functions

- **Funções Ativas:**
    - `chatCoachEvo`: Gatilho de solicitação HTTP, v2, `us-central1`.
    - `salvarAnamnese`: Gatilho de solicitação HTTP, v2, `us-central1`.
    - `getAlimentos`: Gatilho de solicitação HTTP, v2, `us-central1`.
    - `gerarPlanoNutricional`: Gatilho de solicitação HTTP, v2, `us-central1`.
    - `getAnamnese`: Gatilho de solicitação HTTP, v2, `us-central1`.
    - `gerarPlanoTreino`: Gatilho de solicitação HTTP, v2, `us-central1`.
    - `getExercicios`: Gatilho de solicitação HTTP, v2, `us-central1`.
- **Versão:**
    - Todas as funções estão na versão 2.

## Hosting

- **Domínio Principal:**
    - `evolveyou-prod.web.app`
- **Deploy:**
    - O último deploy foi realizado em 22 de agosto de 2025.
- **Canais de Visualização:**
    - Nenhum canal de visualização está configurado.

## Recomendações

- **Segurança:**
    - Ativar a autenticação multifator por SMS para aumentar a segurança das contas dos usuários.
- **Backup:**
    - Configurar backups programados para os bancos de dados do Firestore para evitar perda de dados.
- **Monitoramento:**
    - Configurar alertas de monitoramento para as Cloud Functions para identificar e resolver problemas rapidamente.
- **Desenvolvimento:**
    - Utilizar os canais de visualização do Firebase Hosting para testar novas funcionalidades antes de implantá-las em produção.

