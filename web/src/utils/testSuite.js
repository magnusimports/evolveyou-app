/**
 * SUITE DE TESTES AUTOMATIZADOS - EVOLVEYOU
 * 
 * Testa todas as funcionalidades principais da aplicação
 */

import alimentosDB from './alimentosDatabase';
import exerciciosDB from './exerciciosDatabase';
import { aplicarAlgoritmosCompensatorios } from './algoritmosCompensatorios';
import { gerarDietaPersonalizada } from './dietaPersonalizada';

class TestSuite {
  constructor() {
    this.resultados = [];
    this.totalTestes = 0;
    this.testesPassaram = 0;
  }

  // Executar todos os testes
  async executarTodos() {
    console.log('🧪 Iniciando Suite de Testes EvolveYou...');
    
    this.testarBancoDadosAlimentos();
    this.testarBancoDadosExercicios();
    this.testarAlgoritmosCompensatorios();
    this.testarGeracaoDieta();
    this.testarLocalStorage();
    this.testarValidacaoAnamnese();
    
    this.exibirResultados();
    return this.gerarRelatorio();
  }

  // Teste do banco de dados de alimentos
  testarBancoDadosAlimentos() {
    console.log('🍎 Testando Banco de Dados de Alimentos...');
    
    try {
      // Teste 1: Verificar se o banco foi carregado
      this.teste('Banco de alimentos carregado', () => {
        return alimentosDB && alimentosDB.obterTodos().length > 0;
      });

      // Teste 2: Verificar estrutura dos alimentos
      this.teste('Estrutura dos alimentos válida', () => {
        const alimentos = alimentosDB.obterTodos();
        const primeiroAlimento = alimentos[0];
        return primeiroAlimento.name && 
               primeiroAlimento.category && 
               primeiroAlimento.base_nutrition_per_100g;
      });

      // Teste 3: Busca por categoria
      this.teste('Busca por categoria funcional', () => {
        const carnes = alimentosDB.buscarPorCategoria('Carnes e derivados');
        return carnes.length > 0;
      });

      // Teste 4: Cálculo de porção
      this.teste('Cálculo de porção funcional', () => {
        const alimentos = alimentosDB.obterTodos();
        const alimento = alimentos[0];
        const porcao = alimentosDB.calcularPorcao(alimento, { proteina: 30 });
        return porcao > 0;
      });

    } catch (error) {
      this.teste('Banco de alimentos sem erros', () => false, error.message);
    }
  }

  // Teste do banco de dados de exercícios
  testarBancoDadosExercicios() {
    console.log('💪 Testando Banco de Dados de Exercícios...');
    
    try {
      // Teste 1: Verificar se o banco foi carregado
      this.teste('Banco de exercícios carregado', () => {
        return exerciciosDB && exerciciosDB.obterTodos().length > 0;
      });

      // Teste 2: Verificar estrutura dos exercícios
      this.teste('Estrutura dos exercícios válida', () => {
        const exercicios = exerciciosDB.obterTodos();
        const primeiroExercicio = exercicios[0];
        return primeiroExercicio.name && 
               primeiroExercicio.muscle && 
               primeiroExercicio.equipment;
      });

      // Teste 3: Busca por músculo
      this.teste('Busca por músculo funcional', () => {
        const peito = exerciciosDB.buscarPorMusculo('chest');
        return peito.length > 0;
      });

      // Teste 4: Filtro por equipamento
      this.teste('Filtro por equipamento funcional', () => {
        const semEquipamento = exerciciosDB.filtrarPorEquipamento('body_only');
        return semEquipamento.length > 0;
      });

    } catch (error) {
      this.teste('Banco de exercícios sem erros', () => false, error.message);
    }
  }

