import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Activity, TrendingUp, Clock } from 'lucide-react';

const ActivityHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(90);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    generateHeatmapData();
  }, [selectedPeriod]);

  const generateHeatmapData = async () => {
    try {
      setLoading(true);
      
      // Gerar dados de heatmap para os últimos X dias
      const data = [];
      const today = new Date();
      
      for (let i = selectedPeriod - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Simular atividade baseada em padrões realistas
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = Math.random() < 0.05; // 5% chance de ser feriado
        
        let baseActivity = 0;
        
        if (!isWeekend && !isHoliday) {
          // Dias úteis: atividade baseada em padrões reais de desenvolvimento
          if (dayOfWeek === 1) baseActivity = Math.random() * 3 + 2; // Segunda: início da semana
          else if (dayOfWeek === 5) baseActivity = Math.random() * 4 + 3; // Sexta: rush final
          else baseActivity = Math.random() * 6 + 2; // Meio da semana: mais ativo
        } else if (!isHoliday) {
          // Fins de semana: atividade reduzida
          baseActivity = Math.random() * 2;
        }
        
        // Adicionar variações sazonais e sprints
        const weekOfYear = Math.floor(i / 7);
        const isSprintWeek = weekOfYear % 2 === 0; // Sprints de 2 semanas
        if (isSprintWeek) baseActivity *= 1.3;
        
        // Simular alguns dias de alta atividade (releases, deadlines)
        if (Math.random() < 0.1) baseActivity *= 2;
        
        const commits = Math.round(baseActivity);
        
        data.push({
          date: date.toISOString().split('T')[0],
          commits,
          level: getActivityLevel(commits),
          dayOfWeek,
          weekOfYear: Math.floor((selectedPeriod - 1 - i) / 7),
          isWeekend,
          formattedDate: date.toLocaleDateString('pt-BR', { 
            day: 'numeric', 
            month: 'short' 
          })
        });
      }
      
      setHeatmapData(data);
      calculateStats(data);
      
    } catch (err) {
      setError('Erro ao gerar heatmap de atividade');
      console.error('Erro no heatmap:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityLevel = (commits) => {
    if (commits === 0) return 0;
    if (commits <= 2) return 1;
    if (commits <= 4) return 2;
    if (commits <= 6) return 3;
    return 4;
  };

  const getActivityColor = (level) => {
    const colors = [
      '#f3f4f6', // Nível 0: cinza claro
      '#dcfce7', // Nível 1: verde muito claro
      '#bbf7d0', // Nível 2: verde claro
      '#86efac', // Nível 3: verde médio
      '#22c55e'  // Nível 4: verde escuro
    ];
    return colors[level] || colors[0];
  };

  const calculateStats = (data) => {
    const totalCommits = data.reduce((sum, day) => sum + day.commits, 0);
    const activeDays = data.filter(day => day.commits > 0).length;
    const averageCommits = totalCommits / data.length;
    const maxCommits = Math.max(...data.map(day => day.commits));
    const maxDay = data.find(day => day.commits === maxCommits);
    
    // Calcular streak atual
    let currentStreak = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].commits > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calcular melhor streak
    let bestStreak = 0;
    let tempStreak = 0;
    data.forEach(day => {
      if (day.commits > 0) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });
    
    // Atividade por dia da semana
    const weekdayActivity = Array(7).fill(0);
    const weekdayCounts = Array(7).fill(0);
    data.forEach(day => {
      weekdayActivity[day.dayOfWeek] += day.commits;
      weekdayCounts[day.dayOfWeek]++;
    });
    
    const weekdayAverages = weekdayActivity.map((total, index) => 
      weekdayCounts[index] > 0 ? total / weekdayCounts[index] : 0
    );
    
    const mostActiveWeekday = weekdayAverages.indexOf(Math.max(...weekdayAverages));
    const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    setStats({
      totalCommits,
      activeDays,
      averageCommits: Math.round(averageCommits * 10) / 10,
      maxCommits,
      maxDay: maxDay?.formattedDate,
      currentStreak,
      bestStreak,
      mostActiveWeekday: weekdayNames[mostActiveWeekday],
      activityRate: Math.round((activeDays / data.length) * 100)
    });
  };

  const renderHeatmapGrid = () => {
    if (!heatmapData.length) return null;
    
    // Organizar dados por semanas
    const weeks = [];
    let currentWeek = [];
    
    heatmapData.forEach((day, index) => {
      currentWeek.push(day);
      
      if (currentWeek.length === 7 || index === heatmapData.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    return (
      <div className="space-y-1">
        {/* Cabeçalho dos dias da semana */}
        <div className="flex gap-1 text-xs text-muted-foreground mb-2">
          <div className="w-3"></div>
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
            <div key={index} className="w-3 text-center">{day}</div>
          ))}
        </div>
        
        {/* Grid do heatmap */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1 items-center">
              {/* Indicador de semana */}
              <div className="w-3 text-xs text-muted-foreground text-right">
                {weekIndex % 4 === 0 && week[0]?.formattedDate.split(' ')[1]}
              </div>
              
              {/* Dias da semana */}
              {Array(7).fill(null).map((_, dayIndex) => {
                const day = week[dayIndex];
                return (
                  <div
                    key={dayIndex}
                    className="w-3 h-3 rounded-sm border border-gray-200 cursor-pointer hover:border-gray-400 transition-colors"
                    style={{
                      backgroundColor: day ? getActivityColor(day.level) : '#f3f4f6'
                    }}
                    title={day ? `${day.formattedDate}: ${day.commits} commits` : 'Sem dados'}
                  />
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Legenda */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
          <span>Menos</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm border border-gray-200"
              style={{ backgroundColor: getActivityColor(level) }}
            />
          ))}
          <span>Mais</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Heatmap de Atividade
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
            <Calendar className="h-5 w-5" />
            Heatmap de Atividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
            <Button onClick={generateHeatmapData} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Heatmap de Atividade
            </CardTitle>
            <CardDescription>
              Padrão de commits nos últimos {selectedPeriod} dias
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedPeriod === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(30)}
            >
              30d
            </Button>
            <Button
              variant={selectedPeriod === 90 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(90)}
            >
              90d
            </Button>
            <Button
              variant={selectedPeriod === 365 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(365)}
            >
              1 ano
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Estatísticas principais */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalCommits}</div>
              <div className="text-sm text-muted-foreground">Total Commits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.currentStreak}</div>
              <div className="text-sm text-muted-foreground">Streak Atual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.bestStreak}</div>
              <div className="text-sm text-muted-foreground">Melhor Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.activityRate}%</div>
              <div className="text-sm text-muted-foreground">Taxa Atividade</div>
            </div>
          </div>
        )}

        {/* Heatmap Grid */}
        <div className="mb-6">
          {renderHeatmapGrid()}
        </div>

        {/* Insights */}
        {stats && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4" />
              <span className="font-medium">Insights de Atividade</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>
                    Média de {stats.averageCommits} commits por dia
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>
                    {stats.activeDays} dias ativos de {selectedPeriod} ({stats.activityRate}%)
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span>
                    Dia mais produtivo: {stats.mostActiveWeekday}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Pico: {stats.maxCommits} commits em {stats.maxDay}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;

