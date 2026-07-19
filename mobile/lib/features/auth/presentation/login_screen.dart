import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/cpf_formatter.dart';
import '../../profile/presentation/theme_controller.dart';
import 'auth_controller.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _cpf = TextEditingController();
  final _pass = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _obscure = true;

  @override
  void dispose() {
    _cpf.dispose();
    _pass.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();
    final ok = await ref.read(authControllerProvider.notifier).login(
          _cpf.text,
          _pass.text,
        );
    if (ok && mounted) context.go('/home');
  }

  Future<void> _biometric() async {
    final ok =
        await ref.read(authControllerProvider.notifier).loginWithBiometrics();
    if (ok && mounted) context.go('/home');
  }

  Future<void> _google() async {
    final ok = await ref.read(authControllerProvider.notifier).loginWithGoogle();
    if (ok && mounted) context.go('/home');
  }

  void _guest() {
    ref.read(authControllerProvider.notifier).continueAsGuest();
    context.go('/home');
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

                  // Cartão de login
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
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Acesso restrito', style: t.titleLarge),
                          const SizedBox(height: 4),
                          Text(
                            'Servidores autorizados entram com CPF e senha.',
                            style: t.bodySmall,
                          ),
                          const SizedBox(height: 20),
                          TextFormField(
                            controller: _cpf,
                            keyboardType: TextInputType.number,
                            inputFormatters: [CpfInputFormatter()],
                            decoration: const InputDecoration(
                              labelText: 'CPF',
                              hintText: '000.000.000-00',
                              prefixIcon: Icon(Icons.badge_outlined),
                            ),
                            validator: (v) =>
                                (v == null || v.replaceAll(RegExp(r'\D'), '').length < 11)
                                    ? 'Informe um CPF válido'
                                    : null,
                          ),
                          const SizedBox(height: 14),
                          TextFormField(
                            controller: _pass,
                            obscureText: _obscure,
                            decoration: InputDecoration(
                              labelText: 'Senha',
                              prefixIcon: const Icon(Icons.lock_outline_rounded),
                              suffixIcon: IconButton(
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
                          const SizedBox(height: 4),
                          FilledButton(
                            onPressed: state.loading ? null : _submit,
                            child: state.loading
                                ? const SizedBox(
                                    height: 22,
                                    width: 22,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2.4,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Text('Entrar'),
                          ),
                          const SizedBox(height: 12),
                          OutlinedButton.icon(
                            onPressed: state.loading ? null : _biometric,
                            icon: const Icon(Icons.fingerprint_rounded),
                            label: const Text('Entrar com biometria'),
                          ),
                          const SizedBox(height: 12),
                          OutlinedButton.icon(
                            onPressed: state.loading ? null : _google,
                            icon: const Icon(Icons.g_mobiledata_rounded, size: 28),
                            label: const Text('Continuar com o Google'),
                          ),
                        ],
                      ),
                    ),
                  ).animate().fadeIn(delay: 150.ms).moveY(begin: 20, end: 0),

                  const SizedBox(height: 18),
                  // Cidadão
                  TextButton.icon(
                    onPressed: _guest,
                    icon: Icon(Icons.arrow_forward_rounded,
                        color: scheme.onSurfaceVariant),
                    label: Text(
                      'Continuar como cidadão',
                      style: t.labelLarge?.copyWith(color: scheme.onSurface),
                    ),
                  ),
                  Text(
                    'Denuncie de forma anônima, sem cadastro.',
                    style: t.bodySmall,
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
      isScrollControlled: true,
      showDragHandle: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(
          24,
          8,
          24,
          MediaQuery.viewInsetsOf(ctx).bottom + 28,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Recuperar senha',
                style: Theme.of(ctx).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text(
              'Informe seu CPF. Enviaremos as instruções de redefinição para o e-mail cadastrado.',
              style: Theme.of(ctx).textTheme.bodyMedium,
            ),
            const SizedBox(height: 18),
            TextField(
              keyboardType: TextInputType.number,
              inputFormatters: [CpfInputFormatter()],
              decoration: const InputDecoration(
                labelText: 'CPF',
                prefixIcon: Icon(Icons.badge_outlined),
              ),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Instruções enviadas, se o CPF existir.'),
                  ),
                );
              },
              child: const Text('Enviar instruções'),
            ),
          ],
        ),
      ),
    );
  }
}
