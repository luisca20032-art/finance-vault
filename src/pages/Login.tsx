import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react'

const GT = {
  purple:    '#4F2D7F',
  purple80:  '#72579A',
  purple60:  '#9581B2',
  purple40:  '#B9ABCC',
  purple20:  '#DCD5E5',
  teal:      '#00A7B5',
  red:       '#DE002E',
  warmGrey:  '#CBC4BC',
  white:     '#FFFFFF',
  black:     '#000000',
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Completa todos los campos')
      return
    }
    setLoading(true)
    const ok = await login(email.trim(), password)
    setLoading(false)
    if (ok) {
      navigate('/dashboard')
    } else {
      setError('Correo o contraseña incorrectos, o usuario inactivo')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: `linear-gradient(135deg, ${GT.purple20} 0%, ${GT.white} 50%, #F0EEF6 100%)`, fontFamily: "'Nunito Sans', Arial, sans-serif" }}
    >
      <div className="w-full max-w-md">

        {/* Encabezado con identidad GT */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4"
            style={{ backgroundColor: GT.purple }}
          >
            <ShieldCheck size={32} color={GT.white} />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: GT.purple }}>FinanceVault</h1>
          <p className="text-sm mt-1" style={{ color: GT.purple60 }}>
            Gestor de Credenciales — Departamento de Finanzas
          </p>
          {/* Línea decorativa GT */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="h-0.5 w-8 rounded" style={{ backgroundColor: GT.purple }} />
            <div className="h-0.5 w-3 rounded" style={{ backgroundColor: GT.teal }} />
          </div>
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-2xl p-8"
          style={{ border: `1px solid ${GT.purple20}`, boxShadow: '0 4px 24px rgba(79,45,127,0.08)' }}
        >
          <h2 className="text-lg font-bold mb-6" style={{ color: GT.purple }}>
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Correo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: GT.black }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="correo@empresa.com"
                autoComplete="email"
                autoFocus
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                style={{
                  border: `1.5px solid ${GT.purple40}`,
                  color: GT.black,
                  fontFamily: "'Nunito Sans', Arial, sans-serif",
                }}
                onFocus={(e) => { e.target.style.borderColor = GT.purple; e.target.style.boxShadow = `0 0 0 3px ${GT.purple20}` }}
                onBlur={(e) => { e.target.style.borderColor = GT.purple40; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: GT.black }}>
                Contraseña
              </label>
              <div
                className="flex items-center rounded-lg bg-white overflow-hidden transition-all"
                style={{ border: `1.5px solid ${GT.purple40}` }}
                onFocusCapture={(e) => { (e.currentTarget as HTMLElement).style.borderColor = GT.purple; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 3px ${GT.purple20}` }}
                onBlurCapture={(e) => { (e.currentTarget as HTMLElement).style.borderColor = GT.purple40; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
              >
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none"
                  style={{ color: GT.black, fontFamily: "'Nunito Sans', Arial, sans-serif" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 transition-colors"
                  style={{ color: GT.purple60 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = GT.purple }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = GT.purple60 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm"
                style={{ backgroundColor: '#FFF5F7', border: `1px solid ${GT.red}`, color: GT.red }}
              >
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Botón principal GT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-2.5 rounded-lg text-sm transition-all mt-2"
              style={{
                backgroundColor: loading ? GT.purple60 : GT.purple,
                color: GT.white,
                fontFamily: "'Nunito Sans', Arial, sans-serif",
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple80 }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple }}
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: GT.purple60 }}>
          FinanceVault v1.0 · Uso interno — Grant Thornton
        </p>
      </div>
    </div>
  )
}
