import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/config/firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
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
      
      if (anamneseDoc.exists()) {
        const anamneseData = anamneseDoc.data();
        console.log('🏋️ Gerando treino baseado na anamnese:', anamneseData);
        
        // Gerar treino personalizado baseado na anamnese
        const treinoPersonalizado = gerarTreinoPersonalizado(anamneseData);
        setTreino(treinoPersonalizado);
      } else {
        console.log('Anamnese não encontrada, usando treino exemplo');
        setTreino(getExampleTreino());
      }
    } catch (error) {
      console.error('Erro ao carregar treino do dia:', error);
      setTreino(getExampleTreino());
    } finally {
      setLoading(false);
    }
  };

  const gerarTreinoPersonalizado = (anamnese) => {
    try {
      // Importar e aplicar lógica de treinos personalizados
      const { gerarTreinoPersonalizado: gerarTreino } = require('/functions/algorithms/treinoPersonalizado.js');
      const programaSemanal = gerarTreino(anamnese);
      
      // Obter treino do dia atual
      const hoje = new Date().getDay();
      const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const diaAtual = diasSemana[hoje];
      
      const treinoDoDia = programaSemanal.treinos[diaAtual];
      
      console.log('✅ Treino do dia gerado:', treinoDoDia);
      
      // Adaptar formato para o componente
      if (treinoDoDia.tipo === 'descanso') {
        return {
          tipo: 'descanso',
          titulo: treinoDoDia.titulo,
          descricao: treinoDoDia.descricao || 'Dia dedicado ao descanso e recuperação muscular',
          atividades: treinoDoDia.atividades || [
            'Caminhada leve (20-30 min)',
            'Alongamento (10-15 min)',
            'Hidratação adequada',
            'Sono reparador (7-9 horas)'
          ],
          observacoes: treinoDoDia.observacoes || []
        };
      } else {
        return {
          tipo: 'treino',
          titulo: treinoDoDia.titulo,
          grupos: treinoDoDia.gruposMusculares,
          duracao: treinoDoDia.duracao || 60,
          exercicios: treinoDoDia.exercicios.map(ex => ({
            nome: ex.nome,
            grupoMuscular: ex.grupo,
            series: ex.series,
            repeticoes: ex.repeticoes,
            descanso: ex.descanso,
            carga: ex.carga,
            instrucoes: ex.instrucoes,
            equipamento: ex.equipamento,
            dificuldade: ex.dificuldade
          })),
          observacoes: treinoDoDia.observacoes || [],
          informacoes: programaSemanal.informacoes
        };
      }
    } catch (error) {
      console.error('❌ Erro ao gerar treino personalizado, usando fallback:', error);
      
      // Fallback com lógica simplificada
      return gerarTreinoFallback(anamnese);
    }
  };

  const gerarTreinoFallback = (anamnese) => {
    const hoje = new Date().getDay();
    
    // Domingo = descanso
    if (hoje === 0) {
      return {
        tipo: 'descanso',
        titulo: 'Dia de Descanso',
        descricao: 'Hoje é seu dia de recuperação. Aproveite para relaxar e se preparar para os próximos treinos.',
        atividades: [
          'Caminhada leve (opcional)',
          'Alongamento',
          'Hidratação adequada',
          'Sono reparador'
        ]
      };
    }
    
    // Determinar nível baseado na experiência
    let nivel = 'iniciante';
    if (anamnese.experiencia_treino?.includes('6 meses a 2 anos') || 
        anamnese.experiencia_treino?.includes('2 a 5 anos')) {
      nivel = 'intermediario';
    } else if (anamnese.experiencia_treino?.includes('Mais de 5 anos') ||
               anamnese.experiencia_treino?.includes('Atleta')) {
      nivel = 'avancado';
    }
    
    // Determinar tipo de treino baseado no dia (ABC)
    const tiposTreino = ['A', 'B', 'C'];
    const tipoTreino = tiposTreino[(hoje - 1) % 3];
    
    // Exercícios por tipo de treino
    const exerciciosPorTipo = {
      'A': {
        titulo: 'Treino A: Peito & Tríceps',
        grupos: ['Peito', 'Tríceps'],
        exercicios: [
          {
            nome: anamnese.local_treino?.includes('Casa') ? 'Flexão de braço' : 'Supino reto',
            grupoMuscular: 'Peito',
            series: nivel === 'iniciante' ? 3 : 4,
            repeticoes: nivel === 'iniciante' ? '10-12' : '8-12',
            descanso: '90s',
            carga: anamnese.local_treino?.includes('Casa') ? 'Peso corporal' : '60kg',
            instrucoes: 'Mantenha controle total do movimento'
          },
          {
            nome: anamnese.local_treino?.includes('Casa') ? 'Flexão inclinada' : 'Supino inclinado',
            grupoMuscular: 'Peito',
            series: 3,
            repeticoes: '10-12',
            descanso: '90s',
            carga: anamnese.local_treino?.includes('Casa') ? 'Peso corporal' : '50kg',
            instrucoes: 'Foque na contração do peito superior'
          },
          {
            nome: anamnese.local_treino?.includes('Casa') ? 'Tríceps no banco' : 'Tríceps testa',
            grupoMuscular: 'Tríceps',
            series: 3,
            repeticoes: '12-15',
            descanso: '60s',
            carga: anamnese.local_treino?.includes('Casa') ? 'Peso corporal' : '30kg',
            instrucoes: 'Mantenha os cotovelos fixos'
          }
        ]
      },
      'B': {
        titulo: 'Treino B: Costas & Bíceps',
        grupos: ['Costas', 'Bíceps'],
        exercicios: [
          {
            nome: anamnese.local_treino?.includes('Casa') ? 'Remada com garrafa' : 'Puxada frontal',
            grupoMuscular: 'Costas',
            series: nivel === 'iniciante' ? 3 : 4,
            repeticoes: '10-12',
            descanso: '90s',
            carga: anamnese.local_treino?.includes('Casa') ? '5L água' : '50kg',
            instrucoes: 'Puxe com as costas, não com os braços'
          },
          {
            nome: anamnese.local_treino?.includes('Casa') ? 'Remada curvada' : 'Remada baixa',
            grupoMuscular: 'Costas',
            series: 3,
            repeticoes: '10-12',
            descanso: '90s',
            carga: anamnese.local_treino?.includes('Casa') ? 'Peso corporal' : '45kg',
            instrucoes: 'Mantenha as costas retas'
          },
          {
            nome: anamnese.local_treino?.includes('Casa') ? 'Rosca com garrafa' : 'Rosca direta',
            grupoMuscular: 'Bíceps',
            series: 3,
            repeticoes: '12-15',
            descanso: '60s',
            carga: anamnese.local_treino?.includes('Casa') ? '2L água' : '20kg',
            instrucoes: 'Controle a descida do peso'
          }
        ]
      },
      'C': {
        titulo: 'Treino C: Pernas & Glúteos',
        grupos: ['Pernas', 'Glúteos'],
        exercicios: [
          {
            nome: 'Agachamento',
            grupoMuscular: 'Pernas',
            series: nivel === 'iniciante' ? 3 : 4,
            repeticoes: '12-15',
            descanso: '90s',
            carga: anamnese.local_treino?.includes('Casa') ? 'Peso corporal' : '70kg',
            instrucoes: 'Desça até 90 graus nos joelhos'
          },
          {
            nome: anamnese.local_treino?.includes('Casa') ? 'Afundo' : 'Leg press',
            grupoMuscular: 'Pernas',
            series: 3,
            repeticoes: '12-15',
            descanso: '90s',
            carga: anamnese.local_treino?.includes('Casa') ? 'Peso corporal' : '100kg',
            instrucoes: 'Mantenha o tronco ereto'
          },
          {
            nome: anamnese.local_treino?.includes('Casa') ? 'Elevação pélvica' : 'Stiff',
            grupoMuscular: 'Glúteos',
            series: 3,
            repeticoes: '15-20',
            descanso: '60s',
            carga: anamnese.local_treino?.includes('Casa') ? 'Peso corporal' : '40kg',
            instrucoes: 'Contraia bem os glúteos no topo'
          }
        ]
      }
    };
    
    const treinoSelecionado = exerciciosPorTipo[tipoTreino];
    
    return {
      tipo: 'treino',
      titulo: treinoSelecionado.titulo,
      grupos: treinoSelecionado.grupos,
      duracao: 60,
      exercicios: treinoSelecionado.exercicios,
      observacoes: [
        `🎯 Treino adaptado para ${anamnese.objetivo_principal || 'objetivos gerais'}`,
        `🏠 Exercícios adequados para ${anamnese.local_treino || 'seu local de treino'}`,
        `💪 Nível ${nivel} baseado na sua experiência`,
        '💧 Mantenha-se hidratado durante o treino'
      ]
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

  const iniciarTreino = async () => {
    try {
      const response = await fetch('https://us-central1-evolveyou-prod.cloudfunctions.net/iniciarTreino', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          treinoId: treino.tipo,
          dataPlano: new Date().toISOString().split('T')[0]
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSessaoAtiva(data.sessao);
        setExercicioAtual(0);
        setSerieAtual(1);
      } else {
        console.error('Erro ao iniciar treino:', data.error);
      }
    } catch (error) {
      console.error('Erro ao iniciar treino:', error);
    }
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
    // Aqui poderia salvar estatísticas do treino
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

        {/* Navegação */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md lg:max-w-4xl mx-auto bg-gray-800 border-t border-gray-700">
          <div className="flex justify-around">
            <a href="/dashboard" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
              <Home className="w-6 h-6" />
              <span className="text-xs">Hoje</span>
            </a>
            <a href="/dieta" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
              <Utensils className="w-6 h-6" />
              <span className="text-xs">Dieta</span>
            </a>
            <a href="/treino" className="flex flex-col items-center justify-center p-3 text-green-400 w-1/5">
              <Dumbbell className="w-6 h-6" />
              <span className="text-xs">Treino</span>
            </a>
            <a href="/plano" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
              <Calendar className="w-6 h-6" />
              <span className="text-xs">Plano</span>
            </a>
            <a href="/progresso" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
              <TrendingUp className="w-6 h-6" />
              <span className="text-xs">Progresso</span>
            </a>
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
                style={{
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.3), 0 0 10px rgba(52, 211, 153, 0.3)'
                }}
              >
                <PlayCircle className="w-6 h-6 mr-3" />
                Iniciar Treino
              </button>
            </div>

            {/* Resumo do Treino - Desktop */}
            <div className="hidden lg:block">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-purple-400">{treino?.exercicios?.length || 0}</p>
                    <p className="text-sm text-gray-400">Exercícios</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">
                      {treino?.exercicios?.reduce((total, ex) => total + ex.series, 0) || 0}
                    </p>
                    <p className="text-sm text-gray-400">Séries Totais</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-400">
                      {treino?.gruposMusculares?.join(', ') || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-400">Grupos Musculares</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Exercícios */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 space-y-4">
              {treino?.exercicios?.map((exercicio, index) => (
                <div key={index} className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-colors">
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

