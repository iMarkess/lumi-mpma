import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../config.dart';

/// Erro de API com mensagem pronta para mostrar ao usuário.
class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});
  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

/// Cliente HTTP fino sobre `package:http`: JSON, timeout, token e mensagens
/// de erro em português.
class ApiClient {
  ApiClient({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  Uri _uri(String path, [Map<String, String>? query]) =>
      Uri.parse('${AppConfig.apiBaseUrl}$path').replace(queryParameters: query);

  Map<String, String> _headers(String? token, {bool json = false}) => {
        'Accept': 'application/json',
        if (json) 'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

  Future<dynamic> get(String path, {Map<String, String>? query, String? token}) =>
      _send(() => _client.get(_uri(path, query), headers: _headers(token)));

  Future<dynamic> post(String path, Object? body, {String? token}) => _send(
        () => _client.post(
          _uri(path),
          headers: _headers(token, json: true),
          body: jsonEncode(body ?? const {}),
        ),
      );

  Future<dynamic> patch(String path, {Object? body, String? token}) => _send(
        () => _client.patch(
          _uri(path),
          headers: _headers(token, json: true),
          body: jsonEncode(body ?? const {}),
        ),
      );

  Future<dynamic> delete(String path, {String? token}) =>
      _send(() => _client.delete(_uri(path), headers: _headers(token)));

  Future<dynamic> _send(Future<http.Response> Function() request) async {
    final http.Response res;
    try {
      res = await request().timeout(AppConfig.requestTimeout);
    } on TimeoutException {
      throw ApiException('O servidor demorou para responder. Tente novamente.');
    } on SocketException {
      throw ApiException('Sem conexão com a internet.');
    } on http.ClientException {
      throw ApiException('Sem conexão com o servidor.');
    }

    dynamic data;
    if (res.body.isNotEmpty) {
      try {
        data = jsonDecode(utf8.decode(res.bodyBytes));
      } catch (_) {
        data = null;
      }
    }

    if (res.statusCode >= 400) {
      final serverMsg = data is Map ? data['error'] as String? : null;
      throw ApiException(
        serverMsg ?? _fallbackMessage(res.statusCode),
        statusCode: res.statusCode,
      );
    }
    return data;
  }

  String _fallbackMessage(int code) => switch (code) {
        401 => 'Sessão expirada. Entre novamente.',
        404 => 'Não encontrado.',
        429 => 'Muitas tentativas. Aguarde um minuto.',
        >= 500 => 'Servidor indisponível no momento. Tente mais tarde.',
        _ => 'Não foi possível concluir a operação ($code).',
      };
}
