import '../../../core/network/api_client.dart';
import '../domain/user.dart';

class AuthException implements Exception {
  AuthException(this.message);
  final String message;
  @override
  String toString() => message;
}

/// Contas de cidadão na API do LUMI (`/api/citizen/*`).
abstract class AuthRepository {
  Future<AppUser> login(String identifier, String password);
  Future<AppUser> register({
    required String name,
    required String cpf,
    String? email,
    required String password,
  });

  /// Confere se o token salvo ainda vale e devolve os dados atualizados.
  Future<AppUser> refresh(AppUser user);
  Future<void> changePassword(AppUser user, String current, String next);
  Future<void> deleteAccount(AppUser user, String password);
}

class ApiAuthRepository implements AuthRepository {
  ApiAuthRepository(this._api);
  final ApiClient _api;

  AppUser _fromResponse(Map<String, dynamic> data, {String? token}) {
    final u = (data['user'] ?? data) as Map<String, dynamic>;
    return AppUser(
      id: u['id'] as String,
      name: u['name'] as String? ?? 'Cidadão',
      role: UserRole.cidadao,
      cpf: u['cpf'] as String?,
      email: u['email'] as String?,
      token: token ?? data['token'] as String?,
    );
  }

  Future<T> _guard<T>(Future<T> Function() run) async {
    try {
      return await run();
    } on ApiException catch (e) {
      throw AuthException(e.message);
    }
  }

  @override
  Future<AppUser> login(String identifier, String password) => _guard(() async {
        final data = await _api.post('/api/citizen/login', {
          'identifier': identifier.trim(),
          'password': password,
        });
        return _fromResponse(data as Map<String, dynamic>);
      });

  @override
  Future<AppUser> register({
    required String name,
    required String cpf,
    String? email,
    required String password,
  }) =>
      _guard(() async {
        final data = await _api.post('/api/citizen/register', {
          'name': name.trim(),
          'cpf': cpf,
          if (email != null && email.trim().isNotEmpty)
            'email': email.trim().toLowerCase(),
          'password': password,
        });
        return _fromResponse(data as Map<String, dynamic>);
      });

  @override
  Future<AppUser> refresh(AppUser user) => _guard(() async {
        final data = await _api.get('/api/citizen/me', token: user.token);
        return _fromResponse(data as Map<String, dynamic>, token: user.token);
      });

  @override
  Future<void> changePassword(AppUser user, String current, String next) =>
      _guard(() => _api.post(
            '/api/citizen/password',
            {'currentPassword': current, 'newPassword': next},
            token: user.token,
          ));

  @override
  Future<void> deleteAccount(AppUser user, String password) => _guard(
        () => _api.post(
          '/api/citizen/delete',
          {'password': password},
          token: user.token,
        ),
      );
}
