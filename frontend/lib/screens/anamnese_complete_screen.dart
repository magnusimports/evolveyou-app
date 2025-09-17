/// Tela de conclusão da anamnese

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../widgets/evo_avatar_widget.dart';

class AnamneseCompleteScreen extends StatelessWidget {
  final Map<String, dynamic> profile;

  const AnamneseCompleteScreen({
    super.key,
    required this.profile,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Theme.of(context).primaryColor.withOpacity(0.1),
              Colors.white,
            ],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Avatar do EVO
                      const EvoAvatarWidget(
                        size: 120,
                        expression: 'happy',
                      ),
                      
                      const SizedBox(height: 32),
                      
                      // Título de sucesso
                      Text(
                        'Parabéns! 🎉',
                        style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).primaryColor,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      
                      const SizedBox(height: 16),
                      
                      Text(
                        'Sua anamnese foi concluída com sucesso!',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: Colors.grey[700],
                        ),
                        textAlign: TextAlign.center,
                      ),
                      
                      const SizedBox(height: 32),
                      
                      // Resumo do perfil
                      _buildProfileSummary(context),
                      
                      const SizedBox(height: 32),
                      
                      // Mensagem do EVO
                      _buildEvoMessage(context),
                    ],
                  ),
                ),
                
                // Botões de ação
                _buildActionButtons(context),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProfileSummary(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Resumo do seu perfil:',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: Theme.of(context).primaryColor,
            ),
          ),
          
          const SizedBox(height: 16),
          
          _buildProfileItem(
            context,
            'Nome',
            profile['name'] ?? 'Não informado',
            Icons.person,
          ),
          
          if (profile['age'] != null)
            _buildProfileItem(
              context,
              'Idade',
              '${profile['age']} anos',
              Icons.cake,
            ),
          
          if (profile['height'] != null && profile['weight'] != null)
            _buildProfileItem(
              context,
              'IMC',
              '${profile['bmi'] ?? _calculateBMI(profile['height'], profile['weight'])}',
              Icons.straighten,
            ),
          
          if (profile['main_goal'] != null)
            _buildProfileItem(
              context,
              'Objetivo principal',
              _getGoalLabel(profile['main_goal']),
              Icons.flag,
            ),
          
          if (profile['activity_level'] != null)
            _buildProfileItem(
              context,
              'Nível de atividade',
              _getActivityLevelLabel(profile['activity_level']),
              Icons.fitness_center,
            ),
        ],
      ),
    );
  }

  Widget _buildProfileItem(
    BuildContext context,
    String label,
    String value,
    IconData icon,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(
            icon,
            color: Theme.of(context).primaryColor,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
                Text(
                  value,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEvoMessage(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Theme.of(context).primaryColor.withOpacity(0.3),
        ),
      ),
      child: Column(
        children: [
          Icon(
            Icons.psychology,
            color: Theme.of(context).primaryColor,
            size: 32,
          ),
          
          const SizedBox(height: 12),
          
          Text(
            'Mensagem do EVO',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: Theme.of(context).primaryColor,
            ),
          ),
          
          const SizedBox(height: 8),
          
          Text(
            'Agora que conheço você melhor, posso criar um plano personalizado para alcançar seus objetivos. Vamos começar sua jornada de transformação!',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey[700],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return Column(
      children: [
        // Botão principal
        SizedBox(
          width: double.infinity,
          height: 56,
          child: ElevatedButton(
            onPressed: () {
              // Navegar para a tela principal
              Navigator.pushNamedAndRemoveUntil(
                context,
                '/main',
                (route) => false,
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).primaryColor,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 4,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.rocket_launch),
                const SizedBox(width: 8),
                Text(
                  'Começar minha jornada',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
        
        const SizedBox(height: 16),
        
        // Botão secundário
        SizedBox(
          width: double.infinity,
          height: 48,
          child: OutlinedButton(
            onPressed: () {
              // Compartilhar perfil
              _shareProfile(context);
            },
            style: OutlinedButton.styleFrom(
              foregroundColor: Theme.of(context).primaryColor,
              side: BorderSide(
                color: Theme.of(context).primaryColor,
                width: 2,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.share),
                const SizedBox(width: 8),
                Text(
                  'Compartilhar perfil',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  String _calculateBMI(double height, double weight) {
    final bmi = weight / ((height / 100) * (height / 100));
    return bmi.toStringAsFixed(1);
  }

  String _getGoalLabel(String goal) {
    switch (goal) {
      case 'perder_peso':
        return 'Perder peso';
      case 'ganhar_massa':
        return 'Ganhar massa muscular';
      case 'manter_peso':
        return 'Manter peso atual';
      case 'melhorar_condicionamento':
        return 'Melhorar condicionamento físico';
      default:
        return goal;
    }
  }

  String _getActivityLevelLabel(String level) {
    switch (level) {
      case 'sedentario':
        return 'Sedentário';
      case 'leve':
        return 'Leve';
      case 'moderado':
        return 'Moderado';
      case 'intenso':
        return 'Intenso';
      case 'muito_intenso':
        return 'Muito intenso';
      default:
        return level;
    }
  }

  void _shareProfile(BuildContext context) {
    final profileText = _generateProfileText();
    
    Clipboard.setData(ClipboardData(text: profileText));
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Perfil copiado para a área de transferência!'),
        backgroundColor: Colors.green,
      ),
    );
  }

  String _generateProfileText() {
    final buffer = StringBuffer();
    buffer.writeln('🏃‍♂️ Meu Perfil EvolveYou');
    buffer.writeln('========================');
    buffer.writeln();
    
    if (profile['name'] != null) {
      buffer.writeln('👤 Nome: ${profile['name']}');
    }
    
    if (profile['age'] != null) {
      buffer.writeln('🎂 Idade: ${profile['age']} anos');
    }
    
    if (profile['height'] != null && profile['weight'] != null) {
      buffer.writeln('📏 Altura: ${profile['height']} cm');
      buffer.writeln('⚖️ Peso: ${profile['weight']} kg');
      buffer.writeln('📊 IMC: ${profile['bmi'] ?? _calculateBMI(profile['height'], profile['weight'])}');
    }
    
    if (profile['main_goal'] != null) {
      buffer.writeln('🎯 Objetivo: ${_getGoalLabel(profile['main_goal'])}');
    }
    
    if (profile['activity_level'] != null) {
      buffer.writeln('💪 Atividade: ${_getActivityLevelLabel(profile['activity_level'])}');
    }
    
    buffer.writeln();
    buffer.writeln('🚀 Comece sua jornada de transformação com o EvolveYou!');
    
    return buffer.toString();
  }
}
