import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/app_constants.dart';
import '../domain/app_notification.dart';

abstract class NotificationRepository {
  Future<List<AppNotification>> all();
}

class MockNotificationRepository implements NotificationRepository {
  @override
  Future<List<AppNotification>> all() async {
    await Future.delayed(AppConstants.mockLatency);
    final now = DateTime.now();
    return [
      AppNotification(
        id: 'n1',
        kind: NotificationKind.update,
        title: 'Sua denúncia mudou de status',
        body: 'O protocolo LUMI-X82J91 entrou em análise.',
        date: now.subtract(const Duration(minutes: 25)),
      ),
      AppNotification(
        id: 'n2',
        kind: NotificationKind.alert,
        title: 'Documento pendente',
        body: 'Anexe uma foto para agilizar a triagem do LUMI-A72K12.',
        date: now.subtract(const Duration(hours: 4)),
      ),
      AppNotification(
        id: 'n3',
        kind: NotificationKind.message,
        title: 'Mensagem da Ouvidoria',
        body: 'Recebemos sua denúncia e agradecemos a colaboração.',
        date: now.subtract(const Duration(days: 1)),
        read: true,
      ),
      AppNotification(
        id: 'n4',
        kind: NotificationKind.system,
        title: 'Bem-vindo à LUMI',
        body: 'Denuncie com segurança e acompanhe tudo pelo app.',
        date: now.subtract(const Duration(days: 2)),
        read: true,
      ),
    ];
  }
}

final notificationRepositoryProvider = Provider<NotificationRepository>(
  (ref) => MockNotificationRepository(),
);

/// Estado local das notificações (permite marcar como lida na sessão).
class NotificationsController
    extends AutoDisposeAsyncNotifier<List<AppNotification>> {
  @override
  Future<List<AppNotification>> build() async {
    return ref.watch(notificationRepositoryProvider).all();
  }

  void markRead(String id) {
    final current = state.valueOrNull;
    if (current == null) return;
    for (final n in current) {
      if (n.id == id) n.read = true;
    }
    state = AsyncData([...current]);
  }

  void markAllRead() {
    final current = state.valueOrNull;
    if (current == null) return;
    for (final n in current) {
      n.read = true;
    }
    state = AsyncData([...current]);
  }
}

final notificationsControllerProvider = AutoDisposeAsyncNotifierProvider<
    NotificationsController, List<AppNotification>>(NotificationsController.new);

/// Contagem de não lidas (badge do bottom nav).
final unreadCountProvider = Provider.autoDispose<int>((ref) {
  final list = ref.watch(notificationsControllerProvider).valueOrNull;
  if (list == null) return 0;
  return list.where((n) => !n.read).length;
});
