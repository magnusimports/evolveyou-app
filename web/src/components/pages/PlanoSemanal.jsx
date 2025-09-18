import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Utensils, 
  Dumbbell, 
  Calendar, 
  TrendingUp,
  Clock,
  Target,
  CheckCircle,
  Play,
  RotateCcw,
  Award
} from 'lucide-react';

const PlanoSemanal = () => {
  const [dadosAnamnese, setDadosAnamnese] = useState(null);
  const [progressoSemanal, setProgressoSemanal] = useState({});
  const [planoSemanal, setPlanoSemanal] = useState([]);

  useEffect(() => {
    carregarDadosAnamnese();
    carregarProgressoSemanal();
  }, []);

  const carregarDadosAnamnese = () => {
    const dados = localStorage.getItem('dados_anamnese');
    if (dados) {
      const anamnese = JSON.parse(dados);
      setDadosAnamnese(anamnese);
      gerarPlanoSemanal(anamnese);
    }
  };

  const carregarProgressoSemanal = () => {
    const progresso = localStorage.getItem('progresso_semanal');
    if (progresso) {
      setProgressoSemanal(JSON.parse(progresso));
    }
  };

  const gerarPlanoSemanal = (anamnese) => {
    const frequenciaTreino = parseInt(anamnese.frequencia_treino?.split(' ')[0]) || 3;
    const experiencia = anamnese.experiencia_treino;
    
    // Gerar plano baseado na frequência e experiência
    const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const hoje = new Date().getDay(); // 0 = Domingo, 1 = Segunda, etc.
    
    let plano = [];
    
    if (frequenciaTreino >= 6) {
      // 6+ dias por semana - treino intenso
      plano = [
        { dia: 'Segunda', treino: 'Treino A - Peito/Tríceps', tipo: 'treino' },
        { dia: 'Terça', treino: 'Treino B - Costas/Bíceps', tipo: 'treino' },
        { dia: 'Quarta', treino: 'Treino C - Pernas/Glúteos', tipo: 'treino' },
        { dia: 'Quinta', treino: 'Treino D - Ombros/Abdômen', tipo: 'treino' },
        { dia: 'Sexta', treino: 'Treino E - Cardio/HIIT', tipo: 'cardio' },
        { dia: 'Sábado', treino: 'Treino F - Full Body', tipo: 'treino' },
        { dia: 'Domingo', treino: 'Descanso Ativo', tipo: 'descanso' }
      ];
    } else if (frequenciaTreino >= 4) {
      // 4-5 dias por semana - treino moderado
      plano = [
        { dia: 'Segunda', treino: 'Treino A - Peito/Tríceps', tipo: 'treino' },
        { dia: 'Terça', treino: 'Treino B - Costas/Bíceps', tipo: 'treino' },
        { dia: 'Quarta', treino: 'Descanso', tipo: 'descanso' },
        { dia: 'Quinta', treino: 'Treino C - Pernas/Glúteos', tipo: 'treino' },
        { dia: 'Sexta', treino: 'Treino D - Ombros/Cardio', tipo: 'treino' },
        { dia: 'Sábado', treino: 'Treino E - Full Body', tipo: 'treino' },
        { dia: 'Domingo', treino: 'Descanso', tipo: 'descanso' }
      ];
    } else {
      // 2-3 dias por semana - treino básico
      plano = [
        { dia: 'Segunda', treino: 'Treino A - Upper Body', tipo: 'treino' },
        { dia: 'Terça', treino: 'Descanso', tipo: 'descanso' },
        { dia: 'Quarta', treino: 'Treino B - Lower Body', tipo: 'treino' },
        { dia: 'Quinta', treino: 'Descanso', tipo: 'descanso' },
        { dia: 'Sexta', treino: 'Treino C - Full Body', tipo: 'treino' },
        { dia: 'Sábado', treino: 'Descanso', tipo: 'descanso' },
        { dia: 'Domingo', treino: 'Descanso', tipo: 'descanso' }
      ];
    }

    // Adicionar status baseado no dia atual
    plano = plano.map((item, index) => {
      const diaIndex = index + 1; // Segunda = 1, Terça = 2, etc.
      let status = 'pendente';
      
      if (diaIndex < hoje) {
        status = progressoSemanal[item.dia] ? 'completo' : 'perdido';
      } else if (diaIndex === hoje) {
        status = 'hoje';
      }
      
      return { ...item, status };
    });

    setPlanoSemanal(plano);
  };

  const marcarTreinoCompleto = (dia) => {
    const novoProgresso = {
      ...progressoSemanal,
      [dia]: true
    };
    setProgressoSemanal(novoProgresso);
    localStorage.setItem('progresso_semanal', JSON.stringify(novoProgresso));
    
    // Atualizar status do plano
    const novoPlano = planoSemanal.map(item => 
      item.dia === dia ? { ...item, status: 'completo' } : item
    );
    setPlanoSemanal(novoPlano);
  };

  const calcularEstatisticas = () => {
    const treinosCompletos = Object.values(progressoSemanal).filter(Boolean).length;
    const totalTreinos = planoSemanal.filter(item => item.tipo === 'treino').length;
    const percentualAderencia = totalTreinos > 0 ? Math.round((treinosCompletos / totalTreinos) * 100) : 0;
    
    return {
      treinosCompletos,
      totalTreinos,
      percentualAderencia
    };
  };

  const stats = calcularEstatisticas();

  if (!dadosAnamnese) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Carregando seu plano semanal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white pb-20">
      {/* Header */}
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-center">Plano Semanal</h1>
          <p className="text-gray-400 text-center text-sm mt-1">
            {dadosAnamnese.frequencia_treino} • {dadosAnamnese.experiencia_treino?.split(':')[0]}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Resumo da Semana */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            Resumo da Semana
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-gray-400">Treinos</p>
              <p className="font-bold text-white">{stats.treinosCompletos}/{stats.totalTreinos}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-gray-400">Aderência</p>
              <p className="font-bold text-white">{stats.percentualAderencia}%</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-gray-400">Semana</p>
              <p className="font-bold text-white">{new Date().getWeek()}</p>
            </div>
          </div>
        </section>

        {/* Programação Semanal */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
            Programação
          </h2>
          <div className="space-y-3">
            {planoSemanal.map((item, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                item.status === 'hoje' ? 'bg-blue-900 border border-blue-500' : 
                item.status === 'completo' ? 'bg-green-900 border border-green-500' :
                item.status === 'perdido' ? 'bg-red-900 border border-red-500' :
                'bg-gray-700'
              }`}>
                <div className="flex-1">
                  <p className="font-medium text-white">{item.dia}</p>
                  <p className="text-sm text-gray-400">{item.treino}</p>
                  {item.tipo === 'treino' && (
                    <p className="text-xs text-gray-500 mt-1">
                      {dadosAnamnese.intensidade_treino?.split(' ')[0]} • 45-60min
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {item.status === 'completo' && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                  {item.status === 'hoje' && item.tipo === 'treino' && (
                    <button
                      onClick={() => marcarTreinoCompleto(item.dia)}
                      className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                    >
                      <Play className="w-4 h-4 text-white" />
                    </button>
                  )}
                  {item.status === 'hoje' && item.tipo === 'descanso' && (
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">💤</span>
                    </div>
                  )}
                  {item.status === 'pendente' && item.tipo === 'treino' && (
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                      <Target className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  {item.status === 'pendente' && item.tipo === 'descanso' && (
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">💤</span>
                    </div>
                  )}
                  {item.status === 'perdido' && (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <RotateCcw className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Metas da Semana */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-500" />
            Metas da Semana
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Treinos completos</span>
              <span className="text-white font-bold">{stats.treinosCompletos}/{stats.totalTreinos}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Aderência ao plano</span>
              <span className={`font-bold ${stats.percentualAderencia >= 80 ? 'text-green-400' : stats.percentualAderencia >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {stats.percentualAderencia}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Objetivo principal</span>
              <span className="text-white font-bold text-sm">
                {dadosAnamnese.objetivo_principal?.split(' ')[0]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Próximo treino</span>
              <span className="text-blue-400 font-bold">
                {planoSemanal.find(item => item.status === 'hoje' || item.status === 'pendente')?.dia || 'Completo'}
              </span>
            </div>
          </div>
        </section>

        {/* Motivação */}
        {stats.percentualAderencia >= 80 && (
          <section className="bg-gradient-to-r from-green-800 to-green-700 rounded-xl p-5 border border-green-500">
            <div className="text-center">
              <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="font-bold text-white mb-1">Excelente trabalho!</h3>
              <p className="text-green-100 text-sm">
                Você está mantendo uma ótima consistência. Continue assim!
              </p>
            </div>
          </section>
        )}
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
          <Link to="/plano" className="flex flex-col items-center justify-center p-3 text-green-400 w-1/5">
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

// Extensão para obter número da semana
Date.prototype.getWeek = function() {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

export default PlanoSemanal;
