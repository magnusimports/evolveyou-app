import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../constants/app_colors.dart';
import '../constants/app_constants.dart';
import '../widgets/evo_avatar_widget.dart';
import '../widgets/custom_button.dart';
import '../widgets/loading_overlay.dart';
import '../services/api_service.dart';

/// Tela de progresso e analytics
class ProgressScreen extends StatefulWidget {
  const ProgressScreen({super.key});

  @override
  State<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends State<ProgressScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;
  
  // Dados mockados para demonstração
  final List<WeightData> _weightData = [
    WeightData(DateTime.now().subtract(const Duration(days: 30)), 75.0),
    WeightData(DateTime.now().subtract(const Duration(days: 25)), 74.5),
    WeightData(DateTime.now().subtract(const Duration(days: 20)), 74.2),
    WeightData(DateTime.now().subtract(const Duration(days: 15)), 73.8),
    WeightData(DateTime.now().subtract(const Duration(days: 10)), 73.5),
    WeightData(DateTime.now().subtract(const Duration(days: 5)), 73.2),
    WeightData(DateTime.now(), 73.0),
  ];

  final Map<String, List<ExerciseProgress>> _exerciseProgress = {
    'Supino Reto': [
      ExerciseProgress(DateTime.now().subtract(const Duration(days: 21)), 60.0),
      ExerciseProgress(DateTime.now().subtract(const Duration(days: 14)), 62.5),
      ExerciseProgress(DateTime.now().subtract(const Duration(days: 7)), 65.0),
      ExerciseProgress(DateTime.now(), 67.5),
    ],
    'Agachamento': [
      ExerciseProgress(DateTime.now().subtract(const Duration(days: 21)), 80.0),
      ExerciseProgress(DateTime.now().subtract(const Duration(days: 14)), 85.0),
      ExerciseProgress(DateTime.now().subtract(const Duration(days: 7)), 87.5),
      ExerciseProgress(DateTime.now(), 90.0),
    ],
    'Levantamento Terra': [
      ExerciseProgress(DateTime.now().subtract(const Duration(days: 21)), 100.0),
      ExerciseProgress(DateTime.now().subtract(const Duration(days: 14)), 105.0),
      ExerciseProgress(DateTime.now().subtract(const Duration(days: 7)), 107.5),
      ExerciseProgress(DateTime.now(), 110.0),
    ],
  };

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadProgressData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadProgressData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Simular carregamento de dados
      await Future.delayed(const Duration(seconds: 1));
      
