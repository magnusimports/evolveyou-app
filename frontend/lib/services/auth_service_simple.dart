import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:logger/logger.dart';
import '../constants/app_constants.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final Logger _logger = Logger();

  /// Usuário atual
  User? get currentUser => _firebaseAuth.currentUser;

  /// Stream do estado de autenticação
  Stream<User?> get authStateChanges => _firebaseAuth.authStateChanges();

  /// Criar usuário com email e senha
  Future<bool> createUserWithEmailAndPassword(String email, String password, String name) async {
    try {
      _logger.d('Creating user with email: $email');
      
      final credential = await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (credential.user != null) {
        // Atualizar o nome do usuário
        await credential.user!.updateDisplayName(name);
        
        // Salvar dados básicos
        await _storage.write(key: AppConstants.userDataKey, value: email);
        
        _logger.d('User created successfully: $email');
        return true;
      }
      
      return false;
    } on FirebaseAuthException catch (e) {
      _logger.e('Firebase registration error: ${e.code} - ${e.message}');
      throw Exception(_getFirebaseErrorMessage(e.code));
    } catch (e) {
      _logger.e('Registration error: $e');
      throw Exception('Erro inesperado durante o cadastro');
    }
  }

  /// Login com email e senha
  Future<bool> signInWithEmailAndPassword(String email, String password) async {
    try {
      _logger.d('Signing in user with email: $email');
      
      final credential = await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (credential.user != null) {
        // Salvar dados básicos
        await _storage.write(key: AppConstants.userDataKey, value: email);
        
        _logger.d('User signed in successfully: $email');
        return true;
      }
      
      return false;
    } on FirebaseAuthException catch (e) {
      _logger.e('Firebase login error: ${e.code} - ${e.message}');
      throw Exception(_getFirebaseErrorMessage(e.code));
    } catch (e) {
      _logger.e('Login error: $e');
      throw Exception('Erro inesperado durante o login');
    }
  }

  /// Login com Google
  Future<bool> signInWithGoogle() async {
    try {
      _logger.d('Signing in with Google');
      
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        return false; // Usuário cancelou
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await _firebaseAuth.signInWithCredential(credential);
      
      if (userCredential.user != null) {
        // Salvar dados básicos
        await _storage.write(key: AppConstants.userDataKey, value: userCredential.user!.email ?? '');
        
        _logger.d('User signed in with Google successfully: ${userCredential.user!.email}');
        return true;
      }
      
      return false;
    } catch (e) {
      _logger.e('Google sign in error: $e');
      throw Exception('Erro inesperado durante o login com Google');
    }
  }

  /// Fazer logout
  Future<void> signOut() async {
    try {
      _logger.d('Signing out user');
      
      await _firebaseAuth.signOut();
      await _googleSignIn.signOut();
      await _storage.deleteAll();
      
      _logger.d('User signed out successfully');
    } catch (e) {
      _logger.e('Sign out error: $e');
      throw Exception('Erro ao fazer logout');
    }
  }

  /// Verificar se o usuário está logado
  Future<bool> isUserLoggedIn() async {
    try {
      final user = _firebaseAuth.currentUser;
      return user != null;
    } catch (e) {
      return false;
    }
  }

  /// Verificar se completou onboarding
  Future<bool> hasCompletedOnboarding() async {
    try {
      final completed = await _storage.read(key: AppConstants.onboardingCompleteKey);
      return completed == 'true';
    } catch (e) {
      return false;
    }
  }

  /// Marcar onboarding como completo
  Future<void> markOnboardingCompleted() async {
    try {
      await _storage.write(key: AppConstants.onboardingCompleteKey, value: 'true');
    } catch (e) {
      _logger.e('Error marking onboarding complete: $e');
    }
  }

  /// Enviar email de redefinição de senha
  Future<void> sendPasswordResetEmail(String email) async {
    try {
      await _firebaseAuth.sendPasswordResetEmail(email: email);
    } on FirebaseAuthException catch (e) {
      throw Exception(_getFirebaseErrorMessage(e.code));
    } catch (e) {
      throw Exception('Erro ao enviar email de redefinição');
    }
  }

  /// Verificar se o email está verificado
  bool get isEmailVerified => _firebaseAuth.currentUser?.emailVerified ?? false;

  /// Enviar email de verificação
  Future<void> sendEmailVerification() async {
    try {
      final user = _firebaseAuth.currentUser;
      if (user != null && !user.emailVerified) {
        await user.sendEmailVerification();
      }
    } catch (e) {
      throw Exception('Erro ao enviar email de verificação');
    }
  }

  /// Converte códigos de erro do Firebase em mensagens amigáveis
  String _getFirebaseErrorMessage(String errorCode) {
    switch (errorCode) {
      case 'user-not-found':
        return 'Usuário não encontrado';
      case 'wrong-password':
        return 'Senha incorreta';
      case 'email-already-in-use':
        return 'Este email já está em uso';
      case 'weak-password':
        return 'A senha é muito fraca';
      case 'invalid-email':
        return 'Email inválido';
      case 'user-disabled':
        return 'Usuário desabilitado';
      case 'too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde';
      case 'operation-not-allowed':
        return 'Operação não permitida';
      case 'invalid-credential':
        return 'Credenciais inválidas';
      default:
        return 'Erro de autenticação: $errorCode';
    }
  }
}

