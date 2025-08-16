import 'package:flutter/material.dart';

/// Paleta de cores da EvolveYou
class AppColors {
  // Cores Primárias
  static const Color primary = Color(0xFF6C63FF);
  static const Color primaryDark = Color(0xFF5A52E8);
  static const Color primaryLight = Color(0xFF8B84FF);
  
  // Cores Secundárias
  static const Color secondary = Color(0xFF00D4AA);
  static const Color secondaryDark = Color(0xFF00B894);
  static const Color secondaryLight = Color(0xFF26E5C7);
  
  // Cores de Acento
  static const Color accent = Color(0xFFFF6B6B);
  static const Color accentDark = Color(0xFFE55555);
  static const Color accentLight = Color(0xFFFF8E8E);
  
  // Cores Neutras
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
  static const Color grey50 = Color(0xFFFAFAFA);
  static const Color grey100 = Color(0xFFF5F5F5);
  static const Color grey200 = Color(0xFFEEEEEE);
  static const Color grey300 = Color(0xFFE0E0E0);
  static const Color grey400 = Color(0xFFBDBDBD);
  static const Color grey500 = Color(0xFF9E9E9E);
  static const Color grey600 = Color(0xFF757575);
  static const Color grey700 = Color(0xFF616161);
  static const Color grey800 = Color(0xFF424242);
  static const Color grey900 = Color(0xFF212121);
  
  // Cores de Status
  static const Color success = Color(0xFF4CAF50);
  static const Color warning = Color(0xFFFF9800);
  static const Color error = Color(0xFFF44336);
  static const Color info = Color(0xFF2196F3);
  
  // Cores de Background
  static const Color background = Color(0xFFFAFAFA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF5F5F5);
  
  // Cores de Texto
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color textHint = Color(0xFFBDBDBD);
  static const Color textOnPrimary = Color(0xFFFFFFFF);
  static const Color textOnSecondary = Color(0xFFFFFFFF);
  
  // Cores de Bordas
  static const Color border = Color(0xFFE0E0E0);
  static const Color borderFocus = Color(0xFF6C63FF);
  static const Color borderError = Color(0xFFF44336);
  
  // Cores de Sombra
  static const Color shadow = Color(0x1A000000);
  static const Color shadowLight = Color(0x0D000000);
  static const Color shadowDark = Color(0x33000000);
  
  // Gradientes
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, primaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [secondary, secondaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient accentGradient = LinearGradient(
    colors: [accent, accentLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  // Cores Específicas da EvolveYou
  static const Color fitnessGreen = Color(0xFF00D4AA);
  static const Color nutritionOrange = Color(0xFFFF9500);
  static const Color wellnessBlue = Color(0xFF007AFF);
  static const Color strengthRed = Color(0xFFFF3B30);
  static const Color cardioYellow = Color(0xFFFFCC02);
  
  // Cores de Categoria
  static const Color categoryFruits = Color(0xFFFF6B6B);
  static const Color categoryVegetables = Color(0xFF4ECDC4);
  static const Color categoryProteins = Color(0xFF45B7D1);
  static const Color categoryCarbs = Color(0xFFFFD93D);
  static const Color categoryFats = Color(0xFF6C5CE7);
  
  // Cores de Exercício
  static const Color exerciseChest = Color(0xFFE17055);
  static const Color exerciseBack = Color(0xFF00B894);
  static const Color exerciseLegs = Color(0xFF6C5CE7);
  static const Color exerciseArms = Color(0xFFFF7675);
  static const Color exerciseCore = Color(0xFF00CEC9);
  static const Color exerciseCardio = Color(0xFFFFD93D);
}

