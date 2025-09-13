import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Apple, Activity, Clock, TrendingUp } from 'lucide-react';

const FullTimeSystem = () => {
  const [userId] = useState('user123'); // Em produção, vem da autenticação
  const [foodForm, setFoodForm] = useState({
    food_item: '',
    quantity: '',
    unit: 'g'
  });
  const [activityForm, setActivityForm] = useState({
    activity: '',
    duration: ''
  });
  const [logs, setLogs] = useState({ foods: [], activities: [] });
  const [foods, setFoods] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFoodsAndActivities();
    loadUserLogs();
  }, []);

  const loadFoodsAndActivities = async () => {
    try {
      const [foodsRes, activitiesRes] = await Promise.all([
        fetch('/api/fulltime/foods'),
        fetch('/api/fulltime/activities')
      ]);
      
      const foodsData = await foodsRes.json();
      const activitiesData = await activitiesRes.json();
      
      if (foodsData.success) setFoods(foodsData.foods);
      if (activitiesData.success) setActivities(activitiesData.activities);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const loadUserLogs = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/fulltime/logs/${userId}?date=${today}`);
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    }
  };

  const logFood = async () => {
    if (!foodForm.food_item || !foodForm.quantity) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/fulltime/log/food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          ...foodForm,
          quantity: parseFloat(foodForm.quantity)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFoodForm({ food_item: '', quantity: '', unit: 'g' });
        loadUserLogs();
        
        // Mostrar ajuste sugerido
        if (data.adjustment && data.adjustment.type === 'diet_adjustment') {
          alert(`Alimento registrado! Sugestão: ${data.adjustment.suggestion}`);
        }
      } else {
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      console.error('Erro ao registrar alimento:', error);
      alert('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async () => {
    if (!activityForm.activity || !activityForm.duration) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/fulltime/log/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          ...activityForm,
          duration: parseFloat(activityForm.duration)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setActivityForm({ activity: '', duration: '' });
        loadUserLogs();
        
        // Mostrar ajuste sugerido
        if (data.adjustment && data.adjustment.type === 'energy_adjustment') {
          alert(`Atividade registrada! Sugestão: ${data.adjustment.suggestion}`);
        }
      } else {
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
      alert('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Sistema Full-time
          </CardTitle>
          <CardDescription>
            Registre alimentos e atividades não planejados com reajuste automático do seu plano
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="register" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="register">Registrar</TabsTrigger>
          <TabsTrigger value="logs">Histórico de Hoje</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registrar Alimento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="h-5 w-5 text-green-600" />
                  Registrar Alimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Alimento</Label>
                  <Select 
                    value={foodForm.food_item}
                    onValueChange={(value) => setFoodForm(prev => ({ ...prev, food_item: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um alimento" />
                    </SelectTrigger>
                    <SelectContent>
                      {foods.map(food => (
                        <SelectItem key={food} value={food}>
                          {food.charAt(0).toUpperCase() + food.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      value={foodForm.quantity}
                      onChange={(e) => setFoodForm(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label>Unidade</Label>
                    <Select 
                      value={foodForm.unit}
                      onValueChange={(value) => setFoodForm(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">Gramas (g)</SelectItem>
                        <SelectItem value="ml">Mililitros (ml)</SelectItem>
                        <SelectItem value="unidade">Unidade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={logFood} 
                  disabled={loading || !foodForm.food_item || !foodForm.quantity}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Alimento
                </Button>
              </CardContent>
            </Card>

            {/* Registrar Atividade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  Registrar Atividade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Atividade</Label>
                  <Select 
                    value={activityForm.activity}
                    onValueChange={(value) => setActivityForm(prev => ({ ...prev, activity: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma atividade" />
                    </SelectTrigger>
                    <SelectContent>
                      {activities.map(activity => (
                        <SelectItem key={activity} value={activity}>
                          {activity.charAt(0).toUpperCase() + activity.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Duração (minutos)</Label>
                  <Input
                    type="number"
                    value={activityForm.duration}
                    onChange={(e) => setActivityForm(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="30"
                  />
                </div>

                <Button 
                  onClick={logActivity} 
                  disabled={loading || !activityForm.activity || !activityForm.duration}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Atividade
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Log de Alimentos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="h-5 w-5 text-green-600" />
                  Alimentos Registrados Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logs.foods.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum alimento registrado hoje
                  </p>
                ) : (
                  <div className="space-y-3">
                    {logs.foods.map((food, index) => (
                      <div key={index} className="p-3 bg-green-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{food.food_item}</h4>
                            <p className="text-sm text-gray-600">
                              {food.quantity} {food.unit} • {food.calories.toFixed(1)} kcal
                            </p>
                            <p className="text-xs text-gray-500">
                              P: {food.macros.protein.toFixed(1)}g | 
                              C: {food.macros.carbs.toFixed(1)}g | 
                              G: {food.macros.fat.toFixed(1)}g
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {formatTime(food.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-3 bg-green-100 rounded-lg">
                      <p className="font-medium text-green-800">
                        Total: {logs.foods.reduce((sum, food) => sum + food.calories, 0).toFixed(1)} kcal extras
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Log de Atividades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  Atividades Registradas Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logs.activities.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhuma atividade registrada hoje
                  </p>
                ) : (
                  <div className="space-y-3">
                    {logs.activities.map((activity, index) => (
                      <div key={index} className="p-3 bg-orange-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{activity.activity}</h4>
                            <p className="text-sm text-gray-600">
                              {activity.duration} min • {activity.calories_burned.toFixed(1)} kcal queimadas
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {formatTime(activity.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <p className="font-medium text-orange-800">
                        Total: {logs.activities.reduce((sum, activity) => sum + activity.calories_burned, 0).toFixed(1)} kcal queimadas extras
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FullTimeSystem;

