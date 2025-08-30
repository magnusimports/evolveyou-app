import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react'

const Login = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    // Simular login
    onLogin()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Lado Esquerdo - Apresentação */}
        <div className="space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">EvolveYou</h1>
                <p className="text-gray-600">Dashboard Nutricional</p>
              </div>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Transforme sua vida com
              <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent"> IA</span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8">
              Seu coach pessoal com inteligência artificial para nutrição, treinos e motivação
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center lg:text-left">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-3">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Coach EVO</h3>
              <p className="text-sm text-gray-600">IA personalizada com Gemini</p>
            </div>

            <div className="text-center lg:text-left">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-3">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Planos Personalizados</h3>
              <p className="text-sm text-gray-600">Nutrição e treino sob medida</p>
            </div>

            <div className="text-center lg:text-left">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Progresso Real</h3>
              <p className="text-sm text-gray-600">Métricas em tempo real</p>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Ana Silva</h4>
                <p className="text-sm text-gray-600">Perdeu 8kg em 3 meses</p>
              </div>
            </div>
            <p className="text-gray-700 italic">
              "O EvolveYou mudou minha vida! O Coach EVO me ajuda todos os dias com dicas personalizadas."
            </p>
          </div>
        </div>

        {/* Lado Direito - Login */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Bem-vindo de volta!
              </CardTitle>
              <p className="text-gray-600">
                Entre na sua conta para continuar sua jornada
              </p>
              <Badge variant="outline" className="w-fit mx-auto text-green-600 border-green-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Versão Web Completa
              </Badge>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3"
                >
                  Entrar no EvolveYou
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ou</span>
                  </div>
                </div>

                {/* Demo Button */}
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={onLogin}
                >
                  Entrar como Demo
                </Button>

                {/* Links */}
                <div className="text-center space-y-2">
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    Esqueceu sua senha?
                  </a>
                  <p className="text-sm text-gray-600">
                    Não tem uma conta?{' '}
                    <a href="#" className="text-blue-600 hover:underline font-medium">
                      Cadastre-se grátis
                    </a>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Login

