import { useEffect, useState } from 'react'
import { Users, ArrowLeftRight, AlertTriangle, Shield } from 'lucide-react'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

export function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState({ users: 0, transactions: 0 })

  useEffect(() => {
    Promise.all([
      api('/api/admin/users').then((d) => setStats((s) => ({ ...s, users: d.users?.length || 0 }))).catch(() => {}),
      api('/api/admin/transactions').then((d) => setStats((s) => ({ ...s, transactions: d.transactions?.length || 0 }))).catch(() => {}),
    ])
  }, [])

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-gray-400 text-sm mb-8">
        Signed in as <span className="text-velmora-400">{user?.role}</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-surface-50 border border-surface-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-velmora-600/15 flex items-center justify-center">
              <Users className="w-5 h-5 text-velmora-400" />
            </div>
            <span className="text-sm text-gray-400">Users</span>
          </div>
          <div className="text-3xl font-bold">{stats.users}</div>
        </div>
        <div className="bg-surface-50 border border-surface-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm text-gray-400">Transactions</span>
          </div>
          <div className="text-3xl font-bold">{stats.transactions}</div>
        </div>
        <div className="bg-surface-50 border border-surface-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-sm text-gray-400">Pending</span>
          </div>
          <div className="text-3xl font-bold">—</div>
        </div>
        <div className="bg-surface-50 border border-surface-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-gray-400">Role</span>
          </div>
          <div className="text-xl font-bold">{user?.role}</div>
        </div>
      </div>

      <div className="bg-surface-50 border border-surface-200 rounded-2xl p-6">
        <h2 className="font-semibold mb-2">Quick notes</h2>
        <ul className="text-sm text-gray-400 space-y-1.5 list-disc list-inside">
          <li>Only the <strong className="text-white">Owner</strong> can suspend users, approve withdrawals, or change system settings.</li>
          <li>Support staff can view users and transactions but cannot move funds or edit balances.</li>
          <li>All sensitive actions are written to the Audit Log.</li>
        </ul>
      </div>
    </div>
  )
}
