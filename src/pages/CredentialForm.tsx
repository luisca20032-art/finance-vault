import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCredentials } from '../context/CredentialsContext'
import { PasswordField, AlertBox } from '../components/ui'
import { ArrowLeft, Save } from 'lucide-react'
import { CredentialCategory } from '../types'

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

export default function CredentialForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id && id !== 'new'
  const navigate = useNavigate()
  const { user, users } = useAuth()
  const { addCredential, updateCredential, getCredentialById } = useCredentials()

  const [siteName, setSiteName] = useState('')
  const [url, setUrl] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [category, setCategory] = useState<CredentialCategory>('web')
  const [assignedUserId, setAssignedUserId] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit) {
      const cred = getCredentialById(id)
      if (cred) {
        setSiteName(cred.siteName)
        setUrl(cred.url ?? '')
        setUsername(cred.username)
        setPassword(cred.password)
        setCategory(cred.category)
        setAssignedUserId(cred.assignedUserId ?? '')
        setNotes(cred.notes ?? '')
      }
    }
  }, [id, isEdit, getCredentialById])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!siteName.trim()) { setError('El nombre del sitio es obligatorio'); return }
    if (!username.trim()) { setError('El usuario es obligatorio'); return }
    if (!password.trim()) { setError('La contraseña es obligatoria'); return }

    setSaving(true)
    try {
      if (isEdit) {
        await updateCredential(id!, {
          siteName: siteName.trim(), url: url.trim() || undefined,
          username: username.trim(), password, category,
          assignedUserId: assignedUserId || undefined, notes: notes.trim() || undefined,
        })
      } else {
        await addCredential({
          siteName: siteName.trim(), url: url.trim() || undefined,
          username: username.trim(), password, category,
          assignedUserId: assignedUserId || undefined, notes: notes.trim() || undefined,
          createdBy: user?.id ?? '',
        })
      }
      navigate('/credentials')
    } catch {
      setError('Ocurrió un error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const activeUsers = users.filter((u) => u.active)

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = GT.purple
    e.currentTarget.style.boxShadow = `0 0 0 3px ${GT.purple20}`
  }
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = GT.purple40
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5" style={{ fontFamily: "'Nunito Sans', Arial, sans-serif" }}>

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
          {isEdit ? 'Editar credencial' : 'Nueva credencial'}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 space-y-4"
        style={{ border: `1px solid ${GT.purple20}`, boxShadow: '0 2px 12px rgba(79,45,127,0.06)' }}
      >
        {/* Nombre del sitio */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: GT.black }}>
            Nombre del sitio <span style={{ color: GT.red }}>*</span>
          </label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Ej: Microsoft 365, QuickBooks..."
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        {/* URL */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: GT.black }}>URL (opcional)</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        {/* Usuario */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: GT.black }}>
            Usuario / Correo <span style={{ color: GT.red }}>*</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="usuario@empresa.com"
            autoComplete="off"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        {/* Contraseña */}
        <PasswordField label="Contraseña" value={password} onChange={setPassword} required autoComplete="new-password" />

        {/* Categoría */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: GT.black }}>Categoría</label>
          <div className="flex gap-2">
            {(['web', 'app', 'other'] as CredentialCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  backgroundColor: category === cat ? GT.purple : GT.white,
                  color: category === cat ? GT.white : GT.purple,
                  border: `1.5px solid ${category === cat ? GT.purple : GT.purple40}`,
                }}
                onMouseEnter={(e) => { if (category !== cat) { (e.currentTarget as HTMLElement).style.borderColor = GT.purple; (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple20 } }}
                onMouseLeave={(e) => { if (category !== cat) { (e.currentTarget as HTMLElement).style.borderColor = GT.purple40; (e.currentTarget as HTMLElement).style.backgroundColor = GT.white } }}
              >
                {cat === 'web' ? 'Sitio Web' : cat === 'app' ? 'Aplicación' : 'Otro'}
              </button>
            ))}
          </div>
        </div>

        {/* Asignar a */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: GT.black }}>Asignar a (opcional)</label>
          <select
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          >
            <option value="">Sin asignar</option>
            {activeUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        {/* Notas */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: GT.black }}>Notas (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Licencia empresarial, fecha de vencimiento..."
            rows={3}
            style={{ ...inputStyle, resize: 'none' }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
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
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear credencial'}
        </button>
      </form>
    </div>
  )
}
