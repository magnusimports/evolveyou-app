/// Serviço para gerenciar anamnese detalhada

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/anamnese_models.dart';
import 'api_service.dart';

class AnamneseService {
  static const String _baseUrl = 'http://localhost:8000/api/v2/anamnese';
  
  final ApiService _apiService = ApiService();

  /// Carrega todas as perguntas da anamnese
  Future<List<AnamneseQuestion>> loadQuestions() async {
    try {
      // Tentar carregar da API primeiro
      final response = await _apiService.get('/anamnese/questions');
      if (response['success'] == true) {
        final questionsData = response['questions'] as List;
        return questionsData
            .map((q) => AnamneseQuestion.fromJson(q))
            .toList();
      }
    } catch (e) {
      print('Erro ao carregar perguntas da API: $e');
    }

    // Fallback para perguntas locais
    return _getLocalQuestions();
  }

  /// Carrega categorias da anamnese
  Future<List<AnamneseCategory>> loadCategories() async {
    try {
      final response = await _apiService.get('/anamnese/categories');
      if (response['success'] == true) {
        final categoriesData = response['categories'] as List;
        return categoriesData
            .map((c) => AnamneseCategory.fromJson(c))
            .toList();
      }
    } catch (e) {
      print('Erro ao carregar categorias da API: $e');
    }

    // Fallback para categorias locais
    return _getLocalCategories();
  }

  /// Valida uma resposta
  Future<AnamneseValidation> validateAnswer(int questionId, dynamic answer) async {
    try {
      final response = await _apiService.post('/anamnese/validate', {
        'question_id': questionId,
        'answer': answer,
      });
      
      if (response['success'] == true) {
        return AnamneseValidation.fromJson(response['validation']);
      }
    } catch (e) {
      print('Erro ao validar resposta na API: $e');
    }

    // Fallback para validação local
    return _validateAnswerLocally(questionId, answer);
  }

  /// Submete a anamnese completa
  Future<Map<String, dynamic>> submitAnamnese(List<AnamneseAnswer> answers) async {
    try {
      final response = await _apiService.post('/anamnese/submit', {
        'answers': answers.map((a) => a.toJson()).toList(),
      });
      
      if (response['success'] == true) {
        return response;
      }
    } catch (e) {
      print('Erro ao submeter anamnese na API: $e');
    }

    // Fallback para processamento local
    return _processAnamneseLocally(answers);
  }

