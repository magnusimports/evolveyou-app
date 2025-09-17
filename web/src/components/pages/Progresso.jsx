import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Utensils, 
  Dumbbell, 
  Calendar, 
  TrendingUp,
  Scale,
  Target,
  Activity,
  Award
} from 'lucide-react';

const Progresso = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white pb-20">
      {/* Header */}
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-center">Progresso</h1>
          <p className="text-gray-400 text-center text-sm mt-1">Acompanhe sua evolução</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Resumo Geral */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4">Resumo Geral</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Scale className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-400">Peso Atual</p>
              <p className="font-bold text-xl text-white">95kg</p>
              <p className="text-xs text-green-400">-2kg este mês</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-400">Meta</p>
              <p className="font-bold text-xl text-white">90kg</p>
              <p className="text-xs text-blue-400">5kg restantes</p>
            </div>
          </div>
        </section>

        {/* Gráfico de Peso */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4">Evolução do Peso</h2>
          <div className="h-40 bg-gray-700 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Gráfico de evolução do peso</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400">Inicial</p>
              <p className="font-bold text-white">97kg</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Atual</p>
              <p className="font-bold text-white">95kg</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Meta</p>
              <p className="font-bold text-white">90kg</p>
            </div>
          </div>
        </section>

        {/* Estatísticas */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4">Estatísticas</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Treinos Completos</p>
                  <p className="text-xs text-gray-400">Este mês</p>
                </div>
              </div>
              <p className="text-white font-bold text-xl">18</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Aderência à Dieta</p>
                  <p className="text-xs text-gray-400">Média mensal</p>
                </div>
              </div>
              <p className="text-white font-bold text-xl">87%</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Calorias Queimadas</p>
                  <p className="text-xs text-gray-400">Média diária</p>
                </div>
              </div>
              <p className="text-white font-bold text-xl">2.1k</p>
            </div>
          </div>
        </section>

        {/* Conquistas */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4">Conquistas</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: '🏆', title: 'Primeira Semana', desc: 'Completou 7 dias' },
              { icon: '💪', title: 'Força', desc: '10 treinos completos' },
              { icon: '🎯', title: 'Consistência', desc: '30 dias seguidos' }
            ].map((conquista, index) => (
              <div key={index} className="text-center p-3 bg-gray-700 rounded-lg">
                <div className="text-2xl mb-2">{conquista.icon}</div>
                <p className="text-xs font-medium text-white">{conquista.title}</p>
                <p className="text-xs text-gray-400">{conquista.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Próximas Metas */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4">Próximas Metas</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div>
                <p className="text-white font-medium">Perder mais 2kg</p>
                <p className="text-xs text-gray-400">Meta para próximo mês</p>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold">60%</p>
                <p className="text-xs text-gray-400">progresso</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div>
                <p className="text-white font-medium">20 treinos no mês</p>
                <p className="text-xs text-gray-400">Meta de consistência</p>
              </div>
              <div className="text-right">
                <p className="text-blue-400 font-bold">90%</p>
                <p className="text-xs text-gray-400">progresso</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Barra de Navegação Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gray-800 border-t border-gray-700">
        <div className="flex justify-around">
          <Link to="/dashboard" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
            <Home className="w-6 h-6" />
            <span className="text-xs">Hoje</span>
          </Link>
          <Link to="/dieta" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
            <Utensils className="w-6 h-6" />
            <span className="text-xs">Dieta</span>
          </Link>
          <Link to="/treino" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
            <Dumbbell className="w-6 h-6" />
            <span className="text-xs">Treino</span>
          </Link>
          <Link to="/plano" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Plano</span>
          </Link>
          <Link to="/progresso" className="flex flex-col items-center justify-center p-3 text-green-400 w-1/5">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs">Progresso</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Progresso;

