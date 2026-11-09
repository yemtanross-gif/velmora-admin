import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, ArrowLeftRight, ScrollText, Settings, Ticket, LogOut, Shield } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import clsx from 'clsx'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/audit', icon: ScrollText, label: 'Audit Log' },
  { to: '/redeem-cards', icon: Ticket, label: 'Redeem cards' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-[#0a0e14]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-surface-200 bg-surface flex flex-col">
        <div className="p-5 flex items-center gap-3 border-b border-surface-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-velmora-500 to-velmora-700 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold tracking-tight">VELMORA</div>
            <div className="text-xs text-gray-400">Admin Panel</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-velmora-600/15 text-velmora-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-surface-50'
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-200">
          <div className="text-xs text-gray-500 mb-2 truncate">{user?.email}</div>
          <div className="text-xs text-velmora-400 mb-3 uppercase tracking-wider">{user?.role}</div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
