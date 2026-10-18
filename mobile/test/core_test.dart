import 'package:flutter_test/flutter_test.dart';
import 'package:lumi_sentinela/core/utils/cpf_formatter.dart';
import 'package:lumi_sentinela/features/auth/domain/user.dart';
import 'package:lumi_sentinela/features/complaints/domain/complaint.dart';

void main() {
  test('isValidCpf confere os dígitos verificadores', () {
    expect(isValidCpf('529.982.247-25'), isTrue);
    expect(isValidCpf('52998224725'), isTrue);
    expect(isValidCpf('529.982.247-24'), isFalse);
    expect(isValidCpf('111.111.111-11'), isFalse);
    expect(isValidCpf('123'), isFalse);
  });

  test('sessão sobrevive ao JSON salvo no aparelho', () {
    const user = AppUser(
      id: 'abc',
      name: 'Maria da Silva',
      role: UserRole.cidadao,
      cpf: '52998224725',
      email: 'maria@example.com',
      token: 'jwt',
    );
    final back = AppUser.fromJson(user.toJson());
    expect(back.role, UserRole.cidadao);
    expect(back.token, 'jwt');
    expect(back.isGuest, isFalse);
    expect(back.maskedCpf, '***.982.247-**');
    expect(AppUser.fromJson(AppUser.guest.toJson()).isGuest, isTrue);
  });

  test('status da API mapeia para o enum (inclui concluida sem acento)', () {
    expect(ComplaintStatus.fromId('concluida'), ComplaintStatus.concluida);
    expect(ComplaintStatus.fromId('em_analise'), ComplaintStatus.emAnalise);
    expect(ComplaintStatus.fromId('rejeitada'), ComplaintStatus.rejeitada);
  });
}
