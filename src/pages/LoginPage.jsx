import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'
import AiilsgLogo from '../components/UI/AiilsgLogo'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // slight delay for UX feel
    await new Promise(r => setTimeout(r, 700))
    const result = login(form.username, form.password)
    setLoading(false)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="particle w-72 h-72 bg-orange-600/20 blur-3xl top-[-5%] left-[-5%]" style={{ animationDelay: '0s' }} />
      <div className="particle w-96 h-96 bg-orange-400/15 blur-3xl bottom-[-10%] right-[-5%]" style={{ animationDelay: '2s' }} />
      <div className="particle w-64 h-64 bg-amber-500/15 blur-3xl top-[30%] right-[10%]" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4 mx-auto drop-shadow-2xl">
              <AiilsgLogo size={80} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AIILSG</h1>
            <p className="text-orange-200 text-sm font-medium mt-1">
              All India Institute of Local Self Government
            </p>
            <p className="text-orange-300/80 text-xs mt-1">
              Established 1926 | Strengthening Local Self-Governance
            </p>
            <div className="mt-2 inline-block bg-orange-500/20 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
              West Bengal Centre — Project Management System
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-1.5 tracking-wide uppercase">
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="Enter username"
                required
                autoComplete="username"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-orange-300/60 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-1.5 tracking-wide uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-orange-300/60 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-300 hover:text-white transition-colors p-1"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2.5 text-red-200 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-orange-500/40 mt-6"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Logging in…</>
              ) : (
                <><LogIn size={18} /> Login</>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-xs text-orange-300 text-center font-medium mb-3">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ username: 'admin', password: 'admin123' })}
                className="bg-white/8 hover:bg-white/15 border border-white/15 rounded-xl px-3 py-2 text-xs text-orange-200 font-medium transition-all text-left"
              >
                <div className="font-semibold text-white">admin</div>
                <div className="opacity-70">admin123</div>
              </button>
              <button
                type="button"
                onClick={() => setForm({ username: 'rahul', password: 'rahul123' })}
                className="bg-white/8 hover:bg-white/15 border border-white/15 rounded-xl px-3 py-2 text-xs text-orange-200 font-medium transition-all text-left"
              >
                <div className="font-semibold text-white">rahul</div>
                <div className="opacity-70">rahul123 · Project Officer</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-orange-300/60 text-xs mt-6">
          © 2025 AIILSG West Bengal Centre · All rights reserved
        </p>
      </div>
    </div>
  )
}
