import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/hooks/useAuth.jsx'
import Navbar from '@/components/layout/Navbar'
import Dashboard from '@/components/pages/Dashboard'
import DashboardAdvanced from '@/components/pages/DashboardAdvanced'
import Login from '@/components/pages/Login'
import Nutrition from '@/components/pages/Nutrition'
import Workout from '@/components/pages/Workout'
import WorkoutPlayer from '@/components/pages/WorkoutPlayer'
import FullTimeSystem from '@/components/pages/FullTimeSystem'
import CoachEVO from '@/components/pages/CoachEVO'
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
    return <Login />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/coach" element={<CoachEVO />} />
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
        </main>
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

