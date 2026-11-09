import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

export function Invites() {
  const isOwner = useAuthStore((s) => s.user?.role === 'OWNER')
  const [email, setEmail] = useState('')
  const [invites, setInvites] = useState<any[]>([])
  const [lastToken, setLastToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = () => {
    if (!isOwner) return
    api<{ invites: any[] }>('/api/admin/invites')
      .then((d) => setInvites(d.invites || []))
      .catch((e) => toast.error(e.message))
  }

  useEffect(() => {
    load()
  }, [isOwner])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOwner) return
    setLoading(true)
    setLastToken(null)
    try {
      const res = await api<{ token: string; invite: any }>('/api/admin/invites', {
        method: 'POST',
        body: JSON.stringify({ email, role: 'SUPPORT' }),
      })
      setLastToken(res.token)
      toast.success('Invite created — copy the token now')
      setEmail('')
      load()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOwner) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Admin invites</h1>
        <p className="text-gray-400">Owner only.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Invite staff admin</h1>
      <p className="text-sm text-gray-400 mb-6">
        Creates a SUPPORT account invitation. Cannot create OWNER. Token is shown once.
      </p>

      <form onSubmit={create} className="flex gap-2 mb-4 max-w-lg">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="staff@company.com"
          className="flex-1 px-3 py-2 rounded-xl bg-surface-50 border border-surface-200 text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-velmora-600 text-white font-medium disabled:opacity-50"
        >
          {loading ? '…' : 'Create invite'}
        </button>
      </form>

      {lastToken && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm">
          <p className="text-amber-200 font-medium mb-1">One-time invite token (copy now)</p>
          <code className="block break-all text-xs text-white">{lastToken}</code>
          <p className="text-xs text-gray-400 mt-2">
            Staff accepts via POST /api/auth/accept-invite with {'{ token, password }'}
          </p>
        </div>
      )}

      <table className="w-full text-sm bg-surface-50 border border-surface-200 rounded-2xl overflow-hidden">
        <thead className="text-gray-400 text-left">
          <tr>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Expires</th>
            <th className="px-4 py-2">Used</th>
          </tr>
        </thead>
        <tbody>
          {invites.map((i) => (
            <tr key={i.id} className="border-t border-surface-200">
              <td className="px-4 py-2">{i.email}</td>
              <td className="px-4 py-2">{i.role}</td>
              <td className="px-4 py-2 text-gray-400">{new Date(i.expiresAt).toLocaleString()}</td>
              <td className="px-4 py-2">{i.usedAt ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
