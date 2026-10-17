import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/utils/date_format.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/shimmer_box.dart';
import '../data/notification_repository.dart';
import '../domain/app_notification.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = Theme.of(context).textTheme;
    final async = ref.watch(notificationsControllerProvider);
    final unread = ref.watch(unreadCountProvider);

    return SafeArea(
      bottom: false,
      child: RefreshIndicator(
        onRefresh: () async =>
            ref.refresh(notificationsControllerProvider.future),
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
          children: [
            Row(
              children: [
                Expanded(child: Text('Notificações', style: t.headlineSmall)),
                if (unread > 0)
                  TextButton.icon(
                    onPressed: () => ref
                        .read(notificationsControllerProvider.notifier)
                        .markAllRead(),
                    icon: const Icon(Icons.done_all_rounded, size: 18),
                    label: const Text('Marcar lidas'),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              'Atualizações das denúncias que você acompanha neste aparelho.',
              style: t.bodySmall,
            ),
            const SizedBox(height: 16),
            async.when(
              data: (items) {
                if (items.isEmpty) {
                  return EmptyState(
                    icon: Icons.notifications_off_outlined,
                    title: 'Nenhuma notificação',
                    message:
                        'Quando você enviar ou consultar uma denúncia, as atualizações aparecem aqui.',
                    action: FilledButton.tonal(
                      onPressed: () => context.go('/denunciar'),
                      child: const Text('Fazer uma denúncia'),
                    ),
                  );
                }
                return Column(
                  children: [
                    for (final n in items)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _NotificationTile(
                          n: n,
                          onTap: () {
                            ref
                                .read(notificationsControllerProvider.notifier)
                                .markRead(n.id);
                            if (n.protocol != null) {
                              context.go('/acompanhar?p=${n.protocol}');
                            }
                          },
                        ),
                      ),
                  ],
                );
              },
              loading: () => const ShimmerList(count: 4),
              error: (e, __) => EmptyState(
                icon: Icons.cloud_off_rounded,
                title: 'Não foi possível carregar',
                message: '$e',
                action: FilledButton.tonal(
                  onPressed: () =>
                      ref.invalidate(notificationsControllerProvider),
                  child: const Text('Tentar de novo'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({required this.n, required this.onTap});
  final AppNotification n;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    return AppCard(
      onTap: onTap,
      color: n.read ? null : scheme.primary.withValues(alpha: 0.05),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: n.kind.color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(n.kind.icon, color: n.kind.color, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        n.title,
                        style: t.titleSmall?.copyWith(
                          fontWeight:
                              n.read ? FontWeight.w600 : FontWeight.w800,
                        ),
                      ),
                    ),
                    if (!n.read)
                      Container(
                        width: 9,
                        height: 9,
                        decoration: BoxDecoration(
                          color: scheme.primary,
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(n.body, style: t.bodySmall),
                const SizedBox(height: 6),
                Text(DateFmt.relative(n.date), style: t.labelSmall),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
