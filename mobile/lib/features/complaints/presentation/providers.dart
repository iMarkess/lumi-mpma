import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/config.dart';
import '../data/api_complaint_repository.dart';
import '../data/complaint_repository.dart';
import '../domain/complaint.dart';

/// Usa a API real do VPS quando configurada; senão, mock.
final complaintRepositoryProvider = Provider<ComplaintRepository>(
  (ref) => AppConfig.useApi ? ApiComplaintRepository() : MockComplaintRepository(),
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