  /// Perguntas locais como fallback
  List<AnamneseQuestion> _getLocalQuestions() {
    return [
      // DADOS PESSOAIS
      AnamneseQuestion(
        id: 1,
        category: 'dados_pessoais',
        question: 'Qual é o seu nome completo?',
        type: 'text',
        required: true,
        placeholder: 'Digite seu nome completo',
      ),
      AnamneseQuestion(
        id: 2,
        category: 'dados_pessoais',
        question: 'Qual é a sua idade?',
        type: 'number',
        required: true,
        unit: 'anos',
        placeholder: 'Digite sua idade',
      ),
      AnamneseQuestion(
        id: 3,
        category: 'dados_pessoais',
        question: 'Qual é o seu sexo biológico?',
        type: 'select',
        required: true,
        options: [
          AnamneseOption(value: 'masculino', label: 'Masculino'),
          AnamneseOption(value: 'feminino', label: 'Feminino'),
        ],
      ),
      
      // ANTROPOMETRIA
      AnamneseQuestion(
        id: 4,
        category: 'antropometria',
        question: 'Qual é a sua altura?',
        type: 'number',
        required: true,
        unit: 'cm',
        placeholder: 'Digite sua altura em centímetros',
        helpText: 'Exemplo: 175',
      ),
      AnamneseQuestion(
        id: 5,
        category: 'antropometria',
        question: 'Qual é o seu peso atual?',
        type: 'number',
        required: true,
        unit: 'kg',
        placeholder: 'Digite seu peso em quilogramas',
        helpText: 'Exemplo: 70.5',
      ),
      AnamneseQuestion(
        id: 6,
        category: 'antropometria',
        question: 'Qual é o seu peso ideal/meta?',
        type: 'number',
        required: true,
        unit: 'kg',
        placeholder: 'Digite seu peso meta',
        helpText: 'Peso que você gostaria de alcançar',
      ),
      
      // OBJETIVOS
      AnamneseQuestion(
        id: 7,
        category: 'objetivos',
        question: 'Qual é o seu principal objetivo?',
        type: 'select',
        required: true,
        options: [
          AnamneseOption(value: 'perder_peso', label: 'Perder peso'),
          AnamneseOption(value: 'ganhar_massa', label: 'Ganhar massa muscular'),
          AnamneseOption(value: 'manter_peso', label: 'Manter peso atual'),
          AnamneseOption(value: 'melhorar_condicionamento', label: 'Melhorar condicionamento físico'),
        ],
      ),
      AnamneseQuestion(
        id: 8,
        category: 'objetivos',
        question: 'Em quanto tempo você gostaria de alcançar seu objetivo?',
        type: 'select',
        required: true,
        options: [
          AnamneseOption(value: '1_mes', label: '1 mês'),
          AnamneseOption(value: '3_meses', label: '3 meses'),
          AnamneseOption(value: '6_meses', label: '6 meses'),
          AnamneseOption(value: '1_ano', label: '1 ano'),
          AnamneseOption(value: 'mais_1_ano', label: 'Mais de 1 ano'),
        ],
      ),
      
      // ATIVIDADE FÍSICA
      AnamneseQuestion(
        id: 9,
        category: 'atividade_fisica',
        question: 'Qual é o seu nível de atividade física atual?',
        type: 'select',
        required: true,
        options: [
          AnamneseOption(value: 'sedentario', label: 'Sedentário (pouco ou nenhum exercício)'),
          AnamneseOption(value: 'leve', label: 'Leve (exercício leve 1-3 dias/semana)'),
          AnamneseOption(value: 'moderado', label: 'Moderado (exercício moderado 3-5 dias/semana)'),
          AnamneseOption(value: 'intenso', label: 'Intenso (exercício intenso 6-7 dias/semana)'),
          AnamneseOption(value: 'muito_intenso', label: 'Muito intenso (exercício muito intenso, trabalho físico)'),
        ],
      ),
      AnamneseQuestion(
        id: 10,
        category: 'atividade_fisica',
        question: 'Quantas vezes por semana você pratica exercícios?',
        type: 'number',
        required: true,
        unit: 'vezes/semana',
        placeholder: 'Digite o número de vezes',
        helpText: 'Exemplo: 3',
      ),
      AnamneseQuestion(
        id: 11,
        category: 'atividade_fisica',
        question: 'Qual é a duração média dos seus treinos?',
        type: 'select',
        required: true,
        options: [
          AnamneseOption(value: 'menos_30min', label: 'Menos de 30 minutos'),
          AnamneseOption(value: '30_60min', label: '30-60 minutos'),
          AnamneseOption(value: '60_90min', label: '60-90 minutos'),
          AnamneseOption(value: 'mais_90min', label: 'Mais de 90 minutos'),
        ],
      ),
      
      // ALIMENTAÇÃO
      AnamneseQuestion(
        id: 12,
        category: 'alimentacao',
        question: 'Como você avalia sua alimentação atual?',
        type: 'select',
        required: true,
        options: [
          AnamneseOption(value: 'muito_ruim', label: 'Muito ruim'),
          AnamneseOption(value: 'ruim', label: 'Ruim'),
          AnamneseOption(value: 'regular', label: 'Regular'),
          AnamneseOption(value: 'boa', label: 'Boa'),
          AnamneseOption(value: 'muito_boa', label: 'Muito boa'),
        ],
      ),
      AnamneseQuestion(
        id: 13,
        category: 'alimentacao',
        question: 'Quantas refeições você faz por dia?',
        type: 'number',
        required: true,
        unit: 'refeições',
        placeholder: 'Digite o número de refeições',
        helpText: 'Exemplo: 5',
      ),
      AnamneseQuestion(
        id: 14,
        category: 'alimentacao',
        question: 'Você tem alguma restrição alimentar?',
        type: 'select',
        required: true,
        options: [
          AnamneseOption(value: 'nenhuma', label: 'Nenhuma'),
          AnamneseOption(value: 'vegetariano', label: 'Vegetariano'),
          AnamneseOption(value: 'vegano', label: 'Vegano'),
          AnamneseOption(value: 'sem_gluten', label: 'Sem glúten'),
          AnamneseOption(value: 'sem_lactose', label: 'Sem lactose'),
          AnamneseOption(value: 'outras', label: 'Outras'),
        ],
      ),
      
      // SAÚDE
      AnamneseQuestion(
        id: 15,
        category: 'saude',
        question: 'Você tem alguma condição de saúde?',
        type: 'select',
        required: true,
        options: [
          AnamneseOption(value: 'nenhuma', label: 'Nenhuma'),
          AnamneseOption(value: 'diabetes', label: 'Diabetes'),
          AnamneseOption(value: 'hipertensao', label: 'Hipertensão'),
          AnamneseOption(value: 'problemas_cardiacos', label: 'Problemas cardíacos'),
          AnamneseOption(value: 'problemas_articulares', label: 'Problemas articulares'),
          AnamneseOption(value: 'outras', label: 'Outras'),
        ],
      ),
      AnamneseQuestion(
        id: 16,
        category: 'saude',
        question: 'Você toma algum medicamento regularmente?',
        type: 'select',
        required: true,
        options: [
          AnamneseOption(value: 'nao', label: 'Não'),
          AnamneseOption(value: 'sim', label: 'Sim'),
        ],
      ),
      
      // SONO
      AnamneseQuestion(
        id: 17,
        category: 'sono',
        question: 'Quantas horas você dorme por noite?',
        type: 'number',
        required: true,
        unit: 'horas',
        placeholder: 'Digite o número de horas',
        helpText: 'Exemplo: 8',
      ),
      AnamneseQuestion(
        id: 18,
        category: 'sono',
        question: 'Como você avalia a qualidade do seu sono?',
        type: 'select',
        required: true,
        options: [
          AnamneseOption(value: 'muito_ruim', label: 'Muito ruim'),
          AnamneseOption(value: 'ruim', label: 'Ruim'),
          AnamneseOption(value: 'regular', label: 'Regular'),
          AnamneseOption(value: 'boa', label: 'Boa'),
          AnamneseOption(value: 'muito_boa', label: 'Muito boa'),
        ],
      ),
      
      // ESTRESSE
      AnamneseQuestion(
        id: 19,
        category: 'estresse',
        question: 'Como você avalia seu nível de estresse?',
        type: 'select',
        required: true,
        options: [
          AnamneseOption(value: 'muito_baixo', label: 'Muito baixo'),
          AnamneseOption(value: 'baixo', label: 'Baixo'),
          AnamneseOption(value: 'moderado', label: 'Moderado'),
          AnamneseOption(value: 'alto', label: 'Alto'),
          AnamneseOption(value: 'muito_alto', label: 'Muito alto'),
        ],
      ),
      AnamneseQuestion(
        id: 20,
        category: 'estresse',
        question: 'Você pratica alguma técnica de relaxamento?',
        type: 'select',
        required: true,
        options: [
          AnamneseOption(value: 'nao', label: 'Não'),
          AnamneseOption(value: 'meditacao', label: 'Meditação'),
          AnamneseOption(value: 'yoga', label: 'Yoga'),
          AnamneseOption(value: 'respiratorio', label: 'Exercícios respiratórios'),
          AnamneseOption(value: 'outras', label: 'Outras'),
        ],
      ),
      
      // MOTIVAÇÃO
      AnamneseQuestion(
        id: 21,
        category: 'motivacao',
        question: 'O que mais te motiva a cuidar da sua saúde?',
        type: 'select',
        required: true,
        options: [
          AnamneseOption(value: 'aparencia', label: 'Aparência física'),
          AnamneseOption(value: 'saude', label: 'Saúde e bem-estar'),
          AnamneseOption(value: 'energia', label: 'Mais energia'),
          AnamneseOption(value: 'confianca', label: 'Mais confiança'),
          AnamneseOption(value: 'qualidade_vida', label: 'Melhor qualidade de vida'),
        ],
      ),
      AnamneseQuestion(
        id: 22,
        category: 'motivacao',
        question: 'Você já tentou mudar seus hábitos antes?',
        type: 'select',
        required: true,
        options: [
          AnamneseOption(value: 'nao', label: 'Não, é a primeira vez'),
          AnamneseOption(value: 'sim_sucesso', label: 'Sim, com sucesso'),
          AnamneseOption(value: 'sim_parcial', label: 'Sim, com sucesso parcial'),
          AnamneseOption(value: 'sim_sem_sucesso', label: 'Sim, mas sem sucesso'),
        ],
      ),
    ];
  }

