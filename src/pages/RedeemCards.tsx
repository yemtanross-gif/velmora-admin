import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

interface CodeRow {
  id: string
  code: string
  amount: string
  asset: string
  network: string
  status: string
  expiresAt?: string
  redeemedAt?: string
  redeemedBy?: { email: string }
  createdAt: string
}

export function RedeemCards() {
  const isOwner = useAuthStore((s) => s.user?.role === 'OWNER')
  const [codes, setCodes] = useState<CodeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('10')
  const [asset, setAsset] = useState('USDT')
  const [count, setCount] = useState(1)
  const [expiresInDays, setExpiresInDays] = useState(90)
  const [creating, setCreating] = useState(false)

  const load = () => {
    setLoading(true)
    api<{ codes: CodeRow[] }>('/api/redeem/codes')
      .then((d) => setCodes(d.codes || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOwner) return toast.error('Owner only')
    setCreating(true)
    try {
      const res = await api<{ codes: CodeRow[] }>('/api/redeem/codes', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          asset,
          count: Number(count),
          expiresInDays: Number(expiresInDays) || undefined,
          network: 'ethereum',
        }),
      })
      toast.success(`Created ${res.codes?.length || 0} card(s)`)
      load()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCreating(false)
    }
  }

  const disable = async (id: string) => {
    if (!isOwner) return
    try {
      await api(`/api/redeem/codes/${id}/disable`, { method: 'POST' })
      toast.success('Code disabled')
      load()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-2">Redeem cards</h1>
      <p className="text-sm text-gray-400 mb-6">
        Generate prepaid Velmora codes. Users redeem them for custodial balance. Other apps can
        check validity via GET /api/redeem/validate/:code — credit only happens inside Velmora.
      </p>

      {isOwner && (
        <form
          onSubmit={create}
          className="bg-surface-50 border border-surface-200 rounded-2xl p-5 mb-8 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
        >
          <div>
            <label className="text-xs text-gray-400">Amount</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-surface-200 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Asset</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-surface-200 text-white"
            >
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
              <option value="USD">USD (ledger)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400">How many</label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-surface-200 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Expires (days)</label>
            <input
              type="number"
              min={0}
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-surface-200 text-white"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="sm:col-span-4 py-2.5 rounded-xl bg-velmora-600 hover:bg-velmora-500 text-white font-medium disabled:opacity-50"
          >
            {creating ? 'Creating…' : 'Generate cards'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : (
        <div className="bg-surface-50 border border-surface-200 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-100 text-gray-400 text-left">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Redeemed by</th>
                {isOwner && <th className="px-4 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-t border-surface-200">
                  <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                  <td className="px-4 py-3">
                    {c.amount} {c.asset}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        c.status === 'active'
                          ? 'bg-green-500/15 text-green-400'
                          : c.status === 'redeemed'
                            ? 'bg-blue-500/15 text-blue-400'
                            : 'bg-gray-500/15 text-gray-400'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{c.redeemedBy?.email || '—'}</td>
                  {isOwner && (
                    <td className="px-4 py-3">
                      {c.status === 'active' && (
                        <button
                          onClick={() => disable(c.id)}
                          className="text-xs text-red-400 hover:underline"
                        >
                          Disable
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {codes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No cards yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
