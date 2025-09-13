import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calculator, Activity, Zap } from 'lucide-react';

const EnhancedBMRCalculator = () => {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: '',
    body_description: '',
    uses_ergogenic_resources: false,
    training_experience: '',
    work_activity_level: '',
    leisure_activity_level: ''
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateBMR = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bmr/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Erro ao calcular GMB:', error);
      setResult({
        success: false,
        error: 'Erro ao conectar com o servidor'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-green-600" />
            Calculadora de GMB Aprimorada
          </CardTitle>
          <CardDescription>
            Algoritmo avançado que considera fatores únicos para um cálculo mais preciso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="70"
              />
            </div>
            <div>
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="175"
              />
            </div>
            <div>
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="30"
              />
            </div>
          </div>

          {/* Gênero */}
          <div>
            <Label>Gênero</Label>
            <Select onValueChange={(value) => handleInputChange('gender', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Composição Corporal */}
          <div>
            <Label>Como você descreveria seu corpo hoje?</Label>
            <Select onValueChange={(value) => handleInputChange('body_description', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione sua composição corporal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="very_thin">Muito magro(a)</SelectItem>
                <SelectItem value="lean">Magro(a), com pouca gordura</SelectItem>
                <SelectItem value="athletic">Atlético(a), com músculos definidos</SelectItem>
                <SelectItem value="normal">Normal ou mediano</SelectItem>
                <SelectItem value="overweight">Acima do peso, com acúmulo de gordura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recursos Ergogênicos */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="ergogenic"
              checked={formData.uses_ergogenic_resources}
              onChange={(e) => handleInputChange('uses_ergogenic_resources', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="ergogenic">
              Faz uso de recursos ergogênicos farmacológicos?
            </Label>
          </div>

          {/* Experiência de Treino */}
          <div>
            <Label>Experiência de Treino</Label>
            <Select onValueChange={(value) => handleInputChange('training_experience', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione sua experiência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Iniciante</SelectItem>
                <SelectItem value="intermediate">Intermediário</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Atividade no Trabalho */}
          <div>
            <Label>Nível de Atividade no Trabalho</Label>
            <Select onValueChange={(value) => handleInputChange('work_activity_level', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível de atividade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentário</SelectItem>
                <SelectItem value="lightly_active">Levemente ativo</SelectItem>
                <SelectItem value="moderately_active">Moderadamente ativo</SelectItem>
                <SelectItem value="very_active">Muito ativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Atividade no Tempo Livre */}
          <div>
            <Label>Nível de Atividade no Tempo Livre</Label>
            <Select onValueChange={(value) => handleInputChange('leisure_activity_level', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível de atividade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="very_calm">Muito calmo</SelectItem>
                <SelectItem value="lightly_active">Levemente ativo</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={calculateBMR} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Calculando...' : 'Calcular GMB Aprimorado'}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-600" />
              Resultados do Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800">GMB Base (Mifflin-St Jeor)</h3>
                    <p className="text-2xl font-bold text-blue-600">{result.bmr_base} kcal</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800">GMB Ajustado (EvolveYou)</h3>
                    <p className="text-2xl font-bold text-green-600">{result.bmr_adjusted} kcal</p>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-800">Gasto Calórico Diário Total</h3>
                  <p className="text-3xl font-bold text-purple-600">{result.daily_caloric_expenditure} kcal</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Fatores de Ajuste Aplicados:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="font-medium">Composição Corporal:</span> {(result.adjustment_factors.body_composition * 100 - 100).toFixed(0)}%
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="font-medium">Recursos Ergogênicos:</span> {(result.adjustment_factors.pharma_usage * 100 - 100).toFixed(0)}%
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="font-medium">Experiência de Treino:</span> {(result.adjustment_factors.training_experience * 100 - 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold text-yellow-800">Diferencial EvolveYou</h3>
                  <p className="text-yellow-700">
                    Diferença de <strong>{result.bmr_adjusted - result.bmr_base} kcal</strong> em relação ao cálculo padrão, 
                    considerando seus fatores únicos.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-red-600">Erro: {result.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedBMRCalculator;

