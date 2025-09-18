import React from 'react';

// BYPASS TEMPORÁRIO PARA TESTE DA BASE DE EXERCÍCIOS
function ProtectedRoute({ children, requiresAnamnese = true }) {
  console.log('🔓 Bypass ativo - permitindo acesso direto para teste da base de exercícios');
  return children;
}

export default ProtectedRoute;

