import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/date_format.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/status_chip.dart';
import '../domain/complaint.dart';
import 'providers.dart';

class AcompanharScreen extends ConsumerStatefulWidget {
  const AcompanharScreen({super.key});

  @override
  ConsumerState<AcompanharScreen> createState() => _AcompanharScreenState();
}

class _AcompanharScreenState extends ConsumerState<AcompanharScreen> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _search() {
    final q = _controller.text.trim();
    if (q.isEmpty) return;
    FocusScope.of(context).unfocus();
    ref.read(protocolQueryProvider.notifier).search(q);
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final query = ref.watch(protocolQueryProvider);
    final recent = ref.watch(recentComplaintsProvider);

    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
        children: [
          Text('Acompanhar', style: t.headlineSmall),
          const SizedBox(height: 4),
          Text('Consulte o andamento pelo número do protocolo.',
              style: t.bodyMedium),
          const SizedBox(height: 18),

          // Search bar
          SearchBar(
            controller: _controller,
            hintText: 'Ex.: LUMI-X82J91',
            leading: const Icon(Icons.search_rounded),
            trailing: [
              FilledButton(
                onPressed: _search,
                style: FilledButton.styleFrom(
                  minimumSize: const Size(0, 40),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                ),
                child: const Text('Buscar'),
              ),
            ],
            onSubmitted: (_) => _search(),
            padding: const WidgetStatePropertyAll(
              EdgeInsets.symmetric(horizontal: 16),
            ),
          ),
          const SizedBox(height: 18),

          // Resultado da busca
          query.when(
            data: (c) {
              if (c == null) {
                if (_controller.text.trim().isEmpty) {
                  return const SizedBox.shrink();
                }
                return const EmptyState(
                  icon: Icons.manage_search_rounded,
                  title: 'Protocolo não encontrado',
                  message: 'Confira o número e tente novamente.',
                );
              }
              return _ComplaintDetail(complaint: c);
            },
            loading: () => const Padding(
              padding: EdgeInsets.all(24),
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (_, __) => Text('Erro na busca.', style: t.bodyMedium),
          ),

          const SizedBox(height: 8),
          const SectionHeader(title: 'Denúncias recentes'),
          recent.when(
            data: (list) => Column(
              children: [
                for (final c in list)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: AppCard(
                      onTap: () {
                        _controller.text = c.id;
                        _search();
                      },
                      child: Row(
                        children: [
                          Icon(c.category.icon, color: c.category.color),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(c.id, style: t.titleSmall),
                                Text(c.title,
                                    style: t.bodySmall,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis),
                              ],
                            ),
                          ),
                          StatusChip(status: c.status, dense: true),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }
}

class _ComplaintDetail extends StatelessWidget {
  const _ComplaintDetail({required this.complaint});
  final Complaint complaint;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: complaint.category.color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(complaint.category.icon,
                    color: complaint.category.color),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(complaint.id, style: t.titleMedium),
                    Text(complaint.category.label, style: t.bodySmall),
                  ],
                ),
              ),
              StatusChip(status: complaint.status),
            ],
          ),
          const Divider(height: 28),
          Text(complaint.title, style: t.titleSmall),
          const SizedBox(height: 6),
          Text(complaint.description, style: t.bodyMedium),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(Icons.place_outlined,
                  size: 15,
                  color: Theme.of(context).colorScheme.onSurfaceVariant),
              const SizedBox(width: 4),
              Text(complaint.location, style: t.bodySmall),
              const SizedBox(width: 14),
              Icon(Icons.schedule_rounded,
                  size: 15,
                  color: Theme.of(context).colorScheme.onSurfaceVariant),
              const SizedBox(width: 4),
              Text(DateFmt.relative(complaint.date), style: t.bodySmall),
            ],
          ),
          const SizedBox(height: 18),
          // Progresso
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: complaint.status.progress,
              minHeight: 8,
              backgroundColor:
                  Theme.of(context).colorScheme.surfaceContainerHigh,
              color: complaint.status.color,
            ),
          ),
          const SizedBox(height: 16),
          _Timeline(current: complaint.status),
        ],
      ),
    );
  }
}

class _Timeline extends StatelessWidget {
  const _Timeline({required this.current});
  final ComplaintStatus current;

  @override
  Widget build(BuildContext context) {
    const steps = [
      ComplaintStatus.recebida,
      ComplaintStatus.emTriagem,
      ComplaintStatus.emAnalise,
      ComplaintStatus.concluida,
    ];
    final currentIndex = steps.indexOf(current);
    final t = Theme.of(context).textTheme;

    return Column(
      children: [
        for (var i = 0; i < steps.length; i++)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  Icon(
                    i <= currentIndex
                        ? Icons.check_circle_rounded
                        : Icons.circle_outlined,
                    size: 22,
                    color: i <= currentIndex
                        ? AppColors.success
                        : Theme.of(context).colorScheme.outline,
                  ),
                  if (i < steps.length - 1)
                    Container(
                      width: 2,
                      height: 22,
                      color: i < currentIndex
                          ? AppColors.success
                          : Theme.of(context).colorScheme.outlineVariant,
                    ),
                ],
              ),
              const SizedBox(width: 12),
              Padding(
                padding: const EdgeInsets.only(top: 1),
                child: Text(
                  steps[i].label,
                  style: t.bodyMedium?.copyWith(
                    fontWeight:
                        i == currentIndex ? FontWeight.w700 : FontWeight.w400,
                  ),
                ),
              ),
            ],
          ),
      ],
    );
  }
}
