/// Widget para exibir atividade do Sistema Full-time

import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../services/fulltime_service.dart';

class FulltimeActivityCard extends StatelessWidget {
  final Map<String, dynamic> activity;
  final VoidCallback? onTap;

  const FulltimeActivityCard({
    super.key,
    required this.activity,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final fulltimeService = FulltimeService();
    
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              // Ícone da atividade
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: _getActivityColor(activity['activity_type']).withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    fulltimeService.getActivityEmoji(activity['activity_type']),
                    style: const TextStyle(fontSize: 20),
                  ),
                ),
              ),
              
              const SizedBox(width: 16),
              
              // Informações da atividade
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _getActivityDisplayName(activity['activity_type']),
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          Icons.timer,
                          size: 16,
                          color: Colors.grey[600],
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${activity['duration_minutes']} min',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Icon(
                          Icons.speed,
                          size: 16,
                          color: Colors.grey[600],
                        ),
                        const SizedBox(width: 4),
                        Text(
                          _getIntensityDisplayName(activity['intensity']),
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                    if (activity['description'] != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        activity['description'],
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey[600],
                          fontStyle: FontStyle.italic,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
              
              // Calorias queimadas
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${activity['calories_burned']} cal',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.warning,
                    ),
                  ),
                  Text(
                    _formatTimestamp(activity['timestamp']),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getActivityColor(String activityType) {
    switch (activityType) {
      case 'walking':
      case 'running':
      case 'cycling':
      case 'swimming':
      case 'hiking':
        return AppColors.primary; // Cardio
      case 'weight_training':
      case 'martial_arts':
        return AppColors.accent; // Strength
      case 'yoga':
      case 'pilates':
        return AppColors.info; // Flexibility
      case 'housework':
      case 'gardening':
      case 'cleaning':
      case 'shopping':
        return AppColors.secondary; // Daily
      case 'sports':
      case 'tennis':
      case 'basketball':
      case 'football':
      case 'volleyball':
        return AppColors.warning; // Sports
      default:
        return AppColors.primary;
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

  String _getIntensityDisplayName(String intensity) {
    switch (intensity) {
      case 'low':
        return 'Leve';
      case 'moderate':
        return 'Moderada';
      case 'high':
        return 'Alta';
      default:
        return intensity;
    }
  }

  String _formatTimestamp(String timestamp) {
    try {
      final dateTime = DateTime.parse(timestamp);
      final now = DateTime.now();
      final difference = now.difference(dateTime);
      
      if (difference.inMinutes < 1) {
        return 'Agora mesmo';
      } else if (difference.inMinutes < 60) {
        return '${difference.inMinutes} min atrás';
      } else if (difference.inHours < 24) {
        return '${difference.inHours} h atrás';
      } else {
        return '${difference.inDays} dias atrás';
      }
    } catch (e) {
      return 'Há pouco tempo';
    }
  }
}
