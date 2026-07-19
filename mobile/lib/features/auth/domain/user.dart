enum UserRole {
  cidadao('Cidadão'),
  promotor('Promotor de Justiça'),
  secretaria('Secretaria'),
  ouvidoria('Ouvidoria'),
  master('Administrador');

  const UserRole(this.label);
  final String label;
}

class AppUser {
  const AppUser({
    required this.id,
    required this.name,
    required this.role,
    this.cpf,
    this.institution = 'Ministério Público do Maranhão',
    this.photoUrl,
  });

  final String id;
  final String name;
  final UserRole role;
  final String? cpf;
  final String institution;
  final String? photoUrl;

  bool get isGuest => role == UserRole.cidadao;

  String get initials {
    final parts = name.trim().split(' ').where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return (parts.first[0] + parts.last[0]).toUpperCase();
  }

  String get firstName => name.trim().split(' ').first;
}
