import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

enum NotificationKind {
  update('Atualizações', Icons.update_rounded, AppColors.primary),
  alert('Alertas', Icons.warning_amber_rounded, AppColors.warning),
  message('Mensagens', Icons.forum_rounded, AppColors.info),
  system('Sistema', Icons.settings_suggest_rounded, AppColors.mutedLight);

  const NotificationKind(this.label, this.icon, this.color);
  final String label;
  final IconData icon;
  final Color color;
}

class AppNotification {
  AppNotification({
    required this.id,
    required this.kind,
    required this.title,
    required this.body,
    required this.date,
    this.read = false,
  });

  final String id;
  final NotificationKind kind;
  final String title;
  final String body;
  final DateTime date;
  bool read;
}
