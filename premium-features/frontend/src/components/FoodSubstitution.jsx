import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { RefreshCw, ArrowRight, Check, TrendingUp, TrendingDown } from 'lucide-react';

const FoodSubstitution = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFood, setSelectedFood] = useState('');
  const [quantity, setQuantity] = useState('');
  const [substitutes, setSubstitutes] = useState([]);
  const [originalFood, setOriginalFood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadFoodsAndCategories();
  }, []);

  const loadFoodsAndCategories = async () => {
    try {
      const [foodsRes, categoriesRes] = await Promise.all([
        fetch('/api/nutrition/foods'),
        fetch('/api/nutrition/categories')
      ]);
      
      const foodsData = await foodsRes.json();
      const categoriesData = await categoriesRes.json();
      
      if (foodsData.success) setFoods(foodsData.foods);
      if (categoriesData.success) setCategories(categoriesData.categories);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const findSubstitutes = async () => {
    if (!selectedFood || !quantity) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/nutrition/substitute?food_id=${selectedFood}&quantity=${quantity}`);
      const data = await response.json();
      
      if (data.success) {
        setOriginalFood(data.original);
        setSubstitutes(data.substitutes);
      } else {
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      console.error('Erro ao buscar substitutos:', error);
      alert('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = selectedCategory 
    ? foods.filter(food => food.category === selectedCategory)
    : foods;

  const getCategoryColor = (category) => {
    const colors = {
      protein: 'bg-red-100 text-red-800',
      carbohydrate: 'bg-yellow-100 text-yellow-800',
      fat: 'bg-purple-100 text-purple-800',
      fruit: 'bg-green-100 text-green-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getDifferenceIcon = (value) => {
    if (value > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return null;
  };

  const getDifferenceColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-6 w-6 text-blue-600" />
            Substituição Inteligente de Alimentos
          </CardTitle>
          <CardDescription>
            Encontre substitutos equivalentes para alimentos da sua dieta com cálculo automático de quantidades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtros e Seleção */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Categoria (Filtro)</Label>
              <Select 
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Alimento Original</Label>
              <Select 
                value={selectedFood}
                onValueChange={setSelectedFood}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um alimento" />
                </SelectTrigger>
                <SelectContent>
                  {filteredFoods.map(food => (
                    <SelectItem key={food.id} value={food.id.toString()}>
                      {food.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={findSubstitutes}
                disabled={loading || !selectedFood || !quantity}
                className="w-full"
              >
                {loading ? 'Buscando...' : 'Buscar Substitutos'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {originalFood && (
        <div className="space-y-6">
          {/* Alimento Original */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alimento Original</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{originalFood.name}</h3>
                  <p className="text-gray-600">
                    {originalFood.quantity} {originalFood.unit} • {originalFood.calories} kcal
                  </p>
                </div>
                <div className="text-right">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-medium text-red-600">{originalFood.macros.protein}g</p>
                      <p className="text-xs text-gray-500">Proteína</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-yellow-600">{originalFood.macros.carbs}g</p>
                      <p className="text-xs text-gray-500">Carboidrato</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-purple-600">{originalFood.macros.fat}g</p>
                      <p className="text-xs text-gray-500">Gordura</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Substitutos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Substitutos Equivalentes</CardTitle>
              <CardDescription>
                Ordenados por similaridade nutricional (mais similares primeiro)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {substitutes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhum substituto encontrado para este alimento.
                </p>
              ) : (
                <div className="space-y-4">
                  {substitutes.map((substitute, index) => (
                    <div key={substitute.food_id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold">{substitute.name}</span>
                            <Badge variant="outline" className="text-xs">
                              #{index + 1} mais similar
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Check className="h-4 w-4 mr-1" />
                          Usar Substituto
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-600 mb-2">
                            <strong>{substitute.equivalent_quantity} {substitute.unit}</strong> • {substitute.calories} kcal
                          </p>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <ArrowRight className="h-4 w-4" />
                            <span>Quantidade equivalente para mesmas calorias</span>
                          </div>
                        </div>

                        <div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="text-center p-2 bg-red-50 rounded">
                              <div className="flex items-center justify-center gap-1">
                                <p className="font-medium">{substitute.macros.protein}g</p>
                                {getDifferenceIcon(substitute.difference.protein)}
                              </div>
                              <p className="text-xs text-gray-500">Proteína</p>
                              <p className={`text-xs ${getDifferenceColor(substitute.difference.protein)}`}>
                                {substitute.difference.protein > 0 ? '+' : ''}{substitute.difference.protein}g
                              </p>
                            </div>
                            
                            <div className="text-center p-2 bg-yellow-50 rounded">
                              <div className="flex items-center justify-center gap-1">
                                <p className="font-medium">{substitute.macros.carbs}g</p>
                                {getDifferenceIcon(substitute.difference.carbs)}
                              </div>
                              <p className="text-xs text-gray-500">Carboidrato</p>
                              <p className={`text-xs ${getDifferenceColor(substitute.difference.carbs)}`}>
                                {substitute.difference.carbs > 0 ? '+' : ''}{substitute.difference.carbs}g
                              </p>
                            </div>
                            
                            <div className="text-center p-2 bg-purple-50 rounded">
                              <div className="flex items-center justify-center gap-1">
                                <p className="font-medium">{substitute.macros.fat}g</p>
                                {getDifferenceIcon(substitute.difference.fat)}
                              </div>
                              <p className="text-xs text-gray-500">Gordura</p>
                              <p className={`text-xs ${getDifferenceColor(substitute.difference.fat)}`}>
                                {substitute.difference.fat > 0 ? '+' : ''}{substitute.difference.fat}g
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Score de Similaridade: {substitute.similarity_score}</span>
                          <span>Menor score = mais similar</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FoodSubstitution;

