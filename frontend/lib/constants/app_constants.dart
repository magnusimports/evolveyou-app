/// Constantes globais da aplicação EvolveYou
class AppConstants {
  // API Configuration
  static const String baseUrl = 'https://api.evolveyou.com.br';
  static const String apiVersion = 'v1';
  
  // Endpoints
  static const String authRegister = '/auth/register';
  static const String authLogin = '/auth/login';
  static const String authSocialLogin = '/auth/social-login';
  static const String onboardingSubmit = '/onboarding/submit';
  static const String userProfile = '/user/profile';
  static const String dashboard = '/dashboard';
  static const String foods = '/foods';
  static const String exercises = '/exercises';
  static const String planDiet = '/plan/diet';
  static const String planWorkout = '/plan/workout';
  
  // Storage Keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String onboardingCompleteKey = 'onboarding_complete';
  static const String firstLaunchKey = 'first_launch';
  
  // App Configuration
  static const String appName = 'EvolveYou';
  static const String appVersion = '1.0.0';
  static const Duration splashDuration = Duration(seconds: 3);
  static const Duration requestTimeout = Duration(seconds: 30);
  
  // Validation
  static const int minPasswordLength = 8;
  static const int maxPasswordLength = 128;
  static const int minNameLength = 2;
  static const int maxNameLength = 50;
  
  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 400);
  static const Duration longAnimation = Duration(milliseconds: 600);
  
  // UI Constants
  static const double defaultPadding = 16.0;
  static const double smallPadding = 8.0;
  static const double largePadding = 24.0;
  static const double borderRadius = 12.0;
  static const double buttonHeight = 56.0;
  
  // Firebase Configuration
  static const String firebaseProject = 
      'evolveyou-prod'; // Substitua pelo ID do seu projeto Firebase
}