import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_card.dart';
import '../domain/complaint.dart';

class DenunciarScreen extends StatelessWidget {
  const DenunciarScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
        children: [
          Text('Fazer denúncia', style: t.headlineSmall),
          const SizedBox(height: 4),
          Text(
            'Escolha a área. Seu sigilo é garantido e você pode denunciar de forma anônima.',
            style: t.bodyMedium,
          ),
          const SizedBox(height: 22),
          for (var i = 0; i < ComplaintCategory.values.length; i++)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: AppCard(
                onTap: () =>
                    context.go('/denunciar/${ComplaintCategory.values[i].id}'),
                child: Row(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: ComplaintCategory.values[i].color
                            .withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(
                        ComplaintCategory.values[i].icon,
                        color: ComplaintCategory.values[i].color,
                        size: 28,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(ComplaintCategory.values[i].label,
                              style: t.titleMedium),
                          const SizedBox(height: 3),
                          Text(
                            _desc(ComplaintCategory.values[i]),
                            style: t.bodySmall,
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right_rounded),
                  ],
                ),
              ),
            ).animate().fadeIn(delay: (80 * i).ms).moveX(begin: 16, end: 0),

          const SizedBox(height: 12),
          _EmergencyCard(),
        ],
      ),
    );
  }

  String _desc(ComplaintCategory c) => switch (c) {
        ComplaintCategory.child =>
          'Violência física, sexual, negligência e exploração.',
        ComplaintCategory.elderly =>
          'Maus-tratos, abandono e pessoas com deficiência.',
        ComplaintCategory.env =>
          'Poluição, desmatamento, queimadas e animais.',
      };
}

class _EmergencyCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    return AppCard(
      gradient: AppColors.ink,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.emergency_share_rounded,
                  color: AppColors.secondaryLight),
              const SizedBox(width: 10),
              Text('Emergência agora?',
                  style: t.titleMedium?.copyWith(color: Colors.white)),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Se há risco imediato à vida, ligue 190 (Polícia) ou 100 (Direitos Humanos).',
            style: t.bodySmall?.copyWith(
              color: Colors.white.withValues(alpha: 0.8),
            ),
          ),
        ],
      ),
    );
  }
}
