import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { TrendingUp, TrendingDown, Activity, GitCommit } from 'lucide-react';

const VelocityChart = () => {
  const [velocityData, setVelocityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState(14);
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    fetchVelocityData();
  }, [period]);

  const fetchVelocityData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/analysis/velocity?days=${period}`);
      const result = await response.json();
      
      if (result.success) {
        // Formatar dados para o gráfico
        const formattedData = result.data.velocity.map(item => ({
          ...item,
          formattedDate: new Date(item.date).toLocaleDateString('pt-BR', { 
            month: 'short', 
            day: 'numeric' 
          })
        }));
        
        setVelocityData(formattedData);
      } else {
        setError('Erro ao carregar dados de velocity');
      }
    } catch (err) {
      setError('Erro de conexão com a API');
      console.error('Erro ao buscar velocity:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = () => {
    if (velocityData.length < 2) return { trend: 'stable', percentage: 0 };
    
    const recent = velocityData.slice(-3).reduce((sum, day) => sum + day.commits, 0) / 3;
    const previous = velocityData.slice(-6, -3).reduce((sum, day) => sum + day.commits, 0) / 3;
    
    if (previous === 0) return { trend: 'stable', percentage: 0 };
    
    const percentage = ((recent - previous) / previous) * 100;
    const trend = percentage > 10 ? 'up' : percentage < -10 ? 'down' : 'stable';
    
    return { trend, percentage: Math.abs(percentage) };
  };

  const getStats = () => {
    if (velocityData.length === 0) return { total: 0, average: 0, peak: 0, peakDate: null };
    
    const total = velocityData.reduce((sum, day) => sum + day.commits, 0);
    const average = total / velocityData.length;
    const peak = Math.max(...velocityData.map(day => day.commits));
    const peakDay = velocityData.find(day => day.commits === peak);
    
    return {
      total,
      average: Math.round(average * 10) / 10,
      peak,
      peakDate: peakDay?.formattedDate
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Velocity de Commits
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
            <Activity className="h-5 w-5" />
            Velocity de Commits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
            <Button onClick={fetchVelocityData} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = getStats();
  const trendData = calculateTrend();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Velocity de Commits
            </CardTitle>
            <CardDescription>
              Atividade de commits nos últimos {period} dias
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
              variant={period === 14 ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(14)}
            >
              14d
            </Button>
            <Button
              variant={period === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(30)}
            >
              30d
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Commits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.average}</div>
            <div className="text-sm text-muted-foreground">Média/Dia</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.peak}</div>
            <div className="text-sm text-muted-foreground">Pico ({stats.peakDate})</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              {trendData.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
              {trendData.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
              {trendData.trend === 'stable' && <Activity className="h-4 w-4 text-gray-500" />}
              <span className={`text-sm font-medium ${
                trendData.trend === 'up' ? 'text-green-600' : 
                trendData.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trendData.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="text-sm text-muted-foreground">Tendência</div>
          </div>
        </div>

        {/* Controles do gráfico */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={chartType === 'line' ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType('line')}
          >
            Linha
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
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="formattedDate" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(label) => `Data: ${label}`}
                  formatter={(value) => [`${value} commits`, 'Commits']}
                />
                <Line 
                  type="monotone" 
                  dataKey="commits" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="formattedDate" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(label) => `Data: ${label}`}
                  formatter={(value) => [`${value} commits`, 'Commits']}
                />
                <Bar 
                  dataKey="commits" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <GitCommit className="h-4 w-4" />
            <span className="font-medium">Insights</span>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            {stats.average > 2 && (
              <p>• Boa consistência com média de {stats.average} commits/dia</p>
            )}
            {stats.peak > 5 && (
              <p>• Pico de produtividade em {stats.peakDate} com {stats.peak} commits</p>
            )}
            {trendData.trend === 'up' && (
              <p>• Tendência crescente de {trendData.percentage.toFixed(1)}% nos últimos dias</p>
            )}
            {trendData.trend === 'down' && (
              <p>• Redução de atividade de {trendData.percentage.toFixed(1)}% recentemente</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VelocityChart;

