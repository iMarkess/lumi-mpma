import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/config.dart';
import '../../../core/storage/local_store.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/launcher.dart';
import '../../auth/presentation/auth_controller.dart';
import 'app_lock.dart';

/// ===== Base: tela com AppBar padrão =====
class _SettingsScaffold extends StatelessWidget {
  const _SettingsScaffold({required this.title, required this.child});
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
          children: [child],
        ),
      ),
    );
  }
}

Widget _card(BuildContext context, List<Widget> children) => Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
      ),
      child: Column(children: children),
    );

Widget _linkTile(BuildContext context, IconData icon, String title,
        String subtitle, VoidCallback onTap) =>
    ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(icon),
      title: Text(title, style: Theme.of(context).textTheme.titleSmall),
      subtitle: Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
      trailing: const Icon(Icons.open_in_new_rounded, size: 18),
      onTap: onTap,
    );

void _snack(BuildContext context, String msg, {bool error = false}) {
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
    content: Text(msg),
    backgroundColor: error ? AppColors.danger : AppColors.success,
  ));
}

/// ===== Segurança =====
class SecuritySettingsScreen extends ConsumerStatefulWidget {
  const SecuritySettingsScreen({super.key});
  @override
  ConsumerState<SecuritySettingsScreen> createState() =>
      _SecuritySettingsScreenState();
}

class _SecuritySettingsScreenState extends ConsumerState<SecuritySettingsScreen> {
  late bool _lock = ref.read(localStoreProvider).biometricLock;

  Future<void> _toggle(bool v) async {
    // Confirma a biometria antes de ligar/desligar: garante que funciona aqui.
    final ok = await authenticateDevice(
        v ? 'Confirme para ativar o bloqueio' : 'Confirme para desativar o bloqueio');
    if (!mounted) return;
    if (!ok) {
      _snack(context, 'Biometria/PIN do aparelho indisponível ou não confirmado.',
          error: true);
      return;
    }
    await ref.read(localStoreProvider).setBiometricLock(v);
    setState(() => _lock = v);
  }

  @override
  Widget build(BuildContext context) {
    return _SettingsScaffold(
      title: 'Segurança',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _card(context, [
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              value: _lock,
              onChanged: _toggle,
              secondary: const Icon(Icons.fingerprint_rounded),
              title: Text('Bloqueio por biometria',
                  style: Theme.of(context).textTheme.titleSmall),
              subtitle: Text(
                  'Pedir digital, rosto ou PIN ao abrir o app.',
                  style: Theme.of(context).textTheme.bodySmall),
            ),
          ]),
          const SizedBox(height: 16),
          _infoBox(context, Icons.verified_user_rounded,
              'Toda comunicação com o servidor é criptografada (HTTPS).'),
        ],
      ),
    );
  }
}

/// ===== Privacidade e dados =====
class PrivacySettingsScreen extends StatelessWidget {
  const PrivacySettingsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return _SettingsScaffold(
      title: 'Privacidade',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _card(context, [
            _linkTile(context, Icons.policy_outlined, 'Política de privacidade',
                'Quais dados coletamos e por quê.',
                () => openExternal(context, Uri.parse(AppConfig.privacyUrl))),
            const Divider(height: 1),
            _linkTile(
                context,
                Icons.delete_outline_rounded,
                'Exclusão de dados',
                'Como excluir sua conta e seus dados.',
                () => openExternal(context, Uri.parse(AppConfig.deleteAccountUrl))),
            const Divider(height: 1),
            _linkTile(context, Icons.mail_outline_rounded, 'Falar sobre meus dados',
                AppConfig.supportEmail,
                () => sendEmail(context, AppConfig.supportEmail,
                    subject: 'LGPD — LUMI')),
          ]),
          const SizedBox(height: 16),
          _infoBox(context, Icons.gavel_rounded,
              'Tratamos seus dados conforme a LGPD (Lei 13.709/2018). Denúncias anônimas não guardam dados de quem denuncia.'),
        ],
      ),
    );
  }
}

