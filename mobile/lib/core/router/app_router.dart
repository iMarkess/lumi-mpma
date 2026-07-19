import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/shell/presentation/home_shell.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/complaints/presentation/denunciar_screen.dart';
import '../../features/complaints/presentation/complaint_form_screen.dart';
import '../../features/complaints/presentation/acompanhar_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';

final _rootKey = GlobalKey<NavigatorState>();
final _shellKey = GlobalKey<NavigatorState>();

/// Router principal. A entrada é o login; o cidadão pode seguir como convidado.
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootKey,
    initialLocation: '/login',
    routes: [
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (_, __) => const LoginScreen(),
      ),

      // Shell com bottom navigation (5 abas)
      StatefulShellRoute.indexedStack(
        parentNavigatorKey: _rootKey,
        builder: (_, __, shell) => HomeShell(shell: shell),
        branches: [
          StatefulShellBranch(
            navigatorKey: _shellKey,
            routes: [
              GoRoute(
                path: '/home',
                name: 'home',
                builder: (_, __) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/denunciar',
              name: 'denunciar',
              builder: (_, __) => const DenunciarScreen(),
              routes: [
                GoRoute(
                  path: ':type',
                  name: 'denunciar-form',
                  parentNavigatorKey: _rootKey,
                  builder: (_, state) => ComplaintFormScreen(
                    type: state.pathParameters['type'] ?? 'child',
                  ),
                ),
              ],
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/acompanhar',
              name: 'acompanhar',
              builder: (_, __) => const AcompanharScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/notificacoes',
              name: 'notificacoes',
              builder: (_, __) => const NotificationsScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/perfil',
              name: 'perfil',
              builder: (_, __) => const ProfileScreen(),
            ),
          ]),
        ],
      ),
    ],
  );
});
