import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:logger/logger.dart';
import '../constants/app_constants.dart';
import '../models/api_response.dart';
import '../models/user_model.dart';
import 'api_service.dart';

/// Serviço de autenticação da EvolveYou
class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final ApiService _apiService = ApiService();
  final Logger _logger = Logger();

  /// Stream do estado de autenticação
  Stream<User?> get authStateChanges => _firebaseAuth.authStateChanges();

  /// Usuário atual do Firebase
  User? get currentFirebaseUser => _firebaseAuth.currentUser;

  /// Registra um novo usuário
  Future<ApiResponse<UserModel>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    try {
      _logger.d('Registering user: $email');

      // Primeiro, registra no Firebase
      final credential = await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (credential.user == null) {
        return ApiResponse.error('Falha ao criar usuário no Firebase');
      }

      // Atualiza o nome do usuário no Firebase
      await credential.user!.updateDisplayName(name);

      // Obtém o token do Firebase
      final firebaseToken = await credential.user!.getIdToken();

      // Registra no backend da EvolveYou
      final response = await _apiService.post<Map<String, dynamic>>(
        AppConstants.authRegister,
        data: {
          'name': name,
          'email': email,
          'firebase_token': firebaseToken,
        },
      );

      if (response.isSuccess && response.data != null) {
        final userData = response.data!;
        
        // Salva os tokens
        await _apiService.saveTokens(
          accessToken: userData['access_token'],
          refreshToken: userData['refresh_token'],
        );

        // Salva os dados do usuário
        final user = UserModel.fromJson(userData['user']);
        await _saveUserData(user);

        _logger.d('User registered successfully: ${user.email}');
        return ApiResponse.success(user);
      } else {
        // Se falhou no backend, remove o usuário do Firebase
        await credential.user!.delete();
        return ApiResponse.error(response.error ?? 'Erro ao registrar usuário');
      }
    } on FirebaseAuthException catch (e) {
      _logger.e('Firebase registration error: ${e.code} - ${e.message}');
      return ApiResponse.error(_getFirebaseErrorMessage(e.code));
    } catch (e) {
      _logger.e('Registration error: $e');
      return ApiResponse.error('Erro inesperado durante o registro');
    }
  }

  /// Faz login com email e senha
  Future<ApiResponse<UserModel>> login({
    required String email,
    required String password,
  }) async {
    try {
      _logger.d('Logging in user: $email');

      // Faz login no Firebase
      final credential = await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (credential.user == null) {
        return ApiResponse.error('Falha na autenticação');
      }

      // Obtém o token do Firebase
      final firebaseToken = await credential.user!.getIdToken();

      // Faz login no backend da EvolveYou
      final response = await _apiService.post<Map<String, dynamic>>(
        AppConstants.authLogin,
        data: {
          'email': email,
          'firebase_token': firebaseToken,
        },
      );

      if (response.isSuccess && response.data != null) {
        final userData = response.data!;
        
        // Salva os tokens
        await _apiService.saveTokens(
          accessToken: userData['access_token'],
          refreshToken: userData['refresh_token'],
        );

        // Salva os dados do usuário
        final user = UserModel.fromJson(userData['user']);
        await _saveUserData(user);

        _logger.d('User logged in successfully: ${user.email}');
        return ApiResponse.success(user);
      } else {
        return ApiResponse.error(response.error ?? 'Erro ao fazer login');
      }
    } on FirebaseAuthException catch (e) {
      _logger.e('Firebase login error: ${e.code} - ${e.message}');
      return ApiResponse.error(_getFirebaseErrorMessage(e.code));
    } catch (e) {
      _logger.e('Login error: $e');
      return ApiResponse.error('Erro inesperado durante o login');
    }
  }

  /// Faz login com Google
  Future<ApiResponse<UserModel>> signInWithGoogle() async {
    try {
      _logger.d('Signing in with Google');

      // Inicia o fluxo de login do Google
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      
      if (googleUser == null) {
        return ApiResponse.error('Login cancelado pelo usuário');
      }

      // Obtém os detalhes de autenticação
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      // Cria a credencial do Firebase
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Faz login no Firebase
      final userCredential = await _firebaseAuth.signInWithCredential(credential);

      if (userCredential.user == null) {
        return ApiResponse.error('Falha na autenticação com Google');
      }

      // Obtém o token do Firebase
      final firebaseToken = await userCredential.user!.getIdToken();

      // Faz login social no backend da EvolveYou
      final response = await _apiService.post<Map<String, dynamic>>(
        AppConstants.authSocialLogin,
        data: {
          'provider': 'google',
          'firebase_token': firebaseToken,
          'name': userCredential.user!.displayName,
          'email': userCredential.user!.email,
          'photo_url': userCredential.user!.photoURL,
        },
      );

      if (response.isSuccess && response.data != null) {
        final userData = response.data!;
        
        // Salva os tokens
        await _apiService.saveTokens(
          accessToken: userData['access_token'],
          refreshToken: userData['refresh_token'],
        );

        // Salva os dados do usuário
        final user = UserModel.fromJson(userData['user']);
        await _saveUserData(user);

        _logger.d('User signed in with Google successfully: ${user.email}');
        return ApiResponse.success(user);
      } else {
        return ApiResponse.error(response.error ?? 'Erro ao fazer login com Google');
      }
    } catch (e) {
      _logger.e('Google sign in error: $e');
      return ApiResponse.error('Erro inesperado durante o login com Google');
    }
  }

  /// Faz logout
  Future<void> logout() async {
    try {
      _logger.d('Logging out user');

      // Logout do Firebase
      await _firebaseAuth.signOut();

      // Logout do Google
      await _googleSignIn.signOut();

      // Remove tokens e dados do usuário
      await _apiService.logout();
      await _clearUserData();

      _logger.d('User logged out successfully');
    } catch (e) {
      _logger.e('Logout error: $e');
    }
  }

  /// Verifica se o usuário está autenticado
  Future<bool> isAuthenticated() async {
    final firebaseUser = _firebaseAuth.currentUser;
    final hasToken = await _apiService.isAuthenticated();
    return firebaseUser != null && hasToken;
  }

  /// Obtém os dados do usuário salvos
  Future<UserModel?> getSavedUser() async {
    try {
      final userJson = await _storage.read(key: AppConstants.userDataKey);
      if (userJson != null) {
        final userMap = jsonDecode(userJson) as Map<String, dynamic>;
        return UserModel.fromJson(userMap);
      }
    } catch (e) {
      _logger.e('Error getting saved user: $e');
    }
    return null;
  }

  /// Salva os dados do usuário
  Future<void> _saveUserData(UserModel user) async {
    final userJson = jsonEncode(user.toJson());
    await _storage.write(key: AppConstants.userDataKey, value: userJson);
  }

  /// Remove os dados do usuário
  Future<void> _clearUserData() async {
    await _storage.delete(key: AppConstants.userDataKey);
    await _storage.delete(key: AppConstants.onboardingCompleteKey);
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

  /// Envia email de redefinição de senha
  Future<ApiResponse<void>> sendPasswordResetEmail(String email) async {
    try {
      await _firebaseAuth.sendPasswordResetEmail(email: email);
      return ApiResponse.success(null, message: 'Email de redefinição enviado');
    } on FirebaseAuthException catch (e) {
      return ApiResponse.error(_getFirebaseErrorMessage(e.code));
    } catch (e) {
      return ApiResponse.error('Erro ao enviar email de redefinição');
    }
  }

  /// Verifica se o email está verificado
  bool get isEmailVerified => _firebaseAuth.currentUser?.emailVerified ?? false;

  /// Envia email de verificação
  Future<ApiResponse<void>> sendEmailVerification() async {
    try {
      final user = _firebaseAuth.currentUser;
      if (user != null && !user.emailVerified) {
        await user.sendEmailVerification();
        return ApiResponse.success(null, message: 'Email de verificação enviado');
      }
      return ApiResponse.error('Usuário não encontrado ou email já verificado');
    } catch (e) {
      return ApiResponse.error('Erro ao enviar email de verificação');
    }
  }
}


  /// Verificar se o usuário está logado (compatibilidade)
  Future<bool> isUserLoggedIn() async {
    final firebaseUser = _firebaseAuth.currentUser;
    final hasToken = await _apiService.isAuthenticated();
    return firebaseUser != null && hasToken;
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

  /// Fazer logout (compatibilidade)
  Future<void> signOut() async {
    await logout();
  }

  /// Criar usuário com email e senha (compatibilidade)
  Future<bool> createUserWithEmailAndPassword(String email, String password, String name) async {
    final response = await register(email, password, name);
    return response.isSuccess;
  }

  /// Login com email e senha (compatibilidade)
  Future<bool> signInWithEmailAndPassword(String email, String password) async {
    final response = await login(email, password);
    return response.isSuccess;
  }

  /// Login com Google (compatibilidade)
  Future<bool> signInWithGoogle() async {
    final response = await signInWithGoogleAccount();
    return response.isSuccess;
  }

