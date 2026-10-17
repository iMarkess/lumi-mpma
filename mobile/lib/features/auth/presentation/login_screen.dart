import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/config.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/launcher.dart';
import '../../profile/presentation/theme_controller.dart';
import 'auth_controller.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _id = TextEditingController();
  final _pass = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _obscure = true;

  @override
  void dispose() {
    _id.dispose();
    _pass.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();
    // O router leva para a Home sozinho quando a sessão é criada.
    await ref.read(authControllerProvider.notifier).login(_id.text, _pass.text);
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final t = Theme.of(context).textTheme;
    final state = ref.watch(authControllerProvider);
    final themeMode = ref.watch(themeControllerProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    ref.listen(authControllerProvider, (prev, next) {
      if (next.error != null && next.error != prev?.error) {
        ScaffoldMessenger.of(context)
          ..hideCurrentSnackBar()
          ..showSnackBar(
            SnackBar(
              content: Text(next.error!),
              backgroundColor: AppColors.danger,
            ),
          );
      }
    });

    return Scaffold(
      body: Stack(
        children: [
          // Fundo com gradiente de marca no topo
          Container(
            height: MediaQuery.sizeOf(context).height * 0.42,
            decoration: const BoxDecoration(gradient: AppColors.brand),
          ),
          Positioned(
            top: MediaQuery.paddingOf(context).top + 8,
            right: 8,
            child: IconButton(
              onPressed: () =>
                  ref.read(themeControllerProvider.notifier).toggle(),
              icon: Icon(
                themeMode == ThemeMode.dark
                    ? Icons.light_mode_rounded
                    : Icons.dark_mode_rounded,
                color: Colors.white,
              ),
              tooltip: 'Alternar tema',
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(24, 40, 24, 32),
              child: Column(
                children: [
                  // Marca
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(28),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.18),
                          blurRadius: 30,
                          offset: const Offset(0, 12),
                        ),
                      ],
                    ),
                    child: Image.asset(
                      'assets/images/lumi_brand.png',
                      height: 84,
                    ),
                  ).animate().fadeIn(duration: 400.ms).scale(
                        begin: const Offset(0.85, 0.85),
                        curve: Curves.easeOutBack,
                      ),
                  const SizedBox(height: 20),
                  Text(
                    AppConstants.appName,
                    style: t.headlineMedium?.copyWith(color: Colors.white),
                  ),
                  Text(
                    AppConstants.orgName,
                    style: t.bodySmall?.copyWith(
                      color: Colors.white.withValues(alpha: 0.85),
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 28),

                  // Denúncia anônima: caminho principal, sem cadastro
                  Container(
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      color: scheme.surface,
                      borderRadius: BorderRadius.circular(28),
                      border: Border.all(color: scheme.outlineVariant),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black
                              .withValues(alpha: isDark ? 0.3 : 0.08),
                          blurRadius: 30,
                          offset: const Offset(0, 14),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.visibility_off_rounded,
                                color: AppColors.success),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text('Denunciar sem se identificar',
                                  style: t.titleMedium),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Não precisa de cadastro. Você recebe um protocolo para acompanhar.',
                          style: t.bodySmall,
                        ),
                        const SizedBox(height: 16),
                        FilledButton.icon(
                          onPressed: state.loading
                              ? null
                              : () => ref
                                  .read(authControllerProvider.notifier)
                                  .continueAsGuest(),
                          icon: const Icon(Icons.arrow_forward_rounded),
                          label: const Text('Continuar sem conta'),
                        ),
                      ],
                    ),
                  ).animate().fadeIn(delay: 100.ms).moveY(begin: 20, end: 0),
                  const SizedBox(height: 16),

                  // Login da conta de cidadão
                  Container(
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      color: scheme.surface,
                      borderRadius: BorderRadius.circular(28),
                      border: Border.all(color: scheme.outlineVariant),
                    ),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Já tenho conta', style: t.titleMedium),
                          const SizedBox(height: 4),
                          Text(
                            'Entre com seu CPF ou e-mail e senha.',
                            style: t.bodySmall,
                          ),
                          const SizedBox(height: 18),
                          TextFormField(
                            controller: _id,
                            keyboardType: TextInputType.emailAddress,
                            autofillHints: const [AutofillHints.username],
                            textInputAction: TextInputAction.next,
                            decoration: const InputDecoration(
                              labelText: 'CPF ou e-mail',
                              prefixIcon: Icon(Icons.badge_outlined),
                            ),
                            validator: (v) => (v == null || v.trim().isEmpty)
                                ? 'Informe seu CPF ou e-mail'
                                : null,
                          ),
                          const SizedBox(height: 14),
                          TextFormField(
                            controller: _pass,
                            obscureText: _obscure,
                            autofillHints: const [AutofillHints.password],
                            onFieldSubmitted: (_) => _submit(),
                            decoration: InputDecoration(
                              labelText: 'Senha',
                              prefixIcon: const Icon(Icons.lock_outline_rounded),
                              suffixIcon: IconButton(
                                tooltip: _obscure ? 'Mostrar senha' : 'Ocultar senha',
                                onPressed: () =>
                                    setState(() => _obscure = !_obscure),
                                icon: Icon(
                                  _obscure
                                      ? Icons.visibility_outlined
                                      : Icons.visibility_off_outlined,
                                ),
                              ),
                            ),
                            validator: (v) => (v == null || v.isEmpty)
                                ? 'Informe sua senha'
                                : null,
                          ),
                          Align(
                            alignment: Alignment.centerRight,
                            child: TextButton(
                              onPressed: () => _showForgot(context),
                              child: const Text('Esqueci minha senha'),
                            ),
                          ),
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton(
                              onPressed: state.loading ? null : _submit,
                              child: state.loading
                                  ? const SizedBox(
                                      height: 22,
                                      width: 22,
                                      child: CircularProgressIndicator(
                                          strokeWidth: 2.4),
                                    )
                                  : const Text('Entrar'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ).animate().fadeIn(delay: 180.ms).moveY(begin: 20, end: 0),

                  const SizedBox(height: 14),
                  TextButton(
                    onPressed: state.loading ? null : () => context.push('/cadastro'),
                    child: const Text('Não tem conta? Criar conta'),
                  ),
                  TextButton(
                    onPressed: () =>
                        openExternal(context, Uri.parse(AppConfig.privacyUrl)),
                    child: Text('Política de privacidade', style: t.bodySmall),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showForgot(BuildContext context) {
    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(24, 8, 24, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Recuperar senha', style: Theme.of(ctx).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text(
              'Envie um e-mail para o suporte informando o CPF ou e-mail da conta. '
              'Respondemos com as instruções para redefinir a senha.',
              style: Theme.of(ctx).textTheme.bodyMedium,
            ),
            const SizedBox(height: 18),
            FilledButton.icon(
              onPressed: () {
                Navigator.pop(ctx);
                sendEmail(context, AppConfig.supportEmail,
                    subject: 'Recuperar senha — LUMI');
              },
              icon: const Icon(Icons.mail_outline_rounded),
              label: const Text('Escrever para o suporte'),
            ),
          ],
        ),
      ),
    );
  }
}
