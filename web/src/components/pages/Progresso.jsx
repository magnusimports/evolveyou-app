import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Utensils, 
  Dumbbell, 
  Calendar, 
  TrendingUp,
  Scale,
  Target,
  Activity,
  Award,
  Plus,
  Edit3,
  Camera,
  BarChart3
} from 'lucide-react';

const Progresso = () => {
  const [dadosAnamnese, setDadosAnamnese] = useState(null);
  const [dadosProgresso, setDadosProgresso] = useState({
    pesagens: [],
    medidas: [],
    fotos: [],
    treinos: [],
    conquistas: []
  });
  const [modalPeso, setModalPeso] = useState(false);
  const [novoPeso, setNovoPeso] = useState('');

  useEffect(() => {
    carregarDadosAnamnese();
    carregarDadosProgresso();
  }, []);

  const carregarDadosAnamnese = () => {
    const dados = localStorage.getItem('dados_anamnese');
    if (dados) {
      setDadosAnamnese(JSON.parse(dados));
    }
  };

  const carregarDadosProgresso = () => {
    const progresso = localStorage.getItem('dados_progresso');
    if (progresso) {
      setDadosProgresso(JSON.parse(progresso));
    } else {
      // Inicializar com dados da anamnese se não houver progresso salvo
      const anamnese = JSON.parse(localStorage.getItem('dados_anamnese') || '{}');
      if (anamnese.peso) {
        const progressoInicial = {
          pesagens: [{
            data: new Date().toISOString().split('T')[0],
            peso: parseFloat(anamnese.peso),
            inicial: true
          }],
          medidas: [],
          fotos: [],
          treinos: [],
          conquistas: []
        };
        setDadosProgresso(progressoInicial);
        localStorage.setItem('dados_progresso', JSON.stringify(progressoInicial));
      }
    }
  };

  const adicionarPesagem = () => {
    if (!novoPeso || isNaN(novoPeso)) return;
    
    const novaPesagem = {
      data: new Date().toISOString().split('T')[0],
      peso: parseFloat(novoPeso),
      inicial: false
    };
    
    const novoProgresso = {
      ...dadosProgresso,
      pesagens: [...dadosProgresso.pesagens, novaPesagem]
    };
    
    setDadosProgresso(novoProgresso);
    localStorage.setItem('dados_progresso', JSON.stringify(novoProgresso));
    setModalPeso(false);
    setNovoPeso('');
    
    // Verificar conquistas
    verificarConquistas(novoProgresso);
  };

  const verificarConquistas = (progresso) => {
    const novasConquistas = [];
    const pesagens = progresso.pesagens;
    
    if (pesagens.length >= 2) {
      const pesoInicial = pesagens[0].peso;
      const pesoAtual = pesagens[pesagens.length - 1].peso;
      const diferenca = pesoInicial - pesoAtual;
      
      if (diferenca >= 1 && !progresso.conquistas.find(c => c.id === 'primeiro_kg')) {
        novasConquistas.push({
          id: 'primeiro_kg',
          titulo: 'Primeiro Quilograma',
          descricao: 'Perdeu o primeiro kg!',
          icon: '🎯',
          data: new Date().toISOString()
        });
      }
      
      if (diferenca >= 5 && !progresso.conquistas.find(c => c.id === 'cinco_kg')) {
        novasConquistas.push({
          id: 'cinco_kg',
          titulo: 'Guerreiro da Balança',
          descricao: 'Perdeu 5kg!',
          icon: '💪',
          data: new Date().toISOString()
        });
      }
    }
    
    if (novasConquistas.length > 0) {
      const progressoAtualizado = {
        ...progresso,
        conquistas: [...progresso.conquistas, ...novasConquistas]
      };
      setDadosProgresso(progressoAtualizado);
      localStorage.setItem('dados_progresso', JSON.stringify(progressoAtualizado));
    }
  };

  const calcularEstatisticas = () => {
    if (!dadosProgresso.pesagens.length) return null;
    
    const pesagens = dadosProgresso.pesagens.sort((a, b) => new Date(a.data) - new Date(b.data));
    const pesoInicial = pesagens[0].peso;
    const pesoAtual = pesagens[pesagens.length - 1].peso;
    const diferenca = pesoInicial - pesoAtual;
    const percentualProgresso = dadosAnamnese?.peso_meta ? 
      Math.min(100, Math.max(0, (diferenca / (pesoInicial - parseFloat(dadosAnamnese.peso_meta))) * 100)) : 0;
    
    // Calcular estatísticas de treino
    const progressoSemanal = JSON.parse(localStorage.getItem('progresso_semanal') || '{}');
    const treinosCompletos = Object.values(progressoSemanal).filter(Boolean).length;
    
    return {
      pesoInicial,
      pesoAtual,
      diferenca,
      percentualProgresso,
      treinosCompletos,
      diasAtivos: pesagens.length,
      metaPeso: dadosAnamnese?.peso_meta || pesoAtual - 5
    };
  };

  const gerarGraficoPeso = () => {
    if (!dadosProgresso.pesagens.length) return [];
    
    const pesagens = dadosProgresso.pesagens.sort((a, b) => new Date(a.data) - new Date(b.data));
    const maxPeso = Math.max(...pesagens.map(p => p.peso));
    const minPeso = Math.min(...pesagens.map(p => p.peso));
    const range = maxPeso - minPeso || 1;
    
    return pesagens.map((pesagem, index) => ({
      ...pesagem,
      x: (index / (pesagens.length - 1)) * 100,
      y: ((maxPeso - pesagem.peso) / range) * 80 + 10
    }));
  };

  const stats = calcularEstatisticas();
  const pontosGrafico = gerarGraficoPeso();

  if (!dadosAnamnese) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Carregando seu progresso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white pb-20">
      {/* Header */}
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-center">Progresso</h1>
          <p className="text-gray-400 text-center text-sm mt-1">
            {stats ? `${stats.diasAtivos} dias de jornada` : 'Acompanhe sua evolução'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Resumo Geral */}
        {stats && (
          <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <h2 className="font-semibold text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
              Resumo Geral
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Scale className="w-8 h-8 text-white" />
                </div>
                <p className="text-xs text-gray-400">Peso Atual</p>
                <p className="font-bold text-xl text-white">{stats.pesoAtual}kg</p>
                <p className={`text-xs ${stats.diferenca > 0 ? 'text-green-400' : stats.diferenca < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {stats.diferenca > 0 ? '-' : stats.diferenca < 0 ? '+' : ''}{Math.abs(stats.diferenca).toFixed(1)}kg
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <p className="text-xs text-gray-400">Meta</p>
                <p className="font-bold text-xl text-white">{stats.metaPeso}kg</p>
                <p className="text-xs text-blue-400">
                  {Math.abs(stats.pesoAtual - stats.metaPeso).toFixed(1)}kg restantes
                </p>
              </div>
            </div>
            
            {/* Barra de Progresso */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progresso da meta</span>
                <span className="text-white font-bold">{stats.percentualProgresso.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, stats.percentualProgresso)}%` }}
                ></div>
              </div>
            </div>
          </section>
        )}

        {/* Gráfico de Peso */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Evolução do Peso
            </h2>
            <button
              onClick={() => setModalPeso(true)}
              className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
          
          {pontosGrafico.length > 0 ? (
            <div className="h-40 bg-gray-700 rounded-lg relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Linha do gráfico */}
                <polyline
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  points={pontosGrafico.map(p => `${p.x},${p.y}`).join(' ')}
                />
                {/* Pontos */}
                {pontosGrafico.map((ponto, index) => (
                  <circle
                    key={index}
                    cx={ponto.x}
                    cy={ponto.y}
                    r="1.5"
                    fill="#10b981"
                    className="drop-shadow-lg"
                  />
                ))}
                {/* Gradiente */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          ) : (
            <div className="h-40 bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Scale className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Adicione sua primeira pesagem</p>
              </div>
            </div>
          )}
          
          {stats && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-400">Inicial</p>
                <p className="font-bold text-white">{stats.pesoInicial}kg</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Atual</p>
                <p className="font-bold text-white">{stats.pesoAtual}kg</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Meta</p>
                <p className="font-bold text-white">{stats.metaPeso}kg</p>
              </div>
            </div>
          )}
        </section>

        {/* Estatísticas */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-500" />
            Estatísticas
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Treinos Completos</p>
                  <p className="text-xs text-gray-400">Esta semana</p>
                </div>
              </div>
              <p className="text-white font-bold text-xl">{stats?.treinosCompletos || 0}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Dias Ativos</p>
                  <p className="text-xs text-gray-400">Total registrado</p>
                </div>
              </div>
              <p className="text-white font-bold text-xl">{stats?.diasAtivos || 0}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Objetivo</p>
                  <p className="text-xs text-gray-400">Principal</p>
                </div>
              </div>
              <p className="text-white font-bold text-sm">
                {dadosAnamnese.objetivo_principal?.split(' ')[0] || 'Definido'}
              </p>
            </div>
          </div>
        </section>

        {/* Conquistas */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            Conquistas
          </h2>
          {dadosProgresso.conquistas.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {dadosProgresso.conquistas.map((conquista, index) => (
                <div key={index} className="text-center p-3 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg border border-yellow-500">
                  <div className="text-2xl mb-2">{conquista.icon}</div>
                  <p className="text-xs font-medium text-white">{conquista.titulo}</p>
                  <p className="text-xs text-yellow-100">{conquista.descricao}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400">Suas conquistas aparecerão aqui</p>
              <p className="text-xs text-gray-500 mt-1">Continue progredindo para desbloquear!</p>
            </div>
          )}
        </section>

        {/* Próximas Metas */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-500" />
            Próximas Metas
          </h2>
          <div className="space-y-3">
            {stats && (
              <>
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Alcançar peso meta</p>
                    <p className="text-xs text-gray-400">{stats.metaPeso}kg</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">{stats.percentualProgresso.toFixed(0)}%</p>
                    <p className="text-xs text-gray-400">progresso</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Consistência semanal</p>
                    <p className="text-xs text-gray-400">Manter rotina de treinos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 font-bold">{Math.min(100, (stats.treinosCompletos / 4) * 100).toFixed(0)}%</p>
                    <p className="text-xs text-gray-400">desta semana</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Modal de Pesagem */}
      {modalPeso && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Nova Pesagem</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Peso atual (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={novoPeso}
                  onChange={(e) => setNovoPeso(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  placeholder="Ex: 75.5"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setModalPeso(false)}
                  className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={adicionarPesagem}
                  className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Navegação Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gray-800 border-t border-gray-700">
        <div className="flex justify-around">
          <Link to="/dashboard" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
            <Home className="w-6 h-6" />
            <span className="text-xs">Hoje</span>
          </Link>
          <Link to="/dieta" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
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
          <Link to="/progresso" className="flex flex-col items-center justify-center p-3 text-green-400 w-1/5">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs">Progresso</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Progresso;
