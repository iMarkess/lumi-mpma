/// Constantes globais do aplicativo.
abstract class AppConstants {
  static const String appName = 'LUMI';
  static const String orgName = 'Ministério Público do Maranhão';
  static const String orgShort = 'MPMA';

  /// Atraso simulado das chamadas mock (troque por HTTP real depois).
  static const Duration mockLatency = Duration(milliseconds: 700);

  // Chaves de preferências
  static const String kThemeMode = 'lumi_theme_mode';
  static const String kSession = 'lumi_session';
  static const String kBiometric = 'lumi_biometric_enabled';

  // Telefones de emergência
  static const emergencies = <(String, String)>[
    ('190', 'Polícia Militar'),
    ('100', 'Direitos Humanos'),
    ('181', 'Disque-Denúncia'),
  ];
}
