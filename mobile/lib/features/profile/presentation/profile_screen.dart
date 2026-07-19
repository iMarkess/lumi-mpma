import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_card.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../settings/presentation/settings_screens.dart';
import 'theme_controller.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = Theme.of(context).textTheme;
    final user = ref.watch(authControllerProvider).user;
    final mode = ref.watch(themeControllerProvider);

    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
        children: [
          Text('Perfil', style: t.headlineSmall),
          const SizedBox(height: 16),

          // Cartão do usuário
          AppCard(
            gradient: AppColors.brand,
            child: Row(
              children: [
                Container(
                  width: 62,
                  height: 62,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                    border: Border.all(
                        color: Colors.white.withValues(alpha: 0.5), width: 2),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    user?.initials ?? '?',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 22,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user?.name ?? 'Cidadão',
                        style: t.titleLarge?.copyWith(color: Colors.white),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        user?.role.label ?? 'Acesso público',
                        style: t.bodySmall?.copyWith(
                          color: Colors.white.withValues(alpha: 0.9),
                        ),
                      ),
                      Text(
                        user?.institution ?? AppConstants.orgName,
                        style: t.labelSmall?.copyWith(
                          color: Colors.white.withValues(alpha: 0.75),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 22),

          // Aparência
          Text('Aparência', style: t.titleMedium),
          const SizedBox(height: 10),
          AppCard(
            padding: const EdgeInsets.all(14),
            child: Column(
              children: [
                Row(
                  children: [
                    const Icon(Icons.palette_outlined),
                    const SizedBox(width: 12),
                    Text('Tema', style: t.titleSmall),
                  ],
                ),
                const SizedBox(height: 12),
                SegmentedButton<ThemeMode>(
                  segments: const [
                    ButtonSegment(
                      value: ThemeMode.light,
                      icon: Icon(Icons.light_mode_rounded),
                      label: Text('Claro'),
                    ),
                    ButtonSegment(
                      value: ThemeMode.dark,
                      icon: Icon(Icons.dark_mode_rounded),
                      label: Text('Escuro'),
                    ),
                    ButtonSegment(
                      value: ThemeMode.system,
                      icon: Icon(Icons.brightness_auto_rounded),
                      label: Text('Auto'),
                    ),
                  ],
                  selected: {mode},
                  onSelectionChanged: (s) =>
                      ref.read(themeControllerProvider.notifier).set(s.first),
                ),
              ],
            ),
          ),
          const SizedBox(height: 22),

          // Configurações
          Text('Conta e segurança', style: t.titleMedium),
          const SizedBox(height: 10),
          _MenuGroup(items: [
            _MenuItem(Icons.lock_outline_rounded, 'Alterar senha',
                () => const ChangePasswordScreen()),
            _MenuItem(Icons.security_rounded, 'Segurança',
                () => const SecuritySettingsScreen()),
            _MenuItem(Icons.privacy_tip_outlined, 'Privacidade',
                () => const PrivacySettingsScreen()),
            _MenuItem(Icons.notifications_active_outlined, 'Notificações',
                () => const NotificationsSettingsScreen()),
          ]),
          const SizedBox(height: 16),
          Text('Suporte', style: t.titleMedium),
          const SizedBox(height: 10),
          _MenuGroup(items: [
            _MenuItem(Icons.help_outline_rounded, 'Central de ajuda',
                () => const HelpScreen()),
            _MenuItem(Icons.info_outline_rounded, 'Sobre a LUMI',
                () => const AboutScreen()),
          ]),
          const SizedBox(height: 22),

          // Sair
          OutlinedButton.icon(
            onPressed: () => _confirmLogout(context, ref),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.danger,
              side: const BorderSide(color: AppColors.danger),
            ),
            icon: const Icon(Icons.logout_rounded),
            label: const Text('Sair da conta'),
          ),
          const SizedBox(height: 16),
          Center(
            child: Text('LUMI · versão 1.0.0',
                style: t.labelSmall),
          ),
        ],
      ),
    );
  }

  void _confirmLogout(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sair da conta?'),
        content: const Text('Você precisará entrar novamente para acessar a área restrita.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () async {
              Navigator.pop(ctx);
              await ref.read(authControllerProvider.notifier).logout();
              if (context.mounted) context.go('/login');
            },
            child: const Text('Sair'),
          ),
        ],
      ),
    );
  }
}

class _MenuItem {
  const _MenuItem(this.icon, this.label, this.page);
  final IconData icon;
  final String label;
  final Widget Function() page;
}

class _MenuGroup extends StatelessWidget {
  const _MenuGroup({required this.items});
  final List<_MenuItem> items;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        children: [
          for (var i = 0; i < items.length; i++) ...[
            ListTile(
              leading: Icon(items[i].icon),
              title: Text(items[i].label,
                  style: Theme.of(context).textTheme.titleSmall),
              trailing: const Icon(Icons.chevron_right_rounded),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => items[i].page()),
                );
              },
            ),
            if (i < items.length - 1)
              const Divider(height: 1, indent: 56),
          ],
        ],
      ),
    );
  }
}
