import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Timer, 
  Dumbbell,
  Target,
  TrendingUp,
  CheckCircle,
  ArrowLeft,
  Plus,
  Minus
} from 'lucide-react'

const WorkoutPlayer = () => {
  const navigate = useNavigate()
  
  // Estados do player
  const [currentExercise, setCurrentExercise] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [isResting, setIsResting] = useState(false)
  const [restTime, setRestTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [reps, setReps] = useState(12)
  const [weight, setWeight] = useState(20)
  const [workoutStarted, setWorkoutStarted] = useState(false)

  // Dados dos exercícios (simulados)
  const exercises = [
    {
      id: 1,
      name: 'Supino Reto',
      muscle: 'Peito',
      sets: 3,
      reps: '10-12',
      rest: 90,
      gif: '/gifs/supino-reto.gif',
      instructions: 'Deite no banco, segure a barra com pegada média, desça controladamente até o peito e empurre para cima.'
    },
    {
      id: 2,
      name: 'Agachamento',
      muscle: 'Pernas',
      sets: 3,
      reps: '12-15',
      rest: 120,
      gif: '/gifs/agachamento.gif',
      instructions: 'Pés na largura dos ombros, desça como se fosse sentar, mantenha o peito ereto.'
    },
    {
      id: 3,
      name: 'Remada Curvada',
      muscle: 'Costas',
      sets: 3,
      reps: '8-10',
      rest: 90,
      gif: '/gifs/remada-curvada.gif',
      instructions: 'Incline o tronco, puxe a barra em direção ao abdômen, contraia as escápulas.'
    },
    {
      id: 4,
      name: 'Desenvolvimento',
      muscle: 'Ombros',
      sets: 3,
      reps: '10-12',
      rest: 75,
      gif: '/gifs/desenvolvimento.gif',
      instructions: 'Sentado ou em pé, empurre os halteres acima da cabeça, desça controladamente.'
    }
  ]

  const currentExerciseData = exercises[currentExercise]

  // Timer de descanso
  useEffect(() => {
    let interval = null
    if (isTimerRunning && restTime > 0) {
      interval = setInterval(() => {
        setRestTime(time => {
          if (time <= 1) {
            setIsTimerRunning(false)
            setIsResting(false)
            return 0
          }
          return time - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, restTime])

  const startWorkout = () => {
    setWorkoutStarted(true)
  }

  const completeSet = () => {
    // Salvar dados da série
    const setData = {
      exerciseId: currentExerciseData.id,
      exerciseName: currentExerciseData.name,
      set: currentSet,
      reps: reps,
      weight: weight,
      date: new Date().toISOString(),
      timestamp: Date.now()
    }

    // Salvar no localStorage
    const existingData = JSON.parse(localStorage.getItem('workout_history') || '[]')
    existingData.push(setData)
    localStorage.setItem('workout_history', JSON.stringify(existingData))

    // Verificar se é a última série do exercício
    if (currentSet >= currentExerciseData.sets) {
      // Próximo exercício
      if (currentExercise < exercises.length - 1) {
        setCurrentExercise(currentExercise + 1)
        setCurrentSet(1)
        startRest(currentExerciseData.rest)
      } else {
        // Treino finalizado
        finishWorkout()
      }
    } else {
      // Próxima série
      setCurrentSet(currentSet + 1)
      startRest(currentExerciseData.rest)
    }
  }

  const startRest = (seconds) => {
    setIsResting(true)
    setRestTime(seconds)
    setIsTimerRunning(true)
  }

  const pauseTimer = () => {
    setIsTimerRunning(!isTimerRunning)
  }

  const skipRest = () => {
    setIsResting(false)
    setRestTime(0)
    setIsTimerRunning(false)
  }

  const finishWorkout = () => {
    // Salvar dados do treino completo
    const workoutData = {
      date: new Date().toISOString(),
      exercises: exercises.length,
      duration: '45 min', // Calcular duração real
      totalSets: exercises.reduce((acc, ex) => acc + ex.sets, 0),
      completed: true
    }

    const workoutHistory = JSON.parse(localStorage.getItem('workout_sessions') || '[]')
    workoutHistory.push(workoutData)
    localStorage.setItem('workout_sessions', JSON.stringify(workoutHistory))

    navigate('/workout-complete')
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = ((currentExercise * currentExerciseData.sets + currentSet - 1) / 
    (exercises.length * exercises.reduce((acc, ex) => acc + ex.sets, 0) / exercises.length)) * 100

  if (!workoutStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/workout')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Treino A - Peito e Tríceps</h1>
          </div>

          <Card className="shadow-xl mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Pronto para treinar?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">📋 Resumo do Treino</h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• {exercises.length} exercícios</li>
                    <li>• {exercises.reduce((acc, ex) => acc + ex.sets, 0)} séries totais</li>
                    <li>• Duração estimada: 45-60 min</li>
                    <li>• Foco: Peito, Ombros, Tríceps</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">🎯 Objetivos</h3>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• Hipertrofia muscular</li>
                    <li>• Força funcional</li>
                    <li>• Resistência muscular</li>
                    <li>• Queima calórica</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">Exercícios do Treino:</h3>
                {exercises.map((exercise, index) => (
                  <div key={exercise.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{exercise.name}</div>
                        <div className="text-sm text-gray-600">{exercise.muscle}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{exercise.sets} séries</div>
                      <div className="text-sm text-gray-600">{exercise.reps} reps</div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={startWorkout}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-lg py-6"
              >
                <Play className="w-6 h-6 mr-2" />
                Iniciar Treino
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header com progresso */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/workout')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Sair
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Exercício {currentExercise + 1} de {exercises.length}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {Math.round(progressPercentage)}% completo
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        {isResting ? (
          // Tela de descanso
          <Card className="shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Timer className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tempo de Descanso</h2>
              <p className="text-gray-600 mb-6">Recupere-se para a próxima série</p>
              
              <div className="text-6xl font-bold text-orange-500 mb-6">
                {formatTime(restTime)}
              </div>
              
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  variant="outline"
                  onClick={pauseTimer}
                  className="flex items-center gap-2"
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isTimerRunning ? 'Pausar' : 'Continuar'}
                </Button>
                
                <Button
                  onClick={skipRest}
                  className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
                >
                  <SkipForward className="w-4 h-4" />
                  Pular Descanso
                </Button>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 font-medium">
                  Próximo: {currentSet <= currentExerciseData.sets ? 
                    `${currentExerciseData.name} - Série ${currentSet}` :
                    exercises[currentExercise + 1]?.name || 'Treino Finalizado'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Tela do exercício
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna esquerda - Exercício */}
            <Card className="shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{currentExerciseData.name}</CardTitle>
                    <p className="text-gray-600">{currentExerciseData.muscle}</p>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    Série {currentSet}/{currentExerciseData.sets}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* GIF do exercício (placeholder) */}
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">GIF do {currentExerciseData.name}</p>
                  </div>
                </div>
                
                {/* Instruções */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">📝 Como executar:</h4>
                  <p className="text-blue-700 text-sm">{currentExerciseData.instructions}</p>
                </div>
                
                {/* Meta da série */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">🎯 Meta da série:</h4>
                  <p className="text-green-700">{currentExerciseData.reps} repetições</p>
                </div>
              </CardContent>
            </Card>

            {/* Coluna direita - Controles */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Registrar Série</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Peso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso (kg)
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWeight(Math.max(0, weight - 2.5))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 text-center">
                      <div className="text-3xl font-bold text-blue-600">{weight}</div>
                      <div className="text-sm text-gray-500">kg</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWeight(weight + 2.5)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Repetições */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repetições
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReps(Math.max(1, reps - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 text-center">
                      <div className="text-3xl font-bold text-green-600">{reps}</div>
                      <div className="text-sm text-gray-500">reps</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReps(reps + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Histórico da sessão atual */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">📊 Séries anteriores:</h4>
                  <div className="space-y-2">
                    {Array.from({ length: currentSet - 1 }, (_, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>Série {i + 1}</span>
                        <span className="font-medium">{weight}kg × {reps} reps</span>
                      </div>
                    ))}
                    {currentSet === 1 && (
                      <p className="text-gray-500 text-sm">Primeira série do exercício</p>
                    )}
                  </div>
                </div>

                {/* Botão de completar série */}
                <Button
                  onClick={completeSet}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-lg py-6"
                >
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Completar Série
                </Button>

                {/* Informações adicionais */}
                <div className="text-center text-sm text-gray-500">
                  <p>Descanso recomendado: {currentExerciseData.rest}s</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkoutPlayer

