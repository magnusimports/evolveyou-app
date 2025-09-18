import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Utensils, 
  Dumbbell, 
  Calendar, 
  TrendingUp,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Bug,
  Shield,
  Zap
} from 'lucide-react';
import TestSuite, { executarTestes } from '../../utils/testSuite';

const TestesAutomatizados = () => {
  const [executando, setExecutando] = useState(false);
  const [relatorio, setRelatorio] = useState(null);
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = () => {
    const historicoSalvo = localStorage.getItem('historico_testes_evolveyou');
    if (historicoSalvo) {
      setHistorico(JSON.parse(historicoSalvo));
    }
    
    const ultimoRelatorio = localStorage.getItem('relatorio_testes_evolveyou');
    if (ultimoRelatorio) {
      setRelatorio(JSON.parse(ultimoRelatorio));
    }
  };

  const executarSuiteTestes = async () => {
    setExecutando(true);
    
    try {
      const novoRelatorio = await executarTestes();
      setRelatorio(novoRelatorio);
      
      // Adicionar ao histórico
      const novoHistorico = [novoRelatorio, ...historico.slice(0, 9)]; // Manter apenas os últimos 10
      setHistorico(novoHistorico);
      localStorage.setItem('historico_testes_evolveyou', JSON.stringify(novoHistorico));
      
    } catch (error) {
      console.error('Erro ao executar testes:', error);
    } finally {
      setExecutando(false);
    }
  };

  const baixarRelatorio = () => {
    if (!relatorio) return;
    
    const dadosRelatorio = JSON.stringify(relatorio, null, 2);
    const blob = new Blob([dadosRelatorio], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_testes_evolveyou_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const obterIconeStatus = (status) => {
    switch (status) {
      case 'PASSOU':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'FALHOU':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'ERRO':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bug className="w-5 h-5 text-gray-400" />;
    }
  };

  const obterCorStatus = (status) => {
    switch (status) {
      case 'SUCESSO':
        return 'text-green-400';
      case 'FALHAS_DETECTADAS':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white pb-20">
      {/* Header */}
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-center flex items-center justify-center">
            <Shield className="w-6 h-6 mr-2 text-blue-500" />
            Testes Automatizados
          </h1>
          <p className="text-gray-400 text-center text-sm mt-1">
            Validação completa do sistema EvolveYou
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Controles */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              Executar Testes
            </h2>
            {relatorio && (
              <button
                onClick={baixarRelatorio}
                className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
          
          <button
            onClick={executarSuiteTestes}
            disabled={executando}
            className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
              executando 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {executando ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Executando Testes...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Executar Suite Completa
              </>
            )}
          </button>
          
          {executando && (
            <div className="mt-3 text-center">
              <p className="text-gray-400 text-sm">
                Testando funcionalidades principais...
              </p>
            </div>
          )}
        </section>

        {/* Último Relatório */}
        {relatorio && (
          <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <h2 className="font-semibold text-white mb-4 flex items-center">
              <Bug className="w-5 h-5 mr-2 text-purple-500" />
              Último Relatório
            </h2>
            
            <div className="space-y-4">
              {/* Resumo */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{relatorio.testesPassaram}</p>
                    <p className="text-xs text-green-400">Passaram</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{relatorio.totalTestes - relatorio.testesPassaram}</p>
                    <p className="text-xs text-red-400">Falharam</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className={`text-lg font-bold ${obterCorStatus(relatorio.status)}`}>
                    {relatorio.taxaSucesso.toFixed(1)}% de Sucesso
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(relatorio.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Detalhes dos Testes */}
              <div className="space-y-2">
                <h3 className="font-medium text-white">Detalhes dos Testes</h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {relatorio.resultados.map((resultado, index) => (
                    <div key={index} className={`flex items-center p-3 rounded-lg ${
                      resultado.status === 'PASSOU' ? 'bg-green-900 border border-green-500' :
                      resultado.status === 'FALHOU' ? 'bg-red-900 border border-red-500' :
                      'bg-yellow-900 border border-yellow-500'
                    }`}>
                      {obterIconeStatus(resultado.status)}
                      <div className="ml-3 flex-1">
                        <p className="text-white text-sm font-medium">{resultado.nome}</p>
                        {resultado.erro && (
                          <p className="text-xs text-gray-300 mt-1">{resultado.erro}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Histórico */}
        {historico.length > 0 && (
          <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <h2 className="font-semibold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              Histórico de Testes
            </h2>
            
            <div className="space-y-3">
              {historico.slice(0, 5).map((relatorioHistorico, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">
                      {relatorioHistorico.taxaSucesso.toFixed(1)}% de Sucesso
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(relatorioHistorico.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${obterCorStatus(relatorioHistorico.status)}`}>
                      {relatorioHistorico.testesPassaram}/{relatorioHistorico.totalTestes}
                    </p>
                    <p className="text-xs text-gray-400">testes</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Informações dos Testes */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4">O que é testado?</h2>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start">
              <Utensils className="w-4 h-4 mr-2 mt-0.5 text-green-400" />
              <div>
                <p className="font-medium text-white">Banco de Dados de Alimentos</p>
                <p>Validação da base TACO com 597 alimentos brasileiros</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Dumbbell className="w-4 h-4 mr-2 mt-0.5 text-blue-400" />
              <div>
                <p className="font-medium text-white">Banco de Dados de Exercícios</p>
                <p>Verificação de 1.023 exercícios com GIFs e instruções</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <TrendingUp className="w-4 h-4 mr-2 mt-0.5 text-purple-400" />
              <div>
                <p className="font-medium text-white">Algoritmos Compensatórios</p>
                <p>Testes dos cálculos de TMB, TDEE e macronutrientes</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Shield className="w-4 h-4 mr-2 mt-0.5 text-yellow-400" />
              <div>
                <p className="font-medium text-white">Validação de Dados</p>
                <p>Verificação da anamnese e armazenamento local</p>
              </div>
            </div>
          </div>
        </section>
      </main>

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
          <Link to="/progresso" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs">Progresso</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default TestesAutomatizados;
