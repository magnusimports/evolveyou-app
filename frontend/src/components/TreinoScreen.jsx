import { motion } from 'framer-motion'
import { Play, Clock, Flame, Trophy, ChevronRight } from 'lucide-react'

const WorkoutCard = ({ day, title, exercises, duration, calories, isToday = false, isCompleted = false }) => {
  return (
    <motion.div
      className={`rounded-2xl p-4 border ${
        isToday 
          ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-500' 
          : 'bg-gray-900/50 border-gray-800'
      }`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold">{day}</h3>
          <p className={`text-sm ${isToday ? 'text-white/80' : 'text-gray-400'}`}>{title}</p>
        </div>
        {isCompleted && (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l2.5 2.5L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <Play size={14} className={isToday ? 'text-white/80' : 'text-gray-400'} />
          <span className={`text-sm ${isToday ? 'text-white/80' : 'text-gray-400'}`}>{exercises} exercícios</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} className={isToday ? 'text-white/80' : 'text-gray-400'} />
          <span className={`text-sm ${isToday ? 'text-white/80' : 'text-gray-400'}`}>{duration} min</span>
        </div>
        {calories && (
          <div className="flex items-center gap-1">
            <Flame size={14} className={isToday ? 'text-white/80' : 'text-gray-400'} />
            <span className={`text-sm ${isToday ? 'text-white/80' : 'text-gray-400'}`}>{calories} cal</span>
          </div>
        )}
      </div>
      
      <motion.button
        className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
          isToday 
            ? 'bg-white text-green-600' 
            : 'bg-gray-800 text-white hover:bg-gray-700'
        }`}
        whileTap={{ scale: 0.98 }}
      >
        {isToday ? 'Iniciar Treino' : 'Ver Treino'}
        <ChevronRight size={16} />
      </motion.button>
    </motion.div>
  )
}

const ProgressRing = ({ percentage, size = 80 }) => {
  const radius = (size - 8) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#10b981"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-bold text-lg">{percentage}%</span>
      </div>
    </div>
  )
}

const TreinoScreen = () => {
  return (
    <div className="space-y-6">
      {/* Progresso Semanal */}
      <motion.div
        className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-white mb-6">Progresso Semanal</h2>
        
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm">Treinos Concluídos</p>
              <p className="text-white font-bold text-2xl">12/15</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Próximo Treino</p>
              <p className="text-green-500 font-semibold">Quinta-feira - Pernas</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Consistência</p>
              <p className="text-white font-bold">7 dias</p>
            </div>
          </div>
          
          <ProgressRing percentage={80} />
        </div>
      </motion.div>

      {/* Treino de Hoje */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Hoje</h2>
        <WorkoutCard
          day="Quinta-feira"
          title="Pernas • Moderado"
          exercises={6}
          duration={45}
          calories={380}
          isToday={true}
        />
      </motion.div>

      {/* Próximos Treinos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Próximos Treinos</h2>
        <div className="space-y-4">
          <WorkoutCard
            day="Sexta-feira"
            title="Cardio • Intenso"
            exercises={1}
            duration={30}
            calories={320}
          />
          
          <WorkoutCard
            day="Sábado"
            title="Peito & Tríceps"
            exercises={5}
            duration={50}
            calories={420}
          />
          
          <WorkoutCard
            day="Domingo"
            title="Descanso Ativo"
            exercises={3}
            duration={20}
          />
        </div>
      </motion.div>

      {/* Treinos Concluídos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Concluídos Esta Semana</h2>
        <div className="space-y-4">
          <WorkoutCard
            day="Quarta-feira"
            title="Costas & Bíceps"
            exercises={4}
            duration={45}
            calories={385}
            isCompleted={true}
          />
          
          <WorkoutCard
            day="Terça-feira"
            title="Ombros & Core"
            exercises={5}
            duration={40}
            calories={295}
            isCompleted={true}
          />
          
          <WorkoutCard
            day="Segunda-feira"
            title="Peito & Tríceps"
            exercises={4}
            duration={45}
            calories={410}
            isCompleted={true}
          />
        </div>
      </motion.div>

      {/* Estatísticas */}
      <motion.div
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Trophy size={20} />
              Conquistas
            </h3>
            <p className="text-white/80 text-sm">Você está no caminho certo!</p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-2xl">15</p>
            <p className="text-white/80 text-sm">treinos este mês</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default TreinoScreen

