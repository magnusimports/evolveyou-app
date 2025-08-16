import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { TrendingDown, Target, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

const BurndownChart = () => {
  const [burndownData, setBurndownData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectInfo, setProjectInfo] = useState(null);

  useEffect(() => {
    generateBurndownData();
  }, []);

  const generateBurndownData = async () => {
    try {
      setLoading(true);
      
      // Simular dados de burndown baseados no progresso real
      const totalTasks = 100; // Total de tarefas estimadas
      const sprintDuration = 60; // 60 dias de projeto
      const currentDay = 15; // Dia atual do projeto
      
      // Gerar linha ideal (linear)
      const idealBurndown = [];
      for (let day = 0; day <= sprintDuration; day++) {
        const remainingIdeal = totalTasks - (totalTasks * day / sprintDuration);
        idealBurndown.push({
          day,
          ideal: Math.max(0, remainingIdeal),
          date: new Date(Date.now() - (sprintDuration - day) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
        });
      }

      // Gerar linha real baseada no progresso atual (60%)
      const realProgress = 60; // 60% completo
      const completedTasks = (realProgress / 100) * totalTasks;
      const remainingTasks = totalTasks - completedTasks;
      
      const realBurndown = idealBurndown.map((point, index) => {
        let realRemaining;
        
        if (index <= currentDay) {
          // Simular progresso real com algumas variações
          const progressFactor = index / currentDay;
          const variance = Math.sin(index * 0.3) * 5; // Adicionar variação natural
          realRemaining = totalTasks - (completedTasks * progressFactor) + variance;
          realRemaining = Math.max(0, Math.min(totalTasks, realRemaining));
        } else {
          // Projeção futura baseada na velocidade atual
          const currentVelocity = completedTasks / currentDay;
          const projectedCompletion = completedTasks + (currentVelocity * (index - currentDay));
          realRemaining = Math.max(0, totalTasks - projectedCompletion);
        }
        
        return {
          ...point,
          real: index <= currentDay ? realRemaining : null,
          projected: index > currentDay ? realRemaining : null
        };
      });

      setBurndownData(realBurndown);
      
      // Calcular informações do projeto
      const currentRemaining = realBurndown[currentDay]?.real || remainingTasks;
      const idealRemaining = realBurndown[currentDay]?.ideal || 0;
      const variance = currentRemaining - idealRemaining;
      const velocityNeeded = currentRemaining / (sprintDuration - currentDay);
      const currentVelocity = completedTasks / currentDay;
      
      setProjectInfo({
        totalTasks,
        completedTasks: Math.round(completedTasks),
        remainingTasks: Math.round(currentRemaining),
        currentDay,
        sprintDuration,
        variance: Math.round(variance),
        velocityNeeded: Math.round(velocityNeeded * 10) / 10,
        currentVelocity: Math.round(currentVelocity * 10) / 10,
        onTrack: Math.abs(variance) <= 10,
        projectedCompletion: currentVelocity > 0 ? Math.round(currentDay + (currentRemaining / currentVelocity)) : null
      });
      
    } catch (err) {
      setError('Erro ao gerar dados de burndown');
      console.error('Erro no burndown:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Burndown Chart
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
            <TrendingDown className="h-5 w-5" />
            Burndown Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
            <Button onClick={generateBurndownData} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (!projectInfo) return 'gray';
    if (projectInfo.onTrack) return 'green';
    if (projectInfo.variance > 0) return 'red';
    return 'blue';
  };

  const getStatusText = () => {
    if (!projectInfo) return 'Calculando...';
    if (projectInfo.onTrack) return 'No prazo';
    if (projectInfo.variance > 0) return 'Atrasado';
    return 'Adiantado';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Burndown Chart
            </CardTitle>
            <CardDescription>
              Progresso vs. planejamento ideal do projeto
            </CardDescription>
          </div>
          <Badge variant={getStatusColor() === 'green' ? 'default' : getStatusColor() === 'red' ? 'destructive' : 'secondary'}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Métricas principais */}
        {projectInfo && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{projectInfo.completedTasks}</div>
              <div className="text-sm text-muted-foreground">Concluídas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{projectInfo.remainingTasks}</div>
              <div className="text-sm text-muted-foreground">Restantes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{projectInfo.currentVelocity}</div>
              <div className="text-sm text-muted-foreground">Velocidade Atual</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${projectInfo.variance > 0 ? 'text-red-600' : projectInfo.variance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {projectInfo.variance > 0 ? '+' : ''}{projectInfo.variance}
              </div>
              <div className="text-sm text-muted-foreground">Variação</div>
            </div>
          </div>
        )}

        {/* Gráfico */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={burndownData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                fontSize={12}
                label={{ value: 'Tarefas Restantes', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={(label) => `Data: ${label}`}
                formatter={(value, name) => {
                  if (name === 'ideal') return [`${Math.round(value)} tarefas`, 'Linha Ideal'];
                  if (name === 'real') return [`${Math.round(value)} tarefas`, 'Progresso Real'];
                  if (name === 'projected') return [`${Math.round(value)} tarefas`, 'Projeção'];
                  return [value, name];
                }}
              />
              
              {/* Linha ideal */}
              <Line 
                type="monotone" 
                dataKey="ideal" 
                stroke="#94a3b8" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="ideal"
              />
              
              {/* Progresso real */}
              <Line 
                type="monotone" 
                dataKey="real" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                name="real"
              />
              
              {/* Projeção futura */}
              <Line 
                type="monotone" 
                dataKey="projected" 
                stroke="#f59e0b" 
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={false}
                name="projected"
              />
              
              {/* Linha de hoje */}
              {projectInfo && (
                <ReferenceLine 
                  x={burndownData[projectInfo.currentDay]?.date} 
                  stroke="#ef4444" 
                  strokeDasharray="2 2"
                  label={{ value: "Hoje", position: "top" }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Análise e insights */}
        {projectInfo && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4" />
              <span className="font-medium">Análise do Projeto</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {projectInfo.onTrack ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  <span>
                    {projectInfo.onTrack 
                      ? 'Projeto está no prazo planejado'
                      : projectInfo.variance > 0 
                        ? `Projeto está ${projectInfo.variance} tarefas atrasado`
                        : `Projeto está ${Math.abs(projectInfo.variance)} tarefas adiantado`
                    }
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>
                    Dia {projectInfo.currentDay} de {projectInfo.sprintDuration} 
                    ({Math.round((projectInfo.currentDay / projectInfo.sprintDuration) * 100)}% do tempo)
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-purple-500" />
                  <span>
                    Velocidade necessária: {projectInfo.velocityNeeded} tarefas/dia
                  </span>
                </div>
                
                {projectInfo.projectedCompletion && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-500" />
                    <span>
                      Conclusão projetada: Dia {projectInfo.projectedCompletion}
                      {projectInfo.projectedCompletion > projectInfo.sprintDuration && 
                        ` (${projectInfo.projectedCompletion - projectInfo.sprintDuration} dias de atraso)`
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BurndownChart;

