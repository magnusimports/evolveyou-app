import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User,
  Edit,
  Save,
  Target,
  Activity,
  Calendar,
  MapPin,
  Mail,
  Phone
} from 'lucide-react'

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    phone: '(11) 99999-9999',
    age: 30,
    height: 175,
    currentWeight: 75,
    targetWeight: 70,
    goal: 'Perder Peso',
    activityLevel: 'Moderadamente Ativo',
    location: 'São Paulo, SP',
    joinDate: '2024-01-15'
  })

  const [goals] = useState([
    { name: 'Perder 5kg', progress: 50, color: 'bg-green-500' },
    { name: 'Treinar 4x/semana', progress: 75, color: 'bg-blue-500' },
    { name: 'Beber 2.5L água/dia', progress: 88, color: 'bg-cyan-500' }
  ])

  const [achievements] = useState([
    { name: '7 dias consecutivos', icon: '🔥', date: '2024-08-20' },
    { name: 'Primeira meta atingida', icon: '🎯', date: '2024-08-15' },
    { name: 'Perfil completo', icon: '✅', date: '2024-08-01' }
  ])

  const handleSave = () => {
    setIsEditing(false)
    // Aqui seria feita a chamada para salvar no backend
  }

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais</p>
        </div>
        <Button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </>
          )}
        </Button>
      </div>

      {/* Informações Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>Informações Pessoais</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/api/placeholder/96/96" />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button variant="outline" size="sm">
                  Alterar Foto
                </Button>
              )}
            </div>

            {/* Dados Pessoais */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                {isEditing ? (
                  <Input
                    value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900">{profile.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Telefone</label>
                {isEditing ? (
                  <Input
                    value={profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{profile.phone}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Localização</label>
                {isEditing ? (
                  <Input
                    value={profile.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{profile.location}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Idade</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={profile.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                  />
                ) : (
                  <p className="text-gray-900">{profile.age} anos</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Altura</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={profile.height}
                    onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
                  />
                ) : (
                  <p className="text-gray-900">{profile.height}cm</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Membro desde {new Date(profile.joinDate).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Objetivos e Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Objetivos Atuais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <span>Objetivos Atuais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Peso Atual</p>
                <p className="text-2xl font-bold text-blue-800">{profile.currentWeight}kg</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Meta</p>
                <p className="text-2xl font-bold text-green-800">{profile.targetWeight}kg</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Objetivo:</span>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  {profile.goal}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Nível de Atividade:</span>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  <Activity className="w-3 h-3 mr-1" />
                  {profile.activityLevel}
                </Badge>
              </div>
            </div>

            {/* Progresso das Metas */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Progresso das Metas</h4>
              {goals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{goal.name}</span>
                    <span className="text-sm text-gray-600">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${goal.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conquistas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-xl">🏆</span>
              <span>Conquistas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{achievement.name}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(achievement.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-gray-600">Continue assim para desbloquear mais conquistas!</p>
                <Button variant="outline" className="mt-2">
                  Ver Todas as Conquistas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Profile

