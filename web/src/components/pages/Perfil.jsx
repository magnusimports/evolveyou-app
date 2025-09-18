import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  ArrowLeft,
  UserCircle,
  Mail,
  Calendar,
  Ruler,
  Scale,
  Target,
  Activity,
  Edit3,
  Save,
  X
} from 'lucide-react';

const Perfil = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [anamnese, setAnamnese] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        // Carregar dados da anamnese
        const anamneseDoc = await getDoc(doc(db, 'anamneses', user.uid));
        if (anamneseDoc.exists()) {
          const anamneseData = anamneseDoc.data();
          setAnamnese(anamneseData);
          setEditData({
            nome: anamneseData.nome || '',
            idade: anamneseData.idade || '',
            altura: anamneseData.altura || '',
            peso: anamneseData.peso || '',
            peso_meta: anamneseData.peso_meta || '',
            objetivo: anamneseData.objetivo || ''
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleSave = async () => {
    // Aqui você implementaria a lógica para salvar as alterações
    console.log('Salvando alterações:', editData);
    setEditing(false);
    // TODO: Implementar salvamento no Firebase
  };

  const handleCancel = () => {
    setEditing(false);
    // Restaurar dados originais
    if (anamnese) {
      setEditData({
        nome: anamnese.nome || '',
        idade: anamnese.idade || '',
        altura: anamnese.altura || '',
        peso: anamnese.peso || '',
        peso_meta: anamnese.peso_meta || '',
        objetivo: anamnese.objetivo || ''
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <p className="text-gray-400">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="p-5 flex items-center justify-between sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Meu Perfil</h1>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
        >
          {editing ? <Save className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-8">
        {/* Avatar e Info Básica */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCircle className="w-12 h-12 text-white" />
          </div>
          {editing ? (
            <input
              type="text"
              value={editData.nome}
              onChange={(e) => setEditData({...editData, nome: e.target.value})}
              className="text-xl font-bold bg-gray-800 text-white px-3 py-2 rounded-lg text-center"
              placeholder="Nome completo"
            />
          ) : (
            <h2 className="text-xl font-bold text-white">{anamnese?.nome || 'Usuário'}</h2>
          )}
          <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
        </div>

        {/* Informações Pessoais */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700 mb-6">
          <h3 className="font-semibold text-white mb-4">Informações Pessoais</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-blue-400 mr-3" />
                <span className="text-gray-300">Email</span>
              </div>
              <span className="text-white">{user?.email}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-gray-300">Idade</span>
              </div>
              {editing ? (
                <input
                  type="number"
                  value={editData.idade}
                  onChange={(e) => setEditData({...editData, idade: e.target.value})}
                  className="bg-gray-700 text-white px-3 py-1 rounded w-20 text-right"
                  placeholder="Idade"
                />
              ) : (
                <span className="text-white">{anamnese?.idade} anos</span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Ruler className="w-5 h-5 text-purple-400 mr-3" />
                <span className="text-gray-300">Altura</span>
              </div>
              {editing ? (
                <input
                  type="number"
                  value={editData.altura}
                  onChange={(e) => setEditData({...editData, altura: e.target.value})}
                  className="bg-gray-700 text-white px-3 py-1 rounded w-20 text-right"
                  placeholder="cm"
                />
              ) : (
                <span className="text-white">{anamnese?.altura} cm</span>
              )}
            </div>
          </div>
        </section>

        {/* Dados Físicos */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700 mb-6">
          <h3 className="font-semibold text-white mb-4">Dados Físicos</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Scale className="w-5 h-5 text-yellow-400 mr-3" />
                <span className="text-gray-300">Peso Atual</span>
              </div>
              {editing ? (
                <input
                  type="number"
                  value={editData.peso}
                  onChange={(e) => setEditData({...editData, peso: e.target.value})}
                  className="bg-gray-700 text-white px-3 py-1 rounded w-20 text-right"
                  placeholder="kg"
                />
              ) : (
                <span className="text-white">{anamnese?.peso} kg</span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="w-5 h-5 text-red-400 mr-3" />
                <span className="text-gray-300">Peso Meta</span>
              </div>
              {editing ? (
                <input
                  type="number"
                  value={editData.peso_meta}
                  onChange={(e) => setEditData({...editData, peso_meta: e.target.value})}
                  className="bg-gray-700 text-white px-3 py-1 rounded w-20 text-right"
                  placeholder="kg"
                />
              ) : (
                <span className="text-white">{anamnese?.peso_meta} kg</span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-gray-300">IMC</span>
              </div>
              <span className="text-white">{anamnese?.imc}</span>
            </div>
          </div>
        </section>

        {/* Objetivo */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700 mb-6">
          <h3 className="font-semibold text-white mb-4">Objetivo</h3>
          {editing ? (
            <select
              value={editData.objetivo}
              onChange={(e) => setEditData({...editData, objetivo: e.target.value})}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
            >
              <option value="">Selecione um objetivo</option>
              <option value="Perder peso">Perder peso</option>
              <option value="Ganhar massa muscular">Ganhar massa muscular</option>
              <option value="Manter peso atual">Manter peso atual</option>
              <option value="Melhorar condicionamento físico">Melhorar condicionamento físico</option>
            </select>
          ) : (
            <p className="text-white">{anamnese?.objetivo}</p>
          )}
        </section>

        {/* Botões de Ação */}
        {editing && (
          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center"
            >
              <X className="w-5 h-5 mr-2" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center"
            >
              <Save className="w-5 h-5 mr-2" />
              Salvar
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Perfil;