  /// Categorias locais como fallback
  List<AnamneseCategory> _getLocalCategories() {
    return [
      AnamneseCategory(
        key: 'dados_pessoais',
        name: 'Dados Pessoais',
        icon: 'person',
        description: 'Informações básicas sobre você',
        order: 1,
      ),
      AnamneseCategory(
        key: 'antropometria',
        name: 'Antropometria',
        icon: 'straighten',
        description: 'Medidas corporais e peso',
        order: 2,
      ),
      AnamneseCategory(
        key: 'objetivos',
        name: 'Objetivos',
        icon: 'flag',
        description: 'Seus objetivos de saúde e fitness',
        order: 3,
      ),
      AnamneseCategory(
        key: 'atividade_fisica',
        name: 'Atividade Física',
        icon: 'fitness_center',
        description: 'Seu nível de atividade física atual',
        order: 4,
      ),
      AnamneseCategory(
        key: 'alimentacao',
        name: 'Alimentação',
        icon: 'restaurant',
        description: 'Seus hábitos alimentares',
        order: 5,
      ),
      AnamneseCategory(
        key: 'saude',
        name: 'Saúde',
        icon: 'health_and_safety',
        description: 'Condições de saúde e medicamentos',
        order: 6,
      ),
      AnamneseCategory(
        key: 'sono',
        name: 'Sono',
        icon: 'bedtime',
        description: 'Qualidade e duração do sono',
        order: 7,
      ),
      AnamneseCategory(
        key: 'estresse',
        name: 'Estresse',
        icon: 'psychology',
        description: 'Nível de estresse e técnicas de relaxamento',
        order: 8,
      ),
      AnamneseCategory(
        key: 'motivacao',
        name: 'Motivação',
        icon: 'emoji_events',
        description: 'O que te motiva a cuidar da saúde',
        order: 9,
      ),
    ];
  }

