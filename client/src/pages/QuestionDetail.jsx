import { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { NotificationContext } from '../context/NotificationContext'
import { QUESTION_CATEGORY_MAP } from '../data/platform'
import { formatDate, formatRelativeTime, getScore } from '../utils/formatters'
import UserAvatar from '../components/UserAvatar'

const hasUserVote = (votes = [], userId) => {
  if (!userId) {
    return false
  }

  return votes.some((voteId) => {
    const normalizedVoteId = voteId?._id || voteId
    return normalizedVoteId?.toString() === userId.toString()
  })
}

function QuestionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { error: showError, success: showSuccess, warning: showWarning } = useContext(NotificationContext)
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [busyAction, setBusyAction] = useState('')

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch (error) {
      return null
    }
  }, [])

  const token = localStorage.getItem('token')

  const fetchQuestion = async (trackView = true) => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/questions/${id}`, {
        params: {
          trackView
        }
      })
      setQuestion(response.data)
    } catch (error) {
      console.error('Ошибка загрузки вопроса:', error)
      showError('Вопрос не найден или был удален')
      navigate('/questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const viewKey = `question-viewed:${id}`
    const shouldTrackView = sessionStorage.getItem(viewKey) !== '1'

    fetchQuestion(shouldTrackView)

    if (shouldTrackView) {
      sessionStorage.setItem(viewKey, '1')
    }
  }, [id])

  const category = QUESTION_CATEGORY_MAP[question?.category]
  const questionScore = getScore(question)
  const questionVoteState = useMemo(() => {
    if (!currentUser?._id || !question) {
      return null
    }

    if (hasUserVote(question.upvotes, currentUser._id)) {
      return 'upvote'
    }

    if (hasUserVote(question.downvotes, currentUser._id)) {
      return 'downvote'
    }

    return null
  }, [currentUser, question])
  const sortedAnswers = useMemo(() => {
    const list = [...(question?.answers || [])]
    return list.sort((a, b) => {
      if (a.isBestAnswer && !b.isBestAnswer) return -1
      if (!a.isBestAnswer && b.isBestAnswer) return 1
      return getScore(b) - getScore(a)
    })
  }, [question])
  const questionVoteBusy = busyAction === 'question-upvote' || busyAction === 'question-downvote'

  const handleQuestionVote = async (type) => {
    if (!token) {
      showWarning('Войди в аккаунт, чтобы голосовать')
      navigate('/login')
      return
    }

    try {
      setBusyAction(`question-${type}`)
      await axios.post(`/api/questions/${id}/${type}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchQuestion(false)
    } catch (error) {
      console.error('Ошибка голосования:', error)
      showError('Не удалось сохранить голос')
    } finally {
      setBusyAction('')
    }
  }

  const handleAnswerVote = async (answerId) => {
    if (!token) {
      showWarning('Войди в аккаунт, чтобы поддержать ответ')
      navigate('/login')
      return
    }

    try {
      setBusyAction(`answer-${answerId}`)
      await axios.post(`/api/questions/${id}/answers/${answerId}/upvote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchQuestion(false)
    } catch (error) {
      console.error('Ошибка голосования за ответ:', error)
      showError('Не удалось проголосовать за ответ')
    } finally {
      setBusyAction('')
    }
  }

  const handleMarkBest = async (answerId) => {
    if (!token) {
      return
    }

    try {
      setBusyAction(`best-${answerId}`)
      await axios.post(`/api/questions/${id}/answers/${answerId}/best`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showSuccess('Лучший ответ отмечен')
      await fetchQuestion(false)
    } catch (error) {
      console.error('Ошибка выбора лучшего ответа:', error)
      showError(error.response?.data?.message || 'Не удалось выбрать лучший ответ')
    } finally {
      setBusyAction('')
    }
  }

  const handleSubmitAnswer = async (event) => {
    event.preventDefault()

    if (answer.trim().length < 10) {
      showWarning('Ответ должен содержать минимум 10 символов')
      return
    }

    if (!token) {
      showWarning('Сначала войди в аккаунт')
      navigate('/login')
      return
    }

    try {
      setSubmitting(true)
      await axios.post(
        `/api/questions/${id}/answers`,
        { content: answer },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAnswer('')
      showSuccess('Ответ опубликован')
      await fetchQuestion(false)
    } catch (error) {
      console.error('Ошибка добавления ответа:', error)
      showError(error.response?.data?.message || 'Не удалось отправить ответ')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <section className="surface loading-state">Загрузка вопроса...</section>
  }

  if (!question) {
    return null
  }

  return (
    <div className="page-stack">
      <section className="question-layout">
        <div className="question-detail-stack">
          <article className="surface question-detail-card">
            <div className="question-header">
              <div>
                <span className="category-pill">{category?.label || 'Раздел'}</span>
                <h1>{question.title}</h1>
              </div>

              <div className="vote-stack">
                <button
                  type="button"
                  className={`vote-btn ${questionVoteState === 'upvote' ? 'active upvote' : ''}`}
                  onClick={() => handleQuestionVote('upvote')}
                  disabled={questionVoteBusy}
                  aria-pressed={questionVoteState === 'upvote'}
                >
                  <i className="fa-solid fa-arrow-up" />
                </button>
                <strong>{questionScore}</strong>
                <button
                  type="button"
                  className={`vote-btn ${questionVoteState === 'downvote' ? 'active downvote' : ''}`}
                  onClick={() => handleQuestionVote('downvote')}
                  disabled={questionVoteBusy}
                  aria-pressed={questionVoteState === 'downvote'}
                >
                  <i className="fa-solid fa-arrow-down" />
                </button>
              </div>
            </div>

            <div className="inline-user large">
              <UserAvatar user={question.author} />
              <div>
                <strong>{question.author?.name || question.author?.username}</strong>
                <span>{question.author?.headline || 'Участник сообщества'}</span>
              </div>
            </div>

            <p className="question-body">{question.description}</p>

            <div className="question-tags-row">
              {question.tags?.map((tag) => (
                <span key={tag} className="tag-chip">#{tag}</span>
              ))}
            </div>

            <div className="question-detail-meta">
              <span>{question.views || 0} просмотров</span>
              <span>{question.answers?.length || 0} ответов</span>
              <span>Создан {formatDate(question.createdAt)}</span>
              <span>Активность {formatRelativeTime(question.lastActivityAt || question.updatedAt)}</span>
            </div>
          </article>

          <section className="surface">
            <div className="section-head simple">
              <div>
                <span className="eyebrow">Ответы</span>
                <h2>{sortedAnswers.length} в обсуждении</h2>
              </div>
            </div>

            <div className="answer-list">
              {sortedAnswers.map((item) => (
                <article key={item._id} className={`answer-card ${item.isBestAnswer ? 'best' : ''}`}>
                  <div className="answer-top">
                    <div className="inline-user">
                      <UserAvatar user={item.author} size="sm" />
                      <div>
                        <strong>{item.author?.name || item.author?.username}</strong>
                        <span>{formatRelativeTime(item.createdAt)}</span>
                      </div>
                    </div>

                    <div className="answer-actions">
                      {item.isBestAnswer && <span className="status-pill success">Лучший ответ</span>}
                      {question.author?._id === currentUser?._id && !item.isBestAnswer && (
                        <button
                          type="button"
                          className="text-link button-reset"
                          onClick={() => handleMarkBest(item._id)}
                          disabled={busyAction === `best-${item._id}`}
                        >
                          Выбрать лучшим
                        </button>
                      )}
                    </div>
                  </div>

                  <p>{item.content}</p>

                  <div className="answer-bottom">
                    <button
                      type="button"
                      className="text-link button-reset"
                      onClick={() => handleAnswerVote(item._id)}
                      disabled={busyAction === `answer-${item._id}`}
                    >
                      Поддержать ответ · {getScore(item)}
                    </button>
                  </div>
                </article>
              ))}

              {!sortedAnswers.length && (
                <div className="empty-state no-border">
                  <h3>Пока нет ответов</h3>
                  <p>Можешь стать первым, кто поможет автору.</p>
                </div>
              )}
            </div>
          </section>

          <section className="surface">
            <div className="section-head simple">
              <div>
                <span className="eyebrow">Новый ответ</span>
                <h2>Добавь полезное решение</h2>
              </div>
            </div>

            <form onSubmit={handleSubmitAnswer} className="form-stack">
              <div className="form-group">
                <label htmlFor="answer">Ответ</label>
                <textarea
                  id="answer"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Опиши решение по шагам, без воды и общих фраз."
                />
              </div>

              <div className="button-row">
                <button type="submit" className="btn" disabled={submitting}>
                  {submitting ? 'Отправка...' : 'Опубликовать ответ'}
                </button>
                {!token && (
                  <Link to="/login" className="btn btn-ghost">Войти для ответа</Link>
                )}
              </div>
            </form>
          </section>
        </div>

        <aside className="question-side-column">
          <section className="surface sidebar-card">
            <span className="eyebrow">Если нужен разбор глубже</span>
            <h3>Переведи вопрос в консультацию</h3>
            <p>
              Публичный ответ закрывает базу, а менторская консультация помогает
              собрать план действий именно под твою ситуацию.
            </p>
            <Link to="/consultations" className="btn btn-small">Открыть консультации</Link>
          </section>
        </aside>
      </section>
    </div>
  )
}

export default QuestionDetail
