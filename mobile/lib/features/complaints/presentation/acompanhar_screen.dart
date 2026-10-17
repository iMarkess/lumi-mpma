import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
  const AcompanharScreen({super.key, this.protocol});

  /// Protocolo vindo de outra tela (`/acompanhar?p=...`): consulta na hora.
  final String? protocol;

  @override
  ConsumerState<AcompanharScreen> createState() => _AcompanharScreenState();
}

class _AcompanharScreenState extends ConsumerState<AcompanharScreen> {
  final _controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    _searchIncoming();
  }

  @override
  void didUpdateWidget(covariant AcompanharScreen old) {
    super.didUpdateWidget(old);
    if (widget.protocol != old.protocol) _searchIncoming();
  }

  void _searchIncoming() {
    final p = widget.protocol;
    if (p == null || p.isEmpty) return;
    _controller.text = p;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _search();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _search() {
    final q = _controller.text.trim().toUpperCase();
    if (q.isEmpty) return;
    _controller.text = q;
    FocusScope.of(context).unfocus();
    ref.read(protocolQueryProvider.notifier).search(q);
  }

  Future<void> _forget(Complaint c) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Remover da lista?'),
        content: Text(
          'O protocolo ${c.id} sai deste aparelho. A denúncia continua registrada '
          'e pode ser consultada de novo pelo número.',
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancelar')),
          FilledButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Remover')),
        ],
      ),
    );
    if (ok != true) return;
    await ref.read(complaintRepositoryProvider).forget(c.id);
    ref.invalidate(recentComplaintsProvider);
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final query = ref.watch(protocolQueryProvider);
    final recent = ref.watch(recentComplaintsProvider);

    return SafeArea(
      bottom: false,
      child: RefreshIndicator(
        onRefresh: () async {
          if (_controller.text.trim().isNotEmpty) _search();
          ref.invalidate(recentComplaintsProvider);
          await ref.read(recentComplaintsProvider.future);
        },
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
          children: [
            Text('Acompanhar', style: t.headlineSmall),
            const SizedBox(height: 4),
            Text('Consulte o andamento pelo número do protocolo.',
                style: t.bodyMedium),
            const SizedBox(height: 18),

            SearchBar(
              controller: _controller,
              hintText: 'Ex.: LUMI-X82J91',
              textCapitalization: TextCapitalization.characters,
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
              error: (e, __) => EmptyState(
                icon: Icons.cloud_off_rounded,
                title: 'Não foi possível consultar',
                message: '$e',
              ),
            ),

            const SizedBox(height: 8),
            const SectionHeader(title: 'Minhas denúncias'),
            recent.when(
              data: (list) {
                if (list.isEmpty) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Text(
                      'As denúncias que você enviar ou consultar aparecem aqui.',
                      style: t.bodySmall,
                    ),
                  );
                }
                return Column(
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
                              IconButton(
                                tooltip: 'Remover da lista',
                                visualDensity: VisualDensity.compact,
                                icon: const Icon(Icons.close_rounded, size: 18),
                                onPressed: () => _forget(c),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                );
              },
              loading: () => const Padding(
                padding: EdgeInsets.all(16),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (e, __) => Text('$e', style: t.bodySmall),
            ),
          ],
        ),
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
    final muted = Theme.of(context).colorScheme.onSurfaceVariant;
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
                    GestureDetector(
                      onLongPress: () {
                        Clipboard.setData(ClipboardData(text: complaint.id));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Protocolo copiado.')),
                        );
                      },
                      child: Text(complaint.id, style: t.titleMedium),
                    ),
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
          Wrap(
            spacing: 14,
            runSpacing: 6,
            children: [
              Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.place_outlined, size: 15, color: muted),
                const SizedBox(width: 4),
                Text(complaint.location, style: t.bodySmall),
              ]),
              Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.schedule_rounded, size: 15, color: muted),
                const SizedBox(width: 4),
                Text(DateFmt.full(complaint.date), style: t.bodySmall),
              ]),
            ],
          ),
          const SizedBox(height: 18),
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
          _Timeline(complaint: complaint),
        ],
      ),
    );
  }
}

class _Timeline extends StatelessWidget {
  const _Timeline({required this.complaint});
  final Complaint complaint;

  @override
  Widget build(BuildContext context) {
    final current = complaint.status;
    final steps = [
      ComplaintStatus.recebida,
      ComplaintStatus.emTriagem,
      ComplaintStatus.emAnalise,
      current == ComplaintStatus.rejeitada
          ? ComplaintStatus.rejeitada
          : ComplaintStatus.concluida,
    ];
    final currentIndex = steps.indexOf(current);
    final t = Theme.of(context).textTheme;

    // Último evento de cada status (data + observação da equipe).
    final byStatus = <ComplaintStatus, ComplaintEvent>{
      for (final e in complaint.events) e.status: e,
    };

    return Column(
      children: [
        for (var i = 0; i < steps.length; i++)
          IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  children: [
                    Icon(
                      i <= currentIndex
                          ? (steps[i] == ComplaintStatus.rejeitada
                              ? Icons.cancel_rounded
                              : Icons.check_circle_rounded)
                          : Icons.circle_outlined,
                      size: 22,
                      color: i <= currentIndex
                          ? (steps[i] == ComplaintStatus.rejeitada
                              ? AppColors.danger
                              : AppColors.success)
                          : Theme.of(context).colorScheme.outline,
                    ),
                    if (i < steps.length - 1)
                      Expanded(
                        child: Container(
                          width: 2,
                          constraints: const BoxConstraints(minHeight: 22),
                          color: i < currentIndex
                              ? AppColors.success
                              : Theme.of(context).colorScheme.outlineVariant,
                        ),
                      ),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 1, bottom: 10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          steps[i].label,
                          style: t.bodyMedium?.copyWith(
                            fontWeight: i == currentIndex
                                ? FontWeight.w700
                                : FontWeight.w400,
                          ),
                        ),
                        if (byStatus[steps[i]] case final e?) ...[
                          Text(DateFmt.full(e.date), style: t.labelSmall),
                          if (e.note != null && e.note!.isNotEmpty)
                            Text(e.note!, style: t.bodySmall),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}
