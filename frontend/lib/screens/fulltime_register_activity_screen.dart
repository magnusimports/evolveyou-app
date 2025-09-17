/// Tela para registrar atividade no Sistema Full-time

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/app_colors.dart';
import '../models/fulltime_models.dart';
import '../services/fulltime_service.dart';

class FulltimeRegisterActivityScreen extends StatefulWidget {
  const FulltimeRegisterActivityScreen({super.key});

  @override
  State<FulltimeRegisterActivityScreen> createState() => _FulltimeRegisterActivityScreenState();
}

class _FulltimeRegisterActivityScreenState extends State<FulltimeRegisterActivityScreen> {
  final FulltimeService _fulltimeService = FulltimeService();
  final _formKey = GlobalKey<FormState>();
  
  String _selectedActivityType = '';
  int _durationMinutes = 30;
  String _selectedIntensity = 'moderate';
  final TextEditingController _descriptionController = TextEditingController();
  
  Map<String, dynamic> _supportedActivities = {};
  bool _isLoading = true;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadSupportedActivities();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _loadSupportedActivities() async {
    try {
      final activities = await _fulltimeService.getSupportedActivities();
      setState(() {
        _supportedActivities = activities;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      _showErrorDialog('Erro ao carregar atividades: $e');
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

  void _showSuccessDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sucesso'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Future<void> _submitActivity() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedActivityType.isEmpty) {
      _showErrorDialog('Selecione um tipo de atividade');
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final request = ActivityRegistrationRequest(
        activityType: _selectedActivityType,
        durationMinutes: _durationMinutes,
        intensity: _selectedIntensity,
        description: _descriptionController.text.trim().isEmpty 
            ? null 
            : _descriptionController.text.trim(),
      );

      final result = await _fulltimeService.registerActivity(request);
      
      if (result['success'] == true) {
        _showSuccessDialog(result['message'] ?? 'Atividade registrada com sucesso!');
      } else {
        _showErrorDialog(result['message'] ?? 'Erro ao registrar atividade');
      }
    } catch (e) {
      _showErrorDialog('Erro ao registrar atividade: $e');
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Registrar Atividade'),
        backgroundColor: AppColors.accent,
        foregroundColor: Colors.white,
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _buildBody(),
    );
  }

  Widget _buildBody() {
    return Form(
      key: _formKey,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Card de informações
            _buildInfoCard(),
            
            const SizedBox(height: 24),
            
            // Seleção de atividade
            _buildActivitySelection(),
            
            const SizedBox(height: 24),
            
            // Duração
            _buildDurationSelection(),
            
            const SizedBox(height: 24),
            
            // Intensidade
            _buildIntensitySelection(),
            
            const SizedBox(height: 24),
            
            // Descrição
            _buildDescriptionField(),
            
            const SizedBox(height: 32),
            
            // Botão de submit
            _buildSubmitButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard() {
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
                  Icons.info_outline,
                  color: AppColors.info,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Text(
                  'Registrar Atividade Extra',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              'Registre atividades extras que você realizou hoje. O sistema calculará automaticamente as calorias queimadas e ajustará seu plano alimentar.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivitySelection() {
    final activities = _supportedActivities['activities'] as Map<String, dynamic>? ?? {};
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Tipo de Atividade *',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey[300]!),
            borderRadius: BorderRadius.circular(12),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _selectedActivityType.isEmpty ? null : _selectedActivityType,
              hint: const Text('Selecione uma atividade'),
              isExpanded: true,
              items: activities.entries.map((entry) {
                final activityType = entry.key;
                final activityData = entry.value as Map<String, dynamic>;
                return DropdownMenuItem<String>(
                  value: activityType,
                  child: Row(
                    children: [
                      Text(
                        _fulltimeService.getActivityEmoji(activityType),
                        style: const TextStyle(fontSize: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              activityData['name'] ?? activityType,
                              style: const TextStyle(fontWeight: FontWeight.w500),
                            ),
                            Text(
                              activityData['description'] ?? '',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedActivityType = value ?? '';
                });
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDurationSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Duração (minutos) *',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: Slider(
                value: _durationMinutes.toDouble(),
                min: 5,
                max: 180,
                divisions: 35,
                label: '$_durationMinutes min',
                onChanged: (value) {
                  setState(() {
                    _durationMinutes = value.round();
                  });
                },
              ),
            ),
            Container(
              width: 80,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '$_durationMinutes min',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildIntensitySelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Intensidade *',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildIntensityOption('low', 'Leve', Icons.sentiment_satisfied),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildIntensityOption('moderate', 'Moderada', Icons.sentiment_neutral),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildIntensityOption('high', 'Alta', Icons.sentiment_dissatisfied),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildIntensityOption(String value, String label, IconData icon) {
    final isSelected = _selectedIntensity == value;
    
    return InkWell(
      onTap: () {
        setState(() {
          _selectedIntensity = value;
        });
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected 
              ? AppColors.primary.withOpacity(0.1)
              : Colors.grey[50],
          border: Border.all(
            color: isSelected 
                ? AppColors.primary
                : Colors.grey[300]!,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected ? AppColors.primary : Colors.grey[600],
              size: 24,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? AppColors.primary : Colors.grey[700],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDescriptionField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Descrição (opcional)',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _descriptionController,
          decoration: InputDecoration(
            hintText: 'Ex: Caminhada no parque, limpeza da casa...',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            filled: true,
            fillColor: Colors.grey[50],
          ),
          maxLines: 2,
        ),
      ],
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: _isSubmitting ? null : _submitActivity,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.accent,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 4,
        ),
        child: _isSubmitting
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.add_circle),
                  const SizedBox(width: 8),
                  Text(
                    'Registrar Atividade',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
