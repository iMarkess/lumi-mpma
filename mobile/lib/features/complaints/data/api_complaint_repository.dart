import '../../../core/network/api_client.dart';
import '../../../core/storage/local_store.dart';
import '../domain/complaint.dart';
import 'complaint_repository.dart';

/// Implementação HTTP contra a API real do LUMI (backend no VPS).
///
/// A API pública não lista denúncias (sigilo): "minhas denúncias" são os
/// protocolos guardados neste aparelho, consultados um a um.
class ApiComplaintRepository implements ComplaintRepository {
  ApiComplaintRepository(this._api, this._store);

  final ApiClient _api;
  final LocalStore _store;

  ComplaintPriority _priorityFromId(String id) => switch (id) {
        'alta' => ComplaintPriority.alta,
        'baixa' => ComplaintPriority.baixa,
        _ => ComplaintPriority.media,
      };

  DateTime _date(Object? v) =>
      DateTime.tryParse(v as String? ?? '')?.toLocal() ?? DateTime.now();

  Complaint _fromJson(Map<String, dynamic> j) => Complaint(
        id: j['id'] as String,
        category: ComplaintCategory.fromId(j['category'] as String? ?? 'child'),
        title: j['title'] as String? ?? '',
        location: j['location'] as String? ?? 'Não informado',
        status: ComplaintStatus.fromId(j['status'] as String? ?? 'recebida'),
        priority: _priorityFromId(j['priority'] as String? ?? 'media'),
        date: _date(j['createdAt']),
        description: j['description'] as String? ?? '',
        anonymous: j['anonymous'] as bool? ?? true,
        events: [
          for (final e in (j['events'] as List? ?? const []).cast<Map<String, dynamic>>())
            ComplaintEvent(
              status: ComplaintStatus.fromId(e['toStatus'] as String? ?? 'recebida'),
              date: _date(e['createdAt']),
              note: e['note'] as String?,
            ),
        ],
      );

  @override
  Future<List<Complaint>> recent() async {
    final protocols = _store.protocols();
    final results = await Future.wait(protocols.map((p) async {
      try {
        return await byProtocol(p);
      } on ApiException catch (e) {
        if (e.statusCode == null) rethrow; // sem rede: mostra o erro
        return null;
      }
    }));
    return results.whereType<Complaint>().toList();
  }

  @override
  Future<Complaint?> byProtocol(String protocol) async {
    final clean = protocol.trim().toUpperCase();
    if (clean.isEmpty) return null;
    try {
      final data = await _api.get('/api/complaints/${Uri.encodeComponent(clean)}');
      return _fromJson(data as Map<String, dynamic>);
    } on ApiException catch (e) {
      if (e.statusCode == 404) return null;
      rethrow;
    }
  }

  @override
  Future<Complaint> submit({
    required ComplaintCategory category,
    required String title,
    required String location,
    required String description,
    required ComplaintPriority priority,
    required bool anonymous,
    String? contactEmail,
  }) async {
    final data = await _api.post('/api/complaints', {
      'category': category.id,
      'title': title,
      'description': description,
      'location': location,
      'priority': priority.id,
      'anonymous': anonymous,
      if (!anonymous && contactEmail != null && contactEmail.isNotEmpty)
        'contactEmail': contactEmail,
    }) as Map<String, dynamic>;
    final protocol = data['protocol'] as String? ?? data['id'] as String;
    await _store.addProtocol(protocol);
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

  @override
  Future<void> forget(String protocol) => _store.removeProtocol(protocol);
}
