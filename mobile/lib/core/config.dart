/// Configuração de ambiente do app.
abstract class AppConfig {
  /// URL base da API (backend no VPS, HTTPS pelo domínio oficial).
  static const String apiBaseUrl = 'https://lumimpma.site';

  /// Usa a API real quando há URL; senão cai nos repositórios mock.
  static bool get useApi => apiBaseUrl.isNotEmpty;
}
