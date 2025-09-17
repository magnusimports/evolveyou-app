import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { alimentosAPI, exerciciosAPI, coachAPI } from '@/config/api';

const TestAPI = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState('arroz');
  const [chatMessage, setChatMessage] = useState('Olá Coach! Como posso melhorar meu treino?');

  const testAPI = async (apiName, apiCall) => {
    setLoading(prev => ({ ...prev, [apiName]: true }));
    try {
      const result = await apiCall();
      setResults(prev => ({ ...prev, [apiName]: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, [apiName]: { error: error.message } }));
    } finally {
      setLoading(prev => ({ ...prev, [apiName]: false }));
    }
  };

  const tests = [
    {
      name: 'alimentos_search',
      title: 'Buscar Alimentos',
      action: () => testAPI('alimentos_search', () => alimentosAPI.search(searchTerm, '', 5)),
      input: (
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Digite um alimento..."
          className="mb-2"
        />
      )
    },
    {
      name: 'alimentos_categorias',
      title: 'Categorias de Alimentos',
      action: () => testAPI('alimentos_categorias', alimentosAPI.categorias)
    },
    {
      name: 'exercicios_search',
      title: 'Buscar Exercícios',
      action: () => testAPI('exercicios_search', () => exerciciosAPI.search({ categoria: 'Peito', limit: 3 }))
    },
    {
      name: 'exercicios_categorias',
      title: 'Categorias de Exercícios',
      action: () => testAPI('exercicios_categorias', exerciciosAPI.categorias)
    },
    {
      name: 'gerar_treino',
      title: 'Gerar Treino',
      action: () => testAPI('gerar_treino', () => exerciciosAPI.gerarTreino({
        objetivo: 'hipertrofia',
        nivel: 'Intermediário',
        tempo_minutos: 60,
        grupos_musculares: ['Peito', 'Costas']
      }))
    },
    {
      name: 'coach_chat',
      title: 'Chat com Coach EVO',
      action: () => testAPI('coach_chat', () => coachAPI.chat(chatMessage, {
        name: 'Usuário Teste',
        goal: 'hipertrofia',
        level: 'Iniciante'
      })),
      input: (
        <Textarea
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          placeholder="Digite sua mensagem para o Coach..."
          className="mb-2"
          rows={3}
        />
      )
    },
    {
      name: 'coach_dicas',
      title: 'Dicas Diárias',
      action: () => testAPI('coach_dicas', () => coachAPI.dicasDiarias('fitness', 'iniciante'))
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Teste das APIs - EvolveYou</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <Card key={test.name} className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">{test.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {test.input}
              <Button 
                onClick={test.action}
                disabled={loading[test.name]}
                className="w-full mb-4"
              >
                {loading[test.name] ? 'Testando...' : 'Testar API'}
              </Button>
              
              {results[test.name] && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Resultado:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(results[test.name], null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Status da Conexão</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Backend URL: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:5000</code>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Frontend URL: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:5173</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAPI;

