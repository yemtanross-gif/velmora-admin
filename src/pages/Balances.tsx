import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

interface UserRow {
  id: string
  email: string
  role: string
}

export function Balances() {
  const isOwner = useAuthStore((s) => s.user?.role === 'OWNER')
  const [users, setUsers] = useState<UserRow[]>([])
  const [userId, setUserId] = useState('')
  const [detail, setDetail] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    type: 'PROMO_CREDIT',
    asset: 'USDT',
    network: 'ethereum',
    amount: '',
    reason: '',
    confirmLarge: false,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api<{ users: UserRow[] }>('/api/admin/users')
      .then((d) => setUsers(d.users || []))
      .catch((e) => toast.error(e.message))
  }, [])

  const load = async (id: string) => {
    setUserId(id)
    setLoading(true)
    try {
      const d = await api(`/api/admin/users/${id}/balances`)
      setDetail(d)
    } catch (e: any) {
      toast.error(e.message)
      setDetail(null)
    } finally {
      setLoading(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOwner) return toast.error('Owner only')
    if (!userId) return toast.error('Select a user')
    setSaving(true)
    try {
      const res = await api(`/api/admin/users/${userId}/adjustments`, {
        method: 'POST',
        body: JSON.stringify(form),
      })
      toast.success('Adjustment recorded on ledger')
      if (res.disclaimer) toast(res.disclaimer, { icon: 'ℹ️', duration: 5000 })
      setForm((f) => ({ ...f, amount: '', reason: '', confirmLarge: false }))
      load(userId)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Balances & adjustments</h1>
      <p className="text-sm text-gray-400 mb-6">
        Internal ledger only. Manual adjustments never create on-chain crypto or fake tx hashes.
        {isOwner ? '' : ' View only — OWNER required to adjust.'}
      </p>

      <div className="mb-6">
        <label className="text-sm text-gray-400">Customer</label>
        <select
          value={userId}
          onChange={(e) => load(e.target.value)}
          className="block w-full max-w-md mt-1 px-3 py-2 rounded-xl bg-surface-50 border border-surface-200 text-white"
        >
          <option value="">Select user…</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.email} ({u.role})
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-400">Loading…</p>}

      {detail && (
        <div className="space-y-6">
          <div className="bg-surface-50 border border-surface-200 rounded-2xl p-5">
            <h2 className="font-semibold mb-3">Custodial balances (internal ledger)</h2>
            {(detail.wallets || []).length === 0 && (
              <p className="text-sm text-gray-500">No wallets / balances yet</p>
            )}
            {(detail.wallets || []).map((w: any) => (
              <div key={w.id} className="mb-3">
                <p className="text-xs text-gray-500 mb-1">
                  {w.type} · {w.label || w.id.slice(0, 8)}
                </p>
                <ul className="text-sm space-y-1">
                  {(w.balances || []).map((b: any) => (
                    <li key={b.id} className="flex justify-between gap-4 border-t border-surface-200 py-2">
                      <span>
                        {b.asset} <span className="text-gray-500">({b.network})</span>
                      </span>
                      <span className="font-mono">
                        avail {b.available} · pending {b.pending} · reserved {b.reserved}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {isOwner && (
            <form
              onSubmit={submit}
              className="bg-surface-50 border border-surface-200 rounded-2xl p-5 space-y-3 max-w-lg"
            >
              <h2 className="font-semibold">New adjustment (Owner)</h2>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-200 text-white"
              >
                <option value="PROMO_CREDIT">Promotional credit</option>
                <option value="CORRECTION_CREDIT">Correction credit</option>
                <option value="CORRECTION_DEBIT">Correction debit</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Asset e.g. USDT"
                  value={form.asset}
                  onChange={(e) => setForm({ ...form, asset: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-surface border border-surface-200 text-white"
                />
                <input
                  placeholder="Network"
                  value={form.network}
                  onChange={(e) => setForm({ ...form, network: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-surface border border-surface-200 text-white"
                />
              </div>
              <input
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-200 text-white"
              />
              <textarea
                placeholder="Reason (required, min 10 chars) — stored in audit log"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-200 text-white"
              />
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={form.confirmLarge}
                  onChange={(e) => setForm({ ...form, confirmLarge: e.target.checked })}
                />
                Confirm large adjustment (≥ 1000 units)
              </label>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-velmora-600 hover:bg-velmora-500 text-white font-medium disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Post adjustment'}
              </button>
            </form>
          )}

          <div className="bg-surface-50 border border-surface-200 rounded-2xl overflow-x-auto">
            <h2 className="font-semibold p-4">Recent transactions</h2>
            <table className="w-full text-sm">
              <thead className="text-gray-400 text-left">
                <tr>
                  <th className="px-4 py-2">Ref</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {(detail.transactions || []).map((t: any) => (
                  <tr key={t.id} className="border-t border-surface-200">
                    <td className="px-4 py-2 font-mono text-xs">{t.reference}</td>
                    <td className="px-4 py-2">{t.type}</td>
                    <td className="px-4 py-2">
                      {t.amount} {t.asset}
                    </td>
                    <td className="px-4 py-2">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
