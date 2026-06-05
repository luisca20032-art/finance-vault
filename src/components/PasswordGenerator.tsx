import React, { useState, useCallback } from 'react'
import { RefreshCw, Copy, Check, X, Shield, Eye, EyeOff } from 'lucide-react'

interface PasswordGeneratorProps {
  onClose: () => void
  onUsePassword?: (password: string) => void
}

interface Options {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

function generatePassword(options: Options): string {
  let charset = ''
  if (options.uppercase) charset += UPPERCASE
  if (options.lowercase) charset += LOWERCASE
  if (options.numbers) charset += NUMBERS
  if (options.symbols) charset += SYMBOLS

  if (!charset) return ''

  // Garantizar al menos un carácter de cada tipo seleccionado
  let password = ''
  const required: string[] = []
  if (options.uppercase) required.push(UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)])
  if (options.lowercase) required.push(LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)])
  if (options.numbers) required.push(NUMBERS[Math.floor(Math.random() * NUMBERS.length)])
  if (options.symbols) required.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])

  // Rellenar el resto de forma aleatoria
  for (let i = required.length; i < options.length; i++) {
    required.push(charset[Math.floor(Math.random() * charset.length)])
  }

  // Mezclar el array para que los caracteres requeridos no estén siempre al inicio
  for (let i = required.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [required[i], required[j]] = [required[j], required[i]]
  }

  password = required.slice(0, options.length).join('')
  return password
}

interface StrengthResult {
  score: number // 0-4
  label: string
  color: string
  bgColor: string
  barColor: string
  tips: string[]
}

function evaluateStrength(password: string, options: Options): StrengthResult {
  if (!password) return { score: 0, label: '', color: '', bgColor: '', barColor: '', tips: [] }

  let score = 0
  const tips: string[] = []

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length >= 16) score++

  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)

  const typesCount = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length
  if (typesCount >= 3) score++
  if (typesCount === 4) score++

  if (!hasUpper) tips.push('Agrega letras mayúsculas')
  if (!hasNumber) tips.push('Incluye números')
  if (!hasSymbol) tips.push('Añade símbolos especiales (!@#$)')
  if (password.length < 12) tips.push('Usa al menos 12 caracteres')

  const capped = Math.min(score, 4)

  const levels = [
    { label: 'Muy débil', color: '#DE002E', bgColor: '#FFF0F0', barColor: '#DE002E' },
    { label: 'Débil',     color: '#FF7D1E', bgColor: '#FFF5EE', barColor: '#FF7D1E' },
    { label: 'Media',     color: '#F5A623', bgColor: '#FFFBEE', barColor: '#F5A623' },
    { label: 'Fuerte',    color: '#9BD732', bgColor: '#F5FFEE', barColor: '#9BD732' },
    { label: 'Muy fuerte',color: '#00A7B5', bgColor: '#EEFBFC', barColor: '#00A7B5' },
  ]

  return { score: capped, ...levels[capped], tips }
}

