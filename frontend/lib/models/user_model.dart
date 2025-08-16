import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

/// Modelo de dados do usuário
@JsonSerializable()
class UserModel extends Equatable {
  final String id;
  final String name;
  final String email;
  final String? photoUrl;
  final bool isEmailVerified;
  final bool onboardingCompleted;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final UserProfile? profile;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.photoUrl,
    required this.isEmailVerified,
    required this.onboardingCompleted,
    required this.createdAt,
    this.updatedAt,
    this.profile,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);
  Map<String, dynamic> toJson() => _$UserModelToJson(this);

  UserModel copyWith({
    String? id,
    String? name,
    String? email,
    String? photoUrl,
    bool? isEmailVerified,
    bool? onboardingCompleted,
    DateTime? createdAt,
    DateTime? updatedAt,
    UserProfile? profile,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      photoUrl: photoUrl ?? this.photoUrl,
      isEmailVerified: isEmailVerified ?? this.isEmailVerified,
      onboardingCompleted: onboardingCompleted ?? this.onboardingCompleted,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      profile: profile ?? this.profile,
    );
  }

  @override
  List<Object?> get props => [
        id,
        name,
        email,
        photoUrl,
        isEmailVerified,
        onboardingCompleted,
        createdAt,
        updatedAt,
        profile,
      ];
}

/// Perfil detalhado do usuário
@JsonSerializable()
class UserProfile extends Equatable {
  final int? age;
  final String? gender;
  final double? height;
  final double? weight;
  final String? activityLevel;
  final String? fitnessGoal;
  final List<String>? dietaryRestrictions;
  final List<String>? healthConditions;
  final double? bodyFatPercentage;
  final double? muscleMass;
  final int? bmr; // Basal Metabolic Rate
  final int? tdee; // Total Daily Energy Expenditure
  final MacroTargets? macroTargets;

  const UserProfile({
    this.age,
    this.gender,
    this.height,
    this.weight,
    this.activityLevel,
    this.fitnessGoal,
    this.dietaryRestrictions,
    this.healthConditions,
    this.bodyFatPercentage,
    this.muscleMass,
    this.bmr,
    this.tdee,
    this.macroTargets,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) => _$UserProfileFromJson(json);
  Map<String, dynamic> toJson() => _$UserProfileToJson(this);

  UserProfile copyWith({
    int? age,
    String? gender,
    double? height,
    double? weight,
    String? activityLevel,
    String? fitnessGoal,
    List<String>? dietaryRestrictions,
    List<String>? healthConditions,
    double? bodyFatPercentage,
    double? muscleMass,
    int? bmr,
    int? tdee,
    MacroTargets? macroTargets,
  }) {
    return UserProfile(
      age: age ?? this.age,
      gender: gender ?? this.gender,
      height: height ?? this.height,
      weight: weight ?? this.weight,
      activityLevel: activityLevel ?? this.activityLevel,
      fitnessGoal: fitnessGoal ?? this.fitnessGoal,
      dietaryRestrictions: dietaryRestrictions ?? this.dietaryRestrictions,
      healthConditions: healthConditions ?? this.healthConditions,
      bodyFatPercentage: bodyFatPercentage ?? this.bodyFatPercentage,
      muscleMass: muscleMass ?? this.muscleMass,
      bmr: bmr ?? this.bmr,
      tdee: tdee ?? this.tdee,
      macroTargets: macroTargets ?? this.macroTargets,
    );
  }

  @override
  List<Object?> get props => [
        age,
        gender,
        height,
        weight,
        activityLevel,
        fitnessGoal,
        dietaryRestrictions,
        healthConditions,
        bodyFatPercentage,
        muscleMass,
        bmr,
        tdee,
        macroTargets,
      ];
}

/// Metas de macronutrientes
@JsonSerializable()
class MacroTargets extends Equatable {
  final int calories;
  final int protein; // em gramas
  final int carbs; // em gramas
  final int fat; // em gramas
  final int fiber; // em gramas
  final int sugar; // em gramas

  const MacroTargets({
    required this.calories,
    required this.protein,
    required this.carbs,
    required this.fat,
    required this.fiber,
    required this.sugar,
  });

  factory MacroTargets.fromJson(Map<String, dynamic> json) => _$MacroTargetsFromJson(json);
  Map<String, dynamic> toJson() => _$MacroTargetsToJson(this);

  MacroTargets copyWith({
    int? calories,
    int? protein,
    int? carbs,
    int? fat,
    int? fiber,
    int? sugar,
  }) {
    return MacroTargets(
      calories: calories ?? this.calories,
      protein: protein ?? this.protein,
      carbs: carbs ?? this.carbs,
      fat: fat ?? this.fat,
      fiber: fiber ?? this.fiber,
      sugar: sugar ?? this.sugar,
    );
  }

  @override
  List<Object?> get props => [calories, protein, carbs, fat, fiber, sugar];
}

