import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Credential, CredentialCategory } from '../types'

const STORAGE_KEY = 'fv_credentials'

const DEFAULT_CREDENTIALS: Credential[] = [
  {
    id: 'c1',
    siteName: 'Microsoft 365',
    url: 'https://office.com',
    username: 'finanzas@empresa.com',
    password: 'M365Pass2024!',
    category: 'web',
    assignedUserId: 'u3',
    notes: 'Licencia empresarial — 5 usuarios',
    createdBy: 'u2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c2',
    siteName: 'QuickBooks Online',
    url: 'https://quickbooks.intuit.com',
    username: 'admin_finanzas',
    password: 'QB2024Secure!',
    category: 'app',
    assignedUserId: 'u2',
    notes: 'Plan Plus — renovación anual',
    createdBy: 'u2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c3',
    siteName: 'Dropbox Business',
    url: 'https://dropbox.com',
    username: 'storage@empresa.com',
    password: 'DBx2024!',
    category: 'web',
    assignedUserId: 'u3',
    createdBy: 'u2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

interface CredentialsContextType {
  credentials: Credential[]
  addCredential: (data: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateCredential: (id: string, data: Partial<Credential>) => Promise<void>
  deleteCredential: (id: string) => Promise<void>
  getCredentialById: (id: string) => Credential | undefined
  importBulk: (items: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<number>
}

const CredentialsContext = createContext<CredentialsContextType | null>(null)

function loadCredentials(): Credential[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : DEFAULT_CREDENTIALS
  } catch {
    return DEFAULT_CREDENTIALS
  }
}

export function CredentialsProvider({ children }: { children: React.ReactNode }) {
  const [credentials, setCredentials] = useState<Credential[]>(loadCredentials)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials))
  }, [credentials])

  const addCredential = useCallback(async (data: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const newCred: Credential = { ...data, id: `c_${Date.now()}`, createdAt: now, updatedAt: now }
    setCredentials((prev) => [newCred, ...prev])
  }, [])

  const updateCredential = useCallback(async (id: string, data: Partial<Credential>) => {
    setCredentials((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c))
    )
  }, [])

  const deleteCredential = useCallback(async (id: string) => {
    setCredentials((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const getCredentialById = useCallback(
    (id: string) => credentials.find((c) => c.id === id),
    [credentials]
  )

  const importBulk = useCallback(async (items: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<number> => {
    const now = new Date().toISOString()
    const newCreds: Credential[] = items.map((item, i) => ({
      ...item,
      id: `c_bulk_${Date.now()}_${i}`,
      createdAt: now,
      updatedAt: now,
    }))
    setCredentials(prev => [...newCreds, ...prev])
    return newCreds.length
  }, [])

  return (
    <CredentialsContext.Provider value={{ credentials, addCredential, updateCredential, deleteCredential, getCredentialById, importBulk }}>
      {children}
    </CredentialsContext.Provider>
  )
}

export function useCredentials() {
  const ctx = useContext(CredentialsContext)
  if (!ctx) throw new Error('useCredentials must be used within CredentialsProvider')
  return ctx
}

export const CATEGORY_LABELS: Record<CredentialCategory, string> = {
  web: 'Sitio Web',
  app: 'Aplicación',
  other: 'Otro',
}

export const CATEGORY_COLORS: Record<CredentialCategory, string> = {
  web: '#1A56DB',
  app: '#7C3AED',
  other: '#059669',
}
