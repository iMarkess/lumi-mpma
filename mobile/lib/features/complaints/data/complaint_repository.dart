import '../../../core/constants/app_constants.dart';
import '../domain/complaint.dart';

/// Contrato de dados de denúncias.
///
/// Troque [MockComplaintRepository] por uma implementação HTTP
/// (`ApiComplaintRepository`) apontando para a API real do LUMI —
/// nenhuma tela precisa mudar.
abstract class ComplaintRepository {
  Future<List<Complaint>> recent();
  Future<Complaint?> byProtocol(String protocol);
  Future<Complaint> submit({
    required ComplaintCategory category,
    required String title,
    required String location,
    required String description,
    required ComplaintPriority priority,
    required bool anonymous,
  });
}

/// Implementação mock em memória — permite rodar o app 100% sem backend.
class MockComplaintRepository implements ComplaintRepository {
  final List<Complaint> _items = [
    Complaint(
      id: 'LUMI-X82J91',
      category: ComplaintCategory.child,
      title: 'Possível negligência em escola',
      location: 'São Luís',
      status: ComplaintStatus.recebida,
      priority: ComplaintPriority.alta,
      date: DateTime.now().subtract(const Duration(hours: 3)),
      description: 'Relato de negligência sistemática com alunos.',
    ),
    Complaint(
      id: 'LUMI-A72K12',
      category: ComplaintCategory.env,
      title: 'Queimada irregular em terreno',
      location: 'Imperatriz',
      status: ComplaintStatus.emTriagem,
      priority: ComplaintPriority.media,
      date: DateTime.now().subtract(const Duration(hours: 9)),
      description: 'Fogo em área de proteção ambiental.',
    ),
    Complaint(
      id: 'LUMI-B33L90',
      category: ComplaintCategory.elderly,
      title: 'Maus-tratos por familiar',
      location: 'Caxias',
      status: ComplaintStatus.emAnalise,
      priority: ComplaintPriority.alta,
      date: DateTime.now().subtract(const Duration(days: 1)),
      description: 'Idoso em situação de abandono.',
    ),
    Complaint(
      id: 'LUMI-E44N10',
      category: ComplaintCategory.env,
      title: 'Descarte de lixo em rio',
      location: 'Paço do Lumiar',
      status: ComplaintStatus.concluida,
      priority: ComplaintPriority.baixa,
      date: DateTime.now().subtract(const Duration(days: 4)),
      description: 'Empresa descartando resíduos no rio.',
    ),
  ];

  @override
  Future<List<Complaint>> recent() async {
    await Future.delayed(AppConstants.mockLatency);
    return List.unmodifiable(_items);
  }

  @override
  Future<Complaint?> byProtocol(String protocol) async {
    await Future.delayed(AppConstants.mockLatency);
    final clean = protocol.trim().toUpperCase();
    try {
      return _items.firstWhere((c) => c.id.toUpperCase() == clean);
    } catch (_) {
      return null;
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
}
