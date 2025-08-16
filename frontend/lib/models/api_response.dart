/// Modelo genérico para respostas da API
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final String? error;
  final int? statusCode;

  const ApiResponse._({
    required this.success,
    this.data,
    this.message,
    this.error,
    this.statusCode,
  });

  /// Cria uma resposta de sucesso
  factory ApiResponse.success(T data, {String? message, int? statusCode}) {
    return ApiResponse._(
      success: true,
      data: data,
      message: message,
      statusCode: statusCode,
    );
  }

  /// Cria uma resposta de erro
  factory ApiResponse.error(String error, {int? statusCode}) {
    return ApiResponse._(
      success: false,
      error: error,
      statusCode: statusCode,
    );
  }

  /// Verifica se a resposta foi bem-sucedida
  bool get isSuccess => success;

  /// Verifica se a resposta teve erro
  bool get isError => !success;

  /// Obtém a mensagem de erro ou sucesso
  String? get displayMessage => error ?? message;

  @override
  String toString() {
    if (success) {
      return 'ApiResponse.success(data: $data, message: $message)';
    } else {
      return 'ApiResponse.error(error: $error, statusCode: $statusCode)';
    }
  }
}