  /// Validação local como fallback
  AnamneseValidation _validateAnswerLocally(int questionId, dynamic answer) {
    if (answer == null || answer.toString().trim().isEmpty) {
      return const AnamneseValidation(
        valid: false,
        message: 'Este campo é obrigatório',
      );
    }

    if (answer is String && answer.length < 2) {
      return const AnamneseValidation(
        valid: false,
        message: 'Digite pelo menos 2 caracteres',
      );
    }

    if (answer is num && answer <= 0) {
      return const AnamneseValidation(
        valid: false,
        message: 'Digite um número válido maior que zero',
      );
    }

    return const AnamneseValidation(valid: true);
  }

  /// Processamento local da anamnese como fallback
  Map<String, dynamic> _processAnamneseLocally(List<AnamneseAnswer> answers) {
    final profile = <String, dynamic>{};
    
    for (final answer in answers) {
      switch (answer.questionId) {
        case 1:
          profile['name'] = answer.answer;
          break;
        case 2:
          profile['age'] = answer.answer;
          break;
        case 3:
          profile['gender'] = answer.answer;
          break;
        case 4:
          profile['height'] = answer.answer;
          break;
        case 5:
          profile['weight'] = answer.answer;
          break;
        case 6:
          profile['target_weight'] = answer.answer;
          break;
        case 7:
          profile['main_goal'] = answer.answer;
          break;
        case 8:
          profile['goal_timeline'] = answer.answer;
          break;
        case 9:
          profile['activity_level'] = answer.answer;
          break;
        case 10:
          profile['workouts_per_week'] = answer.answer;
          break;
        case 11:
          profile['workout_duration'] = answer.answer;
          break;
        case 12:
          profile['diet_quality'] = answer.answer;
          break;
        case 13:
          profile['meals_per_day'] = answer.answer;
          break;
        case 14:
          profile['dietary_restrictions'] = answer.answer;
          break;
        case 15:
          profile['health_conditions'] = answer.answer;
          break;
        case 16:
          profile['medications'] = answer.answer;
          break;
        case 17:
          profile['sleep_hours'] = answer.answer;
          break;
        case 18:
          profile['sleep_quality'] = answer.answer;
          break;
        case 19:
          profile['stress_level'] = answer.answer;
          break;
        case 20:
          profile['relaxation_techniques'] = answer.answer;
          break;
        case 21:
          profile['motivation'] = answer.answer;
          break;
        case 22:
          profile['previous_attempts'] = answer.answer;
          break;
      }
    }

    // Calcular IMC
    if (profile['height'] != null && profile['weight'] != null) {
      final height = profile['height'] as num;
      final weight = profile['weight'] as num;
      final bmi = weight / ((height / 100) * (height / 100));
      profile['bmi'] = bmi.toStringAsFixed(1);
    }

    return {
      'success': true,
      'profile': profile,
      'message': 'Anamnese processada com sucesso',
    };
  }
}
