import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Componente para verificar se o usuário completou a anamnese
function ProtectedRoute({ children, requiresAnamnese = true }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se o usuário completou a anamnese
  if (requiresAnamnese) {
    const anamneseCompleta = localStorage.getItem('anamnese_completa');
    const dadosAnamnese = localStorage.getItem('dados_anamnese');
    
    // Se não há dados de anamnese ou não foi marcada como completa, redirecionar
    if (!anamneseCompleta || !dadosAnamnese) {
      return <Navigate to="/anamnese" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;

