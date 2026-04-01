import { useContext, useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { NotificationContext } from '../context/NotificationContext'
import { BRAND } from '../data/platform'
import UserAvatar from './UserAvatar'

const navItems = [
  { to: '/questions', label: 'Лента' },
  { to: '/consultations', label: 'Консультации' },
  { to: '/ask', label: 'Задать вопрос' }
]

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { success: showSuccess } = useContext(NotificationContext)
  const [menuOpen, setMenuOpen] = useState(false)
  const [session, setSession] = useState({ isLoggedIn: false, user: null })

  useEffect(() => {
    const syncSession = () => {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      try {
        setSession({
          isLoggedIn: Boolean(token),
          user: storedUser ? JSON.parse(storedUser) : null
        })
      } catch (error) {
        setSession({ isLoggedIn: Boolean(token), user: null })
      }
    }

    syncSession()
    window.addEventListener('storage', syncSession)
    window.addEventListener('authchange', syncSession)

    return () => {
      window.removeEventListener('storage', syncSession)
      window.removeEventListener('authchange', syncSession)
    }
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.dispatchEvent(new Event('authchange'))
    showSuccess('Вы вышли из аккаунта')
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="container header-row">
        <Link to="/" className="brand-block">
          <span className="brand-mark">TH</span>
          <span>
            <strong>{BRAND.name}</strong>
            <small>{BRAND.subtitle}</small>
          </span>
        </Link>

        <button
          type="button"
          className="mobile-toggle"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Открыть меню"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`header-panel ${menuOpen ? 'open' : ''}`}>
          <nav className="nav-links">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
            {session.user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Админка
              </NavLink>
            )}
          </nav>

          <div className="header-actions">
            {session.isLoggedIn ? (
              <>
                <Link to="/profile" className="profile-link">
                  <UserAvatar user={session.user} size="sm" />
                  <span>{session.user?.name || session.user?.username || 'Профиль'}</span>
                </Link>
                <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link secondary">Войти</Link>
                <Link to="/register" className="btn btn-small">Регистрация</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
