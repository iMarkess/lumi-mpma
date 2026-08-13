import 'package:flutter/material.dart';

/// Paleta da marca — usada para gerar os [ColorScheme] claro e escuro.
abstract class AppColors {
  // Marca
  static const Color primary = Color(0xFF00458E); // Azul
  static const Color primaryLight = Color(0xFF1E6FC4);
  static const Color primaryDark = Color(0xFF002D5C);

  static const Color secondary = Color(0xFFE62310); // Vermelho
  static const Color secondaryLight = Color(0xFFFF5A47);
  static const Color secondaryDark = Color(0xFFB81A0B);

  static const Color accent = Color(0xFFF5B301); // Dourado
  static const Color accentLight = Color(0xFFFFCE45);

  // Status
  static const Color success = Color(0xFF0E9F6E);
  static const Color warning = Color(0xFFD97706);
  static const Color danger = Color(0xFFDC2626);
  static const Color info = Color(0xFF1E6FC4);

  // Superfícies claras
  static const Color bgLight = Color(0xFFF6F8FC);
  static const Color bgDeepLight = Color(0xFFEEF1F6);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color inkLight = Color(0xFF0B1220);
  static const Color mutedLight = Color(0xFF64748B);

  // Superfícies escuras
  static const Color bgDark = Color(0xFF06122A);
  static const Color bgDeepDark = Color(0xFF040B1C);
  static const Color surfaceDark = Color(0xFF0F1F3A);
  static const Color inkDark = Color(0xFFE8EDF6);
  static const Color mutedDark = Color(0xFF94A3B8);

  // Gradientes de marca
  static const LinearGradient brand = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF1E6FC4), Color(0xFF00458E), Color(0xFF002D5C)],
  );

  static const LinearGradient danger2 = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFFF5A47), Color(0xFFE62310), Color(0xFFB81A0B)],
  );

  static const LinearGradient ink = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFF0B1F3A), Color(0xFF06122A), Color(0xFF040B1C)],
  );

  /// Cores por categoria de denúncia.
  static const Color catChild = primary;
  static const Color catElderly = secondary;
  static const Color catEnv = success;
}
