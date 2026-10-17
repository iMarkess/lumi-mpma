import '../../../core/constants/app_constants.dart';
import '../domain/complaint.dart';

/// Contrato de dados de denúncias.
abstract class ComplaintRepository {
  /// Denúncias enviadas a partir deste aparelho (status atualizado).
  Future<List<Complaint>> recent();
  Future<Complaint?> byProtocol(String protocol);
  Future<Complaint> submit({
    required ComplaintCategory category,
    required String title,
    required String location,
    required String description,
    required ComplaintPriority priority,
    required bool anonymous,
    String? contactEmail,
  });

  /// Tira o protocolo da lista "minhas denúncias" deste aparelho.
  Future<void> forget(String protocol);
}

/// Implementação em memória — só para rodar o app sem backend.
class MockComplaintRepository implements ComplaintRepository {
  final List<Complaint> _items = [];

  @override
  Future<List<Complaint>> recent() async {
    await Future.delayed(AppConstants.mockLatency);
    return List.unmodifiable(_items);
  }

  @override
  Future<Complaint?> byProtocol(String protocol) async {
    await Future.delayed(AppConstants.mockLatency);
    final clean = protocol.trim().toUpperCase();
    for (final c in _items) {
      if (c.id.toUpperCase() == clean) return c;
    }
    return null;
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
    await Future.delayed(AppConstants.mockLatency);
    final protocol =
        'LUMI-${DateTime.now().millisecondsSinceEpoch.toRadixString(36).toUpperCase().substring(0, 6)}';
    final complaint = Complaint(
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
    _items.insert(0, complaint);
    return complaint;
  }

  @override
  Future<void> forget(String protocol) async =>
      _items.removeWhere((c) => c.id == protocol);
}
