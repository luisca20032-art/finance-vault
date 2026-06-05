import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { User, UserRole } from '../types'

const STORAGE_KEY = 'fv_users'
const SESSION_KEY = 'fv_session'

const DEFAULT_USERS: User[] = [
  {
    id: 'u1',
    name: 'Super Administrador',
    email: 'admin@financevault.com',
    password: 'Admin2024!',
    role: 'superadmin',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u2',
    name: 'Coordinador Finanzas',
    email: 'coordinador@financevault.com',
    password: 'Coord2024!',
    role: 'coordinator',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u3',
    name: 'Asistente Finanzas',
    email: 'asistente@financevault.com',
    password: 'Asist2024!',
    role: 'assistant',
    active: true,
    createdAt: new Date().toISOString(),
  },
]

interface AuthContextType {
  user: User | null
  users: User[]
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  addUser: (data: Omit<User, 'id' | 'createdAt'>) => Promise<void>
  updateUser: (id: string, data: Partial<User>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function loadUsers(): User[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : DEFAULT_USERS
  } catch {
    return DEFAULT_USERS
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

function loadSession(): User | null {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(loadUsers)
  const [user, setUser] = useState<User | null>(loadSession)

  useEffect(() => {
    saveUsers(users)
  }, [users])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.active
    )
    if (found) {
      setUser(found)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(found))
      return true
    }
    return false
  }, [users])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem(SESSION_KEY)
  }, [])

  const addUser = useCallback(async (data: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...data,
      id: `u_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setUsers((prev) => [...prev, newUser])
  }, [])

  const updateUser = useCallback(async (id: string, data: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...data } : u))
    )
    setUser((prev) => {
      if (prev?.id === id) {
        const updated = { ...prev, ...data }
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated))
        return updated
      }
      return prev
    })
  }, [])

  const deleteUser = useCallback(async (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }, [])

  return (
    <AuthContext.Provider value={{ user, users, login, logout, addUser, updateUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  coordinator: 'Coordinador',
  assistant: 'Asistente',
}

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  superadmin: { bg: 'bg-purple-100', text: 'text-purple-700' },
  coordinator: { bg: 'bg-blue-100', text: 'text-blue-700' },
  assistant: { bg: 'bg-green-100', text: 'text-green-700' },
}
