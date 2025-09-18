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
      if (!requiresAnamnese) {
        setAnamneseLoading(false);
        return;
      }

      try {
        console.log('🔍 Verificando anamnese...');
        
        // Verificar se há usuário no localStorage (bypass temporário)
        const userFromStorage = localStorage.getItem('user');
        if (userFromStorage) {
          const userData = JSON.parse(userFromStorage);
          console.log('👤 Usuário encontrado no localStorage:', userData.displayName);
          
          // Verificar anamnese no localStorage primeiro
          const anamneseCompleta = localStorage.getItem('anamnese_completa');
          const usuarioAnamnese = localStorage.getItem('usuario_anamnese');
          
          if (anamneseCompleta === 'true' && usuarioAnamnese === userData.uid) {
            console.log('✅ Anamnese encontrada no localStorage');
            setHasAnamnese(true);
            setAnamneseLoading(false);
            return;
          }

          // Verificar no Firebase
          console.log('🔍 Buscando anamnese no Firebase para:', userData.uid);
          const anamneseDoc = await getDoc(doc(db, 'anamneses', userData.uid));
          
          if (anamneseDoc.exists()) {
            const anamneseData = anamneseDoc.data();
            console.log('📊 Anamnese encontrada no Firebase:', {
              nome: anamneseData.nome,
              status: anamneseData.status,
              objetivo: anamneseData.objetivo
            });
            
            // Verificar se a anamnese está completa (mais flexível)
            const isCompleta = anamneseData.status === 'completa' || 
                              (anamneseData.nome && anamneseData.idade && anamneseData.peso && anamneseData.altura);
            
            if (isCompleta) {
              setHasAnamnese(true);
              
              // Salvar no localStorage para próximas verificações
              localStorage.setItem('anamnese_completa', 'true');
              localStorage.setItem('dados_anamnese', JSON.stringify(anamneseData));
              localStorage.setItem('usuario_anamnese', userData.uid);
              
              console.log('✅ Anamnese válida encontrada e salva no localStorage');
            } else {
              console.log('❌ Anamnese encontrada mas não está completa');
              setHasAnamnese(false);
            }
          } else {
            console.log('❌ Nenhuma anamnese encontrada no Firebase para:', userData.uid);
            setHasAnamnese(false);
          }
        } else {
          console.log('❌ Nenhum usuário encontrado no localStorage');
          setHasAnamnese(false);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar anamnese:', error);
        
        // Em caso de erro, verificar se há dados válidos no localStorage
        const anamneseCompleta = localStorage.getItem('anamnese_completa');
        const userFromStorage = localStorage.getItem('user');
        
        if (anamneseCompleta === 'true' && userFromStorage) {
          console.log('⚠️ Usando dados do localStorage devido ao erro');
          setHasAnamnese(true);
        } else {
          setHasAnamnese(false);
        }
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

  // Verificar se há usuário (localStorage ou useAuth)
  const userFromStorage = localStorage.getItem('user');
  const hasUser = user || userFromStorage;

  if (!hasUser) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se o usuário completou a anamnese
  if (requiresAnamnese && !hasAnamnese) {
    console.log('🔄 Redirecionando para anamnese - usuário não tem anamnese completa');
    return <Navigate to="/anamnese" replace />;
  }

  console.log('✅ Acesso liberado ao dashboard');
  return children;
}

export default ProtectedRoute;

