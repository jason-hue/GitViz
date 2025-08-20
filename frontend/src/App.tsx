import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { store } from './store'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RepositoryDetailPage from './pages/RepositoryDetailPage'
import RepositoriesPage from './pages/RepositoriesPage'
import BranchesPage from './pages/BranchesPage'
import CommitsPage from './pages/CommitsPage'
import TeamPage from './pages/TeamPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token')
  const isAuthenticated = store.getState().auth.isAuthenticated

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/repositories" 
              element={
                <ProtectedRoute>
                  <RepositoriesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/branches" 
              element={
                <ProtectedRoute>
                  <BranchesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/commits" 
              element={
                <ProtectedRoute>
                  <CommitsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/team" 
              element={
                <ProtectedRoute>
                  <TeamPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/repository/:id" 
              element={
                <ProtectedRoute>
                  <RepositoryDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to="/dashboard" replace />} 
            />
          </Routes>
        </Router>
      </ConfigProvider>
    </Provider>
  )
}

export default App
