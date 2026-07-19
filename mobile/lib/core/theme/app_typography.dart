import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Tipografia: Lexend para títulos (display/headline/title),
/// Inter para corpo e rótulos. Espelha o site.
abstract class AppTypography {
  static TextTheme textTheme(Color ink, Color muted) {
    final lexend = GoogleFonts.lexendTextTheme();
    final inter = GoogleFonts.interTextTheme();

    return TextTheme(
      displayLarge: lexend.displayLarge?.copyWith(
        fontWeight: FontWeight.w800,
        letterSpacing: -1,
        color: ink,
      ),
      displayMedium: lexend.displayMedium?.copyWith(
        fontWeight: FontWeight.w800,
        letterSpacing: -0.5,
        color: ink,
      ),
      headlineLarge: lexend.headlineLarge?.copyWith(
        fontWeight: FontWeight.w800,
        letterSpacing: -0.5,
        color: ink,
      ),
      headlineMedium: lexend.headlineMedium?.copyWith(
        fontWeight: FontWeight.w700,
        letterSpacing: -0.4,
        color: ink,
      ),
      headlineSmall: lexend.headlineSmall?.copyWith(
        fontWeight: FontWeight.w700,
        letterSpacing: -0.3,
        color: ink,
      ),
      titleLarge: lexend.titleLarge?.copyWith(
        fontWeight: FontWeight.w700,
        color: ink,
      ),
      titleMedium: lexend.titleMedium?.copyWith(
        fontWeight: FontWeight.w600,
        color: ink,
      ),
      titleSmall: inter.titleSmall?.copyWith(
        fontWeight: FontWeight.w600,
        color: ink,
      ),
      bodyLarge: inter.bodyLarge?.copyWith(color: ink, height: 1.5),
      bodyMedium: inter.bodyMedium?.copyWith(color: ink, height: 1.5),
      bodySmall: inter.bodySmall?.copyWith(color: muted, height: 1.45),
      labelLarge: inter.labelLarge?.copyWith(fontWeight: FontWeight.w700),
      labelMedium: inter.labelMedium?.copyWith(fontWeight: FontWeight.w600),
      labelSmall: inter.labelSmall?.copyWith(
        fontWeight: FontWeight.w600,
        color: muted,
      ),
    );
  }
}
