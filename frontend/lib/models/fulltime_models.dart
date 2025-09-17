/// Modelos para o Sistema Full-time

class ActivityType {
  final String name;
  final Map<String, double> caloriesPerMinute;
  final String description;
  final String category;

  const ActivityType({
    required this.name,
    required this.caloriesPerMinute,
    required this.description,
    required this.category,
  });

  factory ActivityType.fromJson(Map<String, dynamic> json) {
    return ActivityType(
      name: json['name'],
      caloriesPerMinute: Map<String, double>.from(json['calories_per_minute']),
      description: json['description'],
      category: json['category'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'calories_per_minute': caloriesPerMinute,
      'description': description,
      'category': category,
    };
  }
}

class ActivityRecord {
  final String id;
  final String userId;
  final String activityType;
  final int durationMinutes;
  final String intensity;
  final int caloriesBurned;
  final String description;
  final DateTime timestamp;

  const ActivityRecord({
    required this.id,
    required this.userId,
    required this.activityType,
    required this.durationMinutes,
    required this.intensity,
    required this.caloriesBurned,
    required this.description,
    required this.timestamp,
  });

  factory ActivityRecord.fromJson(Map<String, dynamic> json) {
    return ActivityRecord(
      id: json['id'],
      userId: json['user_id'],
      activityType: json['activity_type'],
      durationMinutes: json['duration_minutes'],
      intensity: json['intensity'],
      caloriesBurned: json['calories_burned'],
      description: json['description'],
      timestamp: DateTime.parse(json['timestamp']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'activity_type': activityType,
      'duration_minutes': durationMinutes,
      'intensity': intensity,
      'calories_burned': caloriesBurned,
      'description': description,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class CalorieRebalance {
  final String id;
  final String userId;
  final int originalCalories;
  final int extraCaloriesBurned;
  final int newCalorieTarget;
  final double rebalanceFactor;
  final String reason;
  final DateTime timestamp;

  const CalorieRebalance({
    required this.id,
    required this.userId,
    required this.originalCalories,
    required this.extraCaloriesBurned,
    required this.newCalorieTarget,
    required this.rebalanceFactor,
    required this.reason,
    required this.timestamp,
  });

  factory CalorieRebalance.fromJson(Map<String, dynamic> json) {
    return CalorieRebalance(
      id: json['id'],
      userId: json['user_id'],
      originalCalories: json['original_calories'],
      extraCaloriesBurned: json['extra_calories_burned'],
      newCalorieTarget: json['new_calorie_target'],
      rebalanceFactor: json['rebalance_factor'].toDouble(),
      reason: json['reason'],
      timestamp: DateTime.parse(json['timestamp']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'original_calories': originalCalories,
      'extra_calories_burned': extraCaloriesBurned,
      'new_calorie_target': newCalorieTarget,
      'rebalance_factor': rebalanceFactor,
      'reason': reason,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class FulltimeStatus {
  final String userId;
  final bool isActive;
  final int dailyExtraCalories;
  final int totalRebalancesToday;
  final DateTime? lastRebalance;
  final int dailyCalorieTarget;
  final int currentCalorieTarget;

  const FulltimeStatus({
    required this.userId,
    required this.isActive,
    required this.dailyExtraCalories,
    required this.totalRebalancesToday,
    this.lastRebalance,
    required this.dailyCalorieTarget,
    required this.currentCalorieTarget,
  });

  factory FulltimeStatus.fromJson(Map<String, dynamic> json) {
    return FulltimeStatus(
      userId: json['user_id'],
      isActive: json['is_active'],
      dailyExtraCalories: json['daily_extra_calories'],
      totalRebalancesToday: json['total_rebalances_today'],
      lastRebalance: json['last_rebalance'] != null 
          ? DateTime.parse(json['last_rebalance'])
          : null,
      dailyCalorieTarget: json['daily_calorie_target'],
      currentCalorieTarget: json['current_calorie_target'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'is_active': isActive,
      'daily_extra_calories': dailyExtraCalories,
      'total_rebalances_today': totalRebalancesToday,
      'last_rebalance': lastRebalance?.toIso8601String(),
      'daily_calorie_target': dailyCalorieTarget,
      'current_calorie_target': currentCalorieTarget,
    };
  }
}

class FulltimeDashboard {
  final FulltimeStatus status;
  final Map<String, dynamic> today;
  final Map<String, dynamic> week;
  final List<Map<String, dynamic>> recentActivities;
  final List<Map<String, dynamic>> recentRebalances;

  const FulltimeDashboard({
    required this.status,
    required this.today,
    required this.week,
    required this.recentActivities,
    required this.recentRebalances,
  });

  factory FulltimeDashboard.fromJson(Map<String, dynamic> json) {
    return FulltimeDashboard(
      status: FulltimeStatus.fromJson(json['status']),
      today: Map<String, dynamic>.from(json['today']),
      week: Map<String, dynamic>.from(json['week']),
      recentActivities: List<Map<String, dynamic>>.from(json['recent_activities']),
      recentRebalances: List<Map<String, dynamic>>.from(json['recent_rebalances']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'status': status.toJson(),
      'today': today,
      'week': week,
      'recent_activities': recentActivities,
      'recent_rebalances': recentRebalances,
    };
  }
}

class RebalanceResult {
  final bool success;
  final int originalCalories;
  final int extraCaloriesBurned;
  final int newCalorieTarget;
  final double rebalanceFactor;
  final String reason;
  final DateTime timestamp;

  const RebalanceResult({
    required this.success,
    required this.originalCalories,
    required this.extraCaloriesBurned,
    required this.newCalorieTarget,
    required this.rebalanceFactor,
    required this.reason,
    required this.timestamp,
  });

  factory RebalanceResult.fromJson(Map<String, dynamic> json) {
    return RebalanceResult(
      success: json['success'],
      originalCalories: json['original_calories'],
      extraCaloriesBurned: json['extra_calories_burned'],
      newCalorieTarget: json['new_calorie_target'],
      rebalanceFactor: json['rebalance_factor'].toDouble(),
      reason: json['reason'],
      timestamp: DateTime.parse(json['timestamp']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'original_calories': originalCalories,
      'extra_calories_burned': extraCaloriesBurned,
      'new_calorie_target': newCalorieTarget,
      'rebalance_factor': rebalanceFactor,
      'reason': reason,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class ActivityRegistrationRequest {
  final String activityType;
  final int durationMinutes;
  final String intensity;
  final String? description;

  const ActivityRegistrationRequest({
    required this.activityType,
    required this.durationMinutes,
    required this.intensity,
    this.description,
  });

  Map<String, dynamic> toJson() {
    return {
      'activity_type': activityType,
      'duration_minutes': durationMinutes,
      'intensity': intensity,
      'description': description,
    };
  }
}
