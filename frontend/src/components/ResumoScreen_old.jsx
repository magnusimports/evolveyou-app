import { motion } from 'framer-motion'
import { TrendingUp, Award, Footprints, MapPin, Dumbbell } from 'lucide-react'
import { useApi } from '../hooks/useApi'

const CircularProgress = ({ percentage, color, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
    </div>
  )
}

const ActivityRings = ({ data }) => {
  if (!data) return <div className="w-[140px] h-[140px] bg-gray-800 rounded-full animate-pulse" />
  
  return (
    <div className="relative flex items-center justify-center">
      {/* Anel externo - Movimento */}
      <div className="absolute">
        <CircularProgress percentage={data.movement.percentage} color="#ff3b30" size={140} strokeWidth={12} />
      </div>
      {/* Anel médio - Exercício */}
      <div className="absolute">
        <CircularProgress percentage={data.exercise.percentage} color="#30d158" size={110} strokeWidth={12} />
      </div>
      {/* Anel interno - Em Pé */}
      <div className="absolute">
        <CircularProgress percentage={data.stand.percentage} color="#007aff" size={80} strokeWidth={12} />
      </div>
    </div>
  )
}

const StatCard = ({ title, value, unit, icon: Icon, color, chart }) => {
  return (
    <motion.div
      className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <Icon size={16} className="text-gray-500" />
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-sm text-gray-400">{unit}</span>
      </div>
      {chart && (
        <div className="h-8 flex items-end gap-1">
          {chart.map((height, index) => (
            <motion.div
              key={index}
              className={`flex-1 rounded-sm ${color}`}
              style={{ height: `${height}%` }}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

const ResumoScreen = () => {
  const { data: activityData, loading: activityLoading } = useApi('activity-rings')
  const { data: metricsData, loading: metricsLoading } = useApi('metrics')
  const { data: chartData, loading: chartLoading } = useApi('chart-data')

  if (activityLoading || metricsLoading || chartLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-48 mb-6"></div>
          <div className="flex items-center gap-8">
            <div className="w-[140px] h-[140px] bg-gray-700 rounded-full"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-700 rounded w-32"></div>
              <div className="h-4 bg-gray-700 rounded w-24"></div>
              <div className="h-4 bg-gray-700 rounded w-28"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Círculos de Atividade */}
      <motion.div
        className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-white mb-6">Círculos de Atividade</h2>
        
        <div className="flex items-center gap-8">
          <div className="flex-shrink-0">
            <ActivityRings data={activityData} />
          </div>
          
          {activityData && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div>
                  <p className="text-white font-medium">Movimento</p>
                  <p className="text-red-500 font-bold">
                    {activityData.movement.current}/{activityData.movement.target} 
                    <span className="text-sm font-normal ml-1">{activityData.movement.unit}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-white font-medium">Exercício</p>
                  <p className="text-green-500 font-bold">
                    {activityData.exercise.current}/{activityData.exercise.target} 
                    <span className="text-sm font-normal ml-1">{activityData.exercise.unit}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-white font-medium">Em Pé</p>
                  <p className="text-blue-500 font-bold">
                    {activityData.stand.current}/{activityData.stand.target} 
                    <span className="text-sm font-normal ml-1">{activityData.stand.unit}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Passos"
            value={metricsData?.steps?.toLocaleString() || "0"}
            unit="hoje"
            icon={Footprints}
            color="bg-purple-500"
            chart={chartData?.steps}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-400 text-sm font-medium">Sessões</h3>
              <TrendingUp size={16} className="text-gray-500" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Dumbbell size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Treino Tradicional de Força</p>
                <p className="text-green-500 font-bold">452CAL</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs">quarta-feira</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatCard
            title="Distância"
            value={metricsData?.distance || "0"}
            unit="KM hoje"
            icon={MapPin}
            color="bg-blue-500"
            chart={chartData?.distance}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-400 text-sm font-medium">Prêmios</h3>
              <Award size={16} className="text-gray-500" />
            </div>
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">7</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-white font-medium text-sm">Semana Perfeita</p>
              <p className="text-gray-400 text-xs">(Ficar em Pé)</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fitness+ Section */}
      <motion.div
        className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-4 flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div>
          <h3 className="text-white font-bold text-lg">🍎Fitness+</h3>
          <p className="text-white/80 text-sm">Novos treinos toda semana</p>
        </div>
        <div className="text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </motion.div>
    </div>
  )
}

export default ResumoScreen

