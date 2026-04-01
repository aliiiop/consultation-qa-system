import { useContext, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { NotificationContext } from '../context/NotificationContext'
import { ASK_GUIDES, QUESTION_CATEGORIES } from '../data/platform'

function AskQuestion() {
  const navigate = useNavigate()
  const { error: showError, success: showSuccess, warning: showWarning } = useContext(NotificationContext)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const tips = useMemo(() => ASK_GUIDES[formData.category] || [], [formData.category])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const validateForm = () => {
    const nextErrors = {}

    if (!formData.title.trim()) {
      nextErrors.title = 'Напиши краткий заголовок'
    } else if (formData.title.trim().length < 10) {
      nextErrors.title = 'Минимум 10 символов'
    }

    if (!formData.category) {
      nextErrors.category = 'Выбери раздел'
    }

    if (!formData.description.trim()) {
      nextErrors.description = 'Опиши ситуацию подробнее'
    } else if (formData.description.trim().length < 20) {
      nextErrors.description = 'Минимум 20 символов'
    }

    const tags = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    if (tags.length > 6) {
      nextErrors.tags = 'Сделай не больше 6 тегов'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      showWarning('Проверь обязательные поля')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      showWarning('Нужно войти в аккаунт, чтобы публиковать вопросы')
      navigate('/login')
      return
    }

    try {
      setLoading(true)

      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)

      await axios.post('/api/questions', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      showSuccess('Вопрос опубликован')
      navigate('/questions')
    } catch (error) {
      console.error('Ошибка публикации вопроса:', error)
      showError(error.response?.data?.message || 'Не удалось опубликовать вопрос')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <span className="eyebrow">Новый пост</span>
          <h1>Опубликовать вопрос</h1>
          <p>
            Здесь важен не просто красивый блок формы. Вопросы проходят валидацию,
            попадают в правильный раздел и после сид-наполнения живут рядом с ответами других пользователей.
          </p>
        </div>
      </section>

      <section className="editor-layout">
        <form onSubmit={handleSubmit} className="surface form-card form-stack">
          <div className="form-group">
            <label htmlFor="title">Заголовок</label>
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Например: как выбрать корпус для тихой сборки?"
            />
            {errors.title && <span className="error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Раздел</label>
            <select id="category" name="category" value={formData.category} onChange={handleChange}>
              <option value="">Выбери раздел</option>
              {QUESTION_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
            {errors.category && <span className="error">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="tags">Теги</label>
            <input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="апгрейд, airflow, budget"
            />
            {errors.tags && <span className="error">{errors.tags}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Опиши задачу, ограничения, что уже пробовал и какой результат хочешь получить."
            />
            {errors.description && <span className="error">{errors.description}</span>}
          </div>

          <div className="button-row">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Публикация...' : 'Опубликовать вопрос'}
            </button>
            <Link to="/questions" className="btn btn-ghost">Отмена</Link>
          </div>
        </form>

        <aside className="surface sidebar-card">
          <span className="eyebrow">Подсказки</span>
          <h3>Как получить сильный ответ</h3>
          <ul className="plain-list">
            {tips.length ? tips.map((tip) => <li key={tip}>{tip}</li>) : (
              <>
                <li>Выбери подходящий раздел</li>
                <li>Опиши контекст и ограничения</li>
                <li>Сформулируй ожидаемый результат</li>
              </>
            )}
          </ul>
        </aside>
      </section>
    </div>
  )
}

export default AskQuestion
