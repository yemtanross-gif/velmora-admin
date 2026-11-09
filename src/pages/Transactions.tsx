import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'

interface Tx {
  id: string
  reference: string
  type: string
  status: string
  asset: string
  amount: string
  createdAt: string
  user?: { email: string }
}

export function Transactions() {
  const [txs, setTxs] = useState<Tx[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<{ transactions: Tx[] }>('/api/admin/transactions')
      .then((d) => setTxs(d.transactions || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>
      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : txs.length === 0 ? (
        <p className="text-gray-400">No transactions yet.</p>
      ) : (
        <div className="bg-surface-50 border border-surface-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-100 text-gray-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id} className="border-t border-surface-200">
                  <td className="px-4 py-3 font-mono text-xs">{t.reference}</td>
                  <td className="px-4 py-3">{t.type}</td>
                  <td className="px-4 py-3">{t.amount} {t.asset}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      t.status === 'COMPLETED' ? 'bg-green-500/15 text-green-400' :
                      t.status === 'PENDING' || t.status === 'RESERVED' ? 'bg-amber-500/15 text-amber-400' :
                      t.status === 'FAILED' ? 'bg-red-500/15 text-red-400' : 'bg-gray-500/15 text-gray-400'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{t.user?.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(t.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
