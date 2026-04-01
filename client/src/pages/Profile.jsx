import { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { NotificationContext } from '../context/NotificationContext'
import { CONSULTATION_SERVICE_MAP, CONSULTATION_STATUS_MAP } from '../data/platform'
import { formatDate } from '../utils/formatters'
import UserAvatar from '../components/UserAvatar'
import QuestionCard from '../components/QuestionCard'

function Profile() {
  const navigate = useNavigate()
  const { error: showError } = useContext(NotificationContext)
  const [user, setUser] = useState(null)
  const [myQuestions, setMyQuestions] = useState([])
  const [myConsultations, setMyConsultations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      setUser(JSON.parse(localStorage.getItem('user')))
    } catch (error) {
      setUser(null)
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true)
        const [questionsRes, consultationsRes] = await Promise.all([
          axios.get('/api/questions/my', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/consultations/my', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        setMyQuestions(questionsRes.data)
        setMyConsultations(consultationsRes.data)
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error)
        showError('Не удалось загрузить профиль')
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [navigate, showError])

  const stats = useMemo(() => {
    const answersReceived = myQuestions.reduce((acc, question) => acc + (question.answers?.length || 0), 0)
    const activeConsultations = myConsultations.filter((item) => item.status !== 'completed' && item.status !== 'cancelled').length

    return [
      { label: 'Вопросов', value: myQuestions.length },
      { label: 'Ответов получено', value: answersReceived },
      { label: 'Консультаций', value: myConsultations.length },
      { label: 'Активных', value: activeConsultations }
    ]
  }, [myQuestions, myConsultations])

  if (loading) {
    return <section className="surface loading-state">Загрузка профиля...</section>
  }

  return (
    <div className="page-stack">
      <section className="surface profile-hero">
        <div className="inline-user large">
          <UserAvatar user={user} size="lg" />
          <div>
            <span className="eyebrow">Профиль</span>
            <h1>{user?.name || user?.username}</h1>
            <p>{user?.headline || 'Участник сообщества TopicHub'}</p>
          </div>
        </div>

        <div className="stat-grid compact">
          {stats.map((item) => (
            <article key={item.label} className="stat-card">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>

        <div className="question-detail-meta">
          <span>{user?.email}</span>
          <span>{user?.location || 'Локация не указана'}</span>
          <span>С нами с {formatDate(user?.createdAt)}</span>
        </div>
      </section>

      <section className="section-stack">
        <div className="section-head">
          <div>
            <span className="eyebrow">Мои вопросы</span>
            <h2>Опубликованные обсуждения</h2>
          </div>
          <Link to="/ask" className="text-link">Создать еще один</Link>
        </div>

        {myQuestions.length ? (
          <div className="question-list">
            {myQuestions.map((question) => (
              <QuestionCard key={question._id} question={question} compact />
            ))}
          </div>
        ) : (
          <div className="surface empty-state">
            <h3>Вопросов пока нет</h3>
            <p>Опубликуй первый вопрос и он сразу появится в ленте.</p>
          </div>
        )}
      </section>

      <section className="section-stack">
        <div className="section-head">
          <div>
            <span className="eyebrow">Мои консультации</span>
            <h2>Статусы и брони</h2>
          </div>
          <Link to="/consultations" className="text-link">Новая консультация</Link>
        </div>

        {myConsultations.length ? (
          <div className="consultation-list">
            {myConsultations.map((item) => {
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

                  <p>{item.goal || item.description}</p>

                  <div className="question-detail-meta">
                    <span>{formatDate(item.preferredDate)}</span>
                    <span>{item.preferredTime}</span>
                    <span>{item.format}</span>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="surface empty-state">
            <h3>Консультаций пока нет</h3>
            <p>Выбери ментора и забронируй первый персональный разбор.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default Profile
