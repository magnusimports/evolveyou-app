import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/hooks/useAuth.jsx'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/layout/Navbar'
import DashboardSimple from '@/components/pages/DashboardSimple'
import DashboardAdvanced from '@/components/pages/DashboardAdvanced'
import DashboardManus from '@/components/pages/DashboardManus'
import DashboardHoje from '@/components/pages/DashboardHoje'
import PlanoAlimentar from '@/components/pages/PlanoAlimentar'
import TreinoDoDia from '@/components/pages/TreinoDoDia'
import PlanoSemanal from '@/components/pages/PlanoSemanal'
import Progresso from '@/components/pages/Progresso'
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
import AnamneseInteligente from '@/components/pages/AnamneseInteligente'
import PlanPresentation from '@/components/pages/PlanPresentation'
import ApiTest from '@/components/pages/ApiTest'
import TestAPI from '@/components/TestAPI'
import DashboardPersonalizado from '@/components/DashboardPersonalizado'
import EnhancedBMRCalculator from '@/components/EnhancedBMRCalculator'
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
          
          {/* Rota da anamnese - não requer anamnese completa */}
          <Route 
            path="/anamnese" 
            element={
              <ProtectedRoute requiresAnamnese={false}>
                <AnamneseInteligente />
              </ProtectedRoute>
            } 
          />
          
          {/* Rotas que requerem anamnese completa */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiresAnamnese={true}>
                <DashboardHoje />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/nutrition" 
            element={
              <ProtectedRoute requiresAnamnese={true}>
                <PlanoAlimentar />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dieta" 
            element={
              <ProtectedRoute requiresAnamnese={true}>
                <PlanoAlimentar />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workout" 
            element={
              <ProtectedRoute requiresAnamnese={true}>
                <TreinoDoDia />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/treino" 
            element={
              <ProtectedRoute requiresAnamnese={true}>
                <TreinoDoDia />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/plano" 
            element={
              <ProtectedRoute requiresAnamnese={true}>
                <PlanoSemanal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/progresso" 
            element={
              <ProtectedRoute requiresAnamnese={true}>
                <Progresso />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/coach" 
            element={
              <ProtectedRoute requiresAnamnese={true}>
                <CoachEVOManus />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute requiresAnamnese={true}>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/meals" 
            element={
              <ProtectedRoute requiresAnamnese={true}>
                <MealRegistration />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/meal-registration" 
            element={
              <ProtectedRoute requiresAnamnese={true}>
                <MealRegistration />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/progress" 
            element={
              <ProtectedRoute requiresAnamnese={true}>
                <ProgressDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workout-player" 
            element={
              <ProtectedRoute requiresAnamnese={true}>
                <WorkoutPlayer />
              </ProtectedRoute>
            } 
          />
          
          {/* Rotas que não requerem anamnese */}
          <Route 
            path="/enhanced-bmr" 
            element={
              <ProtectedRoute requiresAnamnese={false}>
                <EnhancedBMRCalculator />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute requiresAnamnese={false}>
                <Onboarding />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/plan-presentation" 
            element={
              <ProtectedRoute requiresAnamnese={false}>
                <PlanPresentation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/api-test" 
            element={
              <ProtectedRoute requiresAnamnese={false}>
                <ApiTest />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/test-api" 
            element={
              <ProtectedRoute requiresAnamnese={false}>
                <TestAPI />
              </ProtectedRoute>
            } 
          />
          
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

