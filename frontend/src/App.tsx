import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { AuthLayout } from './layouts/AuthLayout'
import {
  ProtectedRoute,
  PublicRoute,
} from './components/auth/ProtectedRoute'
import { Loader2 } from 'lucide-react'

const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const AnalyzerPage = lazy(() => import('./pages/AnalyzerPage'))
const ResultsPage = lazy(() => import('./pages/ResultsPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const ATSGuidePage = lazy(() => import('./pages/ATSGuidePage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        <p className="text-secondary-600">Loading...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public website pages */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/ats-guide" element={<ATSGuidePage />} />

          {/* Protected pages */}
          <Route element={<ProtectedRoute />}>
            <Route path="/analyzer" element={<AnalyzerPage />} />
            <Route path="/results/:id" element={<ResultsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Authentication pages */}
        <Route element={<AuthLayout />}>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App