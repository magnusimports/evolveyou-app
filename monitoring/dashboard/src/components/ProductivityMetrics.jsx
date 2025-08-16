import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  GitBranch, 
  Clock, 
  Users, 
  Target, 
  TrendingUp,
  Calendar,
  Code,
  CheckCircle
} from 'lucide-react';

const ProductivityMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProductivityMetrics();
  }, []);

  const fetchProductivityMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/analysis/productivity');
      const result = await response.json();
      
      if (result.success) {
        setMetrics(result.data);
      } else {
        setError('Erro ao carregar métricas de produtividade');
      }
    } catch (err) {
      setError('Erro de conexão com a API');
      console.error('Erro ao buscar métricas:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button onClick={fetchProductivityMetrics} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  // Preparar dados para gráficos
  const repositoryData = metrics.repositories.map(repo => ({
    name: repo.name.split('/')[1] || repo.name,
    progress: repo.progress,
    commits: repo.recentActivity,
    milestones: repo.milestones
  }));

  const commitTypeColors = {
    feature: '#10b981',
    fix: '#f59e0b', 
    docs: '#3b82f6',
    style: '#8b5cf6',
    refactor: '#06b6d4',
    test: '#ef4444',
    chore: '#6b7280',
    other: '#9ca3af'
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progresso Médio</p>
                <p className="text-2xl font-bold">{metrics.overview.averageProgress}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={metrics.overview.averageProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Commits</p>
                <p className="text-2xl font-bold">{metrics.overview.totalCommits}</p>
              </div>
              <Code className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Repositórios</p>
                <p className="text-2xl font-bold">{metrics.overview.totalRepositories}</p>
              </div>
              <GitBranch className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Marcos</p>
                <p className="text-2xl font-bold">{metrics.overview.totalMilestones}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Repository Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progresso por Repositório
          </CardTitle>
          <CardDescription>
            Status atual de desenvolvimento de cada repositório
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repositoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'progress') return [`${value}%`, 'Progresso'];
                    if (name === 'commits') return [`${value}`, 'Commits Recentes'];
                    if (name === 'milestones') return [`${value}`, 'Marcos'];
                    return [value, name];
                  }}
                />
                <Bar dataKey="progress" fill="#3b82f6" name="progress" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Repository Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Atividade por Repositório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.repositories.map((repo, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {repo.name.split('/')[1] || repo.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {repo.recentActivity} commits recentes • {repo.milestones} marcos
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={repo.progress > 70 ? "default" : repo.progress > 40 ? "secondary" : "outline"}
                    >
                      {repo.progress}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Repositório Mais Ativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {metrics.overview.mostActiveRepo?.split('/')[1] || 'N/A'}
              </div>
              <p className="text-muted-foreground mb-4">
                Repositório com maior atividade recente
              </p>
              
              {metrics.repositories.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.max(...metrics.repositories.map(r => r.recentActivity))}
                    </div>
                    <div className="text-sm text-muted-foreground">Commits Recentes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.max(...metrics.repositories.map(r => r.progress))}%
                    </div>
                    <div className="text-sm text-muted-foreground">Progresso</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Insights de Produtividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Destaques Positivos</h4>
              <div className="space-y-2 text-sm">
                {metrics.overview.averageProgress > 60 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Progresso médio acima de 60%
                  </div>
                )}
                {metrics.overview.totalCommits > 50 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Alta atividade de commits ({metrics.overview.totalCommits})
                  </div>
                )}
                {metrics.overview.totalMilestones > 5 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Bom número de marcos atingidos
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Oportunidades</h4>
              <div className="space-y-2 text-sm">
                {metrics.repositories.some(r => r.progress < 40) && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <Clock className="h-4 w-4" />
                    Alguns repositórios precisam de atenção
                  </div>
                )}
                <div className="flex items-center gap-2 text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                  Manter consistência na atividade diária
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductivityMetrics;

