import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Save, Shield } from 'lucide-react'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

interface SettingsData {
  appName: string
  withdrawalEnabled: boolean
  dailyWithdrawalLimitUsd: string
  minWithdrawal: string
  feeBps: number
  treasuryAddress: string | null
}

export function Settings() {
  const isOwner = useAuthStore((s) => s.user?.role === 'OWNER')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<SettingsData>({
    appName: 'Velmora',
    withdrawalEnabled: true,
    dailyWithdrawalLimitUsd: '10000',
    minWithdrawal: '0.001',
    feeBps: 500,
    treasuryAddress: '',
  })

  useEffect(() => {
    api<SettingsData>('/api/admin/settings')
      .then((data) =>
        setForm({
          ...data,
          treasuryAddress: data.treasuryAddress || '',
          feeBps: data.feeBps ?? 500,
        })
      )
      .catch((e) => toast.error(e.message || 'Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOwner) {
      toast.error('Only the Owner can change settings')
      return
    }
    if (!form.appName.trim() || form.appName.trim().length < 2) {
      toast.error('App name must be at least 2 characters')
      return
    }
    setSaving(true)
    try {
      const updated = await api<SettingsData>('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          appName: form.appName.trim(),
          withdrawalEnabled: form.withdrawalEnabled,
          dailyWithdrawalLimitUsd: form.dailyWithdrawalLimitUsd,
          minWithdrawal: form.minWithdrawal,
          feeBps: Number(form.feeBps),
          treasuryAddress: form.treasuryAddress?.trim() || null,
        }),
      })
      setForm({
        ...updated,
        treasuryAddress: updated.treasuryAddress || '',
      })
      toast.success('Settings saved')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-400">Loading settings…</p>
      </div>
    )
  }

  const feePercent = ((form.feeBps || 0) / 100).toFixed(2)

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">
          {isOwner ? 'Manage branding, fees, and treasury' : 'View only — Owner required to make changes'}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-surface-50 border border-surface-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-velmora-400" />
            <h2 className="font-semibold">Branding</h2>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">App Name</label>
            <input
              type="text"
              value={form.appName}
              onChange={(e) => setForm({ ...form, appName: e.target.value })}
              disabled={!isOwner}
              maxLength={40}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-200 text-white focus:outline-none focus:border-velmora-500 disabled:opacity-60"
            />
          </div>
        </div>

        <div className="bg-surface-50 border border-surface-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold">Platform fee → Admin treasury</h2>
          <p className="text-xs text-gray-500">
            On every send, a platform fee is calculated and sent on-chain to your treasury address.
            Default is 5% (500 basis points). Network gas is separate and paid by the user.
          </p>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Fee (basis points) — currently {feePercent}%
            </label>
            <input
              type="number"
              value={form.feeBps}
              onChange={(e) => setForm({ ...form, feeBps: Number(e.target.value) })}
              disabled={!isOwner}
              min={0}
              max={2000}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-200 text-white focus:outline-none focus:border-velmora-500 disabled:opacity-60"
            />
            <p className="text-xs text-gray-500 mt-1">500 = 5%, 100 = 1%, 0 = no platform fee</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Treasury wallet address (receives fees)</label>
            <input
              type="text"
              value={form.treasuryAddress || ''}
              onChange={(e) => setForm({ ...form, treasuryAddress: e.target.value })}
              disabled={!isOwner}
              placeholder="0x… your admin / company wallet"
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-200 text-white font-mono text-sm focus:outline-none focus:border-velmora-500 disabled:opacity-60"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be a valid EVM address. Fees are only sent when this is set.
            </p>
          </div>
        </div>

        <div className="bg-surface-50 border border-surface-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold">System</h2>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium">Withdrawals enabled</div>
              <div className="text-xs text-gray-500">Emergency switch</div>
            </div>
            <input
              type="checkbox"
              checked={form.withdrawalEnabled}
              onChange={(e) => setForm({ ...form, withdrawalEnabled: e.target.checked })}
              disabled={!isOwner}
              className="w-5 h-5 rounded accent-velmora-500"
            />
          </label>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Daily withdrawal limit (USD)</label>
            <input
              type="text"
              value={form.dailyWithdrawalLimitUsd}
              onChange={(e) => setForm({ ...form, dailyWithdrawalLimitUsd: e.target.value })}
              disabled={!isOwner}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-200 text-white focus:outline-none focus:border-velmora-500 disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Minimum withdrawal</label>
            <input
              type="text"
              value={form.minWithdrawal}
              onChange={(e) => setForm({ ...form, minWithdrawal: e.target.value })}
              disabled={!isOwner}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-200 text-white focus:outline-none focus:border-velmora-500 disabled:opacity-60"
            />
          </div>
        </div>

        {isOwner && (
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-velmora-600 hover:bg-velmora-500 text-white font-medium disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        )}
      </form>
    </div>
  )
}
