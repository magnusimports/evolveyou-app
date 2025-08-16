import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:logger/logger.dart';

/// Helper para verificar conectividade de rede
class ConnectivityHelper {
  static final ConnectivityHelper _instance = ConnectivityHelper._internal();
  factory ConnectivityHelper() => _instance;
  ConnectivityHelper._internal();

  final Connectivity _connectivity = Connectivity();
  final Logger _logger = Logger();

  /// Verifica se há conexão com a internet
  Future<bool> hasConnection() async {
    try {
      final connectivityResult = await _connectivity.checkConnectivity();
      
      // Verifica se há algum tipo de conexão
      final hasConnection = connectivityResult.any((result) => 
        result == ConnectivityResult.mobile ||
        result == ConnectivityResult.wifi ||
        result == ConnectivityResult.ethernet
      );

      _logger.d('Connectivity status: $connectivityResult, hasConnection: $hasConnection');
      return hasConnection;
    } catch (e) {
      _logger.e('Error checking connectivity: $e');
      return false;
    }
  }

  /// Obtém o tipo de conexão atual
  Future<ConnectivityResult> getConnectionType() async {
    try {
      final connectivityResults = await _connectivity.checkConnectivity();
      
      // Retorna o primeiro tipo de conexão disponível
      if (connectivityResults.isNotEmpty) {
        return connectivityResults.first;
      }
      
      return ConnectivityResult.none;
    } catch (e) {
      _logger.e('Error getting connection type: $e');
      return ConnectivityResult.none;
    }
  }

  /// Stream para monitorar mudanças na conectividade
  Stream<List<ConnectivityResult>> get onConnectivityChanged {
    return _connectivity.onConnectivityChanged;
  }

  /// Verifica se está conectado via WiFi
  Future<bool> isWifiConnected() async {
    final connectivityResults = await _connectivity.checkConnectivity();
    return connectivityResults.contains(ConnectivityResult.wifi);
  }

  /// Verifica se está conectado via dados móveis
  Future<bool> isMobileConnected() async {
    final connectivityResults = await _connectivity.checkConnectivity();
    return connectivityResults.contains(ConnectivityResult.mobile);
  }

  /// Verifica se está conectado via ethernet
  Future<bool> isEthernetConnected() async {
    final connectivityResults = await _connectivity.checkConnectivity();
    return connectivityResults.contains(ConnectivityResult.ethernet);
  }

  /// Obtém uma descrição amigável do status de conectividade
  Future<String> getConnectionDescription() async {
    final connectivityResults = await _connectivity.checkConnectivity();
    
    if (connectivityResults.isEmpty || connectivityResults.contains(ConnectivityResult.none)) {
      return 'Sem conexão';
    }
    
    final descriptions = <String>[];
    
    if (connectivityResults.contains(ConnectivityResult.wifi)) {
      descriptions.add('WiFi');
    }
    
    if (connectivityResults.contains(ConnectivityResult.mobile)) {
      descriptions.add('Dados móveis');
    }
    
    if (connectivityResults.contains(ConnectivityResult.ethernet)) {
      descriptions.add('Ethernet');
    }
    
    if (descriptions.isEmpty) {
      return 'Conexão desconhecida';
    }
    
    return descriptions.join(', ');
  }
}

