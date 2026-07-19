import '../../../core/constants/app_constants.dart';
import '../domain/user.dart';
import 'google_auth.dart';

class AuthException implements Exception {
  AuthException(this.message);
  final String message;
  @override
  String toString() => message;
}

/// Contrato de autenticação. Troque [MockAuthRepository] por uma
/// implementação HTTP contra a API real do LUMI.
abstract class AuthRepository {
  Future<AppUser> login(String cpf, String password);
  Future<AppUser> loginWithBiometrics();
  Future<AppUser> loginWithGoogle();
  Future<void> logout();
}

class MockAuthRepository implements AuthRepository {
  static final _users = <String, ({String pass, AppUser user})>{
    '04667544341': (
      pass: '123',
      user: AppUser(
        id: '1',
        name: 'Lucas Marques',
        role: UserRole.promotor,
        cpf: '046.675.443-41',
      ),
    ),
    '00000000000': (
      pass: '123',
      user: AppUser(id: '2', name: 'Ana Silva', role: UserRole.secretaria),
    ),
  };

  @override
  Future<AppUser> login(String cpf, String password) async {
    await Future.delayed(AppConstants.mockLatency);
    final key = cpf.replaceAll(RegExp(r'\D'), '');
    final entry = _users[key];
    if (entry == null || entry.pass != password) {
      throw AuthException('CPF ou senha incorretos.');
    }
    return entry.user;
  }

  @override
  Future<AppUser> loginWithBiometrics() async {
    await Future.delayed(const Duration(milliseconds: 400));
    // Em produção, recupere a sessão salva após validar a biometria.
    return _users.values.first.user;
  }

  @override
  Future<AppUser> loginWithGoogle() async {
    final account = await GoogleAuthService().signIn();
    if (account == null) {
      throw AuthException('Login com Google cancelado.');
    }
    // TODO(API): enviar account.idToken para POST /api/citizen/google e usar a
    // conta retornada pelo backend. Por ora, cria a sessão local do cidadão.
    return AppUser(
      id: account.email ?? 'google',
      name: account.name,
      role: UserRole.cidadao,
      photoUrl: account.photoUrl,
    );
  }

  @override
  Future<void> logout() async {
    try {
      await GoogleAuthService().signOut();
    } catch (_) {
      // Ignora se o Google não estiver configurado/logado.
    }
  }
}
