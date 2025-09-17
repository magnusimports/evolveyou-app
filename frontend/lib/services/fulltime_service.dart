/// Serviço para o Sistema Full-time

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/fulltime_models.dart';
import 'api_service.dart';

class FulltimeService {
  static const String _baseUrl = 'http://localhost:8000/api/v2/fulltime';
  
  final ApiService _apiService = ApiService();

  /// Registra uma atividade extra
  Future<Map<String, dynamic>> registerActivity(ActivityRegistrationRequest request) async {
    try {
      final response = await _apiService.post('/fulltime/register-activity', request.toJson());
      return response;
    } catch (e) {
      print('Erro ao registrar atividade: $e');
      rethrow;
    }
  }

  /// Obtém status do Sistema Full-time
  Future<FulltimeStatus> getStatus(String userId) async {
    try {
      final response = await _apiService.get('/fulltime/status/$userId');
      return FulltimeStatus.fromJson(response);
    } catch (e) {
      print('Erro ao obter status: $e');
      rethrow;
    }
  }

  /// Obtém dashboard completo
  Future<FulltimeDashboard> getDashboard(String userId) async {
    try {
      final response = await _apiService.get('/fulltime/dashboard/$userId');
      return FulltimeDashboard.fromJson(response);
    } catch (e) {
      print('Erro ao obter dashboard: $e');
      rethrow;
    }
  }

  /// Obtém atividades suportadas
  Future<Map<String, dynamic>> getSupportedActivities() async {
    try {
      final response = await _apiService.get('/fulltime/supported-activities');
      return response;
    } catch (e) {
      print('Erro ao obter atividades suportadas: $e');
      rethrow;
    }
  }

  /// Ativa/desativa o sistema
  Future<Map<String, dynamic>> toggleStatus(String userId) async {
    try {
      final response = await _apiService.post('/fulltime/toggle-status/$userId', {});
      return response;
    } catch (e) {
      print('Erro ao alterar status: $e');
      rethrow;
    }
  }

  /// Obtém histórico de rebalanceamentos
  Future<Map<String, dynamic>> getRebalanceHistory(String userId, {int limit = 10}) async {
    try {
      final response = await _apiService.get('/fulltime/history/$userId?limit=$limit');
      return response;
    } catch (e) {
      print('Erro ao obter histórico: $e');
      rethrow;
    }
  }

  /// Obtém atividades do usuário
  Future<Map<String, dynamic>> getUserActivities(String userId, {int limit = 10}) async {
    try {
      final response = await _apiService.get('/fulltime/activities/$userId?limit=$limit');
      return response;
    } catch (e) {
      print('Erro ao obter atividades: $e');
      rethrow;
    }
  }

  /// Calcula calorias queimadas para uma atividade
  int calculateCaloriesBurned(String activityType, int durationMinutes, String intensity) {
    // Tabela de calorias por minuto (fallback local)
    final activityCalories = {
      'walking': {'low': 3, 'moderate': 4, 'high': 5},
      'stairs': {'low': 8, 'moderate': 10, 'high': 12},
      'housework': {'low': 2, 'moderate': 3, 'high': 4},
      'sports': {'low': 5, 'moderate': 8, 'high': 12},
      'cycling': {'low': 4, 'moderate': 6, 'high': 10},
      'running': {'low': 8, 'moderate': 12, 'high': 16},
      'dancing': {'low': 3, 'moderate': 5, 'high': 7},
      'gardening': {'low': 3, 'moderate': 4, 'high': 5},
      'cleaning': {'low': 2, 'moderate': 3, 'high': 4},
      'shopping': {'low': 2, 'moderate': 3, 'high': 3},
      'yoga': {'low': 2, 'moderate': 3, 'high': 4},
      'swimming': {'low': 6, 'moderate': 10, 'high': 14},
      'weight_training': {'low': 4, 'moderate': 6, 'high': 8},
      'hiking': {'low': 5, 'moderate': 7, 'high': 9},
      'tennis': {'low': 6, 'moderate': 9, 'high': 12},
      'basketball': {'low': 7, 'moderate': 10, 'high': 13},
      'football': {'low': 8, 'moderate': 11, 'high': 14},
      'volleyball': {'low': 5, 'moderate': 7, 'high': 9},
      'martial_arts': {'low': 6, 'moderate': 9, 'high': 12},
      'pilates': {'low': 3, 'moderate': 4, 'high': 5},
    };

    if (activityCalories.containsKey(activityType) && 
        activityCalories[activityType]!.containsKey(intensity)) {
      final caloriesPerMinute = activityCalories[activityType]![intensity]!;
      return (caloriesPerMinute * durationMinutes).round();
    }
    
    return 0;
  }

  /// Obtém lista de atividades por categoria
  Map<String, List<String>> getActivitiesByCategory() {
    return {
      'cardio': [
        'walking', 'stairs', 'cycling', 'running', 'dancing', 
        'swimming', 'hiking', 'tennis', 'basketball', 'football', 'volleyball'
      ],
      'strength': [
        'weight_training', 'martial_arts'
      ],
      'flexibility': [
        'yoga', 'pilates'
      ],
      'daily': [
        'housework', 'gardening', 'cleaning', 'shopping'
      ],
      'sports': [
        'sports', 'tennis', 'basketball', 'football', 'volleyball', 'martial_arts'
      ]
    };
  }

  /// Obtém intensidades disponíveis
  List<String> getIntensityLevels() {
    return ['low', 'moderate', 'high'];
  }

  /// Obtém descrição da intensidade
  String getIntensityDescription(String intensity) {
    switch (intensity) {
      case 'low':
        return 'Leve - Atividade confortável, sem muito esforço';
      case 'moderate':
        return 'Moderada - Atividade com esforço moderado, respiração acelerada';
      case 'high':
        return 'Alta - Atividade intensa, respiração pesada e suor';
      default:
        return 'Intensidade não reconhecida';
    }
  }

  /// Obtém emoji para tipo de atividade
  String getActivityEmoji(String activityType) {
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

  /// Obtém cor para categoria de atividade
  String getCategoryColor(String category) {
    switch (category) {
      case 'cardio':
        return '#FF6B6B';
      case 'strength':
        return '#4ECDC4';
      case 'flexibility':
        return '#45B7D1';
      case 'daily':
        return '#96CEB4';
      case 'sports':
        return '#FFEAA7';
      default:
        return '#DDA0DD';
    }
  }
}
