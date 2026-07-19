import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../domain/complaint.dart';
import 'providers.dart';

class ComplaintFormScreen extends ConsumerStatefulWidget {
  const ComplaintFormScreen({super.key, required this.type});
  final String type;

  @override
  ConsumerState<ComplaintFormScreen> createState() =>
      _ComplaintFormScreenState();
}

class _ComplaintFormScreenState extends ConsumerState<ComplaintFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _location = TextEditingController();
  final _description = TextEditingController();
  ComplaintPriority _priority = ComplaintPriority.media;
  bool _anonymous = true;
  bool _submitting = false;

  ComplaintCategory get _category => ComplaintCategory.fromId(widget.type);

  @override
  void dispose() {
    _title.dispose();
    _location.dispose();
    _description.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();
    setState(() => _submitting = true);
    HapticFeedback.mediumImpact();
    try {
      final complaint =
          await ref.read(complaintRepositoryProvider).submit(
                category: _category,
                title: _title.text.trim(),
                location: _location.text.trim(),
                description: _description.text.trim(),
                priority: _priority,
                anonymous: _anonymous,
              );
      ref.invalidate(recentComplaintsProvider);
      if (mounted) _showSuccess(complaint.id);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nova denúncia'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.canPop() ? context.pop() : context.go('/denunciar'),
        ),
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
            children: [
              // Cabeçalho categoria
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: _category.color.withValues(alpha: 0.10),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    Icon(_category.icon, color: _category.color, size: 30),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Categoria', style: t.bodySmall),
                          Text(_category.label, style: t.titleMedium),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),

              Text('Título', style: t.labelLarge),
              const SizedBox(height: 8),
              TextFormField(
                controller: _title,
                textCapitalization: TextCapitalization.sentences,
                decoration: const InputDecoration(
                  hintText: 'Resuma o que aconteceu',
                ),
                validator: (v) => (v == null || v.trim().length < 4)
                    ? 'Descreva um título com ao menos 4 letras'
                    : null,
              ),
              const SizedBox(height: 16),

              Text('Localização', style: t.labelLarge),
              const SizedBox(height: 8),
              TextFormField(
                controller: _location,
                textCapitalization: TextCapitalization.words,
                decoration: const InputDecoration(
                  hintText: 'Cidade / bairro / referência',
                  prefixIcon: Icon(Icons.place_outlined),
                ),
              ),
              const SizedBox(height: 16),

              Text('Descrição', style: t.labelLarge),
              const SizedBox(height: 8),
              TextFormField(
                controller: _description,
                maxLines: 5,
                textCapitalization: TextCapitalization.sentences,
                decoration: const InputDecoration(
                  hintText: 'Conte os detalhes: o que, quando, quem está envolvido...',
                  alignLabelWithHint: true,
                ),
                validator: (v) => (v == null || v.trim().length < 10)
                    ? 'Descreva com mais detalhes (mín. 10 letras)'
                    : null,
              ),
              const SizedBox(height: 20),

              Text('Prioridade', style: t.labelLarge),
              const SizedBox(height: 8),
              SegmentedButton<ComplaintPriority>(
                segments: const [
                  ButtonSegment(
                    value: ComplaintPriority.baixa,
                    label: Text('Baixa'),
                  ),
                  ButtonSegment(
                    value: ComplaintPriority.media,
                    label: Text('Média'),
                  ),
                  ButtonSegment(
                    value: ComplaintPriority.alta,
                    label: Text('Alta'),
                  ),
                ],
                selected: {_priority},
                onSelectionChanged: (s) => setState(() => _priority = s.first),
              ),
              const SizedBox(height: 16),

              // Anexo (mock)
              OutlinedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Anexo de mídia disponível na integração real.'),
                    ),
                  );
                },
                icon: const Icon(Icons.attach_file_rounded),
                label: const Text('Anexar foto ou vídeo (opcional)'),
              ),
              const SizedBox(height: 8),

              // Anônimo
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                value: _anonymous,
                onChanged: (v) => setState(() => _anonymous = v),
                title: Text('Denúncia anônima', style: t.titleSmall),
                subtitle: Text(
                  'Não registramos sua identidade.',
                  style: t.bodySmall,
                ),
              ),
              const SizedBox(height: 8),

              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: scheme.surfaceContainerHigh,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Icon(Icons.lock_rounded,
                        size: 18, color: AppColors.success),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Seus dados trafegam de forma segura e sigilosa.',
                        style: t.bodySmall,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),

              FilledButton.icon(
                onPressed: _submitting ? null : _submit,
                icon: _submitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.4,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.send_rounded),
                label: Text(_submitting ? 'Enviando...' : 'Enviar denúncia'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showSuccess(String protocol) {
    HapticFeedback.heavyImpact();
    showModalBottomSheet(
      context: context,
      isDismissible: false,
      enableDrag: false,
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: 0.14),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_rounded,
                  color: AppColors.success, size: 40),
            ),
            const SizedBox(height: 16),
            Text('Denúncia registrada!',
                style: Theme.of(ctx).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text(
              'Guarde seu protocolo para acompanhar o andamento:',
              style: Theme.of(ctx).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
              decoration: BoxDecoration(
                color: Theme.of(ctx).colorScheme.surfaceContainerHigh,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(protocol,
                      style: Theme.of(ctx).textTheme.titleMedium?.copyWith(
                            letterSpacing: 1,
                          )),
                  const SizedBox(width: 10),
                  IconButton(
                    visualDensity: VisualDensity.compact,
                    icon: const Icon(Icons.copy_rounded, size: 18),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: protocol));
                      ScaffoldMessenger.of(ctx).showSnackBar(
                        const SnackBar(content: Text('Protocolo copiado.')),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: () {
                Navigator.pop(ctx);
                context.go('/acompanhar');
              },
              child: const Text('Acompanhar denúncia'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                context.go('/home');
              },
              child: const Text('Voltar ao início'),
            ),
          ],
        ),
      ),
    );
  }
}
