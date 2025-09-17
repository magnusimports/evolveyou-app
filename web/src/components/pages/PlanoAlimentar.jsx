import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/config/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { 
  NotebookText, 
  Check, 
  Home, 
  Utensils, 
  Dumbbell, 
  Calendar, 
  TrendingUp,
  Clock,
  Plus,
  Minus
} from 'lucide-react';

const PlanoAlimentar = () => {
  const { user } = useAuth();
  const [planoAlimentar, setPlanoAlimentar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedMeals, setCheckedMeals] = useState({});

  useEffect(() => {
    if (user) {
      loadPlanoAlimentar();
    }
  }, [user]);

  const loadPlanoAlimentar = async () => {
    try {
      setLoading(true);
      
      // Buscar plano alimentar via Cloud Function
      const response = await fetch(`https://us-central1-evolveyou-prod.cloudfunctions.net/getPlanoAlimentar?userId=${user.uid}`);
      const data = await response.json();
      
      if (data.success) {
        setPlanoAlimentar(data.plano);
        
        // Carregar check-ins existentes
        await loadCheckIns(data.plano.dataPlano);
      } else {
        console.error('Erro ao carregar plano:', data.error);
        setPlanoAlimentar(getExamplePlanoAlimentar());
      }
    } catch (error) {
      console.error('Erro ao carregar plano alimentar:', error);
      setPlanoAlimentar(getExamplePlanoAlimentar());
    } finally {
      setLoading(false);
    }
  };

  const loadCheckIns = async (dataPlano) => {
    try {
      const checkinsSnapshot = await getDocs(
        query(
          collection(db, 'checkinsRefeicoes'),
          where('userId', '==', user.uid),
          where('dataPlano', '==', dataPlano)
        )
      );
      
      const checkinsData = {};
      checkinsSnapshot.forEach(doc => {
        const data = doc.data();
        checkinsData[data.refeicaoId] = data.consumido;
      });
      
      setCheckedMeals(checkinsData);
    } catch (error) {
      console.error('Erro ao carregar check-ins:', error);
    }
  };

  const generatePlanoAlimentar = (anamnese) => {
    // Calcular calorias baseado na anamnese
    const { peso, altura, idade, sexo, objetivo } = anamnese;
    
    let tmb;
    if (sexo === 'masculino') {
      tmb = (10 * peso) + (6.25 * altura) - (5 * idade) + 5;
    } else {
      tmb = (10 * peso) + (6.25 * altura) - (5 * idade) - 161;
    }
    
    const tdee = tmb * 1.55; // Atividade moderada
    let caloriasAlvo = tdee;
    
    if (objetivo === 'perder_peso') {
      caloriasAlvo = tdee - 500;
    } else if (objetivo === 'ganhar_peso') {
      caloriasAlvo = tdee + 300;
    }

    // Distribuir calorias nas refeições
    const cafeDaManha = Math.round(caloriasAlvo * 0.25);
    const lanche1 = Math.round(caloriasAlvo * 0.10);
    const almoco = Math.round(caloriasAlvo * 0.35);
    const lanche2 = Math.round(caloriasAlvo * 0.10);
    const jantar = Math.round(caloriasAlvo * 0.20);

    return {
      totalCalorias: Math.round(caloriasAlvo),
      refeicoes: [
        {
          id: 'cafe',
          nome: 'Café da Manhã',
          horario: '08:00',
          calorias: cafeDaManha,
          alimentos: [
            { nome: 'Aveia com banana', quantidade: '1 tigela', calorias: Math.round(cafeDaManha * 0.4) },
            { nome: 'Ovos mexidos', quantidade: '2 unidades', calorias: Math.round(cafeDaManha * 0.35) },
            { nome: 'Suco de laranja', quantidade: '200ml', calorias: Math.round(cafeDaManha * 0.25) }
          ]
        },
        {
          id: 'lanche1',
          nome: 'Lanche da Manhã',
          horario: '10:30',
          calorias: lanche1,
          alimentos: [
            { nome: 'Iogurte grego', quantidade: '1 pote', calorias: Math.round(lanche1 * 0.6) },
            { nome: 'Castanhas', quantidade: '10g', calorias: Math.round(lanche1 * 0.4) }
          ]
        },
        {
          id: 'almoco',
          nome: 'Almoço',
          horario: '12:30',
          calorias: almoco,
          alimentos: [
            { nome: 'Peito de frango grelhado', quantidade: '150g', calorias: Math.round(almoco * 0.4) },
            { nome: 'Arroz integral', quantidade: '100g', calorias: Math.round(almoco * 0.3) },
            { nome: 'Brócolis refogado', quantidade: '100g', calorias: Math.round(almoco * 0.15) },
            { nome: 'Salada verde', quantidade: '1 prato', calorias: Math.round(almoco * 0.15) }
          ]
        },
        {
          id: 'lanche2',
          nome: 'Lanche da Tarde',
          horario: '15:30',
          calorias: lanche2,
          alimentos: [
            { nome: 'Whey protein', quantidade: '1 scoop', calorias: Math.round(lanche2 * 0.7) },
            { nome: 'Banana', quantidade: '1 unidade', calorias: Math.round(lanche2 * 0.3) }
          ]
        },
        {
          id: 'jantar',
          nome: 'Jantar',
          horario: '19:00',
          calorias: jantar,
          alimentos: [
            { nome: 'Salmão grelhado', quantidade: '120g', calorias: Math.round(jantar * 0.5) },
            { nome: 'Batata doce', quantidade: '100g', calorias: Math.round(jantar * 0.3) },
            { nome: 'Aspargos', quantidade: '100g', calorias: Math.round(jantar * 0.2) }
          ]
        }
      ]
    };
  };

  const getExamplePlanoAlimentar = () => {
    return {
      totalCalorias: 2500,
      refeicoes: [
        {
          id: 'cafe',
          nome: 'Café da Manhã',
          horario: '08:00',
          calorias: 625,
          alimentos: [
            { nome: 'Aveia com banana', quantidade: '1 tigela', calorias: 250 },
            { nome: 'Ovos mexidos', quantidade: '2 unidades', calorias: 220 },
            { nome: 'Suco de laranja', quantidade: '200ml', calorias: 155 }
          ]
        },
        {
          id: 'lanche1',
          nome: 'Lanche da Manhã',
          horario: '10:30',
          calorias: 250,
          alimentos: [
            { nome: 'Iogurte grego', quantidade: '1 pote', calorias: 150 },
            { nome: 'Castanhas', quantidade: '10g', calorias: 100 }
          ]
        },
        {
          id: 'almoco',
          nome: 'Almoço',
          horario: '12:30',
          calorias: 875,
          alimentos: [
            { nome: 'Peito de frango grelhado', quantidade: '150g', calorias: 350 },
            { nome: 'Arroz integral', quantidade: '100g', calorias: 262 },
            { nome: 'Brócolis refogado', quantidade: '100g', calorias: 131 },
            { nome: 'Salada verde', quantidade: '1 prato', calorias: 132 }
          ]
        },
        {
          id: 'lanche2',
          nome: 'Lanche da Tarde',
          horario: '15:30',
          calorias: 250,
          alimentos: [
            { nome: 'Whey protein', quantidade: '1 scoop', calorias: 175 },
            { nome: 'Banana', quantidade: '1 unidade', calorias: 75 }
          ]
        },
        {
          id: 'jantar',
          nome: 'Jantar',
          horario: '19:00',
          calorias: 500,
          alimentos: [
            { nome: 'Salmão grelhado', quantidade: '120g', calorias: 250 },
            { nome: 'Batata doce', quantidade: '100g', calorias: 150 },
            { nome: 'Aspargos', quantidade: '100g', calorias: 100 }
          ]
        }
      ]
    };
  };

  const handleCheckIn = async (refeicaoId) => {
    try {
      const novoStatus = !checkedMeals[refeicaoId];
      
      // Atualizar estado local imediatamente
      setCheckedMeals(prev => ({
        ...prev,
        [refeicaoId]: novoStatus
      }));

      // Registrar check-in via Cloud Function
      const response = await fetch('https://us-central1-evolveyou-prod.cloudfunctions.net/registrarCheckinRefeicao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          refeicaoId,
          dataPlano: planoAlimentar?.dataPlano || new Date().toISOString().split('T')[0],
          consumido: novoStatus
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        // Reverter estado local se houve erro
        setCheckedMeals(prev => ({
          ...prev,
          [refeicaoId]: !novoStatus
        }));
        console.error('Erro ao registrar check-in:', data.error);
      }
    } catch (error) {
      // Reverter estado local se houve erro
      setCheckedMeals(prev => ({
        ...prev,
        [refeicaoId]: !checkedMeals[refeicaoId]
      }));
      console.error('Erro ao registrar check-in:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md lg:max-w-4xl mx-auto min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <p className="text-gray-400">Carregando plano alimentar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md lg:max-w-4xl mx-auto min-h-screen bg-gray-900 flex flex-col pb-24 text-gray-200">
      
      {/* Cabeçalho */}
      <header className="p-5 flex justify-between items-center sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
        <div>
          <p className="text-sm text-gray-400">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </p>
          <h1 className="text-xl lg:text-2xl font-bold text-white">Plano Alimentar</h1>
        </div>
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {(user?.displayName || 'U').charAt(0).toUpperCase()}
          </span>
        </div>
      </header>

      {/* Resumo do Dia - Desktop */}
      <div className="hidden lg:block px-5 mb-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="grid grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">{planoAlimentar?.totalCalorias}</p>
              <p className="text-sm text-gray-400">Calorias Totais</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{planoAlimentar?.refeicoes?.length || 0}</p>
              <p className="text-sm text-gray-400">Refeições</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">
                {Object.values(checkedMeals).filter(Boolean).length}
              </p>
              <p className="text-sm text-gray-400">Concluídas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">
                {Math.round((Object.values(checkedMeals).filter(Boolean).length / (planoAlimentar?.refeicoes?.length || 1)) * 100)}%
              </p>
              <p className="text-sm text-gray-400">Progresso</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-grow px-4 lg:px-5 space-y-4">
        
        {/* Grid Responsivo para Desktop */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 space-y-4">
          
          {planoAlimentar?.refeicoes?.map((refeicao) => (
            <section key={refeicao.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="font-semibold text-lg text-white">{refeicao.nome}</h2>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{refeicao.horario}</span>
                    <span>•</span>
                    <span>{refeicao.calorias} kcal</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    title="Tabela Nutricional" 
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
                  >
                    <NotebookText className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleCheckIn(refeicao.id)}
                    className={`font-bold py-2 px-4 rounded-full text-xs flex items-center transition-all ${
                      checkedMeals[refeicao.id] 
                        ? 'bg-green-600 text-white' 
                        : 'bg-green-400 text-gray-900 hover:bg-green-500'
                    }`}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {checkedMeals[refeicao.id] ? 'Concluído' : 'Check-in'}
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {refeicao.alimentos.map((alimento, index) => (
                  <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-900/50 rounded-lg">
                    <div className="flex-grow">
                      <p className="text-white font-medium text-sm lg:text-base">{alimento.nome}</p>
                      <p className="text-gray-400 text-xs">{alimento.quantidade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold text-sm">{alimento.calorias} kcal</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botões de Ação - Mobile */}
              <div className="lg:hidden mt-4 pt-4 border-t border-gray-700">
                <div className="flex space-x-3">
                  <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Substituir
                  </button>
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                    <NotebookText className="w-4 h-4 mr-2" />
                    Detalhes
                  </button>
                </div>
              </div>

              {/* Botões de Ação - Desktop */}
              <div className="hidden lg:flex mt-4 pt-4 border-t border-gray-700 space-x-3">
                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Substituir Alimento
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center justify-center transition-colors">
                  <NotebookText className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </button>
              </div>
            </section>
          ))}
        </div>

        {/* Resumo Final - Mobile */}
        <div className="lg:hidden bg-gray-800 rounded-xl p-5 border border-gray-700 mt-6">
          <h3 className="font-semibold text-white mb-3">Resumo do Dia</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-green-400">{planoAlimentar?.totalCalorias}</p>
              <p className="text-xs text-gray-400">Calorias Totais</p>
            </div>
            <div>
              <p className="text-xl font-bold text-purple-400">
                {Math.round((Object.values(checkedMeals).filter(Boolean).length / (planoAlimentar?.refeicoes?.length || 1)) * 100)}%
              </p>
              <p className="text-xs text-gray-400">Progresso</p>
            </div>
          </div>
        </div>
      </main>

      {/* Barra de Navegação Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md lg:max-w-4xl mx-auto bg-gray-800 border-t border-gray-700">
        <div className="flex justify-around">
          <Link to="/dashboard" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
            <Home className="w-6 h-6" />
            <span className="text-xs">Hoje</span>
          </Link>
          <Link to="/dieta" className="flex flex-col items-center justify-center p-3 text-green-400 w-1/5">
            <Utensils className="w-6 h-6" />
            <span className="text-xs">Dieta</span>
          </Link>
          <Link to="/treino" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
            <Dumbbell className="w-6 h-6" />
            <span className="text-xs">Treino</span>
          </Link>
          <Link to="/plano" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Plano</span>
          </Link>
          <Link to="/progresso" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs">Progresso</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default PlanoAlimentar;

