import { motion } from 'framer-motion'
import { Target, Flame, Droplets, Clock } from 'lucide-react'

const MacroBar = ({ label, current, target, color, unit = 'g' }) => {
  const percentage = Math.min((current / target) * 100, 100)
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-white font-semibold">{current}{unit}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="text-right">
        <span className="text-gray-500 text-xs">Meta: {target}{unit}</span>
      </div>
    </div>
  )
}

const CalorieRing = ({ current, target }) => {
  const percentage = (current / target) * 100
  const radius = 60
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="transform -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          fill="none"
        />
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          stroke="#ff6b35"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{current}</span>
        <span className="text-xs text-gray-400">kcal</span>
      </div>
    </div>
  )
}

const FoodItem = ({ name, calories, isCompleted = false }) => {
  return (
    <motion.div
      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
      whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.7)" }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-600'}`} />
        <span className="text-white">{name}</span>
      </div>
      <span className="text-gray-400 text-sm">{calories} kcal</span>
    </motion.div>
  )
}

const NutricaoScreen = () => {
  return (
    <div className="space-y-6">
      {/* Calorias Diárias */}
      <motion.div
        className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-white mb-6">Calorias Hoje</h2>
        
        <div className="flex items-center justify-between">
          <CalorieRing current={1847} target={2459} />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-orange-500" />
              <div>
                <p className="text-white font-medium">Meta</p>
                <p className="text-orange-500 font-bold">2.459 kcal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-red-500" />
              <div>
                <p className="text-white font-medium">Consumidas</p>
                <p className="text-red-500 font-bold">1.847 kcal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Droplets size={16} className="text-blue-500" />
              <div>
                <p className="text-white font-medium">Restantes</p>
                <p className="text-blue-500 font-bold">612 kcal</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Macronutrientes */}
      <motion.div
        className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-white mb-6">Macronutrientes</h2>
        
        <div className="space-y-6">
          <MacroBar
            label="Proteínas"
            current={89}
            target={123}
            color="bg-blue-500"
          />
          
          <MacroBar
            label="Carboidratos"
            current={156}
            target={199}
            color="bg-green-500"
          />
          
          <MacroBar
            label="Gorduras"
            current={45}
            target={67}
            color="bg-yellow-500"
          />
        </div>
      </motion.div>

      {/* Refeições do Dia */}
      <motion.div
        className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Refeições de Hoje</h2>
          <Clock size={20} className="text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-medium mb-3">Café da Manhã</h3>
            <div className="space-y-2">
              <FoodItem name="Aveia com frutas" calories={320} isCompleted={true} />
              <FoodItem name="Café com leite" calories={85} isCompleted={true} />
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-3">Almoço</h3>
            <div className="space-y-2">
              <FoodItem name="Peito de frango grelhado" calories={285} isCompleted={true} />
              <FoodItem name="Arroz integral" calories={180} isCompleted={true} />
              <FoodItem name="Salada verde" calories={45} isCompleted={true} />
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-3">Lanche</h3>
            <div className="space-y-2">
              <FoodItem name="Iogurte grego" calories={120} isCompleted={true} />
              <FoodItem name="Castanhas" calories={95} isCompleted={false} />
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-3">Jantar</h3>
            <div className="space-y-2">
              <FoodItem name="Salmão grelhado" calories={250} isCompleted={false} />
              <FoodItem name="Batata doce" calories={130} isCompleted={false} />
              <FoodItem name="Brócolis" calories={35} isCompleted={false} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hidratação */}
      <motion.div
        className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">Hidratação</h3>
            <p className="text-white/80 text-sm">1.8L de 2.5L hoje</p>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-6 rounded-sm ${
                  i < 6 ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default NutricaoScreen

