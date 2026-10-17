/// Constantes globais do aplicativo.
abstract class AppConstants {
  static const String appName = 'LUMI';
  static const String orgName = 'com você na proteção da vida';
  static const String orgShort = 'LUMI';

  /// Atraso simulado das chamadas mock (só usado sem API configurada).
  static const Duration mockLatency = Duration(milliseconds: 700);

  // Chaves de preferências
  static const String kThemeMode = 'lumi_theme_mode';
  static const String kSession = 'lumi_session';
  static const String kBiometric = 'lumi_biometric_enabled';
  static const String kProtocols = 'lumi_protocols';
  static const String kReadNotifications = 'lumi_read_notifications';

  // Telefones de emergência
  static const emergencies = <(String, String)>[
    ('190', 'Polícia Militar'),
    ('100', 'Direitos Humanos'),
    ('181', 'Disque-Denúncia'),
  ];
}
