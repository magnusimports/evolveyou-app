import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '@/config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import alimentosDB from '@/utils/alimentosDatabase';
import { gerarDietaPersonalizada } from '@/utils/dietaPersonalizada';

const PlanoAlimentarNovo = () => {
  const [planoAlimentar, setPlanoAlimentar] = useState(null);
  const [checkIns, setCheckIns] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPlanoAlimentar();
    loadCheckIns();
  }, []);

  const loadPlanoAlimentar = async () => {
    try {
      console.log('🍽️ Carregando plano alimentar personalizado...');
      
      const dadosAnamnese = localStorage.getItem('dados_anamnese');
      if (!dadosAnamnese) {
        console.log('❌ Dados da anamnese não encontrados');
        setError("Dados da anamnese não encontrados para gerar o plano alimentar.");
        setLoading(false);
        return;
      }

      const anamnese = JSON.parse(dadosAnamnese);
      console.log('📊 Dados da anamnese carregados para o novo plano:', anamnese);

      const planoPersonalizado = gerarDietaPersonalizada(anamnese);
      
      if (planoPersonalizado && planoPersonalizado.refeicoes) {
        console.log('✅ Novo plano alimentar personalizado gerado com sucesso');
        setPlanoAlimentar(planoPersonalizado);
      } else {
        console.log('⚠️ Falha na geração do novo plano personalizado');
        setError("Não foi possível gerar seu plano alimentar personalizado.");
      }
    } catch (error) {
      console.error('❌ Erro ao gerar novo plano alimentar:', error);
      setError("Ocorreu um erro inesperado ao gerar seu plano.");
    } finally {
      setLoading(false);
    }
  };

  const loadCheckIns = async () => {
    try {
      const checkInsData = localStorage.getItem('checkins_refeicoes');
      if (checkInsData) {
        setCheckIns(JSON.parse(checkInsData));
      }
    } catch (error) {
      console.error('Erro ao carregar check-ins:', error);
    }
  };

  const handleCheckIn = async (refeicaoNome) => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const checkInKey = `${hoje}_${refeicaoNome}`;
      
      const novosCheckIns = {
        ...checkIns,
        [checkInKey]: !checkIns[checkInKey]
      };
      
      setCheckIns(novosCheckIns);
      localStorage.setItem('checkins_refeicoes', JSON.stringify(novosCheckIns));
      
      console.log(`✅ Check-in ${checkIns[checkInKey] ? 'removido' : 'realizado'} para ${refeicaoNome}`);
    } catch (error) {
      console.error('Erro ao fazer check-in:', error);
    }
  };

  const isRefeicaoChecked = (refeicaoNome) => {
    const hoje = new Date().toISOString().split('T')[0];
    const checkInKey = `${hoje}_${refeicaoNome}`;
    return checkIns[checkInKey] || false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Gerando seu novo plano alimentar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!planoAlimentar) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p>Nenhum plano alimentar disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              {/* <Utensils className="w-6 h-6" /> */}
            </div>
            <div>
              <h1 className="text-xl font-bold">Plano Alimentar</h1>
              <p className="text-gray-300 text-sm">
                {planoAlimentar.informacoes.caloriasAlvo} kcal • {planoAlimentar.informacoes.numeroRefeicoes} refeições
              </p>
            </div>
          </div>
          <Link to="/configuracoes">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">C</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Informações do Plano */}
      <div className="p-4">
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Informações Nutricionais</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {planoAlimentar.informacoes.macronutrientes.proteina.gramas}g
              </div>
              <div className="text-sm text-gray-400">Proteína</div>
              <div className="text-xs text-gray-500">
                {planoAlimentar.informacoes.macronutrientes.proteina.percentual}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {planoAlimentar.informacoes.macronutrientes.carboidrato.gramas}g
              </div>
              <div className="text-sm text-gray-400">Carboidrato</div>
              <div className="text-xs text-gray-500">
                {planoAlimentar.informacoes.macronutrientes.carboidrato.percentual}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {planoAlimentar.informacoes.macronutrientes.gordura.gramas}g
              </div>
              <div className="text-sm text-gray-400">Gordura</div>
              <div className="text-xs text-gray-500">
                {planoAlimentar.informacoes.macronutrientes.gordura.percentual}%
              </div>
            </div>
          </div>

          {planoAlimentar.observacoes && (
            <div className="space-y-1">
              {planoAlimentar.observacoes.map((obs, index) => (
                <p key={index} className="text-sm text-gray-400">{obs}</p>
              ))}
            </div>
          )}
        </div>

        {/* Refeições */}
        <div className="space-y-4">
          {planoAlimentar.refeicoes.map((refeicao, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{refeicao.nome}</h3>
                    <p className="text-sm text-gray-400">
                      {refeicao.macros.calorias} kcal • {refeicao.percentualDia}% do dia
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCheckIn(refeicao.nome)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isRefeicaoChecked(refeicao.nome)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {/* <Check className="w-5 h-5" /> */}
                </button>
              </div>

              {/* Macros da refeição */}
              <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
                <div className="text-center">
                  <div className="text-white font-semibold">{Math.round(refeicao.macros.calorias)}</div>
                  <div className="text-gray-400">kcal</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-semibold">{Math.round(refeicao.macros.proteinas)}g</div>
                  <div className="text-gray-400">prot</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-semibold">{Math.round(refeicao.macros.carboidratos)}g</div>
                  <div className="text-gray-400">carb</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-400 font-semibold">{Math.round(refeicao.macros.gorduras)}g</div>
                  <div className="text-gray-400">gord</div>
                </div>
              </div>

              {/* Alimentos */}
              <div className="space-y-2">
                {refeicao.alimentos.map((alimento, alimentoIndex) => (
                  <div key={alimentoIndex} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{alimento.nome}</div>
                      <div className="text-xs text-gray-400">
                        {alimento.quantidade}{alimento.unidade}
                        {alimento.categoria && ` • ${alimento.categoria}`}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-white font-semibold">{alimento.calorias} kcal</div>
                      <div className="text-gray-400">
                        P: {Math.round(alimento.proteinas)}g | C: {Math.round(alimento.carboidratos)}g | G: {Math.round(alimento.gorduras)}g
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navegação inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
        <div className="flex justify-around py-2">
          <Link to="/dashboard" className="flex flex-col items-center py-2 px-4">
            {/* <Home className="w-6 h-6 text-gray-400" /> */}
            <span className="text-xs text-gray-400 mt-1">Hoje</span>
          </Link>
          <Link to="/dieta" className="flex flex-col items-center py-2 px-4">
            {/* <Utensils className="w-6 h-6 text-green-500" /> */}
            <span className="text-xs text-green-500 mt-1">Dieta</span>
          </Link>
          <Link to="/treino" className="flex flex-col items-center py-2 px-4">
            {/* <Dumbbell className="w-6 h-6 text-gray-400" /> */}
            <span className="text-xs text-gray-400 mt-1">Treino</span>
          </Link>
          <Link to="/plano" className="flex flex-col items-center py-2 px-4">
            {/* <Calendar className="w-6 h-6 text-gray-400" /> */}
            <span className="text-xs text-gray-400 mt-1">Plano</span>
          </Link>
          <Link to="/progresso" className="flex flex-col items-center py-2 px-4">
            {/* <TrendingUp className="w-6 h-6 text-gray-400" /> */}
            <span className="text-xs text-gray-400 mt-1">Progresso</span>
          </Link>
        </div>
      </div>

      {/* Espaçamento para navegação fixa */}
      <div className="h-20"></div>
    </div>
  );
};

export default PlanoAlimentarNovo;

