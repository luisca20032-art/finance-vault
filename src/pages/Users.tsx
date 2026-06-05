import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { RoleBadge, Avatar, ConfirmInline, EmptyState } from '../components/ui'
import { Plus, Users as UsersIcon, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

const GT = {
  purple:   '#4F2D7F',
  purple80: '#72579A',
  purple60: '#9581B2',
  purple40: '#B9ABCC',
  purple20: '#DCD5E5',
  teal:     '#00A7B5',
  green:    '#9BD732',
  orange:   '#FF7D1E',
  red:      '#DE002E',
  white:    '#FFFFFF',
  black:    '#000000',
  warmGrey: '#CBC4BC',
  teal20:   '#CCF0F3',
}

export default function Users() {
  const { users, deleteUser, updateUser } = useAuth()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmToggleId, setConfirmToggleId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    await deleteUser(id)
    setConfirmDeleteId(null)
  }

  async function handleToggle(id: string, active: boolean) {
    await updateUser(id, { active: !active })
    setConfirmToggleId(null)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5" style={{ fontFamily: "'Nunito Sans', Arial, sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: GT.purple }}>Usuarios</h1>
          <p className="text-sm mt-0.5" style={{ color: GT.purple60 }}>
            {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/users/new"
          className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
          style={{ backgroundColor: GT.purple, color: GT.white, textDecoration: 'none' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple80 }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple }}
        >
          <Plus size={16} />
          Nuevo usuario
        </Link>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${GT.purple20}`, boxShadow: '0 2px 12px rgba(79,45,127,0.06)' }}>
        {users.length === 0 ? (
          <EmptyState icon={<UsersIcon />} title="No hay usuarios" description="Agrega el primer usuario con el botón de arriba" />
        ) : (
          <div>
            {users.map((u, idx) => (
              <div key={u.id} style={{ borderBottom: idx < users.length - 1 ? `1px solid ${GT.purple20}` : 'none' }}>
                <div className="flex items-center gap-4 px-5 py-4">
                  <Avatar name={u.name} active={u.active} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold" style={{ color: GT.black }}>{u.name}</p>
                      {!u.active && (
                        <span className="text-xs rounded-full px-2 py-0.5 font-semibold" style={{ backgroundColor: GT.purple20, color: GT.purple60 }}>
                          Inactivo
                        </span>
                      )}
                    </div>
                    <p className="text-xs truncate" style={{ color: GT.purple60 }}>{u.email}</p>
                    <div className="mt-1">
                      <RoleBadge role={u.role} size="sm" />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Editar */}
                    <Link
                      to={`/users/${u.id}/edit`}
                      className="p-2 rounded-xl transition-colors"
                      title="Editar"
                      style={{ color: GT.purple60, textDecoration: 'none' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = GT.purple; (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple20 }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = GT.purple60; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                    >
                      <Pencil size={16} />
                    </Link>

                    {/* Activar/Desactivar */}
                    <button
                      onClick={() => setConfirmToggleId(confirmToggleId === u.id ? null : u.id)}
                      className="p-2 rounded-xl transition-colors"
                      title={u.active ? 'Desactivar' : 'Activar'}
                      style={{ color: u.active ? GT.teal : GT.warmGrey }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = u.active ? GT.teal20 : GT.purple20 }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                    >
                      {u.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>

                    {/* Eliminar */}
                    <button
                      onClick={() => setConfirmDeleteId(confirmDeleteId === u.id ? null : u.id)}
                      className="p-2 rounded-xl transition-colors"
                      title="Eliminar"
                      style={{ color: GT.purple40 }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = GT.red; (e.currentTarget as HTMLElement).style.backgroundColor = '#FFF5F7' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = GT.purple40; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Confirmación activar/desactivar */}
                {confirmToggleId === u.id && (
                  <div className="px-5 pb-4">
                    <ConfirmInline
                      message={u.active ? `¿Desactivar a "${u.name}"? No podrá iniciar sesión.` : `¿Activar a "${u.name}"?`}
                      confirmLabel={u.active ? 'Sí, desactivar' : 'Sí, activar'}
                      confirmClass={u.active ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}
                      onConfirm={() => handleToggle(u.id, u.active)}
                      onCancel={() => setConfirmToggleId(null)}
                    />
                  </div>
                )}

                {/* Confirmación eliminar */}
                {confirmDeleteId === u.id && (
                  <div className="px-5 pb-4">
                    <ConfirmInline
                      message={`¿Eliminar a "${u.name}"? Esta acción no se puede deshacer.`}
                      confirmLabel="Sí, eliminar"
                      onConfirm={() => handleDelete(u.id)}
                      onCancel={() => setConfirmDeleteId(null)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
