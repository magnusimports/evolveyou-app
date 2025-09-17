/// Tela de histórico do Sistema Full-time

import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../models/fulltime_models.dart';
import '../services/fulltime_service.dart';
import '../widgets/fulltime_activity_card.dart';

class FulltimeHistoryScreen extends StatefulWidget {
  final String type; // 'activities', 'rebalances', 'all'

  const FulltimeHistoryScreen({
    super.key,
    required this.type,
  });

  @override
  State<FulltimeHistoryScreen> createState() => _FulltimeHistoryScreenState();
}

class _FulltimeHistoryScreenState extends State<FulltimeHistoryScreen> {
  final FulltimeService _fulltimeService = FulltimeService();
  
  List<Map<String, dynamic>> _activities = [];
  List<Map<String, dynamic>> _rebalances = [];
  bool _isLoading = true;
  String _userId = 'demo_user'; // TODO: Obter do contexto de autenticação

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    try {
      setState(() => _isLoading = true);
      
      if (widget.type == 'activities' || widget.type == 'all') {
        final activitiesData = await _fulltimeService.getUserActivities(_userId);
        _activities = List<Map<String, dynamic>>.from(activitiesData['activities'] ?? []);
      }
      
      if (widget.type == 'rebalances' || widget.type == 'all') {
        final rebalancesData = await _fulltimeService.getRebalanceHistory(_userId);
        _rebalances = List<Map<String, dynamic>>.from(rebalancesData['history'] ?? []);
      }
      
      setState(() => _isLoading = false);
    } catch (e) {
      setState(() => _isLoading = false);
      _showErrorDialog('Erro ao carregar histórico: $e');
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_getTitle()),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        centerTitle: true,
        actions: [
          IconButton(
            onPressed: _loadHistory,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _buildBody(),
    );
  }

  String _getTitle() {
    switch (widget.type) {
      case 'activities':
        return 'Histórico de Atividades';
      case 'rebalances':
        return 'Histórico de Rebalanceamentos';
      case 'all':
        return 'Histórico Completo';
      default:
        return 'Histórico';
    }
  }

  Widget _buildBody() {
    return RefreshIndicator(
      onRefresh: _loadHistory,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Resumo
            _buildSummary(),
            
            const SizedBox(height: 24),
            
            // Atividades (se solicitado)
            if (widget.type == 'activities' || widget.type == 'all') ...[
              _buildActivitiesSection(),
              const SizedBox(height: 24),
            ],
            
            // Rebalanceamentos (se solicitado)
            if (widget.type == 'rebalances' || widget.type == 'all') ...[
              _buildRebalancesSection(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSummary() {
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
            Text(
              'Resumo',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                if (widget.type == 'activities' || widget.type == 'all') ...[
                  Expanded(
                    child: _buildSummaryItem(
                      'Atividades',
                      '${_activities.length}',
                      Icons.fitness_center,
                      AppColors.accent,
                    ),
                  ),
                  const SizedBox(width: 12),
                ],
                if (widget.type == 'rebalances' || widget.type == 'all') ...[
                  Expanded(
                    child: _buildSummaryItem(
                      'Rebalanceamentos',
                      '${_rebalances.length}',
                      Icons.trending_up,
                      AppColors.success,
                    ),
                  ),
                ],
              ],
            ),
            if (widget.type == 'activities' || widget.type == 'all') ...[
              const SizedBox(height: 12),
              _buildSummaryItem(
                'Total de Calorias',
                '${_calculateTotalCalories()} cal',
                Icons.local_fire_department,
                AppColors.warning,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value, IconData icon, Color color) {
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

  Widget _buildActivitiesSection() {
    if (_activities.isEmpty) {
      return _buildEmptyState(
        'Nenhuma atividade registrada',
        'Registre atividades extras para ver o histórico aqui.',
        Icons.fitness_center,
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Atividades Registradas',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        ..._activities.map((activity) => 
          FulltimeActivityCard(
            activity: activity,
            onTap: () => _showActivityDetails(activity),
          ),
        ),
      ],
    );
  }

  Widget _buildRebalancesSection() {
    if (_rebalances.isEmpty) {
      return _buildEmptyState(
        'Nenhum rebalanceamento registrado',
        'Os rebalanceamentos aparecerão aqui quando você registrar atividades extras.',
        Icons.trending_up,
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Rebalanceamentos Realizados',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        ..._rebalances.map((rebalance) => 
          _buildRebalanceCard(rebalance),
        ),
      ],
    );
  }

  Widget _buildRebalanceCard(Map<String, dynamic> rebalance) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppColors.success.withOpacity(0.1),
          child: Icon(
            Icons.trending_up,
            color: AppColors.success,
          ),
        ),
        title: Text(
          'Rebalanceamento',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              rebalance['reason'] ?? 'Rebalanceamento automático',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 4),
            Text(
              _formatTimestamp(rebalance['timestamp']),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '+${rebalance['extra_calories_burned'] ?? 0} cal',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.success,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              '${rebalance['new_calorie_target'] ?? 0} cal',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
        onTap: () => _showRebalanceDetails(rebalance),
      ),
    );
  }

  Widget _buildEmptyState(String title, String subtitle, IconData icon) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          children: [
            Icon(
              icon,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[500],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  void _showActivityDetails(Map<String, dynamic> activity) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(_getActivityDisplayName(activity['activity_type'])),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDetailRow('Duração', '${activity['duration_minutes']} minutos'),
            _buildDetailRow('Intensidade', _getIntensityDisplayName(activity['intensity'])),
            _buildDetailRow('Calorias queimadas', '${activity['calories_burned']} cal'),
            if (activity['description'] != null)
              _buildDetailRow('Descrição', activity['description']),
            _buildDetailRow('Data', _formatTimestamp(activity['timestamp'])),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Fechar'),
          ),
        ],
      ),
    );
  }

  void _showRebalanceDetails(Map<String, dynamic> rebalance) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Detalhes do Rebalanceamento'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDetailRow('Calorias originais', '${rebalance['original_calories']} cal'),
            _buildDetailRow('Calorias extras queimadas', '${rebalance['extra_calories_burned']} cal'),
            _buildDetailRow('Nova meta de calorias', '${rebalance['new_calorie_target']} cal'),
            _buildDetailRow('Fator de rebalanceamento', '${(rebalance['rebalance_factor'] * 100).toStringAsFixed(0)}%'),
            _buildDetailRow('Motivo', rebalance['reason'] ?? 'Rebalanceamento automático'),
            _buildDetailRow('Data', _formatTimestamp(rebalance['timestamp'])),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Fechar'),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  int _calculateTotalCalories() {
    return _activities.fold(0, (sum, activity) => sum + (activity['calories_burned'] ?? 0));
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
      return '${dateTime.day}/${dateTime.month}/${dateTime.year} às ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return 'Data inválida';
    }
  }
}
