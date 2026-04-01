import { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { NotificationContext } from '../context/NotificationContext'
import {
  CONSULTATION_FORMATS,
  CONSULTATION_SERVICES,
  CONSULTATION_SERVICE_MAP,
  CONSULTATION_STATUS_MAP
} from '../data/platform'
import { formatDate } from '../utils/formatters'
import UserAvatar from '../components/UserAvatar'

function Consultations() {
  const navigate = useNavigate()
  const { error: showError, success: showSuccess, warning: showWarning } = useContext(NotificationContext)
  const [consultations, setConsultations] = useState([])
  const [experts, setExperts] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    serviceCategory: 'pc-plan',
    topic: '',
    goal: '',
    description: '',
    mentorId: '',
    format: 'chat',
    preferredDate: '',
    preferredTime: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const selectedService = useMemo(
    () => CONSULTATION_SERVICE_MAP[formData.serviceCategory],
    [formData.serviceCategory]
  )

  const fetchData = async () => {
    try {
      setLoading(true)
      const [consultationsRes, expertsRes] = await Promise.all([
        axios.get('/api/consultations'),
        axios.get('/api/consultations/experts')
      ])
      setConsultations(consultationsRes.data)
      setExperts(expertsRes.data)
    } catch (error) {
      console.error('Ошибка загрузки консультаций:', error)
      showError('Не удалось загрузить консультации')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const token = localStorage.getItem('token')
    if (!token) {
      showWarning('Войди в аккаунт, чтобы забронировать консультацию')
      navigate('/login')
      return
    }

    try {
      setSubmitting(true)
      await axios.post('/api/consultations', {
        ...formData,
        mentorId: formData.mentorId || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showSuccess('Заявка на консультацию отправлена')
      setFormData({
        serviceCategory: formData.serviceCategory,
        topic: '',
        goal: '',
        description: '',
        mentorId: '',
        format: 'chat',
        preferredDate: '',
        preferredTime: ''
      })
      await fetchData()
    } catch (error) {
      console.error('Ошибка создания консультации:', error)
      showError(error.response?.data?.message || 'Не удалось отправить заявку')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <span className="eyebrow">Mentor sessions</span>
          <h1>Консультации и персональные разборы</h1>
          <p>
            Здесь можно выбрать формат встречи, тему, эксперта и удобное время.
            Все заявки сохраняются в базе и отслеживаются по статусам.
          </p>
        </div>
      </section>

      <section className="service-grid">
        {CONSULTATION_SERVICES.map((service) => (
          <article
            key={service.id}
            className={`surface service-card selectable ${formData.serviceCategory === service.id ? 'active' : ''}`}
          >
            <button
              type="button"
              className="card-select"
              onClick={() => setFormData((current) => ({ ...current, serviceCategory: service.id }))}
            >
              <div className="feature-icon">
                <i className={service.icon} />
              </div>
              <h3>{service.label}</h3>
              <p>{service.description}</p>
              <div className="service-points">
                {service.outcomes.map((item) => (
                  <span key={item} className="tag-chip">{item}</span>
                ))}
              </div>
            </button>
          </article>
        ))}
      </section>

      <section className="consult-layout">
        <form onSubmit={handleSubmit} className="surface form-card form-stack">
          <div className="section-head simple">
            <div>
              <span className="eyebrow">Новая консультация</span>
              <h2>{selectedService?.label}</h2>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="topic">Тема</label>
            <input
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="Что именно нужно разобрать?"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="goal">Цель</label>
            <input
              id="goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              placeholder="Какой результат хочешь получить после сессии?"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание запроса</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Дай контекст, ограничения и что уже пробовал."
              required
            />
          </div>

          <div className="split-fields">
            <div className="form-group">
              <label htmlFor="mentorId">Ментор</label>
              <select id="mentorId" name="mentorId" value={formData.mentorId} onChange={handleChange}>
                <option value="">Подобрать автоматически</option>
                {experts.map((expert) => (
                  <option key={expert._id} value={expert._id}>
                    {expert.name || expert.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="format">Формат</label>
              <select id="format" name="format" value={formData.format} onChange={handleChange}>
                {CONSULTATION_FORMATS.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="split-fields">
            <div className="form-group">
              <label htmlFor="preferredDate">Дата</label>
              <input
                id="preferredDate"
                name="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="preferredTime">Время</label>
              <input
                id="preferredTime"
                name="preferredTime"
                type="time"
                value={formData.preferredTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Отправка...' : 'Забронировать консультацию'}
          </button>
        </form>

        <aside className="surface sidebar-card">
          <span className="eyebrow">Менторы</span>
          <h3>Эксперты, доступные для консультаций</h3>
          <div className="mentor-stack">
            {experts.map((expert) => (
              <article key={expert._id} className="mentor-snippet">
                <div className="inline-user">
                  <UserAvatar user={expert} size="sm" />
                  <div>
                    <strong>{expert.name || expert.username}</strong>
                    <span>{expert.headline}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className="section-stack">
        <div className="section-head">
          <div>
            <span className="eyebrow">Лента консультаций</span>
            <h2>Последние заявки и статусы</h2>
          </div>
        </div>

        {loading ? (
          <div className="surface loading-state">Загрузка консультаций...</div>
        ) : (
          <div className="consultation-list">
            {consultations.map((item) => {
              const service = CONSULTATION_SERVICE_MAP[item.serviceCategory]
              const status = CONSULTATION_STATUS_MAP[item.status] || CONSULTATION_STATUS_MAP.pending

              return (
                <article key={item._id} className="surface consultation-card">
                  <div className="consultation-top">
                    <div>
                      <span className="category-pill">{service?.label || 'Консультация'}</span>
                      <h3>{item.topic}</h3>
                    </div>
                    <span className={`status-pill ${status.tone}`}>{status.label}</span>
                  </div>

                  <p>{item.description}</p>

                  <div className="consultation-users">
                    <div className="inline-user">
                      <UserAvatar user={item.user} size="sm" />
                      <div>
                        <strong>{item.user?.name || item.user?.username}</strong>
                        <span>Автор заявки</span>
                      </div>
                    </div>

                    {item.expert && (
                      <div className="inline-user">
                        <UserAvatar user={item.expert} size="sm" />
                        <div>
                          <strong>{item.expert?.name || item.expert?.username}</strong>
                          <span>Ментор</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="question-detail-meta">
                    <span>{formatDate(item.preferredDate)}</span>
                    <span>{item.preferredTime}</span>
                    <span>{item.format}</span>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default Consultations