/// ===== Alterar senha =====
class ChangePasswordScreen extends ConsumerStatefulWidget {
  const ChangePasswordScreen({super.key});
  @override
  ConsumerState<ChangePasswordScreen> createState() =>
      _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends ConsumerState<ChangePasswordScreen> {
  final _form = GlobalKey<FormState>();
  final _current = TextEditingController();
  final _nova = TextEditingController();
  final _confirm = TextEditingController();
  bool _saving = false;

  @override
  void dispose() {
    _current.dispose();
    _nova.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_form.currentState!.validate()) return;
    setState(() => _saving = true);
    final error = await ref
        .read(authControllerProvider.notifier)
        .changePassword(_current.text, _nova.text);
    if (!mounted) return;
    setState(() => _saving = false);
    if (error != null) {
      _snack(context, error, error: true);
      return;
    }
    _snack(context, 'Senha alterada com sucesso.');
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Alterar senha')),
      body: SafeArea(
        child: Form(
          key: _form,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
            children: [
              _field(_current, 'Senha atual'),
              const SizedBox(height: 14),
              _field(_nova, 'Nova senha', validator: (v) {
                if (v == null || v.length < 6) return 'Mínimo 6 caracteres';
                if (v.length > 72) return 'Máximo 72 caracteres';
                return null;
              }),
              const SizedBox(height: 14),
              _field(_confirm, 'Confirmar nova senha', validator: (v) {
                if (v != _nova.text) return 'As senhas não conferem';
                return null;
              }),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: _saving ? null : _save,
                child: _saving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2.2, color: Colors.white))
                    : const Text('Salvar nova senha'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _field(TextEditingController c, String label,
          {String? Function(String?)? validator}) =>
      TextFormField(
        controller: c,
        obscureText: true,
        decoration: InputDecoration(labelText: label),
        validator: validator ??
            (v) => (v == null || v.isEmpty) ? 'Campo obrigatório' : null,
      );
}

/// ===== Excluir conta (exigência da Play para apps com cadastro) =====
class DeleteAccountScreen extends ConsumerStatefulWidget {
  const DeleteAccountScreen({super.key});
  @override
  ConsumerState<DeleteAccountScreen> createState() =>
      _DeleteAccountScreenState();
}

class _DeleteAccountScreenState extends ConsumerState<DeleteAccountScreen> {
  final _pass = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _pass.dispose();
    super.dispose();
  }

  Future<void> _delete() async {
    if (_pass.text.isEmpty) {
      _snack(context, 'Digite sua senha para confirmar.', error: true);
      return;
    }
    final sure = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Excluir conta definitivamente?'),
        content: const Text('Não dá para desfazer. Seus dados de cadastro serão apagados.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancelar')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Excluir'),
          ),
        ],
      ),
    );
    if (sure != true || !mounted) return;
    setState(() => _busy = true);
    final error =
        await ref.read(authControllerProvider.notifier).deleteAccount(_pass.text);
    if (!mounted) return;
    setState(() => _busy = false);
    if (error != null) {
      _snack(context, error, error: true);
      return;
    }
    // Sessão encerrada: o router volta para o login sozinho.
    Navigator.of(context).popUntil((r) => r.isFirst);
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    return _SettingsScaffold(
      title: 'Excluir conta',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('O que acontece', style: t.titleMedium),
          const SizedBox(height: 8),
          Text(
            '• Seu nome, CPF, e-mail e senha são apagados do servidor.\n'
            '• Denúncias já enviadas continuam registradas para apuração, sem '
            'ligação com você.\n'
            '• Os protocolos salvos neste aparelho continuam na lista até você removê-los.',
            style: t.bodyMedium,
          ),
          const SizedBox(height: 20),
          TextField(
            controller: _pass,
            obscureText: true,
            decoration: const InputDecoration(
              labelText: 'Sua senha',
              prefixIcon: Icon(Icons.lock_outline_rounded),
            ),
          ),
          const SizedBox(height: 20),
          FilledButton.icon(
            style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: _busy ? null : _delete,
            icon: _busy
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                        strokeWidth: 2.2, color: Colors.white))
                : const Icon(Icons.delete_forever_rounded),
            label: const Text('Excluir minha conta'),
          ),
        ],
      ),
    );
  }
}

