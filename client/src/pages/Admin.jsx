import { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { NotificationContext } from '../context/NotificationContext'
import { CONSULTATION_STATUS_MAP, QUESTION_CATEGORY_MAP } from '../data/platform'
import { formatDate } from '../utils/formatters'
import UserAvatar from '../components/UserAvatar'

const roleOptions = [
  { id: 'user', label: 'User' },
  { id: 'expert', label: 'Expert' },
  { id: 'admin', label: 'Admin' }
]

const questionStatusOptions = [
  { id: 'open', label: 'Открыт' },
  { id: 'answered', label: 'Есть ответы' },
  { id: 'closed', label: 'Закрыт' }
]

const consultationStatusOptions = [
  { id: 'pending', label: 'Ждет подбора' },
  { id: 'matched', label: 'Ментор найден' },
  { id: 'confirmed', label: 'Подтверждена' },
  { id: 'completed', label: 'Завершена' },
  { id: 'cancelled', label: 'Отменена' }
]

function Admin() {
  const navigate = useNavigate()
  const { error: showError, success: showSuccess, warning: showWarning } = useContext(NotificationContext)
  const [overview, setOverview] = useState(null)
  const [users, setUsers] = useState([])
  const [questions, setQuestions] = useState([])
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState('')

  const session = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch (error) {
      return null
    }
  }, [])

  const token = localStorage.getItem('token')

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }

      const [overviewRes, usersRes, questionsRes, consultationsRes] = await Promise.all([
        axios.get('/api/admin/overview', config),
        axios.get('/api/admin/users', config),
        axios.get('/api/admin/questions', config),
        axios.get('/api/admin/consultations', config)
      ])

      setOverview(overviewRes.data)
      setUsers(usersRes.data)
      setQuestions(questionsRes.data)
      setConsultations(consultationsRes.data)
    } catch (error) {
      console.error('Ошибка загрузки админки:', error)
      showError(error.response?.data?.message || 'Не удалось открыть админ-панель')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token || session?.role !== 'admin') {
      showWarning('Эта страница доступна только администратору')
      navigate('/')
      return
    }

    fetchAdminData()
  }, [])

  const handleRoleChange = async (userId, role) => {
    try {
      setBusyKey(`role-${userId}`)
      await axios.put(`/api/admin/users/${userId}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showSuccess('Роль пользователя обновлена')
      await fetchAdminData()
    } catch (error) {
      console.error('Ошибка смены роли:', error)
      showError(error.response?.data?.message || 'Не удалось сменить роль')
    } finally {
      setBusyKey('')
    }
  }

  const handleQuestionStatus = async (questionId, status) => {
    try {
      setBusyKey(`question-${questionId}`)
      await axios.put(`/api/admin/questions/${questionId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showSuccess('Статус вопроса обновлен')
      await fetchAdminData()
    } catch (error) {
      console.error('Ошибка обновления вопроса:', error)
      showError(error.response?.data?.message || 'Не удалось обновить вопрос')
    } finally {
      setBusyKey('')
    }
  }

  const handleConsultationStatus = async (consultationId, status) => {
    try {
      setBusyKey(`consultation-${consultationId}`)
      await axios.put(`/api/admin/consultations/${consultationId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showSuccess('Статус консультации обновлен')
      await fetchAdminData()
    } catch (error) {
      console.error('Ошибка обновления консультации:', error)
      showError(error.response?.data?.message || 'Не удалось обновить консультацию')
    } finally {
      setBusyKey('')
    }
  }

  if (loading) {
    return <section className="surface loading-state">Загрузка админ-панели...</section>
  }

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <span className="eyebrow">Admin only</span>
          <h1>Админ-панель</h1>
          <p>
            Здесь доступны функции, которых нет у обычных пользователей:
            управление ролями, модерация вопросов и контроль статусов консультаций.
          </p>
        </div>
      </section>

      <section className="admin-summary-grid">
        <article className="surface stat-card">
          <strong>{overview?.totalUsers || 0}</strong>
          <span>пользователей</span>
        </article>
        <article className="surface stat-card">
          <strong>{overview?.experts || 0}</strong>
          <span>экспертов</span>
        </article>
        <article className="surface stat-card">
          <strong>{overview?.totalQuestions || 0}</strong>
          <span>вопросов</span>
        </article>
        <article className="surface stat-card">
          <strong>{overview?.totalConsultations || 0}</strong>
          <span>консультаций</span>
        </article>
        <article className="surface stat-card">
          <strong>{overview?.closedQuestions || 0}</strong>
          <span>закрытых вопросов</span>
        </article>
        <article className="surface stat-card">
          <strong>{overview?.pendingConsultations || 0}</strong>
          <span>активных заявок</span>
        </article>
      </section>

      <section className="section-stack">
        <div className="section-head">
          <div>
            <span className="eyebrow">Роли</span>
            <h2>Управление пользователями</h2>
          </div>
        </div>

        <div className="admin-card-grid">
          {users.map((user) => (
            <article key={user._id} className="surface admin-entity-card">
              <div className="inline-user">
                <UserAvatar user={user} />
                <div>
                  <strong>{user.name || user.username}</strong>
                  <span>{user.email}</span>
                </div>
              </div>

              <p>{user.headline || 'Без описания профиля'}</p>

              <div className="question-detail-meta">
                <span>Роль: {user.role}</span>
                <span>{user.reputation || 0} репутации</span>
                <span>{formatDate(user.createdAt)}</span>
              </div>

              <div className="admin-inline-actions">
                <select
                  value={user.role}
                  onChange={(event) => handleRoleChange(user._id, event.target.value)}
                  disabled={busyKey === `role-${user._id}` || session?._id === user._id}
                >
                  {roleOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
                {session?._id === user._id && <span className="muted-text">Свою роль менять нельзя</span>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-stack">
        <div className="section-head">
          <div>
            <span className="eyebrow">Модерация</span>
            <h2>Управление вопросами</h2>
          </div>
          <Link to="/questions" className="text-link">Открыть публичную ленту</Link>
        </div>

        <div className="admin-card-grid">
          {questions.map((question) => (
            <article key={question._id} className="surface admin-entity-card">
              <div className="admin-card-top">
                <span className="category-pill">
                  {QUESTION_CATEGORY_MAP[question.category]?.label || 'Раздел'}
                </span>
                <Link to={`/question/${question._id}`} className="text-link">Открыть</Link>
              </div>

              <h3>{question.title}</h3>
              <p>{question.description.slice(0, 180)}{question.description.length > 180 ? '...' : ''}</p>

              <div className="question-detail-meta">
                <span>Автор: {question.author?.name || question.author?.username}</span>
                <span>{question.answers?.length || 0} ответов</span>
                <span>{question.views || 0} просмотров</span>
              </div>

              <div className="admin-inline-actions">
                <select
                  value={question.status}
                  onChange={(event) => handleQuestionStatus(question._id, event.target.value)}
                  disabled={busyKey === `question-${question._id}`}
                >
                  {questionStatusOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-stack">
        <div className="section-head">
          <div>
            <span className="eyebrow">Контроль заявок</span>
            <h2>Управление консультациями</h2>
          </div>
        </div>

        <div className="admin-card-grid">
          {consultations.map((consultation) => {
            const status = CONSULTATION_STATUS_MAP[consultation.status] || CONSULTATION_STATUS_MAP.pending

            return (
              <article key={consultation._id} className="surface admin-entity-card">
                <div className="admin-card-top">
                  <span className={`status-pill ${status.tone}`}>{status.label}</span>
                  <span className="muted-text">{formatDate(consultation.preferredDate)}</span>
                </div>

                <h3>{consultation.topic}</h3>
                <p>{consultation.description.slice(0, 180)}{consultation.description.length > 180 ? '...' : ''}</p>

                <div className="question-detail-meta">
                  <span>Клиент: {consultation.user?.name || consultation.user?.username}</span>
                  <span>Ментор: {consultation.expert?.name || consultation.expert?.username || 'не назначен'}</span>
                  <span>{consultation.preferredTime}</span>
                </div>

                <div className="admin-inline-actions">
                  <select
                    value={consultation.status}
                    onChange={(event) => handleConsultationStatus(consultation._id, event.target.value)}
                    disabled={busyKey === `consultation-${consultation._id}`}
                  >
                    {consultationStatusOptions.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default Admin
