import 'dart:convert';
import 'package:http/http.dart' as http;

import '../../../core/config.dart';
import '../domain/complaint.dart';
import 'complaint_repository.dart';

/// Implementação HTTP contra a API real do LUMI (backend no VPS).
class ApiComplaintRepository implements ComplaintRepository {
  ApiComplaintRepository({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;
  String get _base => AppConfig.apiBaseUrl;

  ComplaintPriority _priorityFromId(String id) => switch (id) {
        'alta' => ComplaintPriority.alta,
        'baixa' => ComplaintPriority.baixa,
        _ => ComplaintPriority.media,
      };

  Complaint _fromJson(Map<String, dynamic> j) => Complaint(
        id: j['id'] as String,
        category: ComplaintCategory.fromId(j['category'] as String? ?? 'child'),
        title: j['title'] as String? ?? '',
        location: j['location'] as String? ?? 'Não informado',
        status: ComplaintStatus.fromId(j['status'] as String? ?? 'recebida'),
        priority: _priorityFromId(j['priority'] as String? ?? 'media'),
        date: DateTime.tryParse(j['createdAt'] as String? ?? '') ?? DateTime.now(),
        description: j['description'] as String? ?? '',
        anonymous: j['anonymous'] as bool? ?? true,
      );

  @override
  Future<List<Complaint>> recent() async {
    // A API pública não lista denúncias de terceiros (sigilo).
    // "Minhas denúncias" virá do histórico local de protocolos (futuro).
    return const [];
  }

  @override
  Future<Complaint?> byProtocol(String protocol) async {
    final res = await _client.get(
      Uri.parse('$_base/api/complaints/${Uri.encodeComponent(protocol.trim())}'),
    );
    if (res.statusCode == 404) return null;
    if (res.statusCode >= 400) {
      throw Exception('Erro ao consultar protocolo (${res.statusCode})');
    }
    return _fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  @override
  Future<Complaint> submit({
    required ComplaintCategory category,
    required String title,
    required String location,
    required String description,
    required ComplaintPriority priority,
    required bool anonymous,
  }) async {
    final res = await _client.post(
      Uri.parse('$_base/api/complaints'),
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode({
        'category': category.id,
        'title': title,
        'description': description,
        'location': location,
        'priority': priority.id,
        'anonymous': anonymous,
      }),
    );
    if (res.statusCode >= 400) {
      throw Exception('Erro ao enviar denúncia (${res.statusCode})');
    }
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    final protocol = data['protocol'] as String? ?? data['id'] as String;
    return Complaint(
      id: protocol,
      category: category,
      title: title.isEmpty ? category.label : title,
      location: location.isEmpty ? 'Não informado' : location,
      status: ComplaintStatus.recebida,
      priority: priority,
      date: DateTime.now(),
      description: description,
      anonymous: anonymous,
    );
  }
}
