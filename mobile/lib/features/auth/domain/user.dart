enum UserRole {
  convidado('Acesso anônimo'),
  cidadao('Conta de cidadão');

  const UserRole(this.label);
  final String label;
}

class AppUser {
  const AppUser({
    required this.id,
    required this.name,
    required this.role,
    this.cpf,
    this.email,
    this.token,
  });

  /// Sessão sem conta: denúncias anônimas, nada é enviado sobre a pessoa.
  static const guest =
      AppUser(id: 'guest', name: 'Cidadão', role: UserRole.convidado);

  final String id;
  final String name;
  final UserRole role;
  final String? cpf;
  final String? email;

  /// JWT da API (só contas de cidadão).
  final String? token;

  bool get isGuest => role == UserRole.convidado;

  String get initials {
    final parts = name.trim().split(' ').where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return (parts.first[0] + parts.last[0]).toUpperCase();
  }

  String get firstName => name.trim().split(' ').first;

  /// CPF mascarado para exibição (***.456.789-**).
  String? get maskedCpf {
    final d = cpf?.replaceAll(RegExp(r'\D'), '');
    if (d == null || d.length != 11) return null;
    return '***.${d.substring(3, 6)}.${d.substring(6, 9)}-**';
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'role': role.name,
        'cpf': cpf,
        'email': email,
        'token': token,
      };

  factory AppUser.fromJson(Map<String, dynamic> j) => AppUser(
        id: j['id'] as String,
        name: j['name'] as String? ?? 'Cidadão',
        role: UserRole.values.firstWhere(
          (r) => r.name == j['role'],
          orElse: () => UserRole.convidado,
        ),
        cpf: j['cpf'] as String?,
        email: j['email'] as String?,
        token: j['token'] as String?,
      );
}
