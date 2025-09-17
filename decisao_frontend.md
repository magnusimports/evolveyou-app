# Decisão: Frontend vs Web

## Análise das Pastas

### Pasta `frontend/`
- **Tecnologia:** Flutter (aplicativo móvel)
- **Descrição:** Projeto Flutter para desenvolvimento de aplicativo móvel
- **Status:** Contém código Dart e estrutura Flutter completa
- **Objetivo:** Aplicativo nativo para iOS e Android

### Pasta `web/`
- **Tecnologia:** React + Vite (aplicação web)
- **Descrição:** Aplicação web React completa e funcional
- **Status:** 100% funcional, já testada e rodando
- **Objetivo:** Versão web do EvolveYou

## Decisão

**USAR A PASTA `web/` COMO BASE PARA O DESENVOLVIMENTO**

### Justificativas:

1. **Objetivo do Projeto:** O foco atual é na versão web, não no aplicativo móvel
2. **Estado de Desenvolvimento:** A pasta `web/` está mais avançada e funcional
3. **Tecnologia Adequada:** React é a tecnologia correta para desenvolvimento web
4. **Funcionalidade:** A aplicação web já está rodando e testada
5. **Documentação:** O README da pasta `web/` indica projeto 100% completo

### Próximos Passos:

1. Focar todo desenvolvimento na pasta `web/`
2. Ignorar a pasta `frontend/` para este projeto (aplicativo móvel fica para futuro)
3. Continuar com configuração do backend Flask
4. Integrar a aplicação web React com o backend

