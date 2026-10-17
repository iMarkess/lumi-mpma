/// Configuração de ambiente do app.
abstract class AppConfig {
  /// URL base da API (backend no VPS, HTTPS pelo domínio oficial).
  static const String apiBaseUrl = 'https://lumimpma.site';

  /// Usa a API real quando há URL; senão cai nos repositórios mock.
  static bool get useApi => apiBaseUrl.isNotEmpty;

  /// Versão exibida no app. Mantenha igual ao `version:` do pubspec.yaml.
  static const String appVersion = '1.0.5';

  /// Páginas públicas exigidas pela Play Store.
  static const String privacyUrl = '$apiBaseUrl/privacidade';
  static const String deleteAccountUrl = '$apiBaseUrl/excluir-conta';

  /// Contato de suporte (recuperação de senha, dúvidas, LGPD).
  static const String supportEmail = 'lucasmarques1977@gmail.com';

  /// Tempo máximo de espera por resposta da API.
  static const Duration requestTimeout = Duration(seconds: 20);
}
