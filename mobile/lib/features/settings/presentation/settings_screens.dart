import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/theme/app_colors.dart';

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

/// Switch persistido em SharedPreferences.
class PrefSwitch extends StatefulWidget {
  const PrefSwitch({
    super.key,
    required this.prefKey,
    required this.title,
    required this.subtitle,
    this.defaultValue = true,
    this.icon,
  });
  final String prefKey;
  final String title;
  final String subtitle;
  final bool defaultValue;
  final IconData? icon;

  @override
  State<PrefSwitch> createState() => _PrefSwitchState();
}

class _PrefSwitchState extends State<PrefSwitch> {
  bool _value = false;
  bool _loaded = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _value = prefs.getBool(widget.prefKey) ?? widget.defaultValue;
      _loaded = true;
    });
  }

  Future<void> _set(bool v) async {
    setState(() => _value = v);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(widget.prefKey, v);
  }

  @override
  Widget build(BuildContext context) {
    return SwitchListTile(
      contentPadding: EdgeInsets.zero,
      value: _loaded ? _value : widget.defaultValue,
      onChanged: _loaded ? _set : null,
      secondary: widget.icon != null ? Icon(widget.icon) : null,
      title: Text(widget.title, style: Theme.of(context).textTheme.titleSmall),
      subtitle: Text(widget.subtitle, style: Theme.of(context).textTheme.bodySmall),
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

/// ===== Notificações =====
class NotificationsSettingsScreen extends StatelessWidget {
  const NotificationsSettingsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return _SettingsScaffold(
      title: 'Notificações',
      child: _card(context, const [
        PrefSwitch(
          prefKey: 'notif_status',
          title: 'Atualizações da denúncia',
          subtitle: 'Avisar quando o status mudar.',
          icon: Icons.update_rounded,
        ),
        Divider(height: 1),
        PrefSwitch(
          prefKey: 'notif_alerts',
          title: 'Alertas importantes',
          subtitle: 'Pendências e comunicados importantes.',
          icon: Icons.warning_amber_rounded,
        ),
        Divider(height: 1),
        PrefSwitch(
          prefKey: 'notif_news',
          title: 'Novidades',
          subtitle: 'Campanhas e informações úteis.',
          defaultValue: false,
          icon: Icons.campaign_rounded,
        ),
      ]),
    );
  }
}

/// ===== Segurança =====
class SecuritySettingsScreen extends StatelessWidget {
  const SecuritySettingsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return _SettingsScaffold(
      title: 'Segurança',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _card(context, const [
            PrefSwitch(
              prefKey: 'sec_biometric',
              title: 'Bloqueio por biometria',
              subtitle: 'Exigir digital/face ao abrir o app.',
              defaultValue: false,
              icon: Icons.fingerprint_rounded,
            ),
            Divider(height: 1),
            PrefSwitch(
              prefKey: 'sec_hide_preview',
              title: 'Ocultar conteúdo em prévia',
              subtitle: 'Esconder dados ao alternar apps.',
              defaultValue: false,
              icon: Icons.visibility_off_rounded,
            ),
          ]),
          const SizedBox(height: 16),
          _infoBox(context, Icons.verified_user_rounded,
              'Suas denúncias trafegam de forma criptografada e o sigilo é garantido por lei.'),
        ],
      ),
    );
  }
}

/// ===== Privacidade =====
class PrivacySettingsScreen extends StatelessWidget {
  const PrivacySettingsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return _SettingsScaffold(
      title: 'Privacidade',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _card(context, const [
            PrefSwitch(
              prefKey: 'priv_anon',
              title: 'Denúncia anônima por padrão',
              subtitle: 'Não registrar sua identidade.',
              icon: Icons.visibility_off_rounded,
            ),
            Divider(height: 1),
            PrefSwitch(
              prefKey: 'priv_location',
              title: 'Compartilhar localização',
              subtitle: 'Ajuda a localizar a ocorrência.',
              defaultValue: false,
              icon: Icons.place_rounded,
            ),
          ]),
          const SizedBox(height: 16),
          _infoBox(context, Icons.gavel_rounded,
              'Tratamos seus dados conforme a LGPD (Lei 13.709/2018). Você pode solicitar exclusão a qualquer momento pela central de atendimento do app.'),
        ],
      ),
    );
  }
}

/// ===== Alterar senha =====
class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});
  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
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
    await Future.delayed(const Duration(milliseconds: 700));
    if (!mounted) return;
    setState(() => _saving = false);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Senha alterada com sucesso.'),
        backgroundColor: AppColors.success,
      ),
    );
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

/// ===== Central de ajuda =====
class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final faqs = const [
      ('Como faço uma denúncia?', 'Na tela inicial, escolha a categoria e responda as etapas. No fim, você recebe um número de protocolo.'),
      ('Preciso me identificar?', 'Não. A denúncia pode ser totalmente anônima.'),
      ('Como acompanho minha denúncia?', 'Vá em "Acompanhar" e informe o número de protocolo.'),
      ('É seguro?', 'Sim. Os dados são criptografados e o sigilo é garantido por lei.'),
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
          _infoBox(context, Icons.support_agent_rounded,
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
          Text('Versão 1.0.3', style: t.labelSmall),
          const SizedBox(height: 20),
          Text(
            'A LUMI é um aplicativo independente para registrar denúncias com segurança e sigilo, e acompanhar o andamento pelo número de protocolo. App independente — não é canal oficial de nenhum órgão público.',
            style: t.bodyMedium,
            textAlign: TextAlign.center,
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
