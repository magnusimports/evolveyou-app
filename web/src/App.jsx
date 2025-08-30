import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Dashboard from '@/components/pages/Dashboard'
import DashboardAdvanced from '@/components/pages/DashboardAdvanced'
import Nutrition from '@/components/pages/Nutrition'
import Workout from '@/components/pages/Workout'
import WorkoutPlayer from '@/components/pages/WorkoutPlayer'
import ProgressDashboard from '@/components/pages/ProgressDashboard'
import CoachEVO from '@/components/pages/CoachEVO'
import Profile from '@/components/pages/Profile'
import Login from '@/components/pages/Login'
import MealRegistration from '@/components/pages/MealRegistration'
import FullTimeSystem from '@/components/pages/FullTimeSystem'
import Onboarding from '@/components/pages/Onboarding'
import PlanPresentation from '@/components/pages/PlanPresentation'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true) // Simulando usuário logado

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />
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
            <Route path="/fulltime" element={<FullTimeSystem />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/plan-presentation" element={<PlanPresentation />} />
            <Route path="/dashboard-advanced" element={<DashboardAdvanced />} />
            <Route path="/workout-player" element={<WorkoutPlayer />} />
            <Route path="/progress" element={<ProgressDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

