/// Tela principal de anamnese detalhada

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/anamnese_models.dart';
import '../services/anamnese_service.dart';
import '../widgets/anamnese_question_widget.dart';
import '../widgets/anamnese_progress_widget.dart';
import '../widgets/anamnese_category_widget.dart';
import 'anamnese_complete_screen.dart';

class AnamneseScreen extends StatefulWidget {
  const AnamneseScreen({super.key});

  @override
  State<AnamneseScreen> createState() => _AnamneseScreenState();
}

class _AnamneseScreenState extends State<AnamneseScreen> {
  final AnamneseService _anamneseService = AnamneseService();
  
  List<AnamneseQuestion> _questions = [];
  List<AnamneseCategory> _categories = [];
  Map<int, dynamic> _answers = {};
  Map<int, AnamneseValidation> _validations = {};
  
  int _currentQuestionIndex = 0;
  bool _isLoading = true;
  bool _isSubmitting = false;
  bool _isValidating = false;

  @override
  void initState() {
    super.initState();
    _loadAnamneseData();
  }

  Future<void> _loadAnamneseData() async {
    try {
      setState(() => _isLoading = true);
      
      final questions = await _anamneseService.loadQuestions();
      final categories = await _anamneseService.loadCategories();
      
      setState(() {
        _questions = questions;
        _categories = categories;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      _showErrorDialog('Erro ao carregar dados da anamnese: $e');
    }
  }

  Future<void> _validateAndNext() async {
    if (_currentQuestionIndex >= _questions.length) return;
    
    final currentQuestion = _questions[_currentQuestionIndex];
    final answer = _answers[currentQuestion.id];
    
    if (answer == null && currentQuestion.required) {
      _showErrorDialog('Por favor, responda esta pergunta antes de continuar.');
      return;
    }
    
    setState(() => _isValidating = true);
    
    try {
      final validation = await _anamneseService.validateAnswer(
        currentQuestion.id,
        answer,
      );
      
      setState(() {
        _validations[currentQuestion.id] = validation;
        _isValidating = false;
      });
      
      if (validation.valid) {
        _nextQuestion();
      } else {
        _showErrorDialog(validation.message ?? 'Resposta inválida');
      }
    } catch (e) {
      setState(() => _isValidating = false);
      _showErrorDialog('Erro ao validar resposta: $e');
    }
  }

  void _nextQuestion() {
    if (_currentQuestionIndex < _questions.length - 1) {
      setState(() => _currentQuestionIndex++);
    } else {
      _submitAnamnese();
    }
  }

  void _previousQuestion() {
    if (_currentQuestionIndex > 0) {
      setState(() => _currentQuestionIndex--);
    }
  }

  void _goToQuestion(int index) {
    if (index >= 0 && index < _questions.length) {
      setState(() => _currentQuestionIndex = index);
    }
  }

  Future<void> _submitAnamnese() async {
    setState(() => _isSubmitting = true);
    
    try {
      final answers = _answers.entries
          .map((e) => AnamneseAnswer(
                questionId: e.key,
                answer: e.value,
                timestamp: DateTime.now(),
              ))
          .toList();
      
      final result = await _anamneseService.submitAnamnese(answers);
      
      if (result['success'] == true) {
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => AnamneseCompleteScreen(
                profile: result['profile'],
              ),
            ),
          );
        }
      } else {
        _showErrorDialog(result['message'] ?? 'Erro ao submeter anamnese');
      }
    } catch (e) {
      _showErrorDialog('Erro ao submeter anamnese: $e');
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Erro'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _onAnswerChanged(int questionId, dynamic answer) {
    setState(() {
      _answers[questionId] = answer;
      _validations.remove(questionId); // Limpar validação anterior
    });
  }

  AnamneseProgress _getProgress() {
    final answeredQuestions = _answers.length;
    final totalQuestions = _questions.length;
    final progress = totalQuestions > 0 ? answeredQuestions / totalQuestions : 0.0;
    
    final currentCategory = _questions.isNotEmpty
        ? _questions[_currentQuestionIndex].category
        : '';
    
    return AnamneseProgress(
      currentQuestion: _currentQuestionIndex + 1,
      totalQuestions: totalQuestions,
      progress: progress,
      currentCategory: currentCategory,
      isComplete: answeredQuestions == totalQuestions,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (_questions.isEmpty) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Anamnese'),
          centerTitle: true,
        ),
        body: const Center(
          child: Text('Nenhuma pergunta encontrada'),
        ),
      );
    }

    final currentQuestion = _questions[_currentQuestionIndex];
    final progress = _getProgress();
    final currentCategory = _categories.firstWhere(
      (c) => c.key == currentQuestion.category,
      orElse: () => AnamneseCategory(
        key: currentQuestion.category,
        name: currentQuestion.category,
        icon: 'help',
        description: '',
        order: 0,
      ),
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Anamnese Detalhada'),
        centerTitle: true,
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          if (_isSubmitting)
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          // Progresso
          AnamneseProgressWidget(
            progress: progress,
            onQuestionTap: _goToQuestion,
          ),
          
          // Categoria atual
          AnamneseCategoryWidget(
            category: currentCategory,
            isActive: true,
          ),
          
          // Pergunta atual
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Número da pergunta
                  Text(
                    'Pergunta ${_currentQuestionIndex + 1} de ${_questions.length}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 8),
                  
                  // Pergunta
                  Text(
                    currentQuestion.question,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  
                  if (currentQuestion.helpText != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      currentQuestion.helpText!,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[600],
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                  
                  const SizedBox(height: 24),
                  
                  // Widget da pergunta
                  AnamneseQuestionWidget(
                    question: currentQuestion,
                    answer: _answers[currentQuestion.id],
                    validation: _validations[currentQuestion.id],
                    onAnswerChanged: (answer) => _onAnswerChanged(currentQuestion.id, answer),
                  ),
                  
                  const SizedBox(height: 32),
                  
                  // Botões de navegação
                  Row(
                    children: [
                      if (_currentQuestionIndex > 0)
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _previousQuestion,
                            child: const Text('Anterior'),
                          ),
                        ),
                      
                      if (_currentQuestionIndex > 0) const SizedBox(width: 16),
                      
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _isValidating ? null : _validateAndNext,
                          child: _isValidating
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : Text(_currentQuestionIndex == _questions.length - 1
                                  ? 'Finalizar'
                                  : 'Próxima'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
