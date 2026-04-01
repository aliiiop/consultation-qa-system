import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { NotificationContext } from '../context/NotificationContext'

function Login() {
  const navigate = useNavigate()
  const { error: showError, success: showSuccess } = useContext(NotificationContext)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      const response = await axios.post('/api/auth/login', formData)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      window.dispatchEvent(new Event('authchange'))
      showSuccess(`С возвращением, ${response.data.user.name}!`)
      navigate('/')
    } catch (error) {
      console.error('Ошибка входа:', error)
      showError(error.response?.data?.message || 'Не удалось войти')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <section className="surface auth-side">
        <span className="eyebrow">Login</span>
        <h1>Войти в TopicHub</h1>
        <p>
          После входа можно публиковать вопросы, отвечать, голосовать и бронировать консультации.
        </p>
        <ul className="plain-list">
          <li>Лента вопросов с категориями</li>
          <li>Ответы от пользователей и экспертов</li>
          <li>Консультации с менторами из базы</li>
        </ul>
      </section>

      <form onSubmit={handleSubmit} className="surface form-card form-stack auth-form">
        <div className="section-head simple">
          <div>
            <span className="eyebrow">Авторизация</span>
            <h2>Продолжить работу</h2>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@mail.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Минимум 6 символов"
            required
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>

        <p className="muted-text">
          Нет аккаунта? <Link to="/register" className="text-link">Создать</Link>
        </p>
      </form>
    </div>
  )
}

export default Login
