import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth.jsx';
import apiService from '@/services/api';

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const runTest = async (testName, testFunction) => {
    setLoading(true);
    try {
      console.log(`🧪 Executando teste: ${testName}`);
      const startTime = Date.now();
      
      const result = await testFunction();
      const endTime = Date.now();
      
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          status: 'success',
          data: result,
          duration: endTime - startTime,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
      
      console.log(`✅ Teste ${testName} concluído:`, result);
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          status: 'error',
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
      
      console.error(`❌ Teste ${testName} falhou:`, error);
    } finally {
      setLoading(false);
    }
  };

  const tests = [
    {
      name: 'Health Check',
      description: 'Verifica se a API Gateway está online',
      action: () => runTest('healthCheck', () => apiService.healthCheck())
    },
    {
      name: 'User Profile',
      description: 'Testa endpoint de perfil do usuário',
      action: () => runTest('userProfile', () => apiService.getUserProfile(user?.uid || 'demo-user-123'))
    },
    {
      name: 'User Plan',
      description: 'Testa endpoint de plano do usuário',
      action: () => runTest('userPlan', () => apiService.getUserPlan(user?.uid || 'demo-user-123'))
    },
    {
      name: 'Progress',
      description: 'Testa endpoint de progresso',
      action: () => runTest('progress', () => apiService.getProgress(user?.uid || 'demo-user-123'))
    }
  ];

  const runAllTests = async () => {
    for (const test of tests) {
      await test.action();
      // Pequena pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusBadge = (result) => {
    if (!result) return <Badge variant="secondary">Não testado</Badge>;
    
    if (result.status === 'success') {
      return <Badge variant="default" className="bg-green-500">✅ Sucesso ({result.duration}ms)</Badge>;
    } else {
      return <Badge variant="destructive">❌ Erro</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🧪 Teste de Integração API
        </h1>
        <p className="text-gray-600">
          Verificação da comunicação com a API Gateway
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Controles de Teste</span>
            <Button 
              onClick={runAllTests} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? '🔄 Testando...' : '🚀 Executar Todos os Testes'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{test.name}</h3>
                  <p className="text-sm text-gray-600">{test.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(testResults[test.name.toLowerCase().replace(' ', '')])}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={test.action}
                    disabled={loading}
                  >
                    Testar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(testResults).map(([testName, result]) => (
                <div key={testName} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize">{testName.replace(/([A-Z])/g, ' $1')}</h4>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                  
                  {result.status === 'success' ? (
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="text-green-800 font-medium">✅ Sucesso</p>
                      <p className="text-sm text-green-600">Tempo de resposta: {result.duration}ms</p>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-green-700 hover:text-green-800">
                          Ver resposta
                        </summary>
                        <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                      <p className="text-red-800 font-medium">❌ Erro</p>
                      <p className="text-sm text-red-600">{result.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ℹ️ Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Usuário:</strong> {user?.email || 'Demo User'}
            </div>
            <div>
              <strong>User ID:</strong> {user?.uid || 'demo-user-123'}
            </div>
            <div>
              <strong>API Base URL:</strong> {process.env.NODE_ENV === 'production' ? 'https://api.evolveyou.com' : 'http://localhost:8080'}
            </div>
            <div>
              <strong>Ambiente:</strong> {process.env.NODE_ENV || 'development'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTest;

