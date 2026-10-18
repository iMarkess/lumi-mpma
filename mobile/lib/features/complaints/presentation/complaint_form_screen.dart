import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/api_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../auth/presentation/auth_controller.dart';
import '../domain/complaint.dart';
import 'providers.dart';

/// Tipos de campo do formulário (espelham o site).
enum FieldType { text, textarea, radio, emoji, identify }

class StepDef {
  const StepDef({
    required this.title,
    required this.question,
    required this.type,
    required this.field,
    this.options = const [],
    this.optional = false,
  });
  final String title;
  final String question;
  final FieldType type;
  final String field;
  final List<String> options;
  final bool optional;
}

/// Última etapa de todas as categorias: anônimo ou com contato.
const _identifyStep = StepDef(
  title: 'Identificação',
  question: 'Quer receber retorno por e-mail ou prefere ficar anônimo?',
  type: FieldType.identify,
  field: 'identify',
  optional: true,
);

/// Rótulos usados ao montar o texto enviado à equipe.
const _answerLabels = {
  'victim_name': 'Pessoa envolvida',
  'victim_age': 'Idade aproximada',
  'victim_type': 'Perfil da pessoa',
  'is_urgent': 'Em risco agora',
  'emotions': 'Como o denunciante se sente',
};

final _emailRe = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');

/// Mesmas perguntas do site (app/denunciar/[type]/page.tsx).
const Map<String, List<StepDef>> _stepsByCategory = {
  'child': [
    StepDef(
      title: 'Sobre quem precisa de ajuda',
      question: 'Quem é a criança ou adolescente que precisa de ajuda? (se souber, informe nome ou apelido)',
      type: FieldType.text,
      field: 'victim_name',
      optional: true,
    ),
    StepDef(
      title: 'Como você se sente?',
      question: 'Queremos saber: como você está se sentindo agora?',
      type: FieldType.emoji,
      field: 'emotions',
    ),
    StepDef(
      title: 'Idade aproximada',
      question: 'Você sabe a idade da criança ou adolescente?',
      type: FieldType.radio,
      field: 'victim_age',
      options: [
        'Não sei',
        '0 a 5 anos',
        '6 a 10 anos',
        '11 a 14 anos',
        '15 a 17 anos',
      ],
    ),
    StepDef(
      title: 'O que está acontecendo',
      question: 'Você pode contar, com suas palavras, o que está acontecendo?',
      type: FieldType.textarea,
      field: 'description',
    ),
    StepDef(
      title: 'Situação de risco atual',
      question: 'A criança ou adolescente está em perigo neste momento?',
      type: FieldType.radio,
      field: 'is_urgent',
      options: ['Sim', 'Não', 'Não sei'],
    ),
  ],
  'elderly': [
    StepDef(
      title: 'Sobre quem precisa de ajuda',
      question: 'Quem é a pessoa que precisa de ajuda? (se souber, informe nome ou apelido)',
      type: FieldType.text,
      field: 'victim_name',
      optional: true,
    ),
    StepDef(
      title: 'Perfil da pessoa',
      question: 'A situação envolve:',
      type: FieldType.radio,
      field: 'victim_type',
      options: [
        'Pessoa idosa',
        'Pessoa com deficiência',
        'Ambos',
        'Não sei informar',
      ],
    ),
    StepDef(
      title: 'O que está acontecendo',
      question:
          'Você pode descrever, com suas palavras, o que está acontecendo?',
      type: FieldType.textarea,
      field: 'description',
    ),
    StepDef(
      title: 'Situação de risco atual',
      question: 'A pessoa está em perigo neste momento?',
      type: FieldType.radio,
      field: 'is_urgent',
      options: ['Sim', 'Não', 'Não sei'],
    ),
  ],
  'env': [
    StepDef(
      title: 'Descrição do fato',
      question:
          'Você pode descrever, com suas palavras, o que está acontecendo?',
      type: FieldType.textarea,
      field: 'description',
    ),
    StepDef(
      title: 'Local da ocorrência',
      question: 'Onde isso está acontecendo? (informe endereço ou ponto de referência)',
      type: FieldType.text,
      field: 'location',
    ),
    StepDef(
      title: 'Situação de risco',
      question:
          'Há risco imediato à saúde das pessoas, animais ou ao meio ambiente?',
      type: FieldType.radio,
      field: 'is_urgent',
      options: ['Sim', 'Não', 'Não sei'],
    ),
  ],
};

const _emojis = ['😊', '😢', '😡', '😨', '😕', '😐', '😔', '😱', '🤫', '💪'];

class ComplaintFormScreen extends ConsumerStatefulWidget {
  const ComplaintFormScreen({super.key, required this.type});
  final String type;

  @override
  ConsumerState<ComplaintFormScreen> createState() =>
      _ComplaintFormScreenState();
}

class _ComplaintFormScreenState extends ConsumerState<ComplaintFormScreen> {
  int _step = 0;
  bool _submitting = false;
  final Map<String, String> _answers = {};
  final _textController = TextEditingController();
  final _emailController = TextEditingController();
  bool _anonymous = true;

