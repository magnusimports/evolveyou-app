import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const DashboardPersonalizado = () => {
  const { user } = useAuth();
  const [dadosAnamnese, setDadosAnamnese] = useState(null);
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      carregarDadosPersonalizados();
    }
  }, [user]);

  const carregarDadosPersonalizados = async () => {
    try {
      setLoading(true);
      
      // Buscar dados da anamnese
      const response = await fetch(
        `https://us-central1-evolveyou-prod.cloudfunctions.net/getAnamnese?userId=${user.uid}`
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDadosAnamnese(result.data);
          calcularMetricasPersonalizadas(result.data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados personalizados:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularMetricasPersonalizadas = (dados) => {
    const peso = parseFloat(dados.peso);
    const altura = parseFloat(dados.altura) / 100; // converter cm para metros
    const idade = parseInt(dados.idade);
    const sexo = dados.sexo.toLowerCase();
    const objetivo = dados.objetivo;
    const pesoMeta = parseFloat(dados.peso_meta);

    // Calcular TMB (Taxa Metabólica Basal)
    let tmb;
    if (sexo === 'masculino') {
      tmb = 88.362 + (13.397 * peso) + (4.799 * altura * 100) - (5.677 * idade);
    } else {
      tmb = 447.593 + (9.247 * peso) + (3.098 * altura * 100) - (4.330 * idade);
    }

    // Fator de atividade baseado no nível informado
    const fatoresAtividade = {
      'sedentário': 1.2,
      'leve': 1.375,
      'moderado': 1.55,
      'intenso': 1.725,
      'muito intenso': 1.9
    };

    const nivelAtividade = dados.nivel_atividade.toLowerCase();
    let fatorAtividade = 1.55; // padrão moderado

    for (const [nivel, fator] of Object.entries(fatoresAtividade)) {
      if (nivelAtividade.includes(nivel)) {
        fatorAtividade = fator;
        break;
      }
    }

    const caloriasDiarias = Math.round(tmb * fatorAtividade);

    // Ajustar calorias baseado no objetivo
    let caloriasObjetivo = caloriasDiarias;
    if (objetivo.toLowerCase().includes('perder')) {
      caloriasObjetivo = Math.round(caloriasDiarias * 0.85); // déficit de 15%
    } else if (objetivo.toLowerCase().includes('ganhar')) {
      caloriasObjetivo = Math.round(caloriasDiarias * 1.15); // superávit de 15%
    }

    // Calcular progresso para meta de peso
    const pesoParaPerder = peso - pesoMeta;
    const progressoPeso = Math.max(0, Math.min(100, ((peso - pesoMeta) / peso) * 100));

    // Distribuição de macronutrientes baseada no objetivo
    let macros;
    if (objetivo.toLowerCase().includes('perder')) {
      macros = {
        proteina: Math.round((caloriasObjetivo * 0.35) / 4),
        carboidrato: Math.round((caloriasObjetivo * 0.35) / 4),
        gordura: Math.round((caloriasObjetivo * 0.30) / 9)
      };
    } else if (objetivo.toLowerCase().includes('ganhar')) {
      macros = {
        proteina: Math.round((caloriasObjetivo * 0.30) / 4),
        carboidrato: Math.round((caloriasObjetivo * 0.45) / 4),
        gordura: Math.round((caloriasObjetivo * 0.25) / 9)
      };
    } else {
      macros = {
        proteina: Math.round((caloriasObjetivo * 0.25) / 4),
        carboidrato: Math.round((caloriasObjetivo * 0.50) / 4),
        gordura: Math.round((caloriasObjetivo * 0.25) / 9)
      };
    }

    // Recomendações baseadas nos hábitos
    const recomendacoes = gerarRecomendacoes(dados);

    setMetricas({
      imc: parseFloat(dados.imc),
      tmb: Math.round(tmb),
      caloriasDiarias,
      caloriasObjetivo,
      pesoAtual: peso,
      pesoMeta,
      pesoParaPerder,
      progressoPeso,
      macros,
      recomendacoes
    });
  };

  const gerarRecomendacoes = (dados) => {
    const recomendacoes = [];

    // Recomendações baseadas no sono
    if (dados.horas_sono.includes('5') || dados.horas_sono.includes('6')) {
      recomendacoes.push({
        tipo: 'sono',
        titulo: 'Melhore seu sono',
        descricao: 'Você dorme pouco. Tente dormir 7-8 horas para melhor recuperação.',
        prioridade: 'alta'
      });
    }

    // Recomendações baseadas na hidratação
    if (dados.consumo_agua.includes('Mais de 3 litros')) {
      recomendacoes.push({
        tipo: 'hidratacao',
        titulo: 'Hidratação excelente!',
        descricao: 'Continue mantendo essa excelente hidratação.',
        prioridade: 'baixa'
      });
    }

    // Recomendações baseadas no objetivo
    if (dados.objetivo.toLowerCase().includes('perder')) {
      recomendacoes.push({
        tipo: 'nutricao',
        titulo: 'Foco na queima de gordura',
        descricao: 'Mantenha déficit calórico e priorize proteínas.',
        prioridade: 'alta'
      });
    }

    // Recomendações baseadas na experiência
    if (dados.experiencia.includes('Pouca')) {
      recomendacoes.push({
        tipo: 'treino',
        titulo: 'Comece gradualmente',
        descricao: 'Foque em exercícios básicos e aumente a intensidade progressivamente.',
        prioridade: 'alta'
      });
    }

    return recomendacoes;
  };

  const getClassificacaoIMC = (imc) => {
    if (imc < 18.5) return { texto: 'Abaixo do peso', cor: 'text-blue-600' };
    if (imc < 25) return { texto: 'Peso normal', cor: 'text-green-600' };
    if (imc < 30) return { texto: 'Sobrepeso', cor: 'text-yellow-600' };
    return { texto: 'Obesidade', cor: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Carregando seus dados personalizados...</p>
        </div>
      </div>
    );
  }

  if (!dadosAnamnese) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Dados da anamnese não encontrados</p>
          <p className="text-gray-400">Complete sua anamnese para ver o dashboard personalizado</p>
        </div>
      </div>
    );
  }

  const classificacaoIMC = getClassificacaoIMC(metricas?.imc || 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Personalizado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Olá, {dadosAnamnese.nome}! 👋
          </h1>
          <p className="text-gray-400">
            Seu plano personalizado baseado na sua anamnese
          </p>
        </div>

        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* IMC */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">IMC Atual</h3>
            <div className="text-3xl font-bold mb-1">{metricas?.imc?.toFixed(1)}</div>
            <div className={`text-sm ${classificacaoIMC.cor}`}>
              {classificacaoIMC.texto}
            </div>
          </div>

          {/* Peso Atual vs Meta */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Peso</h3>
            <div className="text-3xl font-bold mb-1">{metricas?.pesoAtual}kg</div>
            <div className="text-sm text-gray-400">
              Meta: {metricas?.pesoMeta}kg
            </div>
            <div className="text-sm text-orange-500">
              {metricas?.pesoParaPerder > 0 ? 
                `${metricas.pesoParaPerder.toFixed(1)}kg para perder` : 
                'Meta atingida!'
              }
            </div>
          </div>

          {/* Calorias Diárias */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Calorias/Dia</h3>
            <div className="text-3xl font-bold mb-1">{metricas?.caloriasObjetivo}</div>
            <div className="text-sm text-gray-400">
              TMB: {metricas?.tmb} kcal
            </div>
          </div>

          {/* Nível de Atividade */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Atividade</h3>
            <div className="text-lg font-bold mb-1">{dadosAnamnese.nivel_atividade}</div>
            <div className="text-sm text-gray-400">
              {dadosAnamnese.exercicios_preferidos}
            </div>
          </div>
        </div>

        {/* Macronutrientes */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Distribuição de Macronutrientes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500 mb-1">
                {metricas?.macros?.proteina}g
              </div>
              <div className="text-sm text-gray-400">Proteína</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">
                {metricas?.macros?.carboidrato}g
              </div>
              <div className="text-sm text-gray-400">Carboidrato</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500 mb-1">
                {metricas?.macros?.gordura}g
              </div>
              <div className="text-sm text-gray-400">Gordura</div>
            </div>
          </div>
        </div>

        {/* Recomendações Personalizadas */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Recomendações Personalizadas</h3>
          <div className="space-y-4">
            {metricas?.recomendacoes?.map((rec, index) => (
              <div key={index} className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-orange-500">{rec.titulo}</h4>
                <p className="text-gray-300 text-sm">{rec.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPersonalizado;

