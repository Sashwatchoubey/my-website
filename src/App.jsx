import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import StaffPage from './pages/StaffPage'
import AttendancePage from './pages/AttendancePage'
import SalaryPage from './pages/SalaryPage'
import Layout from './components/Layout/Layout'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="salary" element={<SalaryPage />} />
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center h-96 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
            <p>This module is under development.</p>
          </div>
        } />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
