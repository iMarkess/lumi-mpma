/// Configuração de ambiente do app.
abstract class AppConfig {
  /// URL base da API (backend no VPS).
  /// Produção: troque por HTTPS com domínio (ex.: https://api.lumi.mpma.mp.br).
  static const String apiBaseUrl = 'http://31.97.151.126:3333';

  /// Usa a API real quando há URL; senão cai nos repositórios mock.
  static bool get useApi => apiBaseUrl.isNotEmpty;
}
