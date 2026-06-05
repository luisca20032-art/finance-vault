import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth, ROLE_LABELS, ROLE_COLORS } from '../context/AuthContext'
import {
  LayoutDashboard, Key, Users, User, LogOut, ShieldCheck, Menu, Wand2,
} from 'lucide-react'
import { PasswordGenerator } from './PasswordGenerator'

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
  roles: string[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',   icon: <LayoutDashboard size={20} />, label: 'Inicio',       roles: ['superadmin', 'coordinator', 'assistant'] },
  { to: '/credentials', icon: <Key size={20} />,             label: 'Credenciales', roles: ['superadmin', 'coordinator', 'assistant'] },
  { to: '/users',       icon: <Users size={20} />,           label: 'Usuarios',     roles: ['superadmin'] },
  { to: '/profile',     icon: <User size={20} />,            label: 'Mi Perfil',    roles: ['superadmin', 'coordinator', 'assistant'] },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false)

  const visibleNav = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role))

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = user?.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() ?? '??'
  const { bg, text } = ROLE_COLORS[user?.role ?? 'assistant']

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Nunito Sans', Arial, sans-serif" }}>

      {/* Logo GT */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: '#DCD5E5' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#4F2D7F' }}>
          <ShieldCheck size={20} color="#FFFFFF" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight" style={{ color: '#4F2D7F' }}>FinanceVault</p>
          <p className="text-xs leading-tight" style={{ color: '#9581B2' }}>Gestor de Credenciales</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.75rem',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'background 0.15s, color 0.15s',
              backgroundColor: isActive ? '#DCD5E5' : 'transparent',
              color: isActive ? '#4F2D7F' : '#000000',
            })}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              if (!el.getAttribute('aria-current')) {
                el.style.backgroundColor = '#F9F8FB'
                el.style.color = '#4F2D7F'
              }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              if (!el.getAttribute('aria-current')) {
                el.style.backgroundColor = 'transparent'
                el.style.color = '#000000'
              }
            }}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Generador de contraseñas */}
      <div className="px-3 pb-3">
        <button
          onClick={() => { setSidebarOpen(false); setShowPasswordGenerator(true) }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.625rem 0.875rem',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: '700',
            cursor: 'pointer',
            border: '2px solid #00A7B5',
            backgroundColor: '#EEFBFC',
            color: '#007A85',
            fontFamily: "'Nunito Sans', Arial, sans-serif",
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#D0F4F7' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#EEFBFC' }}
        >
          <Wand2 size={17} />
          Generar contraseña
        </button>
      </div>

      {/* Usuario / Logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: '#DCD5E5' }}>
        {showLogoutConfirm ? (
          <div className="rounded-xl p-3 space-y-2" style={{ border: '1px solid #DE002E', backgroundColor: '#FFF5F7' }}>
            <p className="text-xs font-semibold" style={{ color: '#000000' }}>¿Cerrar sesión?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold"
                style={{ border: '1px solid #B9ABCC', backgroundColor: '#FFFFFF', color: '#4F2D7F' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-white"
                style={{ backgroundColor: '#DE002E' }}
              >
                Salir
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: '#4F2D7F' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#000000' }}>{user?.name}</p>
              <span className={`inline-block text-xs font-medium rounded-full px-1.5 py-0.5 ${bg} ${text}`}>
                {ROLE_LABELS[user?.role ?? 'assistant']}
              </span>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              title="Cerrar sesión"
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#9581B2' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#DE002E' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#9581B2' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F9F8FB', fontFamily: "'Nunito Sans', Arial, sans-serif" }}>
      {showPasswordGenerator && (
        <PasswordGenerator onClose={() => setShowPasswordGenerator(false)} />
      )}

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-white border-r" style={{ borderColor: '#DCD5E5' }}>
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar móvil */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b" style={{ borderColor: '#DCD5E5' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg"
            style={{ color: '#4F2D7F' }}
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} style={{ color: '#4F2D7F' }} />
            <span className="text-sm font-bold" style={{ color: '#4F2D7F' }}>FinanceVault</span>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: '#4F2D7F' }}
          >
            {initials}
          </div>
        </header>

        {/* Contenido de página */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
