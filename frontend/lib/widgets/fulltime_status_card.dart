/// Widget para exibir status do Sistema Full-time

import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../models/fulltime_models.dart';

class FulltimeStatusCard extends StatelessWidget {
  final FulltimeStatus status;
  final VoidCallback onToggle;

  const FulltimeStatusCard({
    super.key,
    required this.status,
    required this.onToggle,
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
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Status do Sistema',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Switch(
                  value: status.isActive,
                  onChanged: (_) => onToggle(),
                  activeColor: AppColors.success,
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Status visual
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: status.isActive 
                    ? AppColors.success.withOpacity(0.1)
                    : Colors.grey.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: status.isActive 
                      ? AppColors.success
                      : Colors.grey,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    status.isActive ? Icons.check_circle : Icons.pause_circle,
                    color: status.isActive ? AppColors.success : Colors.grey,
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          status.isActive ? 'Sistema Ativo' : 'Sistema Pausado',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: status.isActive ? AppColors.success : Colors.grey,
                          ),
                        ),
                        Text(
                          status.isActive 
                              ? 'Monitorando atividades e rebalanceando automaticamente'
                              : 'Sistema pausado - não há rebalanceamentos automáticos',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Informações do dia
            Row(
              children: [
                Expanded(
                  child: _buildInfoItem(
                    context,
                    'Calorias Extras Hoje',
                    '${status.dailyExtraCalories}',
                    Icons.local_fire_department,
                    AppColors.warning,
                  ),
                ),
                Expanded(
                  child: _buildInfoItem(
                    context,
                    'Rebalanceamentos',
                    '${status.totalRebalancesToday}',
                    Icons.trending_up,
                    AppColors.accent,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 12),
            
            // Meta de calorias
            Row(
              children: [
                Expanded(
                  child: _buildInfoItem(
                    context,
                    'Meta Original',
                    '${status.dailyCalorieTarget} cal',
                    Icons.flag,
                    AppColors.primary,
                  ),
                ),
                Expanded(
                  child: _buildInfoItem(
                    context,
                    'Meta Atual',
                    '${status.currentCalorieTarget} cal',
                    Icons.flag_circle,
                    AppColors.success,
                  ),
                ),
              ],
            ),
            
            if (status.lastRebalance != null) ...[
              const SizedBox(height: 12),
              Text(
                'Último rebalanceamento: ${_formatDateTime(status.lastRebalance!)}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoItem(
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

  String _formatDateTime(DateTime dateTime) {
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
  }
}
