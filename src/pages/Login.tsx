import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/auth'
import { api } from '../lib/api'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await api<{ token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (data.user.role !== 'OWNER' && data.user.role !== 'SUPPORT') {
        throw new Error('Access denied. Admin credentials required.')
      }
      setAuth(data.token, data.user)
      toast.success('Welcome back')
      navigate('/')
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0e14]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-velmora-500 to-velmora-700 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Velmora Admin</h1>
          <p className="text-gray-400 mt-1 text-sm">Owner & Support access only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-surface-50 border border-surface-200 rounded-2xl p-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-200 text-white focus:outline-none focus:border-velmora-500"
              placeholder="owner@velmora.app"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-200 text-white focus:outline-none focus:border-velmora-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-velmora-600 hover:bg-velmora-500 text-white font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
