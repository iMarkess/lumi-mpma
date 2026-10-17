import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../core/storage/local_store.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../complaints/presentation/providers.dart';
import '../domain/app_notification.dart';

abstract class NotificationRepository {
  Future<List<AppNotification>> all();
  Future<void> markRead(Iterable<String> ids);
}

/// Notificações do servidor para os protocolos acompanhados neste aparelho.
/// "Lida" fica guardado localmente — a notificação não tem dono no servidor.
class ApiNotificationRepository implements NotificationRepository {
  ApiNotificationRepository(this._api, this._store);
  final ApiClient _api;
  final LocalStore _store;

  NotificationKind _kind(String? k) => NotificationKind.values.firstWhere(
        (v) => v.name == k,
        orElse: () => NotificationKind.update,
      );

  @override
  Future<List<AppNotification>> all() async {
    final protocols = _store.protocols();
    if (protocols.isEmpty) return const [];
    final read = _store.readNotifications();

    final lists = await Future.wait(protocols.map((p) async {
      try {
        final data = await _api.get('/api/notifications', query: {'protocol': p});
        return (data as List).cast<Map<String, dynamic>>();
      } on ApiException catch (e) {
        if (e.statusCode == null) rethrow;
        return const <Map<String, dynamic>>[];
      }
    }));

    final items = [
      for (final j in lists.expand((l) => l))
        AppNotification(
          id: j['id'] as String,
          kind: _kind(j['kind'] as String?),
          title: j['title'] as String? ?? '',
          body: j['body'] as String? ?? '',
          protocol: j['protocol'] as String?,
          date: DateTime.tryParse(j['createdAt'] as String? ?? '')?.toLocal() ??
              DateTime.now(),
          read: read.contains(j['id']),
        ),
    ]..sort((a, b) => b.date.compareTo(a.date));
    return items;
  }

  @override
  Future<void> markRead(Iterable<String> ids) => _store.markNotificationsRead(ids);
}

final notificationRepositoryProvider = Provider<NotificationRepository>(
  (ref) => ApiNotificationRepository(
    ref.watch(apiClientProvider),
    ref.watch(localStoreProvider),
  ),
);

/// Estado das notificações (marcar como lida persiste no aparelho).
class NotificationsController extends AsyncNotifier<List<AppNotification>> {
  @override
  Future<List<AppNotification>> build() async {
    // Lista de protocolos mudou (denúncia enviada/consultada): recarrega.
    // (a primeira carga da lista não conta — prev ainda sem valor)
    ref.listen(recentComplaintsProvider, (prev, next) {
      if (prev?.hasValue == true && next.hasValue && !next.isLoading) {
        ref.invalidateSelf();
      }
    });
    return ref.watch(notificationRepositoryProvider).all();
  }

  Future<void> markRead(String id) => _mark((n) => n.id == id);

  Future<void> markAllRead() => _mark((_) => true);

  Future<void> _mark(bool Function(AppNotification) test) async {
    final current = state.valueOrNull;
    if (current == null) return;
    final ids = [for (final n in current) if (!n.read && test(n)) n.id];
    if (ids.isEmpty) return;
    for (final n in current) {
      if (ids.contains(n.id)) n.read = true;
    }
    state = AsyncData([...current]);
    await ref.read(notificationRepositoryProvider).markRead(ids);
  }
}

final notificationsControllerProvider =
    AsyncNotifierProvider<NotificationsController, List<AppNotification>>(
  NotificationsController.new,
);

/// Contagem de não lidas (badge do bottom nav).
final unreadCountProvider = Provider<int>((ref) {
  final list = ref.watch(notificationsControllerProvider).valueOrNull;
  if (list == null) return 0;
  return list.where((n) => !n.read).length;
});
