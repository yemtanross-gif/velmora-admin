import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

interface UserRow {
  id: string
  email: string
  name?: string
  role: string
  isActive: boolean
  isSuspended: boolean
  createdAt: string
  lastLoginAt?: string
}

export function Users() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const current = useAuthStore((s) => s.user)
  const isOwner = current?.role === 'OWNER'

  const load = () => {
    setLoading(true)
    api<{ users: UserRow[] }>('/api/admin/users')
      .then((d) => setUsers(d.users || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggleSuspend = async (u: UserRow) => {
    if (!isOwner) return toast.error('Owner only')
    try {
      await api(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isSuspended: !u.isSuspended }),
      })
      toast.success(u.isSuspended ? 'User unsuspended' : 'User suspended')
      load()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : (
        <div className="bg-surface-50 border border-surface-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-100 text-gray-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                {isOwner && <th className="px-4 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-surface-200">
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${u.role === 'OWNER' ? 'bg-purple-500/15 text-purple-400' : u.role === 'SUPPORT' ? 'bg-blue-500/15 text-blue-400' : 'bg-gray-500/15 text-gray-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.isSuspended ? (
                      <span className="text-red-400">Suspended</span>
                    ) : u.isActive ? (
                      <span className="text-green-400">Active</span>
                    ) : (
                      <span className="text-gray-500">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  {isOwner && (
                    <td className="px-4 py-3">
                      {u.role !== 'OWNER' && (
                        <button
                          onClick={() => toggleSuspend(u)}
                          className="text-xs text-velmora-400 hover:underline"
                        >
                          {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
