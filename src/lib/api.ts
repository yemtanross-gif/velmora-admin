const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function api<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('velmora-admin-auth')
  let authToken: string | null = null
  try {
    const parsed = token ? JSON.parse(token) : null
    authToken = parsed?.state?.token || null
  } catch {}

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data as T
}
