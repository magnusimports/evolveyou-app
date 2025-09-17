/// Widget para exibir estatísticas do Sistema Full-time

import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class FulltimeStatsCard extends StatelessWidget {
  final String title;
  final Map<String, dynamic> stats;
  final IconData icon;
  final Color color;

  const FulltimeStatsCard({
    super.key,
    required this.title,
    required this.stats,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  icon,
                  color: color,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Estatísticas principais
            Row(
              children: [
                Expanded(
                  child: _buildStatItem(
                    context,
                    'Atividades',
                    '${stats['activities'] ?? 0}',
                    Icons.fitness_center,
                    AppColors.accent,
                  ),
                ),
                Expanded(
                  child: _buildStatItem(
                    context,
                    'Calorias Extras',
                    '${stats['extra_calories'] ?? stats['total_calories'] ?? 0}',
                    Icons.local_fire_department,
                    AppColors.warning,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 12),
            
            // Estatísticas secundárias
            Row(
              children: [
                Expanded(
                  child: _buildStatItem(
                    context,
                    'Rebalanceamentos',
                    '${stats['rebalances'] ?? 0}',
                    Icons.trending_up,
                    AppColors.success,
                  ),
                ),
                if (stats['average_daily'] != null)
                  Expanded(
                    child: _buildStatItem(
                      context,
                      'Média Diária',
                      '${stats['average_daily']!.toStringAsFixed(0)} cal',
                      Icons.timeline,
                      AppColors.info,
                    ),
                  ),
              ],
            ),
            
            // Atividades mais comuns (se disponível)
            if (stats['most_common'] != null && (stats['most_common'] as List).isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                'Atividades Mais Comuns',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              ...(stats['most_common'] as List).take(3).map((item) => 
                _buildMostCommonItem(context, item),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(
    BuildContext context,
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            color: color,
            size: 20,
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildMostCommonItem(BuildContext context, List<dynamic> item) {
    if (item.length < 2) return const SizedBox.shrink();
    
    final activityType = item[0] as String;
    final count = item[1] as int;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Text(
            _getActivityEmoji(activityType),
            style: const TextStyle(fontSize: 16),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              _getActivityDisplayName(activityType),
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Text(
            '$countx',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  String _getActivityEmoji(String activityType) {
    switch (activityType) {
      case 'walking':
        return '🚶‍♂️';
      case 'stairs':
        return '🪜';
      case 'housework':
        return '🧹';
      case 'sports':
        return '⚽';
      case 'cycling':
        return '🚴‍♂️';
      case 'running':
        return '🏃‍♂️';
      case 'dancing':
        return '💃';
      case 'gardening':
        return '🌱';
      case 'cleaning':
        return '🧽';
      case 'shopping':
        return '🛒';
      case 'yoga':
        return '🧘‍♀️';
      case 'swimming':
        return '🏊‍♂️';
      case 'weight_training':
        return '🏋️‍♂️';
      case 'hiking':
        return '🥾';
      case 'tennis':
        return '🎾';
      case 'basketball':
        return '🏀';
      case 'football':
        return '⚽';
      case 'volleyball':
        return '🏐';
      case 'martial_arts':
        return '🥋';
      case 'pilates':
        return '🤸‍♀️';
      default:
        return '🏃‍♂️';
    }
  }

  String _getActivityDisplayName(String activityType) {
    switch (activityType) {
      case 'walking':
        return 'Caminhada';
      case 'stairs':
        return 'Subir escadas';
      case 'housework':
        return 'Tarefas domésticas';
      case 'sports':
        return 'Esportes';
      case 'cycling':
        return 'Ciclismo';
      case 'running':
        return 'Corrida';
      case 'dancing':
        return 'Dança';
      case 'gardening':
        return 'Jardinagem';
      case 'cleaning':
        return 'Limpeza';
      case 'shopping':
        return 'Compras';
      case 'yoga':
        return 'Yoga';
      case 'swimming':
        return 'Natação';
      case 'weight_training':
        return 'Musculação';
      case 'hiking':
        return 'Caminhada na natureza';
      case 'tennis':
        return 'Tênis';
      case 'basketball':
        return 'Basquete';
      case 'football':
        return 'Futebol';
      case 'volleyball':
        return 'Vôlei';
      case 'martial_arts':
        return 'Artes marciais';
      case 'pilates':
        return 'Pilates';
      default:
        return activityType;
    }
  }
}
