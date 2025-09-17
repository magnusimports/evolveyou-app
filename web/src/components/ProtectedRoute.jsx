import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Componente para verificar se o usuário completou a anamnese
function ProtectedRoute({ children, requiresAnamnese = true }) {
  const { user, loading } = useAuth();
  const [anamneseLoading, setAnamneseLoading] = useState(true);
  const [hasAnamnese, setHasAnamnese] = useState(false);

  useEffect(() => {
    const checkAnamnese = async () => {
      if (!user || !requiresAnamnese) {
        setAnamneseLoading(false);
        return;
      }

      try {
        // Primeiro verificar localStorage (para usuários que acabaram de completar)
        const anamneseCompleta = localStorage.getItem('anamnese_completa');
        const dadosAnamnese = localStorage.getItem('dados_anamnese');
        const usuarioAnamnese = localStorage.getItem('usuario_anamnese');
        
        // Verificar se os dados do localStorage são do usuário atual
        if (anamneseCompleta && dadosAnamnese && usuarioAnamnese === user.uid) {
          setHasAnamnese(true);
          setAnamneseLoading(false);
          return;
        }

        // Se não há no localStorage ou é de outro usuário, verificar no Firebase
        console.log('Verificando anamnese no Firebase para usuário:', user.uid);
        const anamneseDoc = await getDoc(doc(db, 'anamneses', user.uid));
        
        if (anamneseDoc.exists()) {
          const anamneseData = anamneseDoc.data();
          console.log('Anamnese encontrada no Firebase:', anamneseData.status);
          
          // Verificar se a anamnese está completa
          if (anamneseData.status === 'completa') {
            setHasAnamnese(true);
            
            // Salvar no localStorage para próximas verificações
            localStorage.setItem('anamnese_completa', 'true');
            localStorage.setItem('dados_anamnese', JSON.stringify(anamneseData));
            localStorage.setItem('usuario_anamnese', user.uid);
            
            console.log('✅ Anamnese válida encontrada e salva no localStorage');
          } else {
            console.log('❌ Anamnese encontrada mas não está completa');
            setHasAnamnese(false);
          }
        } else {
          console.log('❌ Nenhuma anamnese encontrada no Firebase');
          setHasAnamnese(false);
          
          // Limpar localStorage se não há anamnese no Firebase
          localStorage.removeItem('anamnese_completa');
          localStorage.removeItem('dados_anamnese');
          localStorage.removeItem('usuario_anamnese');
        }
      } catch (error) {
        console.error('Erro ao verificar anamnese:', error);
        setHasAnamnese(false);
        
        // Limpar localStorage em caso de erro
        localStorage.removeItem('anamnese_completa');
        localStorage.removeItem('dados_anamnese');
        localStorage.removeItem('usuario_anamnese');
      } finally {
        setAnamneseLoading(false);
      }
    };

    checkAnamnese();
  }, [user, requiresAnamnese]);

  if (loading || anamneseLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <p className="text-gray-600">
            {loading ? 'Carregando...' : 'Verificando anamnese...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se o usuário completou a anamnese
  if (requiresAnamnese && !hasAnamnese) {
    console.log('🔄 Redirecionando para anamnese - usuário não tem anamnese completa');
    return <Navigate to="/anamnese" replace />;
  }

  return children;
}

export default ProtectedRoute;

