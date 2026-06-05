import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, ROLE_LABELS, ROLE_COLORS } from '../context/AuthContext'
import { PasswordField, AlertBox, Avatar } from '../components/ui'
import { LogOut, Lock } from 'lucide-react'

const GT = {
  purple:   '#4F2D7F',
  purple80: '#72579A',
  purple60: '#9581B2',
  purple40: '#B9ABCC',
  purple20: '#DCD5E5',
  teal:     '#00A7B5',
  red:      '#DE002E',
  white:    '#FFFFFF',
  black:    '#000000',
}

export default function Profile() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!currentPassword) { setError('Ingresa tu contraseña actual'); return }
    if (currentPassword !== user?.password) { setError('La contraseña actual es incorrecta'); return }
    if (!newPassword || newPassword.length < 8) { setError('La nueva contraseña debe tener al menos 8 caracteres'); return }
    if (newPassword !== confirmPassword) { setError('Las contraseñas nuevas no coinciden'); return }
    if (newPassword === currentPassword) { setError('La nueva contraseña debe ser diferente a la actual'); return }
    setSaving(true)
    await updateUser(user!.id, { password: newPassword })
    setSaving(false)
    setSuccess('Contraseña actualizada correctamente')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (!user) return null
  const { bg, text } = ROLE_COLORS[user.role]

  const cardStyle = {
    backgroundColor: GT.white,
    border: `1px solid ${GT.purple20}`,
    boxShadow: '0 2px 12px rgba(79,45,127,0.06)',
    borderRadius: '1rem',
    padding: '1.5rem',
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-5" style={{ fontFamily: "'Nunito Sans', Arial, sans-serif" }}>
      <h1 className="text-2xl font-bold" style={{ color: GT.purple }}>Mi Perfil</h1>

      {/* Info del usuario */}
      <div style={cardStyle}>
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="lg" />
          <div>
            <h2 className="text-lg font-bold" style={{ color: GT.black }}>{user.name}</h2>
            <p className="text-sm" style={{ color: GT.purple60 }}>{user.email}</p>
            <span className={`inline-block mt-1 text-xs font-semibold rounded-full px-2.5 py-1 ${bg} ${text}`}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div style={cardStyle}>
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} style={{ color: GT.purple }} />
          <h3 className="text-base font-bold" style={{ color: GT.purple }}>Cambiar contraseña</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <PasswordField label="Contraseña actual" value={currentPassword} onChange={setCurrentPassword} required autoComplete="current-password" />
          <PasswordField label="Nueva contraseña" value={newPassword} onChange={setNewPassword} placeholder="Mínimo 8 caracteres" required autoComplete="new-password" />
          <PasswordField label="Confirmar nueva contraseña" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repite la nueva contraseña" required autoComplete="new-password" />

          {error && <AlertBox type="error" message={error} />}
          {success && <AlertBox type="success" message={success} />}

          <button
            type="submit"
            disabled={saving}
            className="w-full font-bold py-3 rounded-xl text-sm transition-all"
            style={{
              backgroundColor: saving ? GT.purple60 : GT.purple,
              color: GT.white,
              opacity: saving ? 0.7 : 1,
              fontFamily: "'Nunito Sans', Arial, sans-serif",
            }}
            onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple80 }}
            onMouseLeave={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple }}
          >
            {saving ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>

      {/* Cerrar sesión */}
      <div style={cardStyle}>
        <h3 className="text-base font-bold mb-3" style={{ color: GT.purple }}>Sesión</h3>
        {!showLogoutConfirm ? (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl text-sm transition-all"
            style={{
              border: `2px solid ${GT.red}`,
              color: GT.red,
              backgroundColor: 'transparent',
              fontFamily: "'Nunito Sans', Arial, sans-serif",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FFF5F7' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        ) : (
          <div className="rounded-xl p-4 space-y-3" style={{ border: `1px solid ${GT.red}`, backgroundColor: '#FFF5F7' }}>
            <p className="text-sm font-semibold" style={{ color: GT.black }}>¿Estás seguro de que deseas cerrar sesión?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all"
                style={{ border: `1px solid ${GT.purple40}`, backgroundColor: GT.white, color: GT.purple }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple20 }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = GT.white }}
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: GT.red }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#B0001F' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = GT.red }}
              >
                Sí, salir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
