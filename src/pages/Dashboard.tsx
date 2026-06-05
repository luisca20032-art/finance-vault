import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCredentials } from '../context/CredentialsContext'
import { CategoryBadge } from '../components/ui'
import { Key, Globe, AppWindow, ChevronRight, Plus } from 'lucide-react'

const GT = {
  purple:   '#4F2D7F',
  purple80: '#72579A',
  purple60: '#9581B2',
  purple40: '#B9ABCC',
  purple20: '#DCD5E5',
  teal:     '#00A7B5',
  teal20:   '#CCF0F3',
  green:    '#9BD732',
  green20:  '#EBF8CC',
  white:    '#FFFFFF',
  black:    '#000000',
  warmGrey: '#CBC4BC',
}

export default function Dashboard() {
  const { user } = useAuth()
  const { credentials } = useCredentials()

  const canEdit = user?.role === 'coordinator' || user?.role === 'superadmin'

  const myCredentials = user?.role === 'assistant'
    ? credentials.filter((c) => c.assignedUserId === user.id)
    : credentials

  const webCount = myCredentials.filter((c) => c.category === 'web').length
  const appCount = myCredentials.filter((c) => c.category === 'app').length
  const recent = myCredentials.slice(0, 5)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6" style={{ fontFamily: "'Nunito Sans', Arial, sans-serif" }}>

      {/* Saludo */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: GT.purple }}>
          Bienvenido, {user?.name.split(' ')[0]}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: GT.purple60 }}>
          Aquí tienes un resumen de las credenciales del departamento
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total */}
        <div className="bg-white rounded-2xl p-5 flex flex-col gap-2" style={{ border: `1px solid ${GT.purple20}`, boxShadow: '0 2px 12px rgba(79,45,127,0.06)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: GT.purple20 }}>
            <Key size={20} style={{ color: GT.purple }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: GT.purple }}>{myCredentials.length}</p>
          <p className="text-sm" style={{ color: GT.black }}>Total credenciales</p>
        </div>

        {/* Sitios web */}
        <div className="bg-white rounded-2xl p-5 flex flex-col gap-2" style={{ border: `1px solid ${GT.teal20}`, boxShadow: '0 2px 12px rgba(0,167,181,0.06)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: GT.teal20 }}>
            <Globe size={20} style={{ color: GT.teal }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: GT.teal }}>{webCount}</p>
          <p className="text-sm" style={{ color: GT.black }}>Sitios Web</p>
        </div>

        {/* Aplicaciones */}
        <div className="bg-white rounded-2xl p-5 flex flex-col gap-2" style={{ border: `1px solid ${GT.green20}`, boxShadow: '0 2px 12px rgba(155,215,50,0.08)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: GT.green20 }}>
            <AppWindow size={20} style={{ color: '#5A8A00' }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: '#5A8A00' }}>{appCount}</p>
          <p className="text-sm" style={{ color: GT.black }}>Aplicaciones</p>
        </div>
      </div>

      {/* Credenciales recientes */}
      <div className="bg-white rounded-2xl" style={{ border: `1px solid ${GT.purple20}`, boxShadow: '0 2px 12px rgba(79,45,127,0.06)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: GT.purple20 }}>
          <h2 className="text-base font-bold" style={{ color: GT.purple }}>Credenciales recientes</h2>
          {canEdit && (
            <Link
              to="/credentials/new"
              className="flex items-center gap-1.5 text-sm font-bold transition-colors"
              style={{ color: GT.teal }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = GT.purple }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = GT.teal }}
            >
              <Plus size={16} />
              Nueva
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="py-12 text-center text-sm" style={{ color: GT.warmGrey }}>
            No hay credenciales aún
          </div>
        ) : (
          <div>
            {recent.map((cred, idx) => (
              <Link
                key={cred.id}
                to={`/credentials/${cred.id}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                style={{
                  borderBottom: idx < recent.length - 1 ? `1px solid ${GT.purple20}` : 'none',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F9F8FB' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: GT.purple20 }}>
                  <Globe size={18} style={{ color: GT.purple }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: GT.black }}>{cred.siteName}</p>
                  <p className="text-xs truncate" style={{ color: GT.purple60 }}>{cred.username}</p>
                </div>
                <CategoryBadge category={cred.category} />
                <ChevronRight size={16} style={{ color: GT.purple40 }} className="shrink-0" />
              </Link>
            ))}
          </div>
        )}

        {myCredentials.length > 5 && (
          <div className="px-5 py-3 border-t" style={{ borderColor: GT.purple20 }}>
            <Link
              to="/credentials"
              className="text-sm font-bold transition-colors"
              style={{ color: GT.teal }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = GT.purple }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = GT.teal }}
            >
              Ver todas ({myCredentials.length}) →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
