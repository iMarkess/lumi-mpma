import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/auth_repository.dart';
import '../domain/user.dart';

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => MockAuthRepository(),
);

class AuthState {
  const AuthState({this.user, this.loading = false, this.error});
  final AppUser? user;
  final bool loading;
  final String? error;

  bool get isAuthenticated => user != null;

  AuthState copyWith({
    AppUser? user,
    bool? loading,
    String? error,
    bool clearError = false,
  }) =>
      AuthState(
        user: user ?? this.user,
        loading: loading ?? this.loading,
        error: clearError ? null : (error ?? this.error),
      );
}

/// Controla a sessão do usuário (login por CPF/senha, biometria e convidado).
class AuthController extends Notifier<AuthState> {
  @override
  AuthState build() => const AuthState();

  AuthRepository get _repo => ref.read(authRepositoryProvider);

  Future<bool> login(String cpf, String password) async {
    state = state.copyWith(loading: true, clearError: true);
    try {
      final user = await _repo.login(cpf, password);
      state = AuthState(user: user);
      return true;
    } on AuthException catch (e) {
      state = state.copyWith(loading: false, error: e.message);
      return false;
    } catch (_) {
      state = state.copyWith(
        loading: false,
        error: 'Não foi possível entrar. Tente novamente.',
      );
      return false;
    }
  }

  Future<bool> loginWithBiometrics() async {
    state = state.copyWith(loading: true, clearError: true);
    try {
      final user = await _repo.loginWithBiometrics();
      state = AuthState(user: user);
      return true;
    } catch (_) {
      state = state.copyWith(
        loading: false,
        error: 'Falha na autenticação biométrica.',
      );
      return false;
    }
  }

  Future<bool> loginWithGoogle() async {
    state = state.copyWith(loading: true, clearError: true);
    try {
      final user = await _repo.loginWithGoogle();
      state = AuthState(user: user);
      return true;
    } on AuthException catch (e) {
      state = state.copyWith(loading: false, error: e.message);
      return false;
    } catch (_) {
      state = state.copyWith(
        loading: false,
        error: 'Não foi possível entrar com o Google.',
      );
      return false;
    }
  }

  /// Acesso do cidadão sem login (denúncia anônima).
  void continueAsGuest() {
    state = const AuthState(
      user: AppUser(id: 'guest', name: 'Cidadão', role: UserRole.cidadao),
    );
  }

  Future<void> logout() async {
    await _repo.logout();
    state = const AuthState();
  }
}

final authControllerProvider =
    NotifierProvider<AuthController, AuthState>(AuthController.new);
