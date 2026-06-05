import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CredentialsProvider } from './context/CredentialsContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Credentials from './pages/Credentials'
import CredentialDetail from './pages/CredentialDetail'
import CredentialForm from './pages/CredentialForm'
import Users from './pages/Users'
import UserForm from './pages/UserForm'
import Profile from './pages/Profile'

// Rutas protegidas: redirige al login si no hay sesión
function ProtectedRoutes() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

// Rutas solo para Super Admin
function AdminRoutes() {
  const { user } = useAuth()
  if (user?.role !== 'superadmin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

// Rutas solo para Coordinador y Super Admin
function CoordinatorRoutes() {
  const { user } = useAuth()
  if (user?.role === 'assistant') return <Navigate to="/credentials" replace />
  return <Outlet />
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Ruta raíz */}
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />

      {/* Login */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/credentials" element={<Credentials />} />
        <Route path="/credentials/:id" element={<CredentialDetail />} />
        <Route path="/profile" element={<Profile />} />

        {/* Solo coordinador y super admin */}
        <Route element={<CoordinatorRoutes />}>
          <Route path="/credentials/new" element={<CredentialForm />} />
          <Route path="/credentials/:id/edit" element={<CredentialForm />} />
        </Route>

        {/* Solo super admin */}
        <Route element={<AdminRoutes />}>
          <Route path="/users" element={<Users />} />
          <Route path="/users/new" element={<UserForm />} />
          <Route path="/users/:id/edit" element={<UserForm />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/finance-vault">
      <AuthProvider>
        <CredentialsProvider>
          <AppRoutes />
        </CredentialsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
