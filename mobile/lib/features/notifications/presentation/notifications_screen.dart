import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/utils/date_format.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/shimmer_box.dart';
import '../data/notification_repository.dart';
import '../domain/app_notification.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  NotificationKind? _filter;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final async = ref.watch(notificationsControllerProvider);

    return SafeArea(
      bottom: false,
      child: RefreshIndicator(
        onRefresh: () async =>
            ref.refresh(notificationsControllerProvider.future),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
          children: [
            Row(
              children: [
                Expanded(child: Text('Notificações', style: t.headlineSmall)),
                TextButton.icon(
                  onPressed: () => ref
                      .read(notificationsControllerProvider.notifier)
                      .markAllRead(),
                  icon: const Icon(Icons.done_all_rounded, size: 18),
                  label: const Text('Marcar lidas'),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Filtros
            SizedBox(
              height: 40,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  _chip('Todas', _filter == null, () {
                    setState(() => _filter = null);
                  }),
                  for (final k in NotificationKind.values)
                    _chip(k.label, _filter == k, () {
                      setState(() => _filter = k);
                    }),
                ],
              ),
            ),
            const SizedBox(height: 12),

            async.when(
              data: (list) {
                final items = _filter == null
                    ? list
                    : list.where((n) => n.kind == _filter).toList();
                if (items.isEmpty) {
                  return const EmptyState(
                    icon: Icons.notifications_off_outlined,
                    title: 'Nenhuma notificação',
                    message: 'Você está em dia por aqui.',
                  );
                }
                return Column(
                  children: [
                    for (final n in items)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _NotificationTile(
                          n: n,
                          onTap: () => ref
                              .read(notificationsControllerProvider.notifier)
                              .markRead(n.id),
                        ),
                      ),
                  ],
                );
              },
              loading: () => const ShimmerList(count: 5),
              error: (_, __) => Text('Erro ao carregar.', style: t.bodyMedium),
            ),
          ],
        ),
      ),
    );
  }

  Widget _chip(String label, bool selected, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => onTap(),
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
                Text(DateFmt.relative(n.date),
                    style: t.labelSmall),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
