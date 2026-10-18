import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../core/storage/local_store.dart';
import '../data/auth_repository.dart';
import '../domain/user.dart';

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => ApiAuthRepository(ref.watch(apiClientProvider)),
);

class AuthState {
  const AuthState({this.user, this.loading = false, this.error});
  final AppUser? user;
  final bool loading;
  final String? error;

  bool get isAuthenticated => user != null;
}

/// Sessão do usuário: conta de cidadão (API) ou acesso anônimo.
/// Persistida no aparelho — quem já entrou abre direto na Home.
class AuthController extends Notifier<AuthState> {
  @override
  AuthState build() {
    final saved = ref.read(localStoreProvider).readSession();
    final user = saved == null ? null : AppUser.fromJson(saved);
    if (user != null && !user.isGuest) Future.microtask(() => _revalidate(user));
    return AuthState(user: user);
  }

  AuthRepository get _repo => ref.read(authRepositoryProvider);
  LocalStore get _store => ref.read(localStoreProvider);

  Future<void> _revalidate(AppUser user) async {
    try {
      final fresh = await _repo.refresh(user);
      if (state.user?.id != user.id) return;
      await _setUser(fresh);
    } on AuthException catch (e) {
      // Token expirado/conta excluída: volta ao login. Sem rede: mantém a sessão.
      if (e.statusCode == 401 && state.user?.id == user.id) await _clear();
    } catch (_) {}
  }

  Future<void> _setUser(AppUser user) async {
    await _store.writeSession(user.toJson());
    state = AuthState(user: user);
  }

  Future<void> _clear() async {
    await _store.clearSession();
    state = const AuthState();
  }

  Future<bool> _run(Future<AppUser> Function() action) async {
    state = AuthState(user: state.user, loading: true);
    try {
      await _setUser(await action());
      return true;
    } on AuthException catch (e) {
      state = AuthState(user: state.user, error: e.message);
    } catch (_) {
      state = AuthState(
        user: state.user,
        error: 'Não foi possível concluir. Tente novamente.',
      );
    }
    return false;
  }

  Future<bool> login(String identifier, String password) =>
      _run(() => _repo.login(identifier, password));

  Future<bool> register({
    required String name,
    required String cpf,
    String? email,
    required String password,
  }) =>
      _run(() => _repo.register(
            name: name,
            cpf: cpf,
            email: email,
            password: password,
          ));

  /// Acesso sem conta (denúncia anônima).
  Future<void> continueAsGuest() => _setUser(AppUser.guest);

  /// Troca a senha. Devolve a mensagem de erro, ou null se deu certo.
  Future<String?> changePassword(String current, String next) async {
    final user = state.user;
    if (user == null || user.isGuest) return 'Entre na sua conta primeiro.';
    try {
      await _repo.changePassword(user, current, next);
      return null;
    } on AuthException catch (e) {
      return e.message;
    } catch (_) {
      return 'Não foi possível alterar a senha.';
    }
  }

  /// Exclui a conta no servidor e encerra a sessão. Devolve erro ou null.
  Future<String?> deleteAccount(String password) async {
    final user = state.user;
    if (user == null || user.isGuest) return 'Nenhuma conta para excluir.';
    try {
      await _repo.deleteAccount(user, password);
      await _clear();
      return null;
    } on AuthException catch (e) {
      return e.message;
    } catch (_) {
      return 'Não foi possível excluir a conta.';
    }
  }

  Future<void> logout() => _clear();
}

final authControllerProvider =
    NotifierProvider<AuthController, AuthState>(AuthController.new);
