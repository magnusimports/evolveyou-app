import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import EnhancedBMRCalculator from './components/EnhancedBMRCalculator'
import FullTimeSystem from './components/FullTimeSystem'
import FoodSubstitution from './components/FoodSubstitution'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Calculator, TrendingUp, RefreshCw, Zap } from 'lucide-react'

function HomePage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          EvolveYou Premium
        </h1>
        <p className="text-xl text-gray-600">
          Funcionalidades diferenciadoras para sua melhor versão
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-6 w-6 text-green-600" />
              GMB Aprimorado
            </CardTitle>
            <CardDescription>
              Algoritmo avançado que considera fatores únicos para cálculo mais preciso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/bmr">
              <Button className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Calcular GMB
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Sistema Full-time
            </CardTitle>
            <CardDescription>
              Registre alimentos e atividades não planejados com reajuste automático
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/fulltime">
              <Button className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                Acessar Sistema
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-6 w-6 text-purple-600" />
              Substituição Inteligente
            </CardTitle>
            <CardDescription>
              Substitua alimentos na dieta com cálculo automático de equivalência
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/substitution">
              <Button className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Buscar Substitutos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle>Sobre o EvolveYou Premium</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            O EvolveYou Premium implementa funcionalidades diferenciadoras que tornam o aplicativo único no mercado:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span><strong>Algoritmo de GMB Aprimorado:</strong> Considera composição corporal, uso de recursos ergogênicos e experiência de treino</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Sistema Full-time:</strong> Reajuste automático do plano baseado em atividades não planejadas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span><strong>Substituição Inteligente:</strong> Encontra equivalentes nutricionais com cálculo automático de quantidades</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold text-green-600">
                EvolveYou Premium
              </Link>
              <div className="flex items-center gap-4">
                <Link to="/bmr" className="text-gray-600 hover:text-green-600 transition-colors">
                  GMB Aprimorado
                </Link>
                <Link to="/fulltime" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Sistema Full-time
                </Link>
                <Link to="/substitution" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Substituição
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/bmr" element={<EnhancedBMRCalculator />} />
            <Route path="/fulltime" element={<FullTimeSystem />} />
            <Route path="/substitution" element={<FoodSubstitution />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

