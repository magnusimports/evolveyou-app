import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/config/firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { gerarTreinoPersonalizado } from '@/utils/treinoPersonalizadoNovo';
import { 
  PlayCircle, 
  Clock, 
  Target, 
  Zap,
  Home, 
  Utensils, 
  Dumbbell, 
  Calendar, 
  TrendingUp,
  CheckCircle,
  Timer,
  RotateCcw
} from 'lucide-react';

const TreinoDoDia = () => {
  const { user } = useAuth();
  const [treino, setTreino] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessaoAtiva, setSessaoAtiva] = useState(null);
  const [exercicioAtual, setExercicioAtual] = useState(0);
  const [serieAtual, setSerieAtual] = useState(1);
  const [tempoDescanso, setTempoDescanso] = useState(0);
  const [cronometroAtivo, setCronometroAtivo] = useState(false);

  useEffect(() => {
    if (user) {
      loadTreinoDoDia();
    }
  }, [user]);

  useEffect(() => {
    let interval;
    if (cronometroAtivo && tempoDescanso > 0) {
      interval = setInterval(() => {
        setTempoDescanso(prev => {
          if (prev <= 1) {
            setCronometroAtivo(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cronometroAtivo, tempoDescanso]);

  const loadTreinoDoDia = async () => {
    try {
      setLoading(true);
      
      // Buscar anamnese do usuário
      const anamneseDoc = await getDoc(doc(db, 'anamneses', user.uid));
      
      if (!anamneseDoc.exists()) {
        console.log('Anamnese não encontrada, usando treino exemplo');
        setTreino(getExampleTreino());
        setLoading(false);
        return;
      }

      const anamnese = anamneseDoc.data();
      console.log('📋 Anamnese carregada para treino:', anamnese);

      // Gerar treino personalizado com nova base de exercícios
      const treinoGerado = gerarTreinoPersonalizado(anamnese);
      console.log('🏋️ Treino gerado:', treinoGerado);
      
      setTreino(treinoGerado);
      
    } catch (error) {
      console.error('Erro ao carregar treino:', error);
      setTreino(getExampleTreino());
    } finally {
      setLoading(false);
    }
  };

  const gerarTreinoFallback = (anamnese) => {
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0 = domingo, 1 = segunda, etc.
    
    // Verificar se é domingo (dia de descanso)
    if (diaSemana === 0) {
      return {
        tipo: 'descanso',
        titulo: 'Dia de Descanso',
        observacoes: ['Aproveite para relaxar e se recuperar!']
      };
    }

    // Determinar tipo de treino baseado no dia (ABC)
    const tipoTreino = ['A', 'B', 'C'][diaSemana % 3];
    const experiencia = anamnese.experiencia_treino || 'iniciante';
    const local = anamnese.local_treino || 'casa';
    const objetivo = anamnese.objetivo_principal || 'emagrecer';

    // Exercícios por tipo de treino e local
    const exerciciosPorTipo = {
      'A': { // Peito e Tríceps
        titulo: 'Treino A: Peito & Tríceps',
        grupos: ['Peito', 'Tríceps'],
        exercicios: local === 'casa' ? [
          {
            nome: 'Flexão de braço',
            grupoMuscular: 'Peito',
            series: experiencia === 'iniciante' ? 3 : 4,
            repeticoes: '10-15',
            descanso: '60s',
            carga: 'Peso corporal',
            instrucoes: 'Mantenha o corpo alinhado e controle o movimento'
          },
          {
            nome: 'Flexão diamante',
            grupoMuscular: 'Tríceps',
            series: experiencia === 'iniciante' ? 2 : 3,
            repeticoes: '8-12',
            descanso: '60s',
            carga: 'Peso corporal',
            instrucoes: 'Forme um diamante com as mãos'
          }
        ] : [
          {
            nome: 'Supino reto',
            grupoMuscular: 'Peito',
            series: experiencia === 'iniciante' ? 3 : 4,
            repeticoes: '8-12',
            descanso: '90s',
            carga: '60kg',
            instrucoes: 'Mantenha os pés firmes no chão'
          },
          {
            nome: 'Tríceps testa',
            grupoMuscular: 'Tríceps',
            series: 3,
            repeticoes: '10-12',
            descanso: '60s',
            carga: '30kg',
            instrucoes: 'Mantenha os cotovelos fixos'
          }
        ]
      },
      'B': { // Costas e Bíceps
        titulo: 'Treino B: Costas & Bíceps',
        grupos: ['Costas', 'Bíceps'],
        exercicios: local === 'casa' ? [
          {
            nome: 'Remada com garrafa',
            grupoMuscular: 'Costas',
            series: experiencia === 'iniciante' ? 3 : 4,
            repeticoes: '12-15',
            descanso: '60s',
            carga: '5L cada mão',
            instrucoes: 'Puxe o cotovelo para trás'
          },
          {
            nome: 'Rosca com garrafa',
            grupoMuscular: 'Bíceps',
            series: 3,
            repeticoes: '12-15',
            descanso: '45s',
            carga: '2L cada mão',
            instrucoes: 'Controle o movimento'
          }
        ] : [
          {
            nome: 'Puxada frontal',
            grupoMuscular: 'Costas',
            series: experiencia === 'iniciante' ? 3 : 4,
            repeticoes: '8-12',
            descanso: '90s',
            carga: '50kg',
            instrucoes: 'Puxe até o peito'
          },
          {
            nome: 'Rosca direta',
            grupoMuscular: 'Bíceps',
            series: 3,
            repeticoes: '10-12',
            descanso: '60s',
            carga: '20kg',
            instrucoes: 'Não balance o corpo'
          }
        ]
      },
      'C': { // Pernas e Ombros
        titulo: 'Treino C: Pernas & Ombros',
        grupos: ['Pernas', 'Ombros'],
        exercicios: local === 'casa' ? [
          {
            nome: 'Agachamento livre',
            grupoMuscular: 'Pernas',
            series: experiencia === 'iniciante' ? 3 : 4,
            repeticoes: '15-20',
            descanso: '90s',
            carga: 'Peso corporal',
            instrucoes: 'Desça até 90 graus'
          },
          {
            nome: 'Elevação lateral com garrafa',
            grupoMuscular: 'Ombros',
            series: 3,
            repeticoes: '12-15',
            descanso: '45s',
            carga: '1L cada mão',
            instrucoes: 'Eleve até a altura dos ombros'
          }
        ] : [
          {
            nome: 'Leg press',
            grupoMuscular: 'Pernas',
            series: experiencia === 'iniciante' ? 3 : 4,
            repeticoes: '12-15',
            descanso: '90s',
            carga: '100kg',
            instrucoes: 'Amplitude completa'
          },
          {
            nome: 'Desenvolvimento com halteres',
            grupoMuscular: 'Ombros',
            series: 3,
            repeticoes: '10-12',
            descanso: '60s',
            carga: '15kg cada',
            instrucoes: 'Não eleve os ombros'
          }
        ]
      }
    };

    const treinoEscolhido = exerciciosPorTipo[tipoTreino];
    
    return {
      tipo: tipoTreino,
      titulo: treinoEscolhido.titulo,
      grupos: treinoEscolhido.grupos,
      duracao: 45,
      exercicios: treinoEscolhido.exercicios,
      observacoes: [
        `🎯 Treino adaptado para ${objetivo}`,
        `🏠 Exercícios adequados para ${local}`,
        `💪 Nível ${experiencia} baseado na sua experiência`,
        '💧 Mantenha-se hidratado durante o treino'
      ]
    };
  };

  const getExampleTreino = () => {
    return {
      tipo: 'treino',
      titulo: 'Treino Exemplo: Peito & Tríceps',
      grupos: ['Peito', 'Tríceps'],
      duracao: 60,
      exercicios: [
        {
          nome: 'Supino reto',
          grupoMuscular: 'Peito',
          series: 4,
          repeticoes: '8-12',
          descanso: '90s',
          carga: '60kg',
          instrucoes: 'Mantenha os pés firmes no chão e controle o movimento'
        },
        {
          nome: 'Supino inclinado',
          grupoMuscular: 'Peito',
          series: 3,
          repeticoes: '10-12',
          descanso: '90s',
          carga: '50kg',
          instrucoes: 'Foque na contração do peito superior'
        },
        {
          nome: 'Tríceps testa',
          grupoMuscular: 'Tríceps',
          series: 3,
          repeticoes: '12-15',
          descanso: '60s',
          carga: '30kg',
          instrucoes: 'Mantenha os cotovelos fixos'
        }
      ],
      observacoes: [
        '🔰 Treino exemplo para demonstração',
        '💪 Foque na execução correta',
        '💧 Mantenha-se hidratado'
      ]
    };
  };

  const iniciarTreino = () => {
    setSessaoAtiva({
      id: Date.now(),
      inicio: new Date(),
      treinoId: treino.tipo
    });
  };

  const proximaSerie = () => {
    const exercicio = treino.exercicios[exercicioAtual];
    
    if (serieAtual < exercicio.series) {
      setSerieAtual(prev => prev + 1);
      iniciarDescanso(exercicio.descanso);
    } else {
      proximoExercicio();
    }
  };

  const proximoExercicio = () => {
    if (exercicioAtual < treino.exercicios.length - 1) {
      setExercicioAtual(prev => prev + 1);
      setSerieAtual(1);
    } else {
      finalizarTreino();
    }
  };

  const iniciarDescanso = (tempoDescansoStr) => {
    const tempo = parseInt(tempoDescansoStr.replace(/[^0-9]/g, ''));
    setTempoDescanso(tempo);
    setCronometroAtivo(true);
  };

  const pularDescanso = () => {
    setTempoDescanso(0);
    setCronometroAtivo(false);
  };

  const finalizarTreino = () => {
    setSessaoAtiva(null);
    setExercicioAtual(0);
    setSerieAtual(1);
  };

  const formatarTempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="max-w-md lg:max-w-4xl mx-auto min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <p className="text-gray-400">Carregando treino do dia...</p>
        </div>
      </div>
    );
  }

  if (treino?.tipo === 'descanso') {
    return (
      <div className="max-w-md lg:max-w-4xl mx-auto min-h-screen bg-gray-900 flex flex-col pb-24 text-gray-200">
        <header className="p-5 flex justify-between items-center sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
          <div>
            <p className="text-sm text-gray-400">Hoje é</p>
            <h1 className="text-xl lg:text-2xl font-bold text-white">Dia de Descanso</h1>
          </div>
          <Link to="/configuracoes" className="w-10 h-10 bg-gradient-to-r from-purple-500 to-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
            <span className="text-white font-bold text-sm">
              {(user?.displayName || 'U').charAt(0).toUpperCase()}
            </span>
          </Link>
        </header>

        <main className="flex-grow px-4 lg:px-5 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <RotateCcw className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Aproveite para descansar!</h2>
            <p className="text-gray-400 text-center max-w-md">
              O descanso é fundamental para a recuperação muscular e crescimento. 
              Aproveite para relaxar, hidratar-se bem e preparar-se para o próximo treino.
            </p>
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 max-w-md lg:max-w-4xl mx-auto bg-gray-800 border-t border-gray-700">
          <div className="flex justify-around">
            <Link to="/dashboard" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
              <Home className="w-6 h-6" />
              <span className="text-xs">Hoje</span>
            </Link>
            <Link to="/dieta" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
              <Utensils className="w-6 h-6" />
              <span className="text-xs">Dieta</span>
            </Link>
            <Link to="/treino" className="flex flex-col items-center justify-center p-3 text-green-400 w-1/5">
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
  }

  return (
    <div className="max-w-md lg:max-w-4xl mx-auto min-h-screen bg-gray-900 flex flex-col pb-24 text-gray-200">
      
      {/* Cabeçalho */}
      <header className="p-5 flex justify-between items-center sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
        <div>
          <p className="text-sm text-gray-400">Treino de Hoje</p>
          <h1 className="text-xl lg:text-2xl font-bold text-white">{treino?.titulo}</h1>
        </div>
        <Link to="/configuracoes" className="w-10 h-10 bg-gradient-to-r from-purple-500 to-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
          <span className="text-white font-bold text-sm">
            {(user?.displayName || 'U').charAt(0).toUpperCase()}
          </span>
        </Link>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-grow px-4 lg:px-5 space-y-4">
        
        {!sessaoAtiva ? (
          <>
            {/* Botão Iniciar Treino */}
            <div className="p-4">
              <button 
                onClick={iniciarTreino}
                className="w-full bg-gradient-to-r from-green-400 to-purple-500 hover:from-green-500 hover:to-purple-600 text-white font-bold py-4 px-4 rounded-xl text-lg flex items-center justify-center transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <PlayCircle className="w-6 h-6 mr-3" />
                Iniciar Treino
              </button>
            </div>

            {/* Lista de Exercícios */}
            <div className="space-y-4">
              {treino?.exercicios?.map((exercicio, index) => (
                <div key={index} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg text-white mb-1">{exercicio.nome}</h3>
                      <p className="text-sm text-purple-400">{exercicio.grupoMuscular}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Séries</p>
                      <p className="text-xl font-bold text-green-400">{exercicio.series}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-300">{exercicio.repeticoes} reps</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-300">{exercicio.descanso}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Instruções:</p>
                    <p className="text-sm text-gray-300">{exercicio.instrucoes}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Player de Treino Ativo */
          <div className="space-y-6">
            {/* Progresso do Treino */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Exercício {exercicioAtual + 1} de {treino.exercicios.length}</h2>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Série</p>
                  <p className="text-xl font-bold text-green-400">{serieAtual}/{treino.exercicios[exercicioAtual].series}</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-green-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((exercicioAtual * treino.exercicios[exercicioAtual].series + serieAtual - 1) / 
                      treino.exercicios.reduce((total, ex) => total + ex.series, 0)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Exercício Atual */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-2">{treino.exercicios[exercicioAtual].nome}</h3>
              <p className="text-purple-400 mb-4">{treino.exercicios[exercicioAtual].grupoMuscular}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Repetições</p>
                  <p className="text-2xl font-bold text-green-400">{treino.exercicios[exercicioAtual].repeticoes}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Descanso</p>
                  <p className="text-2xl font-bold text-yellow-400">{treino.exercicios[exercicioAtual].descanso}</p>
                </div>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-300">{treino.exercicios[exercicioAtual].instrucoes}</p>
              </div>

              {/* Timer de Descanso */}
              {cronometroAtivo && tempoDescanso > 0 && (
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Timer className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Tempo de descanso</p>
                  <p className="text-4xl font-bold text-yellow-400">{formatarTempo(tempoDescanso)}</p>
                  <button 
                    onClick={pularDescanso}
                    className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Pular Descanso
                  </button>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex space-x-4">
                <button 
                  onClick={proximaSerie}
                  disabled={cronometroAtivo && tempoDescanso > 0}
                  className={`flex-1 font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-all ${
                    cronometroAtivo && tempoDescanso > 0
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-400 to-purple-500 hover:from-green-500 hover:to-purple-600 text-white'
                  }`}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {serieAtual < treino.exercicios[exercicioAtual].series ? 'Próxima Série' : 'Próximo Exercício'}
                </button>
                
                <button 
                  onClick={finalizarTreino}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Finalizar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Barra de Navegação Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md lg:max-w-4xl mx-auto bg-gray-800 border-t border-gray-700">
        <div className="flex justify-around">
          <Link to="/dashboard" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
            <Home className="w-6 h-6" />
            <span className="text-xs">Hoje</span>
          </Link>
          <Link to="/dieta" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
            <Utensils className="w-6 h-6" />
            <span className="text-xs">Dieta</span>
          </Link>
          <Link to="/treino" className="flex flex-col items-center justify-center p-3 text-green-400 w-1/5">
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

export default TreinoDoDia;

