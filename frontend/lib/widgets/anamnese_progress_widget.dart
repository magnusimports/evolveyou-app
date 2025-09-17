/// Widget para exibir progresso da anamnese

import 'package:flutter/material.dart';
import '../models/anamnese_models.dart';

class AnamneseProgressWidget extends StatelessWidget {
  final AnamneseProgress progress;
  final Function(int)? onQuestionTap;

  const AnamneseProgressWidget({
    super.key,
    required this.progress,
    this.onQuestionTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Theme.of(context).primaryColor.withOpacity(0.1),
        border: Border(
          bottom: BorderSide(
            color: Colors.grey[300]!,
            width: 1,
          ),
        ),
      ),
      child: Column(
        children: [
          // Barra de progresso
          Row(
            children: [
              Expanded(
                child: LinearProgressIndicator(
                  value: progress.progress,
                  backgroundColor: Colors.grey[300],
                  valueColor: AlwaysStoppedAnimation<Color>(
                    Theme.of(context).primaryColor,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Text(
                '${(progress.progress * 100).toInt()}%',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).primaryColor,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 12),
          
          // Informações do progresso
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Pergunta ${progress.currentQuestion} de ${progress.totalQuestions}',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
              if (progress.isComplete)
                Row(
                  children: [
                    Icon(
                      Icons.check_circle,
                      color: Colors.green[600],
                      size: 20,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Completo',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.green[600],
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
            ],
          ),
          
          // Indicadores de perguntas (se houver callback)
          if (onQuestionTap != null) ...[
            const SizedBox(height: 16),
            _buildQuestionIndicators(context),
          ],
        ],
      ),
    );
  }

  Widget _buildQuestionIndicators(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: List.generate(
          progress.totalQuestions,
          (index) {
            final questionNumber = index + 1;
            final isCurrentQuestion = questionNumber == progress.currentQuestion;
            final isAnswered = questionNumber < progress.currentQuestion;
            
            return GestureDetector(
              onTap: () => onQuestionTap!(index),
              child: Container(
                margin: const EdgeInsets.only(right: 8),
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: isCurrentQuestion
                      ? Theme.of(context).primaryColor
                      : isAnswered
                          ? Colors.green[600]
                          : Colors.grey[300],
                  shape: BoxShape.circle,
                  border: isCurrentQuestion
                      ? Border.all(
                          color: Theme.of(context).primaryColor,
                          width: 2,
                        )
                      : null,
                ),
                child: Center(
                  child: isAnswered
                      ? Icon(
                          Icons.check,
                          color: Colors.white,
                          size: 16,
                        )
                      : Text(
                          questionNumber.toString(),
                          style: TextStyle(
                            color: isCurrentQuestion
                                ? Colors.white
                                : Colors.grey[600],
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
