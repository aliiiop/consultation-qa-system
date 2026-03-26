import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function AskQuestion() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Очистка ошибки при изменении поля
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Заголовок обязателен'
    } else if (formData.title.length < 10) {
      newErrors.title = 'Заголовок должен содержать минимум 10 символов'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно'
    } else if (formData.description.length < 20) {
      newErrors.description = 'Описание должно содержать минимум 20 символов'
    }

    if (!formData.category) {
      newErrors.category = 'Выберите категорию'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      alert('Пожалуйста, войдите в систему')
      navigate('/login')
      return
    }

    try {
      setLoading(true)
      await axios.post('/api/questions', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      alert('Вопрос успешно добавлен!')
      navigate('/questions')
    } catch (error) {
      console.error('Ошибка при добавлении вопроса:', error)
      alert(error.response?.data?.message || 'Ошибка при добавлении вопроса')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Задать вопрос</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Заголовок вопроса *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Кратко опишите ваш вопрос"
            />
            {errors.title && <div className="error">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Категория *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Выберите категорию</option>
              <option value="programming">Программирование</option>
              <option value="design">Дизайн</option>
              <option value="marketing">Маркетинг</option>
              <option value="business">Бизнес</option>
              <option value="education">Образование</option>
              <option value="other">Другое</option>
            </select>
            {errors.category && <div className="error">{errors.category}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Подробное описание *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Опишите ваш вопрос подробно..."
            />
            {errors.description && <div className="error">{errors.description}</div>}
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Отправка...' : 'Опубликовать вопрос'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AskQuestion
