import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCredentials } from '../context/CredentialsContext'
import { CategoryBadge, CopyButton, ConfirmInline } from '../components/ui'
import { ArrowLeft, Edit2, Globe, Eye, EyeOff, Trash2, ExternalLink } from 'lucide-react'

const GT = {
  purple:   '#4F2D7F',
  purple80: '#72579A',
  purple60: '#9581B2',
  purple40: '#B9ABCC',
  purple20: '#DCD5E5',
  teal:     '#00A7B5',
  teal20:   '#CCF0F3',
  red:      '#DE002E',
  white:    '#FFFFFF',
  black:    '#000000',
  warmGrey: '#CBC4BC',
}

export default function CredentialDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, users } = useAuth()
  const { getCredentialById, deleteCredential } = useCredentials()
  const [showPassword, setShowPassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const credential = getCredentialById(id ?? '')
  const canEdit = user?.role === 'coordinator' || user?.role === 'superadmin'

  if (!credential) {
    return (
      <div className="p-6 text-center" style={{ color: GT.purple60 }}>
        <p className="text-lg font-bold" style={{ color: GT.purple }}>Credencial no encontrada</p>
        <Link to="/credentials" className="text-sm mt-2 inline-block" style={{ color: GT.teal }}>
          ← Volver a credenciales
        </Link>
      </div>
    )
  }

  const assignedUser = users.find((u) => u.id === credential.assignedUserId)

  async function handleDelete() {
    await deleteCredential(credential!.id)
    navigate('/credentials')
  }

  const fieldStyle = {
    backgroundColor: '#F9F8FB',
    border: `1px solid ${GT.purple20}`,
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
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
        <h1 className="text-xl font-bold flex-1" style={{ color: GT.purple }}>Detalle de credencial</h1>
        {canEdit && (
          <Link
            to={`/credentials/${credential.id}/edit`}
            className="flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl transition-colors"
            style={{ backgroundColor: GT.purple20, color: GT.purple, textDecoration: 'none' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple40 }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple20 }}
          >
            <Edit2 size={15} />
            Editar
          </Link>
        )}
      </div>

      {/* Tarjeta principal */}
      <div className="bg-white rounded-2xl p-6 space-y-4" style={{ border: `1px solid ${GT.purple20}`, boxShadow: '0 2px 12px rgba(79,45,127,0.06)' }}>

        {/* Icono y nombre */}
        <div className="flex items-center gap-4 pb-4" style={{ borderBottom: `1px solid ${GT.purple20}` }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: GT.purple20 }}>
            <Globe size={28} style={{ color: GT.purple }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold" style={{ color: GT.black }}>{credential.siteName}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <CategoryBadge category={credential.category} />
              {credential.url && (
                <a
                  href={credential.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: GT.teal }}
                >
                  <ExternalLink size={12} />
                  Abrir sitio
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Usuario */}
        <div className="flex items-center justify-between" style={fieldStyle}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: GT.purple60 }}>Usuario / Correo</p>
            <p className="text-sm font-semibold" style={{ color: GT.black }}>{credential.username}</p>
          </div>
          <CopyButton value={credential.username} label="usuario" />
        </div>

        {/* Contraseña */}
        <div className="flex items-center justify-between" style={fieldStyle}>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: GT.purple60 }}>Contraseña</p>
            <p className="text-sm font-semibold font-mono tracking-wider" style={{ color: GT.black }}>
              {showPassword ? credential.password : '••••••••••••'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-1.5 rounded-md transition-colors"
              style={{ color: GT.purple60 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = GT.purple; (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple20 }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = GT.purple60; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            <CopyButton value={credential.password} label="contraseña" />
          </div>
        </div>

        {/* URL */}
        {credential.url && (
          <div style={fieldStyle}>
            <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: GT.purple60 }}>URL</p>
            <p className="text-sm truncate" style={{ color: GT.teal }}>{credential.url}</p>
          </div>
        )}

        {/* Asignado a */}
        {assignedUser && (
          <div style={fieldStyle}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: GT.purple60 }}>Asignado a</p>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: GT.purple }}
              >
                {assignedUser.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
              </div>
              <p className="text-sm font-semibold" style={{ color: GT.black }}>{assignedUser.name}</p>
            </div>
          </div>
        )}

        {/* Notas */}
        {credential.notes && (
          <div style={fieldStyle}>
            <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: GT.purple60 }}>Notas</p>
            <p className="text-sm" style={{ color: GT.black }}>{credential.notes}</p>
          </div>
        )}

        {/* Fecha */}
        <p className="text-xs text-center" style={{ color: GT.warmGrey }}>
          Última actualización: {new Date(credential.updatedAt).toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Eliminar */}
      {canEdit && (
        <div>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl text-sm transition-all"
              style={{ border: `2px solid ${GT.red}`, color: GT.red, backgroundColor: 'transparent' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FFF5F7' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              <Trash2 size={16} />
              Eliminar credencial
            </button>
          ) : (
            <ConfirmInline
              message={`¿Eliminar "${credential.siteName}"? Esta acción no se puede deshacer.`}
              confirmLabel="Sí, eliminar"
              onConfirm={handleDelete}
              onCancel={() => setShowDeleteConfirm(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}
