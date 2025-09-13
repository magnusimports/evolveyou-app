import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/hooks/useAuth.jsx'
import Navbar from '@/components/layout/Navbar'
import DashboardSimple from '@/components/pages/DashboardSimple'
import DashboardAdvanced from '@/components/pages/DashboardAdvanced'
import DashboardManus from '@/components/pages/DashboardManus'
import Login from '@/components/pages/Login'
import Register from '@/components/pages/Register'
import Nutrition from '@/components/pages/Nutrition'
import NutritionManus from '@/components/pages/NutritionManus'
import Workout from '@/components/pages/Workout'
import WorkoutManus from '@/components/pages/WorkoutManus'
import WorkoutPlayer from '@/components/pages/WorkoutPlayer'
import FullTimeSystem from '@/components/pages/FullTimeSystem'
import CoachEVO from '@/components/pages/CoachEVO'
import CoachEVOManus from '@/components/pages/CoachEVOManus'
import Profile from '@/components/pages/Profile'
import ProgressDashboard from '@/components/pages/ProgressDashboard'
import MealRegistration from '@/components/pages/MealRegistration'
import Onboarding from '@/components/pages/Onboarding'
import PlanPresentation from '@/components/pages/PlanPresentation'
import ApiTest from '@/components/pages/ApiTest'
import './App.css'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <p className="text-gray-600">Carregando EvolveYou...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    )
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardManus />} />
          <Route path="/nutrition" element={<NutritionManus />} />
          <Route path="/workout" element={<WorkoutManus />} />
          <Route path="/coach" element={<CoachEVOManus />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/meals" element={<MealRegistration />} />
          <Route path="/meal-registration" element={<MealRegistration />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/plan-presentation" element={<PlanPresentation />} />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="/workout-player" element={<WorkoutPlayer />} />
          <Route path="/progress" element={<ProgressDashboard />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

