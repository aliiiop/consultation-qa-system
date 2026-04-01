import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { NotificationContext } from '../context/NotificationContext'

function Register() {
  const navigate = useNavigate()
  const { error: showError, success: showSuccess } = useContext(NotificationContext)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      showError('Пароли не совпадают')
      return
    }

    try {
      setLoading(true)
      await axios.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      })
      showSuccess('Аккаунт создан, теперь можно войти')
      navigate('/login')
    } catch (error) {
      console.error('Ошибка регистрации:', error)
      showError(error.response?.data?.message || 'Не удалось зарегистрироваться')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <section className="surface auth-side">
        <span className="eyebrow">Register</span>
        <h1>Создать аккаунт</h1>
        <p>
          Новый пользователь сразу получает доступ к вопросам, ответам и заявкам на консультации.
        </p>
        <ul className="plain-list">
          <li>Публикация вопросов по разделам</li>
          <li>Ответы и голоса в сообществе</li>
          <li>Бронирование менторских сессий</li>
        </ul>
      </section>

      <form onSubmit={handleSubmit} className="surface form-card form-stack auth-form">
        <div className="section-head simple">
          <div>
            <span className="eyebrow">Регистрация</span>
            <h2>Новый профиль</h2>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="username">Имя пользователя</label>
          <input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Минимум 3 символа"
            required
          />
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

        <div className="split-fields">
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Повтор пароля</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Повтори пароль"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Создание...' : 'Создать аккаунт'}
        </button>

        <p className="muted-text">
          Уже есть аккаунт? <Link to="/login" className="text-link">Войти</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