  // Teste dos algoritmos compensatórios
  testarAlgoritmosCompensatorios() {
    console.log('🧠 Testando Algoritmos Compensatórios...');
    
    try {
      const anamneseTeste = {
        sexo: 'Masculino',
        idade: 30,
        peso: 80,
        altura: 175,
        descricao_corpo: 'Normal ou mediano, com um pouco de gordura cobrindo os músculos',
        recursos_ergogenicos: 'Não',
        uso_suplementos: 'Sim',
        tipos_suplementos: ['Creatina', 'Whey Protein'],
        atividade_trabalho: 'Nível 2 - Leve: Fico parte do tempo sentado(a), mas caminho um pouco ou fico em pé (ex: professor, vendedor)',
        atividade_tempo_livre: 'Nível 2 - Levemente ativa: Faço tarefas domésticas leves e pequenas caminhadas',
        frequencia_treino: '4 dias por semana',
        experiencia_treino: 'Intermediário: Treino de forma consistente há mais de 6 meses a 2 anos',
        intensidade_treino: '7-8 (Intenso): Só consigo falar frases curtas',
        objetivo_principal: 'Emagrecer e perder gordura corporal (preservar massa muscular)',
        mentalidade: 'Prefiro uma abordagem equilibrada e sustentável',
        prazo_objetivo: 'Médio Prazo: Tenho um bom tempo',
        refeicoes_dia: '4 a 5 refeições (as 3 principais + lanches)'
      };

      // Teste 1: Algoritmos executam sem erro
      this.teste('Algoritmos compensatórios executam', () => {
        const resultado = aplicarAlgoritmosCompensatorios(anamneseTeste);
        return resultado && resultado.caloriasAlvo > 0;
      });

      // Teste 2: TMB calculado corretamente
      this.teste('TMB calculado corretamente', () => {
        const resultado = aplicarAlgoritmosCompensatorios(anamneseTeste);
        return resultado.tmb > 1500 && resultado.tmb < 3000;
      });

      // Teste 3: TDEE maior que TMB
      this.teste('TDEE maior que TMB', () => {
        const resultado = aplicarAlgoritmosCompensatorios(anamneseTeste);
        return resultado.tdee > resultado.tmb;
      });

      // Teste 4: Macronutrientes somam 100%
      this.teste('Macronutrientes somam 100%', () => {
        const resultado = aplicarAlgoritmosCompensatorios(anamneseTeste);
        const soma = resultado.macronutrientes.proteina.percentual + 
                    resultado.macronutrientes.carboidrato.percentual + 
                    resultado.macronutrientes.gordura.percentual;
        return Math.abs(soma - 100) <= 2; // Tolerância de 2%
      });

    } catch (error) {
      this.teste('Algoritmos compensatórios sem erros', () => false, error.message);
    }
  }

  // Teste da geração de dieta
  testarGeracaoDieta() {
    console.log('🍽️ Testando Geração de Dieta...');
    
    try {
      const anamneseTeste = {
        sexo: 'Feminino',
        idade: 25,
        peso: 65,
        altura: 165,
        objetivo_principal: 'Ganhar massa muscular (hipertrofia)',
        refeicoes_dia: '3 refeições principais (café, almoço, jantar)',
        descricao_corpo: 'Atlético(a), com músculos definidos e pouca gordura',
        recursos_ergogenicos: 'Não',
        experiencia_treino: 'Avançado: Treino de forma séria e consistente há vários anos',
        frequencia_treino: '5 dias por semana',
        intensidade_treino: '7-8 (Intenso): Só consigo falar frases curtas',
        atividade_trabalho: 'Nível 1 - Sedentário: Passo a maior parte do tempo sentado(a) (ex: escritório, motorista)',
        atividade_tempo_livre: 'Nível 3 - Ativa: Estou sempre fazendo algo, como limpeza pesada, jardinagem, passeios longos',
        mentalidade: 'Prefiro uma abordagem mais agressiva, mesmo que seja mais difícil',
        prazo_objetivo: 'Curto Prazo: O mais rápido possível'
      };

      // Teste 1: Dieta é gerada sem erro
      this.teste('Dieta gerada sem erro', () => {
        const dieta = gerarDietaPersonalizada(anamneseTeste);
        return dieta && dieta.refeicoes && dieta.refeicoes.length > 0;
      });

      // Teste 2: Número correto de refeições
      this.teste('Número correto de refeições', () => {
        const dieta = gerarDietaPersonalizada(anamneseTeste);
        return dieta.refeicoes.length === 3; // 3 refeições principais
      });

      // Teste 3: Cada refeição tem alimentos
      this.teste('Cada refeição tem alimentos', () => {
        const dieta = gerarDietaPersonalizada(anamneseTeste);
        return dieta.refeicoes.every(refeicao => refeicao.alimentos.length > 0);
      });

      // Teste 4: Informações nutricionais presentes
      this.teste('Informações nutricionais presentes', () => {
        const dieta = gerarDietaPersonalizada(anamneseTeste);
        return dieta.informacoes && 
               dieta.informacoes.caloriasAlvo > 0 && 
               dieta.informacoes.macronutrientes;
      });

    } catch (error) {
      this.teste('Geração de dieta sem erros', () => false, error.message);
    }
  }

  // Teste do localStorage
  testarLocalStorage() {
    console.log('💾 Testando LocalStorage...');
    
    try {
      // Teste 1: LocalStorage disponível
      this.teste('LocalStorage disponível', () => {
        return typeof(Storage) !== "undefined";
      });

      // Teste 2: Salvar e recuperar dados
      this.teste('Salvar e recuperar dados', () => {
        const dadosTeste = { teste: 'valor' };
        localStorage.setItem('teste_evolveyou', JSON.stringify(dadosTeste));
        const recuperado = JSON.parse(localStorage.getItem('teste_evolveyou'));
        localStorage.removeItem('teste_evolveyou');
        return recuperado && recuperado.teste === 'valor';
      });

      // Teste 3: Verificar dados da anamnese
      this.teste('Dados da anamnese salvos', () => {
        const anamnese = localStorage.getItem('dados_anamnese');
        return anamnese !== null;
      });

    } catch (error) {
      this.teste('LocalStorage sem erros', () => false, error.message);
    }
  }

