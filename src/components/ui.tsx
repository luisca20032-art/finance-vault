import React, { useState } from 'react'
import { UserRole, CredentialCategory } from '../types'
import { ROLE_LABELS, ROLE_COLORS } from '../context/AuthContext'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../context/CredentialsContext'
import { Eye, EyeOff, Copy, Check, AlertCircle, CheckCircle } from 'lucide-react'

const GT = {
  purple:   '#4F2D7F',
  purple80: '#72579A',
  purple60: '#9581B2',
  purple40: '#B9ABCC',
  purple20: '#DCD5E5',
  teal:     '#00A7B5',
  teal20:   '#CCF0F3',
  green:    '#9BD732',
  red:      '#DE002E',
  white:    '#FFFFFF',
  black:    '#000000',
  warmGrey: '#CBC4BC',
}

// RoleBadge
export function RoleBadge({ role, size = 'md' }: { role: UserRole; size?: 'sm' | 'md' }) {
  const { bg, text } = ROLE_COLORS[role]
  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${bg} ${text} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      {ROLE_LABELS[role]}
    </span>
  )
}

// CategoryBadge
export function CategoryBadge({ category }: { category: CredentialCategory }) {
  const color = CATEGORY_COLORS[category]
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: color + '18', color }}
    >
      {CATEGORY_LABELS[category]}
    </span>
  )
}

// PasswordField
export function PasswordField({
  label, value, onChange, placeholder = '••••••••', required = false, autoComplete,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; required?: boolean; autoComplete?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: GT.black }}>
        {label}{required && <span style={{ color: GT.red }} className="ml-0.5">*</span>}
      </label>
      <div
        className="flex items-center bg-white overflow-hidden rounded-lg transition-all"
        style={{ border: `1.5px solid ${GT.purple40}` }}
        onFocusCapture={(e) => { (e.currentTarget as HTMLElement).style.borderColor = GT.purple; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 3px ${GT.purple20}` }}
        onBlurCapture={(e) => { (e.currentTarget as HTMLElement).style.borderColor = GT.purple40; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
      >
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none"
          style={{ color: GT.black, fontFamily: "'Nunito Sans', Arial, sans-serif" }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="px-3 transition-colors"
          style={{ color: GT.purple60 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = GT.purple }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = GT.purple60 }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}

// CopyButton
export function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      title={`Copiar ${label ?? ''}`}
      className="p-1.5 rounded-md transition-colors"
      style={{ color: GT.purple60 }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = GT.teal; (e.currentTarget as HTMLElement).style.backgroundColor = GT.teal20 }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = GT.purple60; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
    >
      {copied ? <Check size={15} style={{ color: GT.teal }} /> : <Copy size={15} />}
    </button>
  )
}

// AlertBox
export function AlertBox({ type, message }: { type: 'error' | 'success'; message: string }) {
  if (!message) return null
  const isError = type === 'error'
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium"
      style={{
        backgroundColor: isError ? '#FFF5F7' : '#F0FBE4',
        border: `1px solid ${isError ? GT.red : GT.green}`,
        color: isError ? GT.red : '#3D6B00',
      }}
    >
      {isError ? <AlertCircle size={15} className="shrink-0" /> : <CheckCircle size={15} className="shrink-0" />}
      {message}
    </div>
  )
}

// ConfirmInline
export function ConfirmInline({
  message, confirmLabel = 'Confirmar', confirmClass = '', onConfirm, onCancel,
}: {
  message: string; confirmLabel?: string; confirmClass?: string
  onConfirm: () => void; onCancel: () => void
}) {
  const isDestructive = confirmClass.includes('red') || confirmLabel.toLowerCase().includes('elimin')
  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        border: `1px solid ${isDestructive ? GT.red : GT.purple40}`,
        backgroundColor: isDestructive ? '#FFF5F7' : GT.purple20,
      }}
    >
      <p className="text-sm font-semibold" style={{ color: GT.black }}>{message}</p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all"
          style={{ border: `1px solid ${GT.purple40}`, backgroundColor: GT.white, color: GT.purple }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = GT.purple20 }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = GT.white }}
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white ${confirmClass}`}
          style={!confirmClass ? { backgroundColor: GT.red } : {}}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  )
}

// EmptyState
export function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div style={{ color: GT.purple40, fontSize: '3rem' }}>{icon}</div>
      <p className="text-base font-bold" style={{ color: GT.purple60 }}>{title}</p>
      {description && <p className="text-sm max-w-xs" style={{ color: GT.warmGrey }}>{description}</p>}
    </div>
  )
}

// Avatar
export function Avatar({ name, size = 'md', active = true }: { name: string; size?: 'sm' | 'md' | 'lg'; active?: boolean }) {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-sm'
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: active ? GT.purple : GT.warmGrey }}
    >
      {initials}
    </div>
  )
}
