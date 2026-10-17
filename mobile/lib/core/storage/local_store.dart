import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../constants/app_constants.dart';

/// Instância de [SharedPreferences] carregada no `main()` antes do `runApp`,
/// para que sessão e tema estejam disponíveis já no primeiro frame.
final sharedPrefsProvider = Provider<SharedPreferences>(
  (ref) => throw UnimplementedError('sobrescrito em main()'),
);

final localStoreProvider =
    Provider<LocalStore>((ref) => LocalStore(ref.watch(sharedPrefsProvider)));

/// Dados persistidos no aparelho: sessão e protocolos enviados daqui.
class LocalStore {
  LocalStore(this._prefs);
  final SharedPreferences _prefs;

  // ---- Sessão ----

  Map<String, dynamic>? readSession() {
    final raw = _prefs.getString(AppConstants.kSession);
    if (raw == null) return null;
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  Future<void> writeSession(Map<String, dynamic> session) =>
      _prefs.setString(AppConstants.kSession, jsonEncode(session));

  Future<void> clearSession() => _prefs.remove(AppConstants.kSession);

  // ---- Protocolos ("minhas denúncias", só neste aparelho) ----

  List<String> protocols() =>
      _prefs.getStringList(AppConstants.kProtocols) ?? const [];

  Future<void> addProtocol(String protocol) {
    final list = [protocol, ...protocols().where((p) => p != protocol)];
    return _prefs.setStringList(AppConstants.kProtocols, list.take(50).toList());
  }

  Future<void> removeProtocol(String protocol) => _prefs.setStringList(
        AppConstants.kProtocols,
        protocols().where((p) => p != protocol).toList(),
      );

  // ---- Notificações lidas (as do servidor não têm dono) ----

  Set<String> readNotifications() =>
      (_prefs.getStringList(AppConstants.kReadNotifications) ?? const []).toSet();

  Future<void> markNotificationsRead(Iterable<String> ids) {
    final all = {...readNotifications(), ...ids};
    return _prefs.setStringList(AppConstants.kReadNotifications, all.toList());
  }

  // ---- Bloqueio por biometria ----

  bool get biometricLock => _prefs.getBool(AppConstants.kBiometric) ?? false;
  Future<void> setBiometricLock(bool v) =>
      _prefs.setBool(AppConstants.kBiometric, v);
}
