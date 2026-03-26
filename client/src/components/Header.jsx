import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    window.location.href = '/'
  }

  return (
    <header>
      <div className="container">
        <nav>
          <h1>Система онлайн-консультаций</h1>
          <ul>
            <li><Link to="/">Главная</Link></li>
            <li><Link to="/questions">Вопросы</Link></li>
            <li><Link to="/consultations">Консультации</Link></li>
            {isLoggedIn ? (
              <>
                <li><Link to="/ask">Задать вопрос</Link></li>
                <li><Link to="/profile">Профиль</Link></li>
                <li><a href="#" onClick={handleLogout}>Выход</a></li>
              </>
            ) : (
              <>
                <li><Link to="/login">Вход</Link></li>
                <li><Link to="/register">Регистрация</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