/// ===== Central de ajuda =====
class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});
  @override
  Widget build(BuildContext context) {
    const faqs = [
      ('Como faço uma denúncia?', 'Na tela inicial, escolha a categoria e responda as etapas. No fim, você recebe um número de protocolo.'),
      ('Preciso me identificar?', 'Não. A denúncia pode ser totalmente anônima, sem conta. Se quiser retorno, informe um e-mail na última etapa.'),
      ('Como acompanho minha denúncia?', 'Vá em "Acompanhar". As denúncias enviadas por este aparelho já aparecem lá; outras você consulta pelo número do protocolo.'),
      ('Perdi meu protocolo. E agora?', 'Se a denúncia foi enviada por este aparelho, ele está em "Acompanhar". Por segurança, não é possível recuperar o protocolo de outra forma.'),
      ('A LUMI é um canal oficial?', 'Não. A LUMI é um aplicativo independente. Em emergência, ligue 190.'),
      ('É seguro?', 'Sim. A comunicação é criptografada (HTTPS) e denúncias anônimas não guardam dados de quem denuncia.'),
    ];
    return _SettingsScaffold(
      title: 'Central de ajuda',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _card(
            context,
            [
              for (var i = 0; i < faqs.length; i++) ...[
                ExpansionTile(
                  tilePadding: EdgeInsets.zero,
                  title: Text(faqs[i].$1,
                      style: Theme.of(context).textTheme.titleSmall),
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(faqs[i].$2,
                          style: Theme.of(context).textTheme.bodyMedium),
                    ),
                  ],
                ),
                if (i < faqs.length - 1) const Divider(height: 1),
              ],
            ],
          ),
          const SizedBox(height: 16),
          _card(context, [
            _linkTile(context, Icons.support_agent_rounded, 'Falar com o suporte',
                AppConfig.supportEmail,
                () => sendEmail(context, AppConfig.supportEmail,
                    subject: 'Ajuda — LUMI')),
          ]),
          const SizedBox(height: 16),
          _infoBox(context, Icons.emergency_rounded,
              'Emergência com risco à vida: ligue 190. Direitos humanos: 100.'),
        ],
      ),
    );
  }
}

/// ===== Sobre =====
class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    return _SettingsScaffold(
      title: 'Sobre a LUMI',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 20,
                    offset: const Offset(0, 8)),
              ],
            ),
            child: Image.asset('assets/images/lumi_brand.png', height: 84),
          ),
          const SizedBox(height: 16),
          Text('LUMI', style: t.headlineSmall),
          Text('com você na proteção da vida',
              style: t.bodySmall, textAlign: TextAlign.center),
          const SizedBox(height: 4),
          Text('Versão ${AppConfig.appVersion}', style: t.labelSmall),
          const SizedBox(height: 20),
          Text(
            'A LUMI é um aplicativo independente para registrar denúncias com segurança e sigilo, e acompanhar o andamento pelo número de protocolo. App independente — não é canal oficial de nenhum órgão público.',
            style: t.bodyMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          TextButton(
            onPressed: () => showLicensePage(
              context: context,
              applicationName: 'LUMI',
              applicationVersion: AppConfig.appVersion,
            ),
            child: const Text('Licenças de software'),
          ),
        ],
      ),
    );
  }
}

Widget _infoBox(BuildContext context, IconData icon, String text) => Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.success.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: AppColors.success),
          const SizedBox(width: 10),
          Expanded(
            child: Text(text, style: Theme.of(context).textTheme.bodySmall),
          ),
        ],
      ),
    );
