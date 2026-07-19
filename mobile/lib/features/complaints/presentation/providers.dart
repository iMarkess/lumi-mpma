import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/complaint_repository.dart';
import '../domain/complaint.dart';

/// Injeção do repositório. Para plugar a API real, troque por:
/// `ApiComplaintRepository(baseUrl: ...)`.
final complaintRepositoryProvider = Provider<ComplaintRepository>(
  (ref) => MockComplaintRepository(),
);

/// Lista de denúncias recentes (usada na Home e no Acompanhar).
final recentComplaintsProvider = FutureProvider<List<Complaint>>((ref) async {
  return ref.watch(complaintRepositoryProvider).recent();
});

/// Estado da consulta de protocolo.
class ProtocolQuery extends AutoDisposeAsyncNotifier<Complaint?> {
  @override
  Future<Complaint?> build() async => null;

  Future<void> search(String protocol) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(complaintRepositoryProvider).byProtocol(protocol),
    );
  }

  void clear() => state = const AsyncData(null);
}

final protocolQueryProvider =
    AutoDisposeAsyncNotifierProvider<ProtocolQuery, Complaint?>(
  ProtocolQuery.new,
);
