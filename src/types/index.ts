export type UserRole = 'superadmin' | 'coordinator' | 'assistant'
export type CredentialCategory = 'web' | 'app' | 'other'

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  active: boolean
  createdAt: string
}

export interface Credential {
  id: string
  siteName: string
  url?: string
  username: string
  password: string
  category: CredentialCategory
  assignedUserId?: string
  notes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}