      // Aqui seria feita a chamada real para a API
      // final response = await ApiService().get('/progress/summary');
      
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao carregar dados: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Meu Progresso'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Peso', icon: Icon(Icons.monitor_weight)),
            Tab(text: 'Força', icon: Icon(Icons.fitness_center)),
            Tab(text: 'Resumo', icon: Icon(Icons.analytics)),
          ],
        ),
      ),
      body: LoadingOverlay(
        isLoading: _isLoading,
        message: 'Carregando seus dados...',
        child: TabBarView(
          controller: _tabController,
          children: [
            _buildWeightTab(),
            _buildStrengthTab(),
            _buildSummaryTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildWeightTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar EVO
          Center(
            child: EvoAvatarWidget(
              state: EvoState.analyzing,
              context: EvoContext.progress,
              message: EvoMessages.getProgressMessage(),
              size: 80,
              onTap: () {
                setState(() {
                  // Atualizar mensagem do EVO
                });
              },
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Card de estatísticas
          _buildWeightStatsCard(),
          
          const SizedBox(height: 24),
          
          // Gráfico de peso
          _buildWeightChart(),
          
          const SizedBox(height: 24),
          
          // Histórico recente
          _buildWeightHistory(),
        ],
      ),
    );
  }

  Widget _buildStrengthTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Evolução de Força',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Lista de exercícios com progresso
          ..._exerciseProgress.entries.map((entry) {
            return _buildExerciseProgressCard(entry.key, entry.value);
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildSummaryTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Resumo geral
          _buildSummaryCards(),
          
          const SizedBox(height: 24),
          
          // Conquistas
          _buildAchievements(),
          
          const SizedBox(height: 24),
          
          // Próximas metas
          _buildNextGoals(),
        ],
      ),
    );
  }

  Widget _buildWeightStatsCard() {
    final currentWeight = _weightData.last.weight;
    final initialWeight = _weightData.first.weight;
    final weightLoss = initialWeight - currentWeight;
    final weightLossPercentage = (weightLoss / initialWeight) * 100;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem(
                  'Peso Atual',
                  '${currentWeight.toStringAsFixed(1)} kg',
                  Icons.monitor_weight,
                  AppColors.primary,
                ),
                _buildStatItem(
                  'Perdidos',
                  '${weightLoss.toStringAsFixed(1)} kg',
                  Icons.trending_down,
                  AppColors.success,
                ),
                _buildStatItem(
                  'Progresso',
                  '${weightLossPercentage.toStringAsFixed(1)}%',
                  Icons.percent,
                  AppColors.secondary,
                ),
              ],
            ),
          ],
        ),
      ),
    ).animate().fadeIn().slideY(begin: 0.2, end: 0);
  }

  Widget _buildStatItem(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildWeightChart() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Evolução do Peso (30 dias)',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: LineChart(
                LineChartData(
                  gridData: FlGridData(show: true),
                  titlesData: FlTitlesData(
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 40,
                        getTitlesWidget: (value, meta) {
                          return Text(
                            '${value.toInt()}kg',
                            style: Theme.of(context).textTheme.bodySmall,
                          );
                        },
                      ),
                    ),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 30,
                        getTitlesWidget: (value, meta) {
                          final index = value.toInt();
                          if (index >= 0 && index < _weightData.length) {
                            final date = _weightData[index].date;
                            return Text(
                              '${date.day}/${date.month}',
                              style: Theme.of(context).textTheme.bodySmall,
                            );
                          }
                          return const Text('');
                        },
                      ),
                    ),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  ),
                  borderData: FlBorderData(show: true),
                  lineBarsData: [
                    LineChartBarData(
                      spots: _weightData.asMap().entries.map((entry) {
                        return FlSpot(entry.key.toDouble(), entry.value.weight);
                      }).toList(),
                      isCurved: true,
                      color: AppColors.primary,
                      barWidth: 3,
                      dotData: const FlDotData(show: true),
                      belowBarData: BarAreaData(
                        show: true,
                        color: AppColors.primary.withOpacity(0.1),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.2, end: 0);
  }

  Widget _buildWeightHistory() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Histórico Recente',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            ...(_weightData.reversed.take(5).map((data) {
              return ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.monitor_weight,
                    color: AppColors.primary,
                    size: 20,
                  ),
                ),
                title: Text('${data.weight.toStringAsFixed(1)} kg'),
                subtitle: Text(
                  '${data.date.day}/${data.date.month}/${data.date.year}',
                ),
                trailing: data != _weightData.first
                    ? Icon(
                        data.weight < _weightData[_weightData.indexOf(data) - 1].weight
                            ? Icons.trending_down
                            : Icons.trending_up,
                        color: data.weight < _weightData[_weightData.indexOf(data) - 1].weight
                            ? AppColors.success
                            : AppColors.error,
                      )
                    : null,
              );
            }).toList()),
          ],
        ),
      ),
    ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.2, end: 0);
  }

  Widget _buildExerciseProgressCard(String exerciseName, List<ExerciseProgress> progress) {
    final currentWeight = progress.last.weight;
    final initialWeight = progress.first.weight;
    final improvement = currentWeight - initialWeight;
    final improvementPercentage = (improvement / initialWeight) * 100;

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  exerciseName,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.success.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '+${improvement.toStringAsFixed(1)}kg',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.success,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Carga atual: ${currentWeight.toStringAsFixed(1)}kg',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            Text(
              'Melhoria: ${improvementPercentage.toStringAsFixed(1)}%',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 120,
              child: LineChart(
                LineChartData(
                  gridData: FlGridData(show: false),
                  titlesData: FlTitlesData(
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 35,
                        getTitlesWidget: (value, meta) {
                          return Text(
                            '${value.toInt()}',
                            style: Theme.of(context).textTheme.bodySmall,
                          );
                        },
                      ),
                    ),
                    bottomTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  ),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      spots: progress.asMap().entries.map((entry) {
                        return FlSpot(entry.key.toDouble(), entry.value.weight);
                      }).toList(),
                      isCurved: true,
                      color: AppColors.secondary,
                      barWidth: 2,
                      dotData: const FlDotData(show: true),
                      belowBarData: BarAreaData(
                        show: true,
                        color: AppColors.secondary.withOpacity(0.1),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn().slideX(begin: 0.2, end: 0);
  }

  Widget _buildSummaryCards() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildSummaryCard(
                'Treinos',
                '24',
                'Este mês',
                Icons.fitness_center,
                AppColors.primary,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildSummaryCard(
                'Calorias',
                '18.5k',
                'Queimadas',
                Icons.local_fire_department,
                AppColors.accent,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildSummaryCard(
                'Streak',
                '12',
                'Dias seguidos',
                Icons.emoji_events,
                AppColors.success,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildSummaryCard(
                'Meta',
                '85%',
                'Concluída',
                Icons.target,
                AppColors.secondary,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSummaryCard(String title, String value, String subtitle, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              title,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAchievements() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Conquistas Recentes',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            _buildAchievementItem(
              'Primeira Semana',
              'Completou 7 dias de treino',
              Icons.emoji_events,
              AppColors.success,
            ),
            _buildAchievementItem(
              'Força Crescente',
              'Aumentou 10kg no supino',
              Icons.fitness_center,
              AppColors.primary,
            ),
            _buildAchievementItem(
              'Consistência',
              '30 dias de uso do app',
              Icons.calendar_today,
              AppColors.secondary,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAchievementItem(String title, String description, IconData icon, Color color) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: color),
      ),
      title: Text(title),
      subtitle: Text(description),
      trailing: Icon(
        Icons.check_circle,
        color: color,
      ),
    );
  }

  Widget _buildNextGoals() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Próximas Metas',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            _buildGoalItem('Perder mais 2kg', 0.7),
            _buildGoalItem('Supino 70kg', 0.9),
            _buildGoalItem('50 treinos', 0.48),
            const SizedBox(height: 16),
            CustomButton(
              text: 'Definir Nova Meta',
              type: CustomButtonType.outline,
              onPressed: () {
                // Implementar definição de nova meta
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGoalItem(String goal, double progress) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(goal),
              Text('${(progress * 100).toInt()}%'),
            ],
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: progress,
            backgroundColor: AppColors.grey200,
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
          ),
        ],
      ),
    );
  }
}

/// Modelo de dados para peso
class WeightData {
  final DateTime date;
  final double weight;

  WeightData(this.date, this.weight);
}

/// Modelo de dados para progresso de exercícios
class ExerciseProgress {
  final DateTime date;
  final double weight;

  ExerciseProgress(this.date, this.weight);
}

