import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

/// Abre link, e-mail ou discador fora do app; avisa se não houver app capaz.
Future<void> openExternal(BuildContext context, Uri uri) async {
  bool ok;
  try {
    ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
  } catch (_) {
    ok = false;
  }
  if (!ok && context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Nenhum app disponível para abrir isso.')),
    );
  }
}

Future<void> callNumber(BuildContext context, String number) =>
    openExternal(context, Uri(scheme: 'tel', path: number));

Future<void> sendEmail(BuildContext context, String to, {String? subject}) =>
    openExternal(
      context,
      Uri(
        scheme: 'mailto',
        path: to,
        query: subject == null
            ? null
            : 'subject=${Uri.encodeComponent(subject)}',
      ),
    );
