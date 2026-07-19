import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/date_format.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/shimmer_box.dart';
import '../../../core/widgets/status_chip.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../complaints/domain/complaint.dart';
import '../../complaints/presentation/providers.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final user = ref.watch(authControllerProvider).user;
    final recent = ref.watch(recentComplaintsProvider);

    return SafeArea(
      bottom: false,
      child: RefreshIndicator(
        onRefresh: () async => ref.refresh(recentComplaintsProvider.future),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
          children: [
            // Cabeçalho
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('${DateFmt.greeting()},', style: t.bodyMedium),
                      Text(
                        user?.firstName ?? 'Cidadão',
                        style: t.headlineSmall,
                      ),
                    ],
                  ),
                ),
                _Avatar(initials: user?.initials ?? '?'),
              ],
            ).animate().fadeIn(duration: 350.ms),
            const SizedBox(height: 20),

            // Banner destaque (alerta / chamada)
            AppCard(
              gradient: AppColors.brand,
              onTap: () => context.go('/denunciar'),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Viu algo errado?',
                          style: t.titleLarge?.copyWith(color: Colors.white),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Faça sua denúncia com sigilo total. Pode ser anônima.',
                          style: t.bodySmall?.copyWith(
                            color: Colors.white.withValues(alpha: 0.9),
                          ),
                        ),
                        const SizedBox(height: 14),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            'Denunciar agora',
                            style: t.labelLarge?.copyWith(
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.verified_user_rounded,
                      color: Colors.white, size: 56),
                ],
              ),
            ).animate().fadeIn(delay: 100.ms).moveY(begin: 16, end: 0),
            const SizedBox(height: 24),

            // Indicadores
            recent.when(
              data: (list) => _Indicators(items: list),
              loading: () => Row(
                children: List.generate(
                  3,
                  (i) => Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(right: i < 2 ? 12 : 0),
                      child: const ShimmerBox(height: 92, radius: 24),
                    ),
                  ),
                ),
              ),
              error: (_, __) => const SizedBox.shrink(),
            ),
            const SizedBox(height: 24),

            // Atalhos
            const SectionHeader(title: 'Acesso rápido'),
            _Shortcuts(),
            const SizedBox(height: 24),

            // Atividades recentes
            SectionHeader(
              title: 'Denúncias recentes',
              actionLabel: 'Ver tudo',
              onAction: () => context.go('/acompanhar'),
            ),
            recent.when(
              data: (list) => Column(
                children: [
                  for (final c in list.take(3))
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _ComplaintTile(complaint: c),
                    ),
                ],
              ),
              loading: () => const ShimmerList(count: 3),
              error: (_, __) => Text('Erro ao carregar.', style: t.bodyMedium),
            ),
          ],
        ),
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar({required this.initials});
  final String initials;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 52,
      height: 52,
      decoration: const BoxDecoration(
        gradient: AppColors.brand,
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Text(
        initials,
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w700,
          fontSize: 18,
        ),
      ),
    );
  }
}

class _Indicators extends StatelessWidget {
  const _Indicators({required this.items});
  final List<Complaint> items;

  @override
  Widget build(BuildContext context) {
    final total = items.length;
    final analysis = items
        .where((c) => c.status == ComplaintStatus.emAnalise ||
            c.status == ComplaintStatus.emTriagem)
        .length;
    final done =
        items.where((c) => c.status == ComplaintStatus.concluida).length;

    final data = [
      ('Total', '$total', Icons.folder_copy_rounded, AppColors.primary),
      ('Em andamento', '$analysis', Icons.pending_actions_rounded,
          AppColors.warning),
      ('Concluídas', '$done', Icons.task_alt_rounded, AppColors.success),
    ];

    return Row(
      children: [
        for (var i = 0; i < data.length; i++)
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(right: i < data.length - 1 ? 12 : 0),
              child: AppCard(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(data[i].$3, color: data[i].$4, size: 22),
                    const SizedBox(height: 10),
                    Text(
                      data[i].$2,
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    Text(
                      data[i].$1,
                      style: Theme.of(context).textTheme.bodySmall,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    ).animate().fadeIn(delay: 150.ms);
  }
}

class _Shortcuts extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final items = [
      ('Nova denúncia', Icons.add_alert_rounded, AppColors.secondary,
          '/denunciar'),
      ('Acompanhar', Icons.search_rounded, AppColors.primary, '/acompanhar'),
      ('Alertas', Icons.notifications_rounded, AppColors.accent, '/notificacoes'),
      ('Meu perfil', Icons.person_rounded, AppColors.success, '/perfil'),
    ];
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.9,
      children: [
        for (final it in items)
          AppCard(
            onTap: () => context.go(it.$4),
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: it.$3.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(it.$2, color: it.$3, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    it.$1,
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _ComplaintTile extends StatelessWidget {
  const _ComplaintTile({required this.complaint});
  final Complaint complaint;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    return AppCard(
      onTap: () {},
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: complaint.category.color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(complaint.category.icon,
                color: complaint.category.color, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  complaint.title,
                  style: t.titleSmall,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.place_outlined,
                        size: 13,
                        color: Theme.of(context).colorScheme.onSurfaceVariant),
                    const SizedBox(width: 3),
                    Text('${complaint.location} · ${DateFmt.relative(complaint.date)}',
                        style: t.bodySmall),
                  ],
                ),
                const SizedBox(height: 8),
                StatusChip(status: complaint.status, dense: true),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
