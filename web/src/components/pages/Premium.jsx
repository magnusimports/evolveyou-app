import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Utensils, 
  Dumbbell, 
  Calendar, 
  TrendingUp,
  Crown,
  Star,
  Check,
  X,
  Zap,
  Brain,
  Target,
  Award,
  ShoppingCart,
  Camera,
  BarChart3,
  Users,
  MessageCircle
} from 'lucide-react';

const Premium = () => {
  const [planoAtual, setPlanoAtual] = useState('gratuito');
  const [dadosAnamnese, setDadosAnamnese] = useState(null);

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  const carregarDadosUsuario = () => {
    const dados = localStorage.getItem('dados_anamnese');
    const premium = localStorage.getItem('plano_premium');
    
    if (dados) {
      setDadosAnamnese(JSON.parse(dados));
    }
    
    if (premium) {
      setPlanoAtual(JSON.parse(premium).tipo);
    }
  };

  const ativarPremium = (tipo) => {
    const dadosPremium = {
      tipo,
      dataAtivacao: new Date().toISOString(),
      ativo: true,
      funcionalidades: obterFuncionalidadesPremium(tipo)
    };
    
    localStorage.setItem('plano_premium', JSON.stringify(dadosPremium));
    setPlanoAtual(tipo);
  };

  const obterFuncionalidadesPremium = (tipo) => {
    const funcionalidades = {
      pro: [
        'treinos_personalizados_avancados',
        'dietas_detalhadas_taco',
        'analise_progresso_avancada',
        'suporte_prioritario',
        'sem_anuncios'
      ],
      elite: [
        'treinos_personalizados_avancados',
        'dietas_detalhadas_taco',
        'analise_progresso_avancada',
        'suporte_prioritario',
        'sem_anuncios',
        'personal_trainer_virtual',
        'nutricao_em_tempo_real',
        'comunidade_exclusiva',
        'consultoria_mensal',
        'planos_ilimitados'
      ]
    };
    
    return funcionalidades[tipo] || [];
  };

  const planos = [
    {
      id: 'gratuito',
      nome: 'Gratuito',
      preco: 'R$ 0',
      periodo: '/mês',
      cor: 'gray',
      icone: Star,
      funcionalidades: [
        { nome: 'Treinos básicos', incluido: true },
        { nome: 'Dieta simples', incluido: true },
        { nome: 'Progresso básico', incluido: true },
        { nome: 'Anamnese inteligente', incluido: true },
        { nome: 'Treinos avançados', incluido: false },
        { nome: 'Dieta TACO completa', incluido: false },
        { nome: 'Análises detalhadas', incluido: false },
        { nome: 'Suporte prioritário', incluido: false }
      ]
    },
    {
      id: 'pro',
      nome: 'Pro',
      preco: 'R$ 29,90',
      periodo: '/mês',
      cor: 'blue',
      icone: Zap,
      popular: true,
      funcionalidades: [
        { nome: 'Treinos básicos', incluido: true },
        { nome: 'Dieta simples', incluido: true },
        { nome: 'Progresso básico', incluido: true },
        { nome: 'Anamnese inteligente', incluido: true },
        { nome: 'Treinos avançados', incluido: true },
        { nome: 'Dieta TACO completa', incluido: true },
        { nome: 'Análises detalhadas', incluido: true },
        { nome: 'Suporte prioritário', incluido: true }
      ]
    },
    {
      id: 'elite',
      nome: 'Elite',
      preco: 'R$ 59,90',
      periodo: '/mês',
      cor: 'purple',
      icone: Crown,
      funcionalidades: [
        { nome: 'Tudo do Pro', incluido: true },
        { nome: 'Personal Trainer Virtual', incluido: true },
        { nome: 'Nutrição em tempo real', incluido: true },
        { nome: 'Comunidade exclusiva', incluido: true },
        { nome: 'Consultoria mensal', incluido: true },
        { nome: 'Planos ilimitados', incluido: true },
        { nome: 'Análise de fotos', incluido: true },
        { nome: 'Suporte 24/7', incluido: true }
      ]
    }
  ];

  const funcionalidadesPremium = [
    {
      titulo: 'Personal Trainer Virtual',
      descricao: 'IA avançada que ajusta seus treinos em tempo real',
      icone: Brain,
      disponivel: ['elite']
    },
    {
      titulo: 'Nutrição TACO Completa',
      descricao: 'Base completa de alimentos brasileiros com 597 opções',
      icone: Utensils,
      disponivel: ['pro', 'elite']
    },
    {
      titulo: 'Análise de Progresso Avançada',
      descricao: 'Gráficos detalhados e insights personalizados',
      icone: BarChart3,
      disponivel: ['pro', 'elite']
    },
    {
      titulo: 'Comunidade Exclusiva',
      descricao: 'Acesso à comunidade premium com outros usuários',
      icone: Users,
      disponivel: ['elite']
    },
    {
      titulo: 'Lista de Compras Inteligente',
      descricao: 'Geração automática baseada no seu plano alimentar',
      icone: ShoppingCart,
      disponivel: ['pro', 'elite']
    },
    {
      titulo: 'Consultoria Mensal',
      descricao: 'Sessão mensal com especialistas em fitness',
      icone: MessageCircle,
      disponivel: ['elite']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white pb-20">
      {/* Header */}
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-center flex items-center justify-center">
            <Crown className="w-6 h-6 mr-2 text-yellow-500" />
            EvolveYou Premium
          </h1>
          <p className="text-gray-400 text-center text-sm mt-1">
            Desbloqueie todo o potencial da sua jornada fitness
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Status Atual */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
              planoAtual === 'elite' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
              planoAtual === 'pro' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
              'bg-gradient-to-r from-gray-500 to-gray-600'
            }`}>
              {planoAtual === 'elite' ? <Crown className="w-8 h-8 text-white" /> :
               planoAtual === 'pro' ? <Zap className="w-8 h-8 text-white" /> :
               <Star className="w-8 h-8 text-white" />}
            </div>
            <h2 className="text-xl font-bold text-white mb-1">
              Plano {planoAtual === 'gratuito' ? 'Gratuito' : planoAtual === 'pro' ? 'Pro' : 'Elite'}
            </h2>
            <p className="text-gray-400 text-sm">
              {planoAtual === 'gratuito' ? 'Funcionalidades básicas' : 'Acesso completo às funcionalidades premium'}
            </p>
          </div>
        </section>

        {/* Funcionalidades Premium */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Funcionalidades Premium
          </h2>
          <div className="space-y-4">
            {funcionalidadesPremium.map((funcionalidade, index) => {
              const IconeComponent = funcionalidade.icone;
              const disponivel = funcionalidade.disponivel.includes(planoAtual);
              
              return (
                <div key={index} className={`flex items-center p-3 rounded-lg border ${
                  disponivel ? 'bg-green-900 border-green-500' : 'bg-gray-700 border-gray-600'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    disponivel ? 'bg-green-500' : 'bg-gray-600'
                  }`}>
                    <IconeComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${disponivel ? 'text-white' : 'text-gray-400'}`}>
                      {funcionalidade.titulo}
                    </p>
                    <p className={`text-xs ${disponivel ? 'text-green-100' : 'text-gray-500'}`}>
                      {funcionalidade.descricao}
                    </p>
                  </div>
                  {disponivel ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <div className="w-5 h-5 bg-gray-600 rounded border border-gray-500"></div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Planos */}
        <section className="space-y-4">
          <h2 className="font-semibold text-white text-center mb-4">Escolha seu Plano</h2>
          {planos.map((plano) => {
            const IconePlano = plano.icone;
            const ativo = planoAtual === plano.id;
            
            return (
              <div key={plano.id} className={`relative bg-gray-800 rounded-xl p-5 border transition-all ${
                ativo ? 'border-green-500 bg-green-900' : 
                plano.popular ? 'border-blue-500' : 'border-gray-700'
              }`}>
                {plano.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                      Mais Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    plano.cor === 'purple' ? 'bg-purple-500' :
                    plano.cor === 'blue' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    <IconePlano className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{plano.nome}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-2xl font-bold text-white">{plano.preco}</span>
                    <span className="text-gray-400 text-sm">{plano.periodo}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {plano.funcionalidades.map((func, index) => (
                    <div key={index} className="flex items-center">
                      {func.incluido ? (
                        <Check className="w-4 h-4 text-green-400 mr-2" />
                      ) : (
                        <X className="w-4 h-4 text-gray-500 mr-2" />
                      )}
                      <span className={`text-sm ${func.incluido ? 'text-white' : 'text-gray-500'}`}>
                        {func.nome}
                      </span>
                    </div>
                  ))}
                </div>
                
                {ativo ? (
                  <div className="w-full py-3 bg-green-500 text-white rounded-lg text-center font-medium">
                    Plano Atual
                  </div>
                ) : (
                  <button
                    onClick={() => ativarPremium(plano.id)}
                    className={`w-full py-3 rounded-lg text-center font-medium transition-colors ${
                      plano.cor === 'purple' ? 'bg-purple-500 hover:bg-purple-600 text-white' :
                      plano.cor === 'blue' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                      'bg-gray-600 hover:bg-gray-500 text-white'
                    }`}
                  >
                    {plano.id === 'gratuito' ? 'Usar Gratuito' : 'Assinar Agora'}
                  </button>
                )}
              </div>
            );
          })}
        </section>

        {/* Benefícios Exclusivos */}
        <section className="bg-gradient-to-r from-purple-800 to-pink-800 rounded-xl p-5 border border-purple-500">
          <div className="text-center">
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Por que escolher Premium?</h3>
            <div className="space-y-2 text-sm text-purple-100">
              <p>✨ Algoritmos compensatórios únicos no mercado</p>
              <p>🧠 IA treinada especificamente para fitness brasileiro</p>
              <p>📊 Base de dados TACO com 597 alimentos nacionais</p>
              <p>🎯 Personalização baseada em 22 fatores da anamnese</p>
              <p>💪 Resultados comprovados e suporte especializado</p>
            </div>
          </div>
        </section>

        {/* Garantia */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="text-center">
            <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h3 className="font-bold text-white mb-1">Garantia de 7 dias</h3>
            <p className="text-gray-400 text-sm">
              Não ficou satisfeito? Devolvemos 100% do seu dinheiro em até 7 dias.
            </p>
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

export default Premium;