export function PasswordGenerator({ onClose, onUsePassword }: PasswordGeneratorProps) {
  const [options, setOptions] = useState<Options>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  })
  const [password, setPassword] = useState<string>(() =>
    generatePassword({ length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true })
  )
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(true)

  const strength = evaluateStrength(password, options)

  const regenerate = useCallback(() => {
    setPassword(generatePassword(options))
    setCopied(false)
  }, [options])

  const handleOptionChange = (key: keyof Options, value: boolean | number) => {
    // Evitar que todos los tipos de caracteres queden desactivados
    if (typeof value === 'boolean' && !value) {
      const newOpts = { ...options, [key]: value }
      const anyActive = newOpts.uppercase || newOpts.lowercase || newOpts.numbers || newOpts.symbols
      if (!anyActive) return
    }
    const newOpts = { ...options, [key]: value }
    setOptions(newOpts)
    setPassword(generatePassword(newOpts))
    setCopied(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleUse = () => {
    if (onUsePassword) onUsePassword(password)
    onClose()
  }

  const strengthPercent = ((strength.score) / 4) * 100

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff', borderRadius: 12, width: 480, maxWidth: '95vw',
        boxShadow: '0 20px 60px rgba(79,45,127,0.18)',
        overflow: 'hidden', fontFamily: "'Nunito Sans', Arial, sans-serif"
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4F2D7F, #2D1A4F)',
          padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={22} color="#00A7B5" />
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Generador de Contraseñas</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Crea claves seguras al instante</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6,
              padding: '6px 8px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Contraseña generada */}
          <div style={{
            background: '#F5F3FF', borderRadius: 8, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
            border: '2px solid #E8E0FF'
          }}>
            <div style={{
              flex: 1, fontFamily: 'monospace', fontSize: 18, fontWeight: 700,
              color: '#4F2D7F', letterSpacing: 1, wordBreak: 'break-all',
              filter: showPassword ? 'none' : 'blur(6px)', userSelect: showPassword ? 'text' : 'none'
            }}>
              {password || '—'}
            </div>
            <button
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Ocultar' : 'Mostrar'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4F2D7F', padding: 4 }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <button
              onClick={regenerate}
              title="Generar nueva contraseña"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4F2D7F', padding: 4 }}
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={handleCopy}
              title="Copiar al portapapeles"
              style={{
                background: copied ? '#9BD732' : '#4F2D7F', border: 'none', borderRadius: 6,
                padding: '6px 12px', cursor: 'pointer', color: '#fff',
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700,
                transition: 'background 0.2s'
              }}
            >
              {copied ? <><Check size={15} /> Copiada</> : <><Copy size={15} /> Copiar</>}
            </button>
          </div>

          {/* Indicador de fortaleza */}
          {password && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Fortaleza
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 800, color: strength.color,
                  background: strength.bgColor, padding: '2px 10px', borderRadius: 20
                }}>
                  {strength.label}
                </span>
              </div>
              {/* Barra de fortaleza */}
              <div style={{ background: '#E8E0FF', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  width: `${strengthPercent}%`,
                  background: strength.barColor,
                  transition: 'width 0.4s ease, background 0.4s ease'
                }} />
              </div>
              {/* Tips */}
              {strength.tips.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {strength.tips.map((tip, i) => (
                    <span key={i} style={{
                      fontSize: 11, color: '#888', background: '#F5F5F5',
                      borderRadius: 4, padding: '2px 8px'
                    }}>
                      ↑ {tip}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Longitud */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#4F2D7F' }}>Longitud</label>
              <span style={{
                fontSize: 13, fontWeight: 800, color: '#fff',
                background: '#4F2D7F', borderRadius: 6, padding: '1px 10px'
              }}>
                {options.length}
              </span>
            </div>
            <input
              type="range" min={8} max={32} value={options.length}
              onChange={(e) => handleOptionChange('length', parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#4F2D7F', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 11, color: '#aaa' }}>8 (mínimo)</span>
              <span style={{ fontSize: 11, color: '#aaa' }}>32 (máximo)</span>
            </div>
          </div>

          {/* Opciones de caracteres */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4F2D7F', marginBottom: 10 }}>
              Tipos de caracteres
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { key: 'uppercase', label: 'Mayúsculas', example: 'A–Z' },
                { key: 'lowercase', label: 'Minúsculas', example: 'a–z' },
                { key: 'numbers',   label: 'Números',    example: '0–9' },
                { key: 'symbols',   label: 'Símbolos',   example: '!@#$%' },
              ].map(({ key, label, example }) => {
                const checked = options[key as keyof Options] as boolean
                return (
                  <label
                    key={key}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                      background: checked ? '#F5F3FF' : '#FAFAFA',
                      border: `2px solid ${checked ? '#4F2D7F' : '#E5E7EB'}`,
                      transition: 'all 0.15s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => handleOptionChange(key as keyof Options, e.target.checked)}
                      style={{ accentColor: '#4F2D7F', width: 16, height: 16, cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: checked ? '#4F2D7F' : '#888' }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace' }}>{example}</div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={regenerate}
              style={{
                flex: 1, padding: '11px', borderRadius: 8, cursor: 'pointer',
                border: '2px solid #4F2D7F', background: '#fff',
                color: '#4F2D7F', fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: "'Nunito Sans', Arial, sans-serif"
              }}
            >
              <RefreshCw size={16} /> Nueva contraseña
            </button>
            {onUsePassword && (
              <button
                onClick={handleUse}
                style={{
                  flex: 1, padding: '11px', borderRadius: 8, cursor: 'pointer',
                  border: 'none', background: '#4F2D7F',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: "'Nunito Sans', Arial, sans-serif"
                }}
              >
                <Check size={16} /> Usar esta contraseña
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
