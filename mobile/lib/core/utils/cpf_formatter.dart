import 'package:flutter/services.dart';

/// Máscara de CPF: 000.000.000-00
class CpfInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final digits = newValue.text.replaceAll(RegExp(r'\D'), '');
    final trimmed = digits.length > 11 ? digits.substring(0, 11) : digits;

    final buffer = StringBuffer();
    for (var i = 0; i < trimmed.length; i++) {
      if (i == 3 || i == 6) buffer.write('.');
      if (i == 9) buffer.write('-');
      buffer.write(trimmed[i]);
    }
    final text = buffer.toString();
    return TextEditingValue(
      text: text,
      selection: TextSelection.collapsed(offset: text.length),
    );
  }
}

/// Confere os dígitos verificadores do CPF.
bool isValidCpf(String input) {
  final d = input.replaceAll(RegExp(r'\D'), '');
  if (d.length != 11 || RegExp(r'^(\d)\1{10}$').hasMatch(d)) return false;
  final n = d.split('').map(int.parse).toList();
  for (var check = 9; check < 11; check++) {
    var sum = 0;
    for (var i = 0; i < check; i++) {
      sum += n[i] * (check + 1 - i);
    }
    final digit = (sum * 10) % 11 % 10;
    if (digit != n[check]) return false;
  }
  return true;
}
