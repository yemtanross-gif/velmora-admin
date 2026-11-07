import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

interface Log {
  id: string
  actorEmail?: string
  action: string
  resource?: string
  resourceId?: string
  createdAt: string
}

export function Audit() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const isOwner = useAuthStore((s) => s.user?.role === 'OWNER')

  useEffect(() => {
    if (!isOwner) {
      setLoading(false)
      return
    }
    api<{ logs: Log[] }>('/api/admin/audit')
      .then((d) => setLogs(d.logs || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [isOwner])

  if (!isOwner) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Audit Log</h1>
        <p className="text-gray-400">Owner access only.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Audit Log</h1>
      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-400">No audit entries yet.</p>
      ) : (
        <div className="bg-surface-50 border border-surface-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-100 text-gray-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Resource</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-surface-200">
                  <td className="px-4 py-3 text-gray-400">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{l.actorEmail || '—'}</td>
                  <td className="px-4 py-3 font-medium">{l.action}</td>
                  <td className="px-4 py-3 text-gray-400">{l.resource || '—'} {l.resourceId ? `(${l.resourceId.slice(0, 8)}…)` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
