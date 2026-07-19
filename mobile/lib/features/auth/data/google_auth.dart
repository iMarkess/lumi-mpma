import 'package:google_sign_in/google_sign_in.dart';

class GoogleAccount {
  const GoogleAccount({
    required this.name,
    required this.email,
    this.photoUrl,
    this.idToken,
  });
  final String name;
  final String? email;
  final String? photoUrl;
  final String? idToken;
}

/// Login com Google (nativo). Abre o seletor de contas do aparelho.
///
/// Config Android: adicione o `google-services.json` (Firebase) ou configure o
/// OAuth Client Android (package `br.mp.lumi` + SHA-1) no Google Cloud.
/// Para receber `idToken` (verificar no backend), passe o Web Client ID em
/// [serverClientId].
class GoogleAuthService {
  GoogleAuthService({String? serverClientId})
      : _google = GoogleSignIn(
          scopes: const ['email', 'profile'],
          serverClientId: serverClientId,
        );

  final GoogleSignIn _google;

  Future<GoogleAccount?> signIn() async {
    final account = await _google.signIn();
    if (account == null) return null; // usuário cancelou
    final auth = await account.authentication;
    return GoogleAccount(
      name: account.displayName ?? 'Cidadão',
      email: account.email,
      photoUrl: account.photoUrl,
      idToken: auth.idToken,
    );
  }

  Future<void> signOut() => _google.signOut();
}
