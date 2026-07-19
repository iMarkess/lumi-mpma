import 'package:intl/intl.dart';

/// Formatação de datas em pt-BR.
abstract class DateFmt {
  static String relative(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 1) return 'Agora';
    if (diff.inMinutes < 60) return 'há ${diff.inMinutes} min';
    if (diff.inHours < 24) return 'há ${diff.inHours} h';
    if (diff.inDays == 1) return 'Ontem';
    if (diff.inDays < 7) return 'há ${diff.inDays} dias';
    return DateFormat("d 'de' MMM", 'pt_BR').format(date);
  }

  static String full(DateTime date) =>
      DateFormat("d 'de' MMMM 'de' y', às' HH:mm", 'pt_BR').format(date);

  static String greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }
}
