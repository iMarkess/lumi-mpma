import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

enum ComplaintCategory {
  child('child', 'Criança e Adolescente', Icons.child_care_rounded, AppColors.catChild),
  elderly('elderly', 'Idosos e Vulneráveis', Icons.elderly_rounded, AppColors.catElderly),
  env('env', 'Meio Ambiente', Icons.eco_rounded, AppColors.catEnv);

  const ComplaintCategory(this.id, this.label, this.icon, this.color);
  final String id;
  final String label;
  final IconData icon;
  final Color color;

  static ComplaintCategory fromId(String id) =>
      ComplaintCategory.values.firstWhere(
        (c) => c.id == id,
        orElse: () => ComplaintCategory.child,
      );
}

enum ComplaintStatus {
  recebida('recebida', 'Recebida', AppColors.info),
  emTriagem('em_triagem', 'Em triagem', AppColors.warning),
  emAnalise('em_analise', 'Em análise', AppColors.primary),
  concluida('concluída', 'Concluída', AppColors.success),
  rejeitada('rejeitada', 'Rejeitada', AppColors.danger);

  const ComplaintStatus(this.id, this.label, this.color);
  final String id;
  final String label;
  final Color color;

  /// Progresso 0..1 para a barra de andamento.
  double get progress => switch (this) {
        ComplaintStatus.recebida => 0.2,
        ComplaintStatus.emTriagem => 0.45,
        ComplaintStatus.emAnalise => 0.75,
        ComplaintStatus.concluida => 1.0,
        ComplaintStatus.rejeitada => 1.0,
      };

  static ComplaintStatus fromId(String id) =>
      ComplaintStatus.values.firstWhere(
        (s) => s.id == id,
        orElse: () => ComplaintStatus.recebida,
      );
}

enum ComplaintPriority {
  alta('alta', 'Alta', AppColors.danger),
  media('media', 'Média', AppColors.warning),
  baixa('baixa', 'Baixa', AppColors.success);

  const ComplaintPriority(this.id, this.label, this.color);
  final String id;
  final String label;
  final Color color;
}

class Complaint {
  const Complaint({
    required this.id,
    required this.category,
    required this.title,
    required this.location,
    required this.status,
    required this.priority,
    required this.date,
    required this.description,
    this.anonymous = true,
  });

  final String id;
  final ComplaintCategory category;
  final String title;
  final String location;
  final ComplaintStatus status;
  final ComplaintPriority priority;
  final DateTime date;
  final String description;
  final bool anonymous;

  Complaint copyWith({ComplaintStatus? status}) => Complaint(
        id: id,
        category: category,
        title: title,
        location: location,
        status: status ?? this.status,
        priority: priority,
        date: date,
        description: description,
        anonymous: anonymous,
      );
}
