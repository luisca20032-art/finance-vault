import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PasswordField, AlertBox } from '../components/ui'
import { ArrowLeft, Save } from 'lucide-react'
import { UserRole } from '../types'

const GT = {
  purple:   '#4F2D7F',
  purple80: '#72579A',
  purple60: '#9581B2',
  purple40: '#B9ABCC',
  purple20: '#DCD5E5',
  red:      '#DE002E',
  white:    '#FFFFFF',
  black:    '#000000',
  warmGrey: '#CBC4BC',
}

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: 'superadmin', label: 'Super Admin', desc: 'Administra usuarios y toda la app' },
  { value: 'coordinator', label: 'Coordinador', desc: 'Gestiona todas las credenciales' },
  { value: 'assistant', label: 'Asistente', desc: 'Ve solo sus credenciales asignadas' },
]

const inputStyle = {
  border: `1.5px solid ${GT.purple40}`,
  borderRadius: '0.5rem',
  padding: '0.625rem 0.75rem',
  fontSize: '0.875rem',
  color: GT.black,
  backgroundColor: GT.white,
  width: '100%',
  outline: 'none',
  fontFamily: "'Nunito Sans', Arial, sans-serif",
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

export default function UserForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id && id !== 'new'
  const navigate = useNavigate()
  const { users, addUser, updateUser } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('assistant')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit) {
      const u = users.find((u) => u.id === id)
      if (u) { setName(u.name); setEmail(u.email); setPassword(u.password); setRole(u.role) }
    }
  }, [id, isEdit, users])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('El nombre es obligatorio'); return }
    if (!email.trim()) { setError('El correo es obligatorio'); return }
    if (!password.trim()) { setError('La contraseña es obligatoria'); return }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return }
    const emailExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== id)
    if (emailExists) { setError('Ya existe un usuario con ese correo'); return }

    setSaving(true)
    try {
      if (isEdit) {
        await updateUser(id!, { name: name.trim(), email: email.trim().toLowerCase(), password, role })
      } else {
        await addUser({ name: name.trim(), email: email.trim().toLowerCase(), password, role, active: true })
      }
      navigate('/users')
    } catch {
      setError('Ocurrió un error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = GT.purple
    e.currentTarget.style.boxShadow = `0 0 0 3px ${GT.purple20}`
  }
  const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = GT.purple40
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-5" style={{ fontFamily: "'Nunito Sans', Arial, sans-serif" }}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl transition-colors"
          style={{ color: GT.purple60 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple20; (e.currentTarget as HTMLElement).style.color = GT.purple }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = GT.purple60 }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold" style={{ color: GT.purple }}>
          {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 space-y-4"
        style={{ border: `1px solid ${GT.purple20}`, boxShadow: '0 2px 12px rgba(79,45,127,0.06)' }}
      >
        {/* Nombre */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: GT.black }}>
            Nombre completo <span style={{ color: GT.red }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre Apellido"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: GT.black }}>
            Correo electrónico <span style={{ color: GT.red }}>*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@empresa.com"
            autoComplete="off"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        {/* Contraseña */}
        <PasswordField label="Contraseña" value={password} onChange={setPassword} required autoComplete="new-password" />

        {/* Rol */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold" style={{ color: GT.black }}>
            Rol <span style={{ color: GT.red }}>*</span>
          </label>
          <div className="space-y-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                style={{
                  border: `1.5px solid ${role === r.value ? GT.purple : GT.purple40}`,
                  backgroundColor: role === r.value ? GT.purple20 : GT.white,
                }}
                onMouseEnter={(e) => { if (role !== r.value) { (e.currentTarget as HTMLElement).style.borderColor = GT.purple; (e.currentTarget as HTMLElement).style.backgroundColor = '#F5F2FA' } }}
                onMouseLeave={(e) => { if (role !== r.value) { (e.currentTarget as HTMLElement).style.borderColor = GT.purple40; (e.currentTarget as HTMLElement).style.backgroundColor = GT.white } }}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                  style={{ borderColor: role === r.value ? GT.purple : GT.warmGrey }}
                >
                  {role === r.value && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GT.purple }} />}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: role === r.value ? GT.purple : GT.black }}>{r.label}</p>
                  <p className="text-xs" style={{ color: GT.purple60 }}>{r.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && <AlertBox type="error" message={error} />}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl text-sm transition-all"
          style={{
            backgroundColor: saving ? GT.purple60 : GT.purple,
            color: GT.white,
            opacity: saving ? 0.7 : 1,
            fontFamily: "'Nunito Sans', Arial, sans-serif",
          }}
          onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple80 }}
          onMouseLeave={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple }}
        >
          <Save size={16} />
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
        </button>
      </form>
    </div>
  )
}