  ComplaintCategory get _category => ComplaintCategory.fromId(widget.type);
  List<StepDef> get _steps => [
    ...?(_stepsByCategory[widget.type] ?? _stepsByCategory['child']),
    _identifyStep,
  ];
  StepDef get _current => _steps[_step];

  @override
  void initState() {
    super.initState();
    _emailController.text = ref.read(authControllerProvider).user?.email ?? '';
  }

  @override
  void dispose() {
    _textController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  void _syncControllerFromAnswer() {
    if (_current.type == FieldType.text ||
        _current.type == FieldType.textarea) {
      _textController.text = _answers[_current.field] ?? '';
      _textController.selection = TextSelection.collapsed(
        offset: _textController.text.length,
      );
    }
  }

  bool get _canAdvance {
    final v = _answers[_current.field]?.trim() ?? '';
    if (_current.type == FieldType.identify) {
      return _anonymous || _emailRe.hasMatch(_emailController.text.trim());
    }
    // Descrição precisa de ao menos 10 caracteres (regra do servidor).
    if (_current.type == FieldType.textarea) return v.length >= 10;
    if (_current.optional) return true;
    return v.isNotEmpty;
  }

  void _next() {
    if (_current.type == FieldType.text ||
        _current.type == FieldType.textarea) {
      _answers[_current.field] = _textController.text.trim();
    }
    if (!_canAdvance) {
      final msg = switch (_current.type) {
        FieldType.textarea => 'Descreva com mais detalhes (mínimo 10 letras).',
        FieldType.identify =>
          'Informe um e-mail válido ou escolha ficar anônimo.',
        FieldType.radio ||
        FieldType.emoji => 'Escolha uma opção para continuar.',
        FieldType.text => 'Preencha para continuar.',
      };
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      return;
    }
    FocusScope.of(context).unfocus();
    if (_step < _steps.length - 1) {
      setState(() => _step++);
      _syncControllerFromAnswer();
    } else {
      _submit();
    }
  }

  void _back() {
    if (_current.type == FieldType.text ||
        _current.type == FieldType.textarea) {
      _answers[_current.field] = _textController.text.trim();
    }
    if (_step > 0) {
      setState(() => _step--);
      _syncControllerFromAnswer();
    } else {
      context.canPop() ? context.pop() : context.go('/denunciar');
    }
  }

  Future<void> _submit() async {
    setState(() => _submitting = true);
    HapticFeedback.mediumImpact();
    final victim = _answers['victim_name']?.trim() ?? '';
    var title = victim.isNotEmpty
        ? 'Denúncia: $victim'
        : 'Denúncia ${_category.label}';
    if (title.length > 150) title = '${title.substring(0, 150)}…';
    final urgent = _answers['is_urgent'] == 'Sim';
    try {
      final complaint = await ref
          .read(complaintRepositoryProvider)
          .submit(
            category: _category,
            title: title,
            location: _answers['location']?.trim() ?? '',
            description: _composeDescription(),
            priority: urgent ? ComplaintPriority.alta : ComplaintPriority.media,
            anonymous: _anonymous,
            contactEmail: _anonymous ? null : _emailController.text.trim(),
          );
      ref.invalidate(recentComplaintsProvider);
      if (mounted) _showSuccess(complaint.id);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              e is ApiException
                  ? e.message
                  : 'Não foi possível enviar. Verifique a conexão.',
            ),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  /// Relato + respostas das outras etapas, para a equipe ver tudo.
  String _composeDescription() {
    final extra = [
      for (final e in _answerLabels.entries)
        if ((_answers[e.key]?.trim() ?? '').isNotEmpty)
          '${e.value}: ${_answers[e.key]!.trim()}',
    ];
    final text = [
      _answers['description']?.trim() ?? '',
      if (extra.isNotEmpty)
        '\n— Informações do formulário —\n${extra.join('\n')}',
    ].join('\n');
    return text.length > 4000 ? text.substring(0, 4000) : text;
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final progress = (_step + 1) / _steps.length;

    // Voltar do sistema volta uma etapa, sem perder o que já foi respondido.
    return PopScope(
      canPop: _step == 0 && !_submitting,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop && !_submitting) _back();
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(_category.label),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: _back,
          ),
        ),
        body: SafeArea(
          child: Column(
            children: [
              // Progresso
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 4, 20, 0),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Etapa ${_step + 1} de ${_steps.length}',
                          style: t.labelMedium,
                        ),
                        Text(
                          '${(progress * 100).round()}%',
                          style: t.labelMedium,
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(999),
                      child: LinearProgressIndicator(
                        value: progress,
                        minHeight: 8,
                        backgroundColor: scheme.surfaceContainerHigh,
                        color: _category.color,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 24),
                  child: Column(
                    key: ValueKey(_step),
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _current.title.toUpperCase(),
                        style: t.labelMedium?.copyWith(
                          color: _category.color,
                          letterSpacing: 1,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(_current.question, style: t.headlineSmall),
                      const SizedBox(height: 24),
                      _buildField(),
                    ],
                  ).animate().fadeIn(duration: 250.ms).moveX(begin: 16, end: 0),
                ),
              ),
              // Rodapé
              Container(
                padding: EdgeInsets.fromLTRB(
                  20,
                  12,
                  20,
                  12 + MediaQuery.paddingOf(context).bottom,
                ),
                decoration: BoxDecoration(
                  color: scheme.surface,
                  border: Border(top: BorderSide(color: scheme.outlineVariant)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      // Sem ícone: em tela de 360dp o rótulo quebrava ("Volta/r").
                      child: OutlinedButton(
                        onPressed: _submitting ? null : _back,
                        child: const Text(
                          'Voltar',
                          maxLines: 1,
                          softWrap: false,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: FilledButton.icon(
                        onPressed: _submitting ? null : _next,
                        icon: _submitting
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.2,
                                  color: Colors.white,
                                ),
                              )
                            : Icon(
                                _step == _steps.length - 1
                                    ? Icons.send_rounded
                                    : Icons.chevron_right_rounded,
                              ),
                        label: Text(
                          _step == _steps.length - 1
                              ? 'Enviar denúncia'
                              : 'Próximo',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildField() {
    switch (_current.type) {
      case FieldType.identify:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              value: _anonymous,
              onChanged: (v) => setState(() => _anonymous = v),
              secondary: const Icon(Icons.visibility_off_rounded),
              title: const Text('Denúncia anônima'),
              subtitle: const Text(
                'Nenhum dado seu é enviado junto com o relato.',
              ),
            ),
            if (!_anonymous) ...[
              const SizedBox(height: 12),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'E-mail para contato',
                  prefixIcon: Icon(Icons.mail_outline_rounded),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Usado só para a equipe falar com você sobre esta denúncia.',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ],
        );
      case FieldType.text:
        return TextField(
          controller: _textController,
          textCapitalization: TextCapitalization.sentences,
          onChanged: (v) => _answers[_current.field] = v,
          decoration: InputDecoration(
            hintText: _current.optional ? 'Opcional' : 'Digite aqui...',
          ),
        );
      case FieldType.textarea:
        return TextField(
          controller: _textController,
          maxLines: 6,
          maxLength: 3500,
          textCapitalization: TextCapitalization.sentences,
          onChanged: (v) => _answers[_current.field] = v,
          decoration: const InputDecoration(
            hintText: 'Descreva com suas palavras...',
            alignLabelWithHint: true,
          ),
        );
      case FieldType.emoji:
        return Wrap(
          spacing: 12,
          runSpacing: 12,
          children: _emojis.map((e) {
            final active = _answers[_current.field] == e;
            return GestureDetector(
              onTap: () => setState(() => _answers[_current.field] = e),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: active
                      ? _category.color.withValues(alpha: 0.16)
                      : Theme.of(context).colorScheme.surfaceContainerHigh,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: active ? _category.color : Colors.transparent,
                    width: 2,
                  ),
                ),
                alignment: Alignment.center,
                child: Text(e, style: const TextStyle(fontSize: 28)),
              ),
            );
          }).toList(),
        );
      case FieldType.radio:
        return Column(
          children: _current.options.map((opt) {
            final active = _answers[_current.field] == opt;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: GestureDetector(
                onTap: () => setState(() => _answers[_current.field] = opt),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 16,
                  ),
                  decoration: BoxDecoration(
                    color: active
                        ? _category.color.withValues(alpha: 0.1)
                        : Theme.of(context).colorScheme.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: active
                          ? _category.color
                          : Theme.of(context).colorScheme.outlineVariant,
                      width: active ? 2 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        active
                            ? Icons.radio_button_checked_rounded
                            : Icons.radio_button_unchecked_rounded,
                        color: active
                            ? _category.color
                            : Theme.of(context).colorScheme.onSurfaceVariant,
                        size: 22,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          opt,
                          style: Theme.of(context).textTheme.titleSmall,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        );
    }
  }

  void _showSuccess(String protocol) {
    HapticFeedback.heavyImpact();
    showModalBottomSheet(
      context: context,
      isDismissible: false,
      enableDrag: false,
      // Rolável: em tela pequena "Voltar ao início" ficava cortado.
      isScrollControlled: true,
      builder: (ctx) => SafeArea(
        child: SingleChildScrollView(
          child: Padding(
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
                  child: const Icon(
                    Icons.check_rounded,
                    color: AppColors.success,
                    size: 40,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Denúncia enviada!',
                  style: Theme.of(ctx).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  'Registrada com sucesso. Guarde seu protocolo — ele também fica salvo em Acompanhar:',
                  style: Theme.of(ctx).textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: Theme.of(ctx).colorScheme.surfaceContainerHigh,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        protocol,
                        style: Theme.of(ctx).textTheme.titleMedium
                            ?.copyWith(letterSpacing: 1),
                      ),
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
                    context.go('/acompanhar?p=$protocol');
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
        ),
      ),
    );
  }
}
