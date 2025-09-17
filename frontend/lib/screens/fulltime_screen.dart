/// Tela principal do Sistema Full-time

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import '../models/fulltime_models.dart';
import '../services/fulltime_service.dart';
import '../widgets/fulltime_activity_card.dart';
import '../widgets/fulltime_status_card.dart';
import '../widgets/fulltime_stats_card.dart';
import 'fulltime_register_activity_screen.dart';
import 'fulltime_history_screen.dart';

class FulltimeScreen extends StatefulWidget {
  const FulltimeScreen({super.key});

  @override
  State<FulltimeScreen> createState() => _FulltimeScreenState();
}

class _FulltimeScreenState extends State<FulltimeScreen> {
  final FulltimeService _fulltimeService = FulltimeService();
  
  FulltimeDashboard? _dashboard;
  bool _isLoading = true;
  String _userId = 'demo_user'; // TODO: Obter do contexto de autenticação

  @override
  void initState() {
    super.initState();
    _loadDashboard();
  }

  Future<void> _loadDashboard() async {
    try {
      setState(() => _isLoading = true);
      final dashboard = await _fulltimeService.getDashboard(_userId);
      setState(() {
        _dashboard = dashboard;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      _showErrorDialog('Erro ao carregar dashboard: $e');
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
        title: const Text('Sistema Full-time'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        centerTitle: true,
        actions: [
          IconButton(
            onPressed: _loadDashboard,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _dashboard == null
              ? const Center(child: Text('Erro ao carregar dados'))
              : _buildBody(),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _navigateToRegisterActivity(),
        backgroundColor: AppColors.accent,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Registrar Atividade'),
      ),
    );
  }

  Widget _buildBody() {
    return RefreshIndicator(
      onRefresh: _loadDashboard,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status do sistema
            FulltimeStatusCard(
              status: _dashboard!.status,
              onToggle: _toggleStatus,
            ),
            
            const SizedBox(height: 16),
            
            // Estatísticas de hoje
            FulltimeStatsCard(
              title: 'Hoje',
              stats: _dashboard!.today,
              icon: Icons.today,
              color: AppColors.primary,
            ),
            
            const SizedBox(height: 16),
            
            // Estatísticas da semana
            FulltimeStatsCard(
              title: 'Esta Semana',
              stats: _dashboard!.week,
              icon: Icons.calendar_view_week,
              color: AppColors.secondary,
            ),
            
            const SizedBox(height: 24),
            
            // Atividades recentes
            _buildRecentActivities(),
            
            const SizedBox(height: 16),
            
            // Rebalanceamentos recentes
            _buildRecentRebalances(),
            
            const SizedBox(height: 16),
            
            // Ações rápidas
            _buildQuickActions(),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentActivities() {
    if (_dashboard!.recentActivities.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Atividades Recentes',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: () => _navigateToHistory('activities'),
              child: const Text('Ver Todas'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ..._dashboard!.recentActivities.map((activity) => 
          FulltimeActivityCard(
            activity: activity,
            onTap: () => _showActivityDetails(activity),
          ),
        ),
      ],
    );
  }

  Widget _buildRecentRebalances() {
    if (_dashboard!.recentRebalances.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Rebalanceamentos Recentes',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: () => _navigateToHistory('rebalances'),
              child: const Text('Ver Todos'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ..._dashboard!.recentRebalances.map((rebalance) => 
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
        subtitle: Text(
          rebalance['reason'] ?? 'Rebalanceamento automático',
          style: Theme.of(context).textTheme.bodySmall,
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
      ),
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Ações Rápidas',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildQuickActionButton(
                'Registrar Atividade',
                Icons.add_circle,
                AppColors.accent,
                _navigateToRegisterActivity,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildQuickActionButton(
                'Ver Histórico',
                Icons.history,
                AppColors.secondary,
                () => _navigateToHistory('all'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildQuickActionButton(
                'Atividades Suportadas',
                Icons.list,
                AppColors.info,
                _showSupportedActivities,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildQuickActionButton(
                'Configurações',
                Icons.settings,
                AppColors.warning,
                _showSettings,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickActionButton(
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: color.withOpacity(0.3),
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: color,
              size: 24,
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: color,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  void _navigateToRegisterActivity() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const FulltimeRegisterActivityScreen(),
      ),
    ).then((_) => _loadDashboard());
  }

  void _navigateToHistory(String type) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => FulltimeHistoryScreen(type: type),
      ),
    );
  }

  void _showActivityDetails(Map<String, dynamic> activity) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(activity['activity_type'] ?? 'Atividade'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Duração: ${activity['duration_minutes']} minutos'),
            Text('Intensidade: ${activity['intensity']}'),
            Text('Calorias queimadas: ${activity['calories_burned']}'),
            if (activity['description'] != null)
              Text('Descrição: ${activity['description']}'),
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

  void _showSupportedActivities() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Atividades Suportadas'),
        content: const Text('Lista de atividades suportadas será exibida aqui.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Fechar'),
          ),
        ],
      ),
    );
  }

  void _showSettings() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Configurações'),
        content: const Text('Configurações do Sistema Full-time serão exibidas aqui.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Fechar'),
          ),
        ],
      ),
    );
  }

  Future<void> _toggleStatus() async {
    try {
      final result = await _fulltimeService.toggleStatus(_userId);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Status alterado'),
          backgroundColor: AppColors.success,
        ),
      );
      _loadDashboard();
    } catch (e) {
      _showErrorDialog('Erro ao alterar status: $e');
    }
  }
}
