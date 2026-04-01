import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  BRAND,
  CONSULTATION_SERVICES,
  QUESTION_CATEGORIES
} from '../data/platform'
import QuestionCard from '../components/QuestionCard'
import UserAvatar from '../components/UserAvatar'

function Home() {
  const [questions, setQuestions] = useState([])
  const [experts, setExperts] = useState([])
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true)
        const [questionsRes, expertsRes, consultationsRes] = await Promise.all([
          axios.get('/api/questions?sort=popular'),
          axios.get('/api/consultations/experts'),
          axios.get('/api/consultations')
        ])

        setQuestions(questionsRes.data)
        setExperts(expertsRes.data)
        setConsultations(consultationsRes.data)
      } catch (error) {
        console.error('Ошибка загрузки главной страницы:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  const stats = useMemo(() => {
    const totalAnswers = questions.reduce((acc, question) => acc + (question.answers?.length || 0), 0)

    return [
      { value: questions.length || '0', label: 'вопросов в ленте' },
      { value: totalAnswers || '0', label: 'публичных ответов' },
      { value: experts.length || '0', label: 'менторов' },
      { value: consultations.length || '0', label: 'консультаций' }
    ]
  }, [questions, experts, consultations])

  return (
    <div className="page-stack">
      <section className="hero-surface">
        <div className="hero-copy">
          <span className="eyebrow">Q&A + mentorship</span>
          <h1>{BRAND.name} для вопросов по играм, ПК, готовке, учебе и карьере</h1>
          <p>
            Платформа теперь работает как смесь удобной ленты вопросов и личных разборов:
            публично спрашиваешь у сообщества, а если нужен глубже разбор, бронируешь
            консультацию у ментора.
          </p>

          <div className="button-row">
            <Link to="/questions" className="btn">Открыть ленту</Link>
            <Link to="/consultations" className="btn btn-ghost">Подобрать ментора</Link>
            <Link to="/ask" className="btn btn-secondary">Задать вопрос</Link>
          </div>

          <div className="hero-stats">
            {stats.map((stat) => (
              <article key={stat.label} className="stat-card">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="hero-side">
          <div className="surface hero-panel">
            <span className="eyebrow">Что изменилось</span>
            <h3>Вместо абстрактной темы теперь полноценный community hub</h3>
            <ul className="plain-list">
              <li>Четкие разделы как в сервисах вопросов-ответов</li>
              <li>Вымышленные пользователи, вопросы и ответы хранятся в БД</li>
              <li>Консультации стали отдельным продуктом, а не просто формой заявки</li>
            </ul>
          </div>

          <div className="surface mini-feed">
            <span className="eyebrow">Сейчас обсуждают</span>
            {questions.slice(0, 3).map((question) => (
              <Link key={question._id} to={`/question/${question._id}`} className="mini-feed-item">
                <strong>{question.title}</strong>
                <span>{question.answers?.length || 0} ответов</span>
              </Link>
            ))}
            {!questions.length && !loading && <p>После сид-наполнения здесь появятся горячие обсуждения.</p>}
          </div>
        </div>
      </section>

      <section className="section-stack">
        <div className="section-head">
          <div>
            <span className="eyebrow">Разделы</span>
            <h2>Разделение по темам сделано как у больших community-площадок</h2>
          </div>
          <Link to="/questions" className="text-link">Смотреть все вопросы</Link>
        </div>

        <div className="category-grid">
          {QUESTION_CATEGORIES.map((category) => (
            <article key={category.id} className="surface feature-card">
              <div className="feature-icon">
                <i className={category.icon} />
              </div>
              <h3>{category.label}</h3>
              <p>{category.description}</p>
              <Link to={`/questions?category=${category.id}`} className="text-link">Перейти в раздел</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section-stack">
        <div className="section-head">
          <div>
            <span className="eyebrow">Консультации</span>
            <h2>Личные разборы с менторами вместо сухой формы записи</h2>
          </div>
          <Link to="/consultations" className="text-link">Все форматы</Link>
        </div>

        <div className="service-grid">
          {CONSULTATION_SERVICES.slice(0, 4).map((service) => (
            <article key={service.id} className="surface service-card">
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
            </article>
          ))}
        </div>
      </section>

      <section className="section-stack">
        <div className="section-head">
          <div>
            <span className="eyebrow">Популярные вопросы</span>
            <h2>Лента уже выглядит как живая площадка, а не пустой шаблон</h2>
          </div>
        </div>

        <div className="question-list">
          {questions.slice(0, 3).map((question) => (
            <QuestionCard key={question._id} question={question} />
          ))}

          {!questions.length && !loading && (
            <div className="surface empty-state">
              <h3>Пока нет вопросов</h3>
              <p>Запусти наполнение базы, и в ленте появятся вопросы, ответы и обсуждения.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section-stack">
        <div className="section-head">
          <div>
            <span className="eyebrow">Менторы</span>
            <h2>Эксперты уже хранятся в базе и участвуют в консультациях</h2>
          </div>
        </div>

        <div className="mentor-grid">
          {experts.slice(0, 4).map((expert) => (
            <article key={expert._id} className="surface mentor-card">
              <div className="inline-user large">
                <UserAvatar user={expert} />
                <div>
                  <strong>{expert.name || expert.username}</strong>
                  <span>{expert.headline}</span>
                </div>
              </div>
              <p>{expert.bio}</p>
              <div className="mentor-tags">
                {expert.expertise?.map((item) => (
                  <span key={item} className="tag-chip">{item}</span>
                ))}
              </div>
              <div className="mentor-meta">
                <span>{expert.reputation || 0} репутации</span>
                <span>{expert.location}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
