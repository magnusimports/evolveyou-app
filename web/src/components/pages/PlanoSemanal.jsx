import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Utensils, 
  Dumbbell, 
  Calendar, 
  TrendingUp,
  Clock,
  Target,
  CheckCircle
} from 'lucide-react';

const PlanoSemanal = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white pb-20">
      {/* Header */}
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-center">Plano Semanal</h1>
          <p className="text-gray-400 text-center text-sm mt-1">Sua programação da semana</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Resumo da Semana */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4">Resumo da Semana</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-gray-400">Treinos</p>
              <p className="font-bold text-white">4/6</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-gray-400">Dieta</p>
              <p className="font-bold text-white">85%</p>
            </div>
          </div>
        </section>

        {/* Programação Semanal */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4">Programação</h2>
          <div className="space-y-3">
            {[
              { dia: 'Segunda', treino: 'Treino A - Peito/Tríceps', status: 'completo' },
              { dia: 'Terça', treino: 'Treino B - Costas/Bíceps', status: 'completo' },
              { dia: 'Quarta', treino: 'Descanso', status: 'descanso' },
              { dia: 'Quinta', treino: 'Treino C - Pernas', status: 'hoje' },
              { dia: 'Sexta', treino: 'Treino A - Peito/Tríceps', status: 'pendente' },
              { dia: 'Sábado', treino: 'Cardio', status: 'pendente' },
              { dia: 'Domingo', treino: 'Descanso', status: 'descanso' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-white">{item.dia}</p>
                  <p className="text-sm text-gray-400">{item.treino}</p>
                </div>
                <div>
                  {item.status === 'completo' && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                  {item.status === 'hoje' && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {item.status === 'pendente' && (
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                      <Target className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  {item.status === 'descanso' && (
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">💤</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Metas da Semana */}
        <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-white mb-4">Metas da Semana</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Treinos completos</span>
              <span className="text-white font-bold">4/6</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Aderência à dieta</span>
              <span className="text-white font-bold">85%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Água consumida</span>
              <span className="text-white font-bold">2.1L/dia</span>
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
          <Link to="/plano" className="flex flex-col items-center justify-center p-3 text-green-400 w-1/5">
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Plano</span>
          </Link>
          <Link to="/progresso" className="flex flex-col items-center justify-center p-3 text-gray-400 hover:text-green-400 w-1/5 transition-colors">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs">Progresso</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default PlanoSemanal;

