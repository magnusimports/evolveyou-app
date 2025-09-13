import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calculator, Activity, Brain, Heart, Utensils, Thermometer } from 'lucide-react';

const EnhancedBMRCalculator = () => {
  const [formData, setFormData] = useState({
    // Dados biométricos obrigatórios
    age: '',
    weight: '',
    height: '',
    gender: '',
    body_fat_percentage: '',
    muscle_mass: '',
    
    // Dados de atividade
    activity_level: 'moderately_active',
    weekly_exercise_hours: '',
    job_activity_level: 'sedentary',
    daily_steps: '',
    
    // Dados comportamentais
    sleep_quality: '7',
    sleep_duration: '8',
    stress_level: '5',
    activity_consistency: '0.7',
    hydration_level: '0.8',
    
    // Dados ambientais
    temperature: '22',
    altitude: '0',
    humidity: '50',
    air_quality_index: '50',
    
    // Dados fisiológicos
    resting_heart_rate: '',
    heart_rate_variability: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    
    // Dados nutricionais
    last_meal_hours: '3',
    caffeine_intake: '0',
    metabolic_flexibility: '0.7'
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateBMR = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Validar campos obrigatórios
      const requiredFields = ['age', 'weight', 'height', 'gender'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        setError(`Campos obrigatórios: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      // Preparar dados para a API
      const apiData = {
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        gender: formData.gender,
        body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : null,
        muscle_mass: formData.muscle_mass ? parseFloat(formData.muscle_mass) : null,
        
        activity: {
          level: formData.activity_level,
          weekly_exercise_hours: formData.weekly_exercise_hours ? parseFloat(formData.weekly_exercise_hours) : 0,
          job_activity_level: formData.job_activity_level,
          daily_steps: formData.daily_steps ? parseInt(formData.daily_steps) : 5000
        },
        
        behavioral: {
          sleep_quality: parseFloat(formData.sleep_quality),
          sleep_duration: parseFloat(formData.sleep_duration),
          stress_level: parseFloat(formData.stress_level),
          activity_consistency: parseFloat(formData.activity_consistency),
          hydration_level: parseFloat(formData.hydration_level)
        },
        
        environmental: {
          temperature: parseFloat(formData.temperature),
          altitude: parseFloat(formData.altitude),
          humidity: parseFloat(formData.humidity),
          air_quality_index: parseFloat(formData.air_quality_index)
        },
        
        physiological: {
          resting_heart_rate: formData.resting_heart_rate ? parseFloat(formData.resting_heart_rate) : null,
          heart_rate_variability: formData.heart_rate_variability ? parseFloat(formData.heart_rate_variability) : null,
          blood_pressure_systolic: formData.blood_pressure_systolic ? parseFloat(formData.blood_pressure_systolic) : null,
          blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseFloat(formData.blood_pressure_diastolic) : null
        },
        
        nutritional: {
          last_meal_hours: parseFloat(formData.last_meal_hours),
          caffeine_intake: parseFloat(formData.caffeine_intake),
          metabolic_flexibility: parseFloat(formData.metabolic_flexibility)
        }
      };

      const response = await fetch('http://localhost:5000/api/enhanced-bmr/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.error || 'Erro no cálculo');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const ResultCard = ({ title, value, unit, description, icon: Icon }) => (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">
          {value} <span className="text-sm text-gray-400">{unit}</span>
        </div>
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Calculator className="h-8 w-8 text-green-500" />
            Algoritmo de Gasto Calórico Aprimorado
          </h1>
          <p className="text-gray-400">
            O diferencial competitivo do EvolveYou - Precisão superior com múltiplos fatores
          </p>
          <Badge variant="outline" className="mt-2 border-green-500 text-green-500">
            Tecnologia Exclusiva EvolveYou
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <div className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="lifestyle">Estilo de Vida</TabsTrigger>
                <TabsTrigger value="advanced">Avançado</TabsTrigger>
                <TabsTrigger value="environment">Ambiente</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Dados Biométricos
                    </CardTitle>
                    <CardDescription>Informações básicas obrigatórias</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="age">Idade *</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => handleInputChange('age', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                          placeholder="28"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gênero *</Label>
                        <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-600">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Masculino</SelectItem>
                            <SelectItem value="female">Feminino</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weight">Peso (kg) *</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={formData.weight}
                          onChange={(e) => handleInputChange('weight', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                          placeholder="75.0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">Altura (cm) *</Label>
                        <Input
                          id="height"
                          type="number"
                          value={formData.height}
                          onChange={(e) => handleInputChange('height', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                          placeholder="180"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="body_fat">% Gordura Corporal</Label>
                        <Input
                          id="body_fat"
                          type="number"
                          step="0.1"
                          value={formData.body_fat_percentage}
                          onChange={(e) => handleInputChange('body_fat_percentage', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                          placeholder="15.0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="muscle_mass">Massa Muscular (kg)</Label>
                        <Input
                          id="muscle_mass"
                          type="number"
                          step="0.1"
                          value={formData.muscle_mass}
                          onChange={(e) => handleInputChange('muscle_mass', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                          placeholder="35.0"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="activity_level">Nível de Atividade</Label>
                      <Select value={formData.activity_level} onValueChange={(value) => handleInputChange('activity_level', value)}>
                        <SelectTrigger className="bg-gray-800 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentário</SelectItem>
                          <SelectItem value="lightly_active">Levemente Ativo</SelectItem>
                          <SelectItem value="moderately_active">Moderadamente Ativo</SelectItem>
                          <SelectItem value="very_active">Muito Ativo</SelectItem>
                          <SelectItem value="extremely_active">Extremamente Ativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lifestyle" className="space-y-4">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Estilo de Vida
                    </CardTitle>
                    <CardDescription>Fatores comportamentais que afetam o metabolismo</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sleep_quality">Qualidade do Sono (1-10)</Label>
                        <Input
                          id="sleep_quality"
                          type="number"
                          min="1"
                          max="10"
                          value={formData.sleep_quality}
                          onChange={(e) => handleInputChange('sleep_quality', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sleep_duration">Horas de Sono</Label>
                        <Input
                          id="sleep_duration"
                          type="number"
                          step="0.5"
                          value={formData.sleep_duration}
                          onChange={(e) => handleInputChange('sleep_duration', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="stress_level">Nível de Estresse (1-10)</Label>
                        <Input
                          id="stress_level"
                          type="number"
                          min="1"
                          max="10"
                          value={formData.stress_level}
                          onChange={(e) => handleInputChange('stress_level', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hydration_level">Hidratação (0-1)</Label>
                        <Input
                          id="hydration_level"
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={formData.hydration_level}
                          onChange={(e) => handleInputChange('hydration_level', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weekly_exercise">Exercícios/Semana (horas)</Label>
                        <Input
                          id="weekly_exercise"
                          type="number"
                          step="0.5"
                          value={formData.weekly_exercise_hours}
                          onChange={(e) => handleInputChange('weekly_exercise_hours', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                          placeholder="5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="daily_steps">Passos Diários</Label>
                        <Input
                          id="daily_steps"
                          type="number"
                          value={formData.daily_steps}
                          onChange={(e) => handleInputChange('daily_steps', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                          placeholder="8500"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Dados Fisiológicos
                    </CardTitle>
                    <CardDescription>Dados avançados para maior precisão</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rhr">Frequência Cardíaca de Repouso</Label>
                        <Input
                          id="rhr"
                          type="number"
                          value={formData.resting_heart_rate}
                          onChange={(e) => handleInputChange('resting_heart_rate', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                          placeholder="60"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hrv">Variabilidade Cardíaca</Label>
                        <Input
                          id="hrv"
                          type="number"
                          value={formData.heart_rate_variability}
                          onChange={(e) => handleInputChange('heart_rate_variability', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                          placeholder="45"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bp_sys">Pressão Sistólica</Label>
                        <Input
                          id="bp_sys"
                          type="number"
                          value={formData.blood_pressure_systolic}
                          onChange={(e) => handleInputChange('blood_pressure_systolic', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                          placeholder="120"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bp_dia">Pressão Diastólica</Label>
                        <Input
                          id="bp_dia"
                          type="number"
                          value={formData.blood_pressure_diastolic}
                          onChange={(e) => handleInputChange('blood_pressure_diastolic', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                          placeholder="80"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Utensils className="h-5 w-5" />
                      Estado Nutricional
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="last_meal">Última Refeição (horas)</Label>
                        <Input
                          id="last_meal"
                          type="number"
                          step="0.5"
                          value={formData.last_meal_hours}
                          onChange={(e) => handleInputChange('last_meal_hours', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                        />
                      </div>
                      <div>
                        <Label htmlFor="caffeine">Cafeína (mg)</Label>
                        <Input
                          id="caffeine"
                          type="number"
                          value={formData.caffeine_intake}
                          onChange={(e) => handleInputChange('caffeine_intake', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="environment" className="space-y-4">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Thermometer className="h-5 w-5" />
                      Fatores Ambientais
                    </CardTitle>
                    <CardDescription>Condições ambientais que afetam o metabolismo</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="temperature">Temperatura (°C)</Label>
                        <Input
                          id="temperature"
                          type="number"
                          value={formData.temperature}
                          onChange={(e) => handleInputChange('temperature', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                        />
                      </div>
                      <div>
                        <Label htmlFor="altitude">Altitude (m)</Label>
                        <Input
                          id="altitude"
                          type="number"
                          value={formData.altitude}
                          onChange={(e) => handleInputChange('altitude', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="humidity">Umidade (%)</Label>
                        <Input
                          id="humidity"
                          type="number"
                          value={formData.humidity}
                          onChange={(e) => handleInputChange('humidity', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                        />
                      </div>
                      <div>
                        <Label htmlFor="air_quality">Qualidade do Ar (0-500)</Label>
                        <Input
                          id="air_quality"
                          type="number"
                          value={formData.air_quality_index}
                          onChange={(e) => handleInputChange('air_quality_index', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Button 
              onClick={calculateBMR} 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? 'Calculando...' : 'Calcular BMR Aprimorado'}
            </Button>

            {error && (
              <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded">
                {error}
              </div>
            )}
          </div>

          {/* Resultados */}
          <div className="space-y-6">
            {results && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <ResultCard
                    title="BMR Aprimorado"
                    value={results.bmr.enhanced_bmr}
                    unit="kcal/dia"
                    description="Taxa metabólica basal com múltiplos fatores"
                    icon={Calculator}
                  />
                  <ResultCard
                    title="TDEE Total"
                    value={results.tdee.enhanced_tdee}
                    unit="kcal/dia"
                    description="Gasto energético total diário"
                    icon={Activity}
                  />
                </div>

                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Comparação de Algoritmos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Harris-Benedict</span>
                      <span className="text-white">{results.bmr.harris_benedict} kcal</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Mifflin-St Jeor</span>
                      <span className="text-white">{results.bmr.mifflin_st_jeor} kcal</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Katch-McArdle</span>
                      <span className="text-white">{results.bmr.katch_mcardle} kcal</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-700 pt-2">
                      <span className="text-green-400 font-semibold">EvolveYou Enhanced</span>
                      <span className="text-green-400 font-semibold">{results.bmr.enhanced_bmr} kcal</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Objetivos Calóricos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Manutenção</span>
                      <span className="text-white">{results.recommendations.caloric_goals.maintenance} kcal</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Perda de Peso</span>
                      <span className="text-orange-400">{results.recommendations.caloric_goals.weight_loss_moderate} kcal</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Ganho de Peso</span>
                      <span className="text-blue-400">{results.recommendations.caloric_goals.weight_gain_lean} kcal</span>
                    </div>
                  </CardContent>
                </Card>

                {results.recommendations.optimization_tips.length > 0 && (
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Dicas de Otimização</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {results.recommendations.optimization_tips.map((tip, index) => (
                          <li key={index} className="text-gray-300 text-sm">
                            • {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {results.recommendations.health_insights.length > 0 && (
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Insights de Saúde</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {results.recommendations.health_insights.map((insight, index) => (
                          <li key={index} className="text-green-400 text-sm">
                            ✓ {insight}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBMRCalculator;

