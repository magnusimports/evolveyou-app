import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:logger/logger.dart';
import '../constants/app_constants.dart';
import '../models/api_response.dart';
import '../utils/connectivity_helper.dart';

/// Serviço centralizado para comunicação com a API EvolveYou
class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  late final Dio _dio;
  late final FlutterSecureStorage _storage;
  late final Logger _logger;
  late final ConnectivityHelper _connectivity;

  /// Inicializa o serviço de API
  void initialize() {
    _storage = const FlutterSecureStorage();
    _logger = Logger();
    _connectivity = ConnectivityHelper();
    
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.baseUrl,
      connectTimeout: AppConstants.requestTimeout,
      receiveTimeout: AppConstants.requestTimeout,
      sendTimeout: AppConstants.requestTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': '${AppConstants.appName}/${AppConstants.appVersion}',
      },
    ));

    _setupInterceptors();
  }

  /// Configura interceptors do Dio
  void _setupInterceptors() {
    // Request Interceptor - Adiciona token de autenticação
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Verifica conectividade
        if (!await _connectivity.hasConnection()) {
          return handler.reject(
            DioException(
              requestOptions: options,
              type: DioExceptionType.connectionError,
              message: 'Sem conexão com a internet',
            ),
          );
        }

        // Adiciona token de autenticação se disponível
        final token = await _storage.read(key: AppConstants.accessTokenKey);
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }

        _logger.d('Request: ${options.method} ${options.uri}');
        _logger.d('Headers: ${options.headers}');
        if (options.data != null) {
          _logger.d('Body: ${options.data}');
        }

        handler.next(options);
      },
      onResponse: (response, handler) {
        _logger.d('Response: ${response.statusCode} ${response.requestOptions.uri}');
        _logger.d('Data: ${response.data}');
        handler.next(response);
      },
      onError: (error, handler) async {
        _logger.e('Error: ${error.message}');
        _logger.e('Response: ${error.response?.data}');

        // Handle token refresh for 401 errors
        if (error.response?.statusCode == 401) {
          final refreshed = await _refreshToken();
          if (refreshed) {
            // Retry the original request
            final options = error.requestOptions;
            final token = await _storage.read(key: AppConstants.accessTokenKey);
            options.headers['Authorization'] = 'Bearer $token';
            
            try {
              final response = await _dio.fetch(options);
              return handler.resolve(response);
            } catch (e) {
              // If retry fails, proceed with original error
            }
          } else {
            // Token refresh failed, logout user
            await _clearTokens();
          }
        }

        handler.next(error);
      },
    ));

    // Logging Interceptor
    if (AppConstants.appVersion.contains('debug')) {
      _dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
        requestHeader: true,
        responseHeader: false,
        error: true,
        logPrint: (obj) => _logger.d(obj),
      ));
    }
  }

  /// Refresh do token de autenticação
  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await _storage.read(key: AppConstants.refreshTokenKey);
      if (refreshToken == null) return false;

      final response = await _dio.post('/auth/refresh', data: {
        'refresh_token': refreshToken,
      });

      if (response.statusCode == 200) {
        final data = response.data;
        await _storage.write(key: AppConstants.accessTokenKey, value: data['access_token']);
        if (data['refresh_token'] != null) {
          await _storage.write(key: AppConstants.refreshTokenKey, value: data['refresh_token']);
        }
        return true;
      }
    } catch (e) {
      _logger.e('Token refresh failed: $e');
    }
    return false;
  }

  /// Limpa tokens de autenticação
  Future<void> _clearTokens() async {
    await _storage.delete(key: AppConstants.accessTokenKey);
    await _storage.delete(key: AppConstants.refreshTokenKey);
    await _storage.delete(key: AppConstants.userDataKey);
  }

  /// GET Request
  Future<ApiResponse<T>> get<T>(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.get(
        endpoint,
        queryParameters: queryParameters,
        options: options,
      );
      return ApiResponse.success(response.data);
    } on DioException catch (e) {
      return _handleError<T>(e);
    } catch (e) {
      return ApiResponse.error('Erro inesperado: $e');
    }
  }

  /// POST Request
  Future<ApiResponse<T>> post<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.post(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return ApiResponse.success(response.data);
    } on DioException catch (e) {
      return _handleError<T>(e);
    } catch (e) {
      return ApiResponse.error('Erro inesperado: $e');
    }
  }

  /// PUT Request
  Future<ApiResponse<T>> put<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.put(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return ApiResponse.success(response.data);
    } on DioException catch (e) {
      return _handleError<T>(e);
    } catch (e) {
      return ApiResponse.error('Erro inesperado: $e');
    }
  }

  /// DELETE Request
  Future<ApiResponse<T>> delete<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.delete(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return ApiResponse.success(response.data);
    } on DioException catch (e) {
      return _handleError<T>(e);
    } catch (e) {
      return ApiResponse.error('Erro inesperado: $e');
    }
  }

  /// Trata erros da API
  ApiResponse<T> _handleError<T>(DioException error) {
    String message;
    
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        message = 'Tempo limite de conexão excedido';
        break;
      case DioExceptionType.connectionError:
        message = 'Erro de conexão. Verifique sua internet';
        break;
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final responseData = error.response?.data;
        
        if (statusCode != null) {
          switch (statusCode) {
            case 400:
              message = responseData?['message'] ?? 'Dados inválidos';
              break;
            case 401:
              message = 'Não autorizado. Faça login novamente';
              break;
            case 403:
              message = 'Acesso negado';
              break;
            case 404:
              message = 'Recurso não encontrado';
              break;
            case 422:
              message = responseData?['message'] ?? 'Dados de entrada inválidos';
              break;
            case 500:
              message = 'Erro interno do servidor';
              break;
            default:
              message = responseData?['message'] ?? 'Erro no servidor ($statusCode)';
          }
        } else {
          message = 'Erro de resposta do servidor';
        }
        break;
      case DioExceptionType.cancel:
        message = 'Requisição cancelada';
        break;
      default:
        message = 'Erro de rede: ${error.message}';
    }

    return ApiResponse.error(message);
  }

  /// Verifica se o usuário está autenticado
  Future<bool> isAuthenticated() async {
    final token = await _storage.read(key: AppConstants.accessTokenKey);
    return token != null && token.isNotEmpty;
  }

  /// Salva tokens de autenticação
  Future<void> saveTokens({
    required String accessToken,
    String? refreshToken,
  }) async {
    await _storage.write(key: AppConstants.accessTokenKey, value: accessToken);
    if (refreshToken != null) {
      await _storage.write(key: AppConstants.refreshTokenKey, value: refreshToken);
    }
  }

  /// Remove tokens de autenticação (logout)
  Future<void> logout() async {
    await _clearTokens();
  }

  /// Obtém o token de acesso atual
  Future<String?> getAccessToken() async {
    return await _storage.read(key: AppConstants.accessTokenKey);
  }
}

