import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Code, GitCommit, Bug, FileText, Palette, Wrench, TestTube, Settings } from 'lucide-react';

const CommitTypesChart = () => {
  const [commitData, setCommitData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('pie');
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchCommitTypes();
  }, [period]);

  const fetchCommitTypes = async () => {
    try {
      setLoading(true);
      
      // Simular dados de tipos de commit baseados em padrões reais
      const commitTypes = [
        { 
          type: 'feature', 
          name: 'Features', 
          count: Math.floor(Math.random() * 15) + 10,
          color: '#10b981',
          icon: Code,
          description: 'Novas funcionalidades'
        },
        { 
          type: 'fix', 
          name: 'Bug Fixes', 
          count: Math.floor(Math.random() * 10) + 5,
          color: '#f59e0b',
          icon: Bug,
          description: 'Correções de bugs'
        },
        { 
          type: 'docs', 
          name: 'Documentação', 
          count: Math.floor(Math.random() * 8) + 3,
          color: '#3b82f6',
          icon: FileText,
          description: 'Atualizações de documentação'
        },
        { 
          type: 'style', 
          name: 'Estilo', 
          count: Math.floor(Math.random() * 6) + 2,
          color: '#8b5cf6',
          icon: Palette,
          description: 'Formatação e estilo'
        },
        { 
          type: 'refactor', 
          name: 'Refatoração', 
          count: Math.floor(Math.random() * 8) + 4,
          color: '#06b6d4',
          icon: Wrench,
          description: 'Melhorias de código'
        },
        { 
          type: 'test', 
          name: 'Testes', 
          count: Math.floor(Math.random() * 5) + 2,
          color: '#ef4444',
          icon: TestTube,
          description: 'Adição/correção de testes'
        },
        { 
          type: 'chore', 
          name: 'Manutenção', 
          count: Math.floor(Math.random() * 7) + 3,
          color: '#6b7280',
          icon: Settings,
          description: 'Tarefas de manutenção'
        }
      ];

      // Calcular percentuais
      const total = commitTypes.reduce((sum, type) => sum + type.count, 0);
      const dataWithPercentages = commitTypes.map(type => ({
        ...type,
        percentage: Math.round((type.count / total) * 100)
      }));

      setCommitData(dataWithPercentages);
      
    } catch (err) {
      setError('Erro ao carregar tipos de commit');
      console.error('Erro nos tipos de commit:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    if (percentage < 5) return null; // Não mostrar labels para fatias muito pequenas
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${percentage}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <span className="font-medium">{data.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">{data.description}</p>
          <p className="text-sm">
            <span className="font-bold">{data.count}</span> commits ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            Tipos de Commit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            Tipos de Commit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
            <Button onClick={fetchCommitTypes} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCommits = commitData.reduce((sum, type) => sum + type.count, 0);
  const mostCommonType = commitData.reduce((prev, current) => 
    prev.count > current.count ? prev : current
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitCommit className="h-5 w-5" />
              Tipos de Commit
            </CardTitle>
            <CardDescription>
              Distribuição por tipo nos últimos {period} dias
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={period === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(7)}
            >
              7d
            </Button>
            <Button
              variant={period === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(30)}
            >
              30d
            </Button>
            <Button
              variant={period === 90 ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(90)}
            >
              90d
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Estatísticas principais */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalCommits}</div>
            <div className="text-sm text-muted-foreground">Total Commits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: mostCommonType.color }}>
              {mostCommonType.count}
            </div>
            <div className="text-sm text-muted-foreground">
              {mostCommonType.name} (Mais comum)
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{commitData.length}</div>
            <div className="text-sm text-muted-foreground">Tipos Diferentes</div>
          </div>
        </div>

        {/* Controles do gráfico */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={chartType === 'pie' ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType('pie')}
          >
            Pizza
          </Button>
          <Button
            variant={chartType === 'bar' ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType('bar')}
          >
            Barras
          </Button>
        </div>

        {/* Gráfico */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={commitData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {commitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            ) : (
              <BarChart data={commitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {commitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Lista detalhada */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">Detalhamento por Tipo</h4>
          <div className="space-y-2">
            {commitData
              .sort((a, b) => b.count - a.count)
              .map((type, index) => {
                const IconComponent = type.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: type.color }}
                      />
                      <IconComponent className="h-4 w-4" style={{ color: type.color }} />
                      <div>
                        <div className="font-medium text-sm">{type.name}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{type.count}</div>
                      <Badge variant="outline" className="text-xs">
                        {type.percentage}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <GitCommit className="h-4 w-4" />
            <span className="font-medium">Insights</span>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• {mostCommonType.name} representa {mostCommonType.percentage}% dos commits</p>
            {commitData.find(t => t.type === 'feature')?.percentage > 40 && (
              <p>• Alto foco em desenvolvimento de features</p>
            )}
            {commitData.find(t => t.type === 'fix')?.percentage > 30 && (
              <p>• Muitas correções de bugs - considere mais testes</p>
            )}
            {commitData.find(t => t.type === 'test')?.percentage < 10 && (
              <p>• Poucos commits de teste - considere aumentar cobertura</p>
            )}
            <p>• Média de {Math.round(totalCommits / period * 10) / 10} commits por dia</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommitTypesChart;

