import React, { useState, useRef } from 'react'
import { X, Download, Upload, AlertCircle, CheckCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { Credential, CredentialCategory } from '../types'

// ─── Paleta GT ────────────────────────────────────────────────────────────────
const GT = {
  purple:   '#4F2D7F',
  purple80: '#7257A0',
  purple20: '#DCD5E5',
  teal:     '#00A7B5',
  teal10:   '#E5F7F8',
  red:      '#DE002E',
  red10:    '#FDEAEE',
  white:    '#FFFFFF',
  warmGrey: '#CBC4BC',
  grey50:   '#F9F8F7',
  grey100:  '#F0EDE9',
}

// ─── Etiquetas de categoría ───────────────────────────────────────────────────
const CATEGORY_LABELS: Record<CredentialCategory, string> = {
  web:   'Sitio Web',
  app:   'Aplicación',
  other: 'Otro',
}

// ─── Mapa de normalización de categorías ─────────────────────────────────────
const CATEGORY_MAP: Record<string, CredentialCategory> = {
  web: 'web',
  sitio_web: 'web',
  sitio: 'web',
  website: 'web',
  web_subscription: 'web',
  suscripcion_web: 'web',
  app: 'app',
  aplicacion: 'app',
  aplicación: 'app',
  third_party_app: 'app',
  app_terceros: 'app',
  other: 'other',
  otro: 'other',
  otros: 'other',
  internal_system: 'other',
  sistema_interno: 'other',
  social_media: 'other',
  redes_sociales: 'other',
  email: 'other',
  correo: 'other',
}

// ─── Tipos internos ───────────────────────────────────────────────────────────
interface ParsedRow {
  rowNumber: number
  data: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>
  errors: string[]
  valid: boolean
}

interface CsvImportProps {
  currentUserId: string
  onClose: () => void
  onImport: (credentials: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>[]) => void
}

// ─── Descarga de plantilla ────────────────────────────────────────────────────
function downloadTemplate() {
  const header = 'nombre_sitio,url,usuario,contrasena,categoria,notas'
  const rows = [
    'Microsoft 365,https://office.com,admin@empresa.com,MiClave2024!,web,Licencia anual — renovar en diciembre',
    'QuickBooks,https://quickbooks.intuit.com,finanzas@empresa.com,QB_Seguro#99,app,Plan Plus',
    'Dropbox Business,https://dropbox.com,storage@empresa.com,Drop2024$Box,web,Almacenamiento compartido',
  ]
  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plantilla_credenciales_financevault.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Parser CSV ───────────────────────────────────────────────────────────────
function normalize(s: string) {
  return s.trim().toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i').replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u').replace(/[ñ]/g, 'n')
}

function parseCSV(text: string, createdBy: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '')
  if (lines.length < 2) return []

  const sep = lines[0].includes(';') ? ';' : ','
  const rawHeaders = lines[0].split(sep).map(h => normalize(h.replace(/^["']|["']$/g, '')))

  const get = (values: string[], col: string): string => {
    const idx = rawHeaders.indexOf(col)
    return idx >= 0 ? (values[idx] || '').trim().replace(/^["']|["']$/g, '') : ''
  }

  return lines.slice(1).map((line, i) => {
    const values = line.split(sep)
    const errors: string[] = []

    const siteName = get(values, 'nombre_sitio') || get(values, 'nombre') || get(values, 'sitio') || get(values, 'name')
    const url      = get(values, 'url') || get(values, 'enlace') || get(values, 'link')
    const username = get(values, 'usuario') || get(values, 'user') || get(values, 'email') || get(values, 'correo')
    const password = get(values, 'contrasena') || get(values, 'contraseña') || get(values, 'password') || get(values, 'clave')
    const catRaw   = normalize(get(values, 'categoria') || get(values, 'category') || 'other')
    const notes    = get(values, 'notas') || get(values, 'notes') || get(values, 'nota')

    if (!siteName)  errors.push('Nombre del sitio es obligatorio')
    if (!username)  errors.push('Usuario/email es obligatorio')
    if (!password)  errors.push('Contraseña es obligatoria')

    const category: CredentialCategory = CATEGORY_MAP[catRaw] ?? 'other'

    return {
      rowNumber: i + 2,
      data: {
        siteName,
        url:      url || undefined,
        username,
        password,
        category,
        notes:    notes || undefined,
        createdBy,
      },
      errors,
      valid: errors.length === 0,
    }
  })
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function CsvImport({ currentUserId, onClose, onImport }: CsvImportProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<'upload' | 'preview'>('upload')
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [dragging, setDragging] = useState(false)
  const [showErrors, setShowErrors] = useState(false)

  const validRows  = rows.filter(r => r.valid)
  const errorRows  = rows.filter(r => !r.valid)

  function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Por favor selecciona un archivo .csv')
      return
    }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      setRows(parseCSV(text, currentUserId))
      setStep('preview')
    }
    reader.readAsText(file, 'UTF-8')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleConfirm() {
    onImport(validRows.map(r => r.data))
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col"
        style={{ backgroundColor: GT.white }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: GT.purple20 }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: GT.purple20 }}>
              <FileText size={18} style={{ color: GT.purple }} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: GT.purple }}>Importar Credenciales</h2>
              <p className="text-xs" style={{ color: GT.purple80 }}>Carga masiva desde archivo CSV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ color: GT.purple80 }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = GT.purple20)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* PASO 1 — Subir */}
          {step === 'upload' && (
            <div className="flex flex-col gap-6">

              {/* Instrucción descargar plantilla */}
              <div className="rounded-xl p-5 border" style={{ backgroundColor: GT.teal10, borderColor: GT.teal }}>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm" style={{ backgroundColor: GT.teal }}>1</div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1" style={{ color: GT.purple }}>Descarga la plantilla CSV</h3>
                    <p className="text-sm mb-3" style={{ color: GT.purple80 }}>
                      Ábrela en Excel o Google Sheets, llena tus credenciales y guárdala como CSV.
                    </p>
                    <div className="text-xs font-mono rounded-lg px-3 py-2 mb-3" style={{ backgroundColor: GT.white, color: GT.purple80, border: `1px solid ${GT.warmGrey}` }}>
                      nombre_sitio · url · usuario · contrasena · categoria · notas
                    </div>
                    <p className="text-xs mb-3" style={{ color: GT.purple80 }}>
                      <strong>Categorías válidas:</strong>{' '}
                      {(['web', 'app', 'other'] as CredentialCategory[]).map(c => (
                        <span key={c} className="inline-block mr-1.5 px-1.5 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: GT.purple20, color: GT.purple }}>
                          {c}
                        </span>
                      ))}
                    </p>
                    <button
                      onClick={downloadTemplate}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                      style={{ backgroundColor: GT.teal }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      <Download size={15} />
                      Descargar plantilla
                    </button>
                  </div>
                </div>
              </div>

              {/* Zona de carga */}
              <div className="rounded-xl p-5 border" style={{ backgroundColor: GT.grey50, borderColor: GT.warmGrey }}>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm" style={{ backgroundColor: GT.purple }}>2</div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1" style={{ color: GT.purple }}>Sube tu archivo CSV completado</h3>
                    <p className="text-sm mb-4" style={{ color: GT.purple80 }}>
                      Arrastra el archivo aquí o haz clic para seleccionarlo.
                    </p>
                    <div
                      className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
                      style={{
                        borderColor: dragging ? GT.teal : GT.warmGrey,
                        backgroundColor: dragging ? GT.teal10 : GT.white,
                      }}
                      onDragOver={e => { e.preventDefault(); setDragging(true) }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload size={32} className="mx-auto mb-3" style={{ color: dragging ? GT.teal : GT.warmGrey }} />
                      <p className="font-semibold text-sm" style={{ color: GT.purple }}>
                        {dragging ? 'Suelta el archivo aquí' : 'Arrastra tu CSV o haz clic para seleccionar'}
                      </p>
                      <p className="text-xs mt-1" style={{ color: GT.purple80 }}>Solo archivos .csv · Separador: coma o punto y coma</p>
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2 — Previsualización */}
          {step === 'preview' && (
            <div className="flex flex-col gap-4">
              {/* Resumen */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold" style={{ color: GT.purple }}>
                  Archivo: <span style={{ color: GT.purple80 }}>{fileName}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: GT.teal }}>
                  <CheckCircle size={14} />
                  {validRows.length} listas para importar
                </span>
                {errorRows.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: GT.red }}>
                    <AlertCircle size={14} />
                    {errorRows.length} con errores
                  </span>
                )}
              </div>

              {/* Errores colapsables */}
              {errorRows.length > 0 && (
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: GT.red }}>
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold"
                    style={{ backgroundColor: GT.red10, color: GT.red }}
                    onClick={() => setShowErrors(!showErrors)}
                  >
                    <span className="flex items-center gap-2">
                      <AlertCircle size={15} />
                      {errorRows.length} fila(s) con errores — no se importarán
                    </span>
                    {showErrors ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  {showErrors && (
                    <div>
                      {errorRows.map(row => (
                        <div key={row.rowNumber} className="px-4 py-2.5 text-xs border-t" style={{ color: GT.red, borderColor: GT.red + '30' }}>
                          <span className="font-semibold">Fila {row.rowNumber}:</span>{' '}
                          {row.errors.join(' · ')}
                          {row.data.siteName && <span style={{ color: GT.purple80 }}> — "{row.data.siteName}"</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tabla de previsualización */}
              {validRows.length > 0 ? (
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: GT.purple20 }}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ backgroundColor: GT.purple, color: GT.white }}>
                          <th className="px-4 py-3 text-left font-semibold text-xs">#</th>
                          <th className="px-4 py-3 text-left font-semibold text-xs">Sitio</th>
                          <th className="px-4 py-3 text-left font-semibold text-xs">Usuario</th>
                          <th className="px-4 py-3 text-left font-semibold text-xs">Categoría</th>
                          <th className="px-4 py-3 text-left font-semibold text-xs">URL</th>
                          <th className="px-4 py-3 text-left font-semibold text-xs">Notas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validRows.map((row, i) => (
                          <tr key={row.rowNumber} style={{ backgroundColor: i % 2 === 0 ? GT.white : GT.grey50 }}>
                            <td className="px-4 py-2.5 text-xs" style={{ color: GT.purple80 }}>{row.rowNumber}</td>
                            <td className="px-4 py-2.5 font-semibold" style={{ color: GT.purple }}>{row.data.siteName}</td>
                            <td className="px-4 py-2.5 text-xs" style={{ color: GT.purple80 }}>{row.data.username}</td>
                            <td className="px-4 py-2.5">
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: GT.purple20, color: GT.purple }}>
                                {CATEGORY_LABELS[row.data.category]}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-xs max-w-[140px] truncate" style={{ color: GT.teal }}>
                              {row.data.url || '—'}
                            </td>
                            <td className="px-4 py-2.5 text-xs max-w-[160px] truncate" style={{ color: GT.purple80 }}>
                              {row.data.notes || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <AlertCircle size={40} className="mx-auto mb-3" style={{ color: GT.red }} />
                  <p className="font-semibold" style={{ color: GT.purple }}>No hay filas válidas para importar</p>
                  <p className="text-sm mt-1" style={{ color: GT.purple80 }}>Revisa los errores y corrige el archivo CSV</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t gap-3" style={{ borderColor: GT.purple20, backgroundColor: GT.grey50 }}>
          {step === 'preview' && (
            <button
              className="text-sm font-semibold px-4 py-2 rounded-lg"
              style={{ color: GT.purple80 }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = GT.purple20)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              onClick={() => { setStep('upload'); setRows([]); setFileName('') }}
            >
              ← Volver
            </button>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="text-sm font-semibold px-4 py-2 rounded-lg border"
              style={{ borderColor: GT.warmGrey, color: GT.purple80 }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = GT.grey100)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Cancelar
            </button>
            {step === 'preview' && validRows.length > 0 && (
              <button
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: GT.purple }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <CheckCircle size={16} />
                Importar {validRows.length} credencial{validRows.length !== 1 ? 'es' : ''}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
