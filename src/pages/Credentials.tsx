import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCredentials } from '../context/CredentialsContext'
import { CategoryBadge, EmptyState } from '../components/ui'
import { Search, Plus, Key, Globe, ChevronRight, Upload, Download } from 'lucide-react'
import { CredentialCategory } from '../types'
import CsvImport from '../components/CsvImport'

const GT = {
  purple:   '#4F2D7F',
  purple80: '#72579A',
  purple60: '#9581B2',
  purple40: '#B9ABCC',
  purple20: '#DCD5E5',
  teal:     '#00A7B5',
  teal20:   '#CCF0F3',
  white:    '#FFFFFF',
  black:    '#000000',
  warmGrey: '#CBC4BC',
}

const CATEGORIES: { value: CredentialCategory | 'all'; label: string }[] = [
  { value: 'all',   label: 'Todas' },
  { value: 'web',   label: 'Sitios Web' },
  { value: 'app',   label: 'Aplicaciones' },
  { value: 'other', label: 'Otros' },
]

export default function Credentials() {
  const { user } = useAuth()
  const { credentials, importBulk } = useCredentials()
  const [showCsvImport, setShowCsvImport] = useState(false)
  const [importSuccess, setImportSuccess] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CredentialCategory | 'all'>('all')

  const canEdit = user?.role === 'coordinator' || user?.role === 'superadmin'

  async function handleImport(items: Parameters<typeof importBulk>[0]) {
    const count = await importBulk(items)
    setImportSuccess(count)
    setTimeout(() => setImportSuccess(null), 4000)
  }

  const base = user?.role === 'assistant'
    ? credentials.filter((c) => c.assignedUserId === user.id)
    : credentials

  const filtered = useMemo(() => {
    return base.filter((c) => {
      const matchSearch =
        !search ||
        c.siteName.toLowerCase().includes(search.toLowerCase()) ||
        c.username.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === 'all' || c.category === category
      return matchSearch && matchCat
    })
  }, [base, search, category])

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5" style={{ fontFamily: "'Nunito Sans', Arial, sans-serif" }}>

      {/* Modal de importación CSV */}
      {showCsvImport && user && (
        <CsvImport
          currentUserId={user.id}
          onClose={() => setShowCsvImport(false)}
          onImport={handleImport}
        />
      )}

      {/* Notificación de importación exitosa */}
      {importSuccess !== null && (
        <div
          className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold"
          style={{ backgroundColor: '#00A7B5' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          {importSuccess} credencial{importSuccess !== 1 ? 'es' : ''} importada{importSuccess !== 1 ? 's' : ''} correctamente
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: GT.purple }}>Credenciales</h1>
          <p className="text-sm mt-0.5" style={{ color: GT.purple60 }}>
            {base.length} credencial{base.length !== 1 ? 'es' : ''} en total
          </p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCsvImport(true)}
              className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl border transition-all"
              style={{ borderColor: GT.purple, color: GT.purple, backgroundColor: GT.white }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple20 }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = GT.white }}
            >
              <Upload size={16} />
              Importar CSV
            </button>
            <Link
              to="/credentials/new"
              className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
              style={{ backgroundColor: GT.purple, color: GT.white, textDecoration: 'none' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple80 }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple }}
            >
              <Plus size={16} />
              Nueva credencial
            </Link>
          </div>
        )}
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div
          className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 transition-all"
          style={{ border: `1.5px solid ${GT.purple40}` }}
          onFocusCapture={(e) => { (e.currentTarget as HTMLElement).style.borderColor = GT.purple; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 3px ${GT.purple20}` }}
          onBlurCapture={(e) => { (e.currentTarget as HTMLElement).style.borderColor = GT.purple40; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
        >
          <Search size={16} style={{ color: GT.purple60 }} className="shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o usuario..."
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: GT.black, fontFamily: "'Nunito Sans', Arial, sans-serif" }}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className="px-3 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: category === cat.value ? GT.purple : GT.white,
                color: category === cat.value ? GT.white : GT.purple,
                border: `1.5px solid ${category === cat.value ? GT.purple : GT.purple40}`,
                fontFamily: "'Nunito Sans', Arial, sans-serif",
              }}
              onMouseEnter={(e) => {
                if (category !== cat.value) {
                  (e.currentTarget as HTMLElement).style.borderColor = GT.purple
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = GT.purple20
                }
              }}
              onMouseLeave={(e) => {
                if (category !== cat.value) {
                  (e.currentTarget as HTMLElement).style.borderColor = GT.purple40
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = GT.white
                }
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${GT.purple20}`, boxShadow: '0 2px 12px rgba(79,45,127,0.06)' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Key />}
            title="No se encontraron credenciales"
            description={search ? 'Intenta con otro término de búsqueda' : 'Agrega la primera credencial con el botón de arriba'}
          />
        ) : (
          <div>
            {filtered.map((cred, idx) => (
              <Link
                key={cred.id}
                to={`/credentials/${cred.id}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors"
                style={{
                  borderBottom: idx < filtered.length - 1 ? `1px solid ${GT.purple20}` : 'none',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F9F8FB' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: GT.purple20 }}>
                  <Globe size={20} style={{ color: GT.purple }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: GT.black }}>{cred.siteName}</p>
                  <p className="text-xs truncate" style={{ color: GT.purple60 }}>{cred.username}</p>
                  {cred.url && (
                    <p className="text-xs truncate" style={{ color: GT.teal }}>{cred.url}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <CategoryBadge category={cred.category} />
                  <ChevronRight size={16} style={{ color: GT.purple40 }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
