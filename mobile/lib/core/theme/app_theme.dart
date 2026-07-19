import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_typography.dart';

/// Temas Material 3 (claro/escuro) com a identidade MPMA.
abstract class AppTheme {
  static ThemeData get light => _build(Brightness.light);
  static ThemeData get dark => _build(Brightness.dark);

  static ThemeData _build(Brightness brightness) {
    final isDark = brightness == Brightness.dark;

    final scheme = ColorScheme(
      brightness: brightness,
      primary: AppColors.primary,
      onPrimary: Colors.white,
      primaryContainer:
          isDark ? AppColors.primaryDark : const Color(0xFFD9E6F5),
      onPrimaryContainer:
          isDark ? const Color(0xFFD9E6F5) : AppColors.primaryDark,
      secondary: AppColors.secondary,
      onSecondary: Colors.white,
      secondaryContainer:
          isDark ? AppColors.secondaryDark : const Color(0xFFFCDCD7),
      onSecondaryContainer:
          isDark ? const Color(0xFFFCDCD7) : AppColors.secondaryDark,
      tertiary: AppColors.accent,
      onTertiary: const Color(0xFF3A2A00),
      tertiaryContainer: const Color(0xFFFFE9A8),
      onTertiaryContainer: const Color(0xFF3A2A00),
      error: AppColors.danger,
      onError: Colors.white,
      surface: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
      onSurface: isDark ? AppColors.inkDark : AppColors.inkLight,
      surfaceContainerLowest:
          isDark ? AppColors.bgDeepDark : AppColors.surfaceLight,
      surfaceContainerLow: isDark ? AppColors.bgDark : AppColors.bgLight,
      surfaceContainer: isDark ? AppColors.surfaceDark : AppColors.bgLight,
      surfaceContainerHigh:
          isDark ? const Color(0xFF16294A) : const Color(0xFFF1F4FA),
      surfaceContainerHighest:
          isDark ? const Color(0xFF1C3254) : const Color(0xFFE9EEF6),
      onSurfaceVariant: isDark ? AppColors.mutedDark : AppColors.mutedLight,
      outline: isDark ? const Color(0xFF2C3E5E) : const Color(0xFFD5DEEB),
      outlineVariant: isDark ? const Color(0xFF223650) : const Color(0xFFE6ECF4),
      shadow: Colors.black,
      scrim: Colors.black,
      inverseSurface: isDark ? AppColors.inkDark : AppColors.inkLight,
      onInverseSurface: isDark ? AppColors.inkLight : Colors.white,
      inversePrimary: AppColors.primaryLight,
    );

    final textTheme = AppTypography.textTheme(
      scheme.onSurface,
      scheme.onSurfaceVariant,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor:
          isDark ? AppColors.bgDeepDark : AppColors.bgDeepLight,
      textTheme: textTheme,
      splashFactory: InkSparkle.splashFactory,
      cardTheme: CardThemeData(
        elevation: 0,
        color: scheme.surface,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: BorderSide(color: scheme.outlineVariant),
        ),
        margin: EdgeInsets.zero,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor:
            isDark ? AppColors.bgDeepDark : AppColors.bgDeepLight,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: textTheme.titleLarge,
        iconTheme: IconThemeData(color: scheme.onSurface),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(54),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(999),
          ),
          textStyle: textTheme.labelLarge,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(54),
          side: BorderSide(color: scheme.outline),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(999),
          ),
          textStyle: textTheme.labelLarge,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: scheme.surfaceContainerHigh,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: scheme.outlineVariant),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: scheme.primary, width: 2),
        ),
        hintStyle: textTheme.bodyMedium?.copyWith(
          color: scheme.onSurfaceVariant,
        ),
      ),
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(999),
        ),
        side: BorderSide(color: scheme.outlineVariant),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: scheme.surface,
        surfaceTintColor: Colors.transparent,
        indicatorColor: scheme.primary.withValues(alpha: 0.12),
        elevation: 0,
        height: 68,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => textTheme.labelSmall?.copyWith(
            fontWeight: FontWeight.w700,
            color: states.contains(WidgetState.selected)
                ? scheme.primary
                : scheme.onSurfaceVariant,
          ),
        ),
        iconTheme: WidgetStateProperty.resolveWith(
          (states) => IconThemeData(
            color: states.contains(WidgetState.selected)
                ? scheme.primary
                : scheme.onSurfaceVariant,
          ),
        ),
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: scheme.surface,
        surfaceTintColor: Colors.transparent,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
        ),
      ),
      dividerTheme: DividerThemeData(
        color: scheme.outlineVariant,
        thickness: 1,
      ),
    );
  }
}
