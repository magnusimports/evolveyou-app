import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  LayoutDashboard, 
  Apple, 
  Dumbbell, 
  Bot, 
  User,
  Menu,
  X,
  Utensils,
  Zap
} from 'lucide-react'

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard, color: 'text-green-600' },
    { path: '/nutrition', label: 'Nutrição', icon: Apple, color: 'text-blue-600' },
    { path: '/meals', label: 'Refeições', icon: Utensils, color: 'text-yellow-600' },
    { path: '/workout', label: 'Treino', icon: Dumbbell, color: 'text-orange-600' },
    { path: '/fulltime', label: 'Full-time', icon: Zap, color: 'text-red-600' },
    { path: '/coach', label: 'Coach EVO', icon: Bot, color: 'text-purple-600' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-gray-800">EvolveYou</span>
            <span className="text-sm text-gray-500 hidden sm:block">Dashboard Nutricional</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`flex items-center space-x-2 ${
                      isActive(item.path) 
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive(item.path) ? 'text-white' : item.color}`} />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Online</span>
              <span className="text-sm text-gray-400">7 dias</span>
            </div>
            
            <Link to="/profile">
              <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-green-500 transition-all">
                <AvatarImage src="/api/placeholder/32/32" />
                <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                  A
                </AvatarFallback>
              </Avatar>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className={`w-full justify-start space-x-2 ${
                        isActive(item.path) 
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive(item.path) ? 'text-white' : item.color}`} />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