  // Teste de validação da anamnese
  testarValidacaoAnamnese() {
    console.log('📋 Testando Validação da Anamnese...');
    
    try {
      // Teste 1: Validação de campos obrigatórios
      this.teste('Validação de campos obrigatórios', () => {
        const anamneseIncompleta = { sexo: 'Masculino' };
        return this.validarAnamnese(anamneseIncompleta) === false;
      });

      // Teste 2: Validação de anamnese completa
      this.teste('Validação de anamnese completa', () => {
        const anamneseCompleta = {
          sexo: 'Masculino',
          idade: 30,
          peso: 80,
          altura: 175,
          objetivo_principal: 'Emagrecer e perder gordura corporal (preservar massa muscular)',
          experiencia_treino: 'Intermediário: Treino de forma consistente há mais de 6 meses a 2 anos',
          frequencia_treino: '4 dias por semana',
          intensidade_treino: '7-8 (Intenso): Só consigo falar frases curtas',
          atividade_trabalho: 'Nível 2 - Leve: Fico parte do tempo sentado(a), mas caminho um pouco ou fico em pé (ex: professor, vendedor)',
          atividade_tempo_livre: 'Nível 2 - Levemente ativa: Faço tarefas domésticas leves e pequenas caminhadas',
          descricao_corpo: 'Normal ou mediano, com um pouco de gordura cobrindo os músculos',
          recursos_ergogenicos: 'Não',
          mentalidade: 'Prefiro uma abordagem equilibrada e sustentável',
          prazo_objetivo: 'Médio Prazo: Tenho um bom tempo',
          refeicoes_dia: '4 a 5 refeições (as 3 principais + lanches)'
        };
        return this.validarAnamnese(anamneseCompleta) === true;
      });

    } catch (error) {
      this.teste('Validação da anamnese sem erros', () => false, error.message);
    }
  }

  // Função auxiliar para validar anamnese
  validarAnamnese(anamnese) {
    const camposObrigatorios = [
      'sexo', 'idade', 'peso', 'altura', 'objetivo_principal',
      'experiencia_treino', 'frequencia_treino', 'intensidade_treino',
      'atividade_trabalho', 'atividade_tempo_livre', 'descricao_corpo',
      'recursos_ergogenicos', 'mentalidade', 'prazo_objetivo', 'refeicoes_dia'
    ];
    
    return camposObrigatorios.every(campo => anamnese[campo] !== undefined && anamnese[campo] !== '');
  }

  // Executar um teste individual
  teste(nome, funcaoTeste, erro = null) {
    this.totalTestes++;
    
    try {
      const resultado = funcaoTeste();
      if (resultado) {
        this.testesPassaram++;
        this.resultados.push({ nome, status: 'PASSOU', erro: null });
        console.log(`✅ ${nome}`);
      } else {
        this.resultados.push({ nome, status: 'FALHOU', erro: erro || 'Teste retornou false' });
        console.log(`❌ ${nome}`);
      }
    } catch (error) {
      this.resultados.push({ nome, status: 'ERRO', erro: error.message });
      console.log(`💥 ${nome} - Erro: ${error.message}`);
    }
  }

  // Exibir resultados dos testes
  exibirResultados() {
    console.log('\n📊 RESULTADOS DOS TESTES');
    console.log('========================');
    console.log(`Total de testes: ${this.totalTestes}`);
    console.log(`Testes que passaram: ${this.testesPassaram}`);
    console.log(`Testes que falharam: ${this.totalTestes - this.testesPassaram}`);
    console.log(`Taxa de sucesso: ${((this.testesPassaram / this.totalTestes) * 100).toFixed(1)}%`);
    
    const falhas = this.resultados.filter(r => r.status !== 'PASSOU');
    if (falhas.length > 0) {
      console.log('\n❌ FALHAS DETECTADAS:');
      falhas.forEach(falha => {
        console.log(`- ${falha.nome}: ${falha.erro}`);
      });
    }
  }

  // Gerar relatório detalhado
  gerarRelatorio() {
    const relatorio = {
      timestamp: new Date().toISOString(),
      totalTestes: this.totalTestes,
      testesPassaram: this.testesPassaram,
      taxaSucesso: (this.testesPassaram / this.totalTestes) * 100,
      resultados: this.resultados,
      status: this.testesPassaram === this.totalTestes ? 'SUCESSO' : 'FALHAS_DETECTADAS'
    };
    
    // Salvar relatório no localStorage
    localStorage.setItem('relatorio_testes_evolveyou', JSON.stringify(relatorio));
    
    return relatorio;
  }
}

// Exportar a classe de testes
export default TestSuite;

// Função para executar testes rapidamente
export const executarTestes = async () => {
  const suite = new TestSuite();
  return await suite.executarTodos();
};
