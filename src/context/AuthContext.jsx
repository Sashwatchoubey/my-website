import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const DEMO_USERS = {
  admin: { password: 'admin123', name: 'Admin User', role: 'Administrator', avatar: 'AU' },
  director: { password: 'dir123', name: 'Dr. Subrata Banerjee', role: 'Centre Director', avatar: 'SB' },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('aiilsg_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [theme, setTheme] = useState(() => localStorage.getItem('aiilsg_theme') || 'light')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('aiilsg_theme', theme)
  }, [theme])

  const login = (username, password) => {
    const record = DEMO_USERS[username.toLowerCase()]
    if (record && record.password === password) {
      const userData = { username, name: record.name, role: record.role, avatar: record.avatar }
      setUser(userData)
      localStorage.setItem('aiilsg_user', JSON.stringify(userData))
      return { success: true }
    }
    return { success: false, message: 'Invalid username or password.' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('aiilsg_user')
  }

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return (
    <AuthContext.Provider value={{ user, login, logout, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
