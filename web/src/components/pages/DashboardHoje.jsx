import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Chart, ArcElement, DoughnutController } from 'chart.js';
import { 
  Home, 
  Utensils, 
  Dumbbell, 
  Calendar, 
  TrendingUp,
  UtensilsCrossed,
  Flame,
  Plus,
  Minus
} from 'lucide-react';

// Registrar elementos do Chart.js
Chart.register(ArcElement, DoughnutController);

const DashboardHoje = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waterIntake, setWaterIntake] = useState(1.5);
  
  // Refs para os gráficos
  const energyBalanceChartRef = useRef(null);
  const basalExpenditureChartRef = useRef(null);
  const activityExpenditureChartRef = useRef(null);
  const carbsChartRef = useRef(null);
  const proteinChartRef = useRef(null);
  const fatChartRef = useRef(null);
  
  // Instâncias dos gráficos
  const chartsRef = useRef({});

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados da anamnese do usuário
      const anamneseDoc = await getDoc(doc(db, 'anamneses', user.uid));
      
      if (anamneseDoc.exists()) {
        const anamneseData = anamneseDoc.data();
        
        // Calcular dados do dashboard baseado na anamnese
        const calculatedData = calculateDashboardData(anamneseData);
        setDashboardData(calculatedData);
        
        // Aguardar um pouco para garantir que os elementos DOM estejam prontos
        setTimeout(() => {
          renderCharts(calculatedData);
        }, 100);
      } else {
        console.log('Anamnese não encontrada');
        // Usar dados de exemplo se não houver anamnese
        const exampleData = getExampleDashboardData();
        setDashboardData(exampleData);
        setTimeout(() => {
          renderCharts(exampleData);
        }, 100);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      // Usar dados de exemplo em caso de erro
      const exampleData = getExampleDashboardData();
      setDashboardData(exampleData);
      setTimeout(() => {
        renderCharts(exampleData);
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const calculateDashboardData = (anamnese) => {
    // Calcular TMB usando fórmula Mifflin-St Jeor
    const { peso, altura, idade, sexo, objetivo, nivel_atividade } = anamnese;
    
    let tmb;
    if (sexo === 'masculino') {
      tmb = (10 * peso) + (6.25 * altura) - (5 * idade) + 5;
    } else {
      tmb = (10 * peso) + (6.25 * altura) - (5 * idade) - 161;
    }
    
    // Fator de atividade
    const fatoresAtividade = {
      'sedentario': 1.2,
      'pouco_ativo': 1.375,
      'moderadamente_ativo': 1.55,
      'muito_ativo': 1.725,
      'extremamente_ativo': 1.9
    };
    
    const fatorAtividade = fatoresAtividade[nivel_atividade] || 1.55;
    const tdee = tmb * fatorAtividade;
    
    // Ajustar calorias baseado no objetivo
    let caloriasAlvo = tdee;
    if (objetivo === 'Perder peso') {
      caloriasAlvo = tdee - 500; // Déficit de 500kcal
    } else if (objetivo === 'Ganhar massa muscular') {
      caloriasAlvo = tdee + 300; // Superávit de 300kcal
    }
    
    // Calcular macronutrientes (exemplo: 40% carbo, 30% proteína, 30% gordura)
    const carbosGramas = (caloriasAlvo * 0.4) / 4;
    const proteinaGramas = (caloriasAlvo * 0.3) / 4;
    const gorduraGramas = (caloriasAlvo * 0.3) / 9;
    
    // Simular consumo atual (60% do alvo para demonstração)
    const consumoAtual = caloriasAlvo * 0.6;
    const deficit = caloriasAlvo - consumoAtual;
    
    return {
      greeting: {
        date: new Date().toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        }),
        nickname: `Olá, ${anamnese.nome || user.displayName || 'Usuário'}`
      },
      energy_balance: {
        deficit_or_surplus_kcal: Math.round(deficit),
        consumed_kcal: Math.round(consumoAtual),
        expended_kcal: Math.round(caloriasAlvo),
      },
      caloric_expenditure: {
        basal_and_daily_activity_kcal: Math.round(tmb),
        physical_activity_kcal: Math.round(tdee - tmb),
        total_expended_kcal: Math.round(tdee)
      },
      macronutrients: {
        carbs: { 
          consumed: Math.round(carbosGramas * 0.8), 
          target: Math.round(carbosGramas) 
        },
        protein: { 
          consumed: Math.round(proteinaGramas * 0.9), 
          target: Math.round(proteinaGramas) 
        },
        fat: { 
          consumed: Math.round(gorduraGramas * 0.75), 
          target: Math.round(gorduraGramas) 
        },
        total_target_kcal: Math.round(caloriasAlvo)
      },
      water_intake: {
        consumed_liters: waterIntake,
        target_liters: 3.0
      }
    };
  };

  const getExampleDashboardData = () => {
    return {
      greeting: {
        date: new Date().toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        }),
        nickname: `Olá, ${user?.displayName || 'Usuário'}`
      },
      energy_balance: {
        deficit_or_surplus_kcal: -300,
        consumed_kcal: 1500,
        expended_kcal: 1800,
      },
      caloric_expenditure: {
        basal_and_daily_activity_kcal: 1900,
        physical_activity_kcal: 450,
        total_expended_kcal: 2350
      },
      macronutrients: {
        carbs: { consumed: 180, target: 220 },
        protein: { consumed: 115, target: 130 },
        fat: { consumed: 38, target: 50 },
        total_target_kcal: 2500
      },
      water_intake: {
        consumed_liters: waterIntake,
        target_liters: 3.0
      }
    };
  };

  const createDoughnutChart = (canvas, progress, color, backgroundColor = '#374151') => {
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [progress, 100 - progress],
          backgroundColor: [color, backgroundColor],
          borderColor: 'transparent',
          borderRadius: 10,
          cutout: '80%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: { enabled: false }
        },
        events: []
      }
    });
  };

  const renderCharts = (data) => {
    // Limpar gráficos existentes
    Object.values(chartsRef.current).forEach(chart => {
      if (chart) chart.destroy();
    });
    chartsRef.current = {};

    if (!data) return;

    // Balanço Energético
    const consumedPercentage = Math.round((data.energy_balance.consumed_kcal / data.energy_balance.expended_kcal) * 100);
    if (energyBalanceChartRef.current) {
      chartsRef.current.energyBalance = createDoughnutChart(
        energyBalanceChartRef.current, 
        consumedPercentage, 
        '#34D399'
      );
    }

    // Gasto Calórico
    if (basalExpenditureChartRef.current) {
      chartsRef.current.basalExpenditure = createDoughnutChart(
        basalExpenditureChartRef.current, 
        50, 
        '#34D399'
      );
    }
    
    if (activityExpenditureChartRef.current) {
      chartsRef.current.activityExpenditure = createDoughnutChart(
        activityExpenditureChartRef.current, 
        50, 
        '#8B5CF6'
      );
    }

    // Macronutrientes
    const carbsProgress = (data.macronutrients.carbs.consumed / data.macronutrients.carbs.target) * 100;
    const proteinProgress = (data.macronutrients.protein.consumed / data.macronutrients.protein.target) * 100;
    const fatProgress = (data.macronutrients.fat.consumed / data.macronutrients.fat.target) * 100;

    if (carbsChartRef.current) {
      chartsRef.current.carbs = createDoughnutChart(carbsChartRef.current, carbsProgress, '#34D399');
    }
    
    if (proteinChartRef.current) {
      chartsRef.current.protein = createDoughnutChart(proteinChartRef.current, proteinProgress, '#3B82F6');
    }
    
    if (fatChartRef.current) {
      chartsRef.current.fat = createDoughnutChart(fatChartRef.current, fatProgress, '#F59E0B');
    }
  };

  const updateWaterIntake = (change) => {
    const newIntake = Math.max(0, waterIntake + change);
    setWaterIntake(newIntake);
    
    if (dashboardData) {
      const updatedData = {
        ...dashboardData,
        water_intake: {
          ...dashboardData.water_intake,
          consumed_liters: newIntake
        }
      };
      setDashboardData(updatedData);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <p className="text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Erro ao carregar dados</p>
        </div>
      </div>
    );
  }

  const consumedPercentage = Math.round((dashboardData.energy_balance.consumed_kcal / dashboardData.energy_balance.expended_kcal) * 100);
  const carbsProgress = Math.round((dashboardData.macronutrients.carbs.consumed / dashboardData.macronutrients.carbs.target) * 100);
  const proteinProgress = Math.round((dashboardData.macronutrients.protein.consumed / dashboardData.macronutrients.protein.target) * 100);
  const fatProgress = Math.round((dashboardData.macronutrients.fat.consumed / dashboardData.macronutrients.fat.target) * 100);
  const waterPercentage = Math.min(100, (dashboardData.water_intake.consumed_liters / dashboardData.water_intake.target_liters) * 100);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-900 flex flex-col pb-24 text-gray-200">
      
      {/* Cabeçalho */}
      <header className="p-5 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-400">{dashboardData.greeting.date}</p>
          <h1 className="text-xl font-bold text-white">{dashboardData.greeting.nickname}</h1>
        </div>
        <Link to="/configuracoes" className="w-10 h-10 bg-gradient-to-r from-green-500 to-purple-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
          <span className="text-white font-bold text-sm">
            {(user?.displayName || 'U').charAt(0).toUpperCase()}
          </span>
        </Link>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-grow px-4 space-y-4">
        
        {/* Card: Balanço Energético */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4">Balanço Energético</h2>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="relative w-32 h-32 mx-auto">
              <canvas ref={energyBalanceChartRef} className="w-full h-full"></canvas>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-white">{consumedPercentage}%</span>
                <span className="text-xs text-gray-400">Consumido</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-center">
                <span className="font-bold text-lg text-green-400">
                  {dashboardData.energy_balance.deficit_or_surplus_kcal > 0 ? 'Superávit' : 'Déficit'}
                </span><br />
                <span className="font-bold text-2xl text-white">
                  {Math.abs(dashboardData.energy_balance.deficit_or_surplus_kcal)}kcal
                </span>
              </p>
              <div className="text-xs space-y-1 text-center">
                <p>Consumo Total <span className="font-bold text-white">{dashboardData.energy_balance.consumed_kcal}kcal</span></p>
                <p>Gasto Total <span className="font-bold text-white">{dashboardData.energy_balance.expended_kcal}kcal</span></p>
              </div>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-center text-gray-400 mb-2">Sistema FULL-TIME</h3>
            <div className="flex space-x-3">
              <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                <UtensilsCrossed className="w-4 h-4 mr-2 text-green-400" />
                Alimento
              </button>
              <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                <Flame className="w-4 h-4 mr-2 text-purple-400" />
                Treino
              </button>
            </div>
          </div>
        </section>

        {/* Card: Gasto Calórico */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4">Gasto Calórico</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto">
                <canvas ref={basalExpenditureChartRef} className="w-full h-full"></canvas>
                <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">50%</div>
              </div>
              <p className="text-xs mt-2">Basal + Ativ. diária</p>
              <p className="font-bold text-sm text-white">{dashboardData.caloric_expenditure.basal_and_daily_activity_kcal}kcal</p>
            </div>
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto">
                <canvas ref={activityExpenditureChartRef} className="w-full h-full"></canvas>
                <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-purple-400">50%</div>
              </div>
              <p className="text-xs mt-2">Ativ. física</p>
              <p className="font-bold text-sm text-white">{dashboardData.caloric_expenditure.physical_activity_kcal}kcal</p>
            </div>
          </div>
        </section>

        {/* Card: Macronutrientes */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4">Macronutrientes</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="relative w-20 h-20 mx-auto">
                <canvas ref={carbsChartRef} className="w-full h-full"></canvas>
                <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">{carbsProgress}%</div>
              </div>
              <p className="text-xs mt-2">Carbo</p>
              <p className="font-bold text-sm text-white">
                {dashboardData.macronutrients.carbs.consumed}/{dashboardData.macronutrients.carbs.target}g
              </p>
            </div>
            <div>
              <div className="relative w-20 h-20 mx-auto">
                <canvas ref={proteinChartRef} className="w-full h-full"></canvas>
                <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">{proteinProgress}%</div>
              </div>
              <p className="text-xs mt-2">Proteína</p>
              <p className="font-bold text-sm text-white">
                {dashboardData.macronutrients.protein.consumed}/{dashboardData.macronutrients.protein.target}g
              </p>
            </div>
            <div>
              <div className="relative w-20 h-20 mx-auto">
                <canvas ref={fatChartRef} className="w-full h-full"></canvas>
                <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">{fatProgress}%</div>
              </div>
              <p className="text-xs mt-2">Gordura</p>
              <p className="font-bold text-sm text-white">
                {dashboardData.macronutrients.fat.consumed}/{dashboardData.macronutrients.fat.target}g
              </p>
            </div>
          </div>
          <div className="text-center mt-4 text-xs text-gray-400">
            Total <span className="font-bold text-white">{dashboardData.macronutrients.total_target_kcal}kcal</span>
          </div>
        </section>

        {/* Card: Ingestão de Água */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4">Ingestão de Água</h2>
          <div className="flex items-center justify-between mb-2">
            <p className="text-lg font-bold text-white">
              {dashboardData.water_intake.consumed_liters.toFixed(1)}L / {dashboardData.water_intake.target_liters.toFixed(1)}L
            </p>
            <div className="flex space-x-2">
              <button 
                onClick={() => updateWaterIntake(-0.1)}
                className="bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-lg hover:bg-gray-600 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => updateWaterIntake(0.1)}
                className="bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-lg hover:bg-gray-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${waterPercentage}%` }}
            ></div>
          </div>
          <div className="mt-4 text-xs text-gray-400 bg-gray-900/50 p-3 rounded-lg">
            <p className="font-bold">Dica:</p>
            <p>Beba água regularmente ao longo do dia para manter-se hidratado e otimizar a concentração.</p>
          </div>
        </section>
      </main>

      {/* Barra de Navegação Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gray-800 border-t border-gray-700">
        <div className="flex justify-around">
          <Link to="/dashboard" className="flex flex-col items-center justify-center p-3 text-green-400 w-1/5">
            <Home className="w-6 h-6" />
            <span className="text-xs">Hoje</span>
          </Link>
          <Link to="/dieta" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5">
            <Utensils className="w-6 h-6" />
            <span className="text-xs">Dieta</span>
          </Link>
          <Link to="/treino" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5">
            <Dumbbell className="w-6 h-6" />
            <span className="text-xs">Treino</span>
          </Link>
          <Link to="/plano" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5">
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Plano</span>
          </Link>
          <Link to="/progresso" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs">Progresso</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default DashboardHoje;

