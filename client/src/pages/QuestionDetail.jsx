import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

function QuestionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchQuestion()
  }, [id])

  const fetchQuestion = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/questions/${id}`)
      setQuestion(response.data)
    } catch (error) {
      console.error('Ошибка загрузки вопроса:', error)
      alert('Вопрос не найден')
      navigate('/questions')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async (e) => {
    e.preventDefault()

    if (!answer.trim()) {
      alert('Пожалуйста, введите ответ')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      alert('Пожалуйста, войдите в систему')
      navigate('/login')
      return
    }

    try {
      setSubmitting(true)
      await axios.post(`/api/questions/${id}/answers`, 
        { content: answer },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      setAnswer('')
      fetchQuestion()
      alert('Ответ успешно добавлен!')
    } catch (error) {
      console.error('Ошибка при добавлении ответа:', error)
      alert(error.response?.data?.message || 'Ошибка при добавлении ответа')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading">Загрузка вопроса...</div>
  }

  if (!question) {
    return <div className="card">Вопрос не найден</div>
  }

  return (
    <div>
      <div className="card">
        <h1>{question.title}</h1>
        <div style={{ color: '#7f8c8d', marginBottom: '1rem', fontSize: '0.9rem' }}>
          <span>Автор: {question.author?.username || 'Аноним'}</span>
          <span style={{ margin: '0 1rem' }}>|</span>
          <span>Категория: {question.category}</span>
          <span style={{ margin: '0 1rem' }}>|</span>
          <span>{new Date(question.createdAt).toLocaleDateString('ru-RU')}</span>
        </div>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{question.description}</p>
      </div>

      <div className="card">
        <h2>Ответы ({question.answers?.length || 0})</h2>
        
        {question.answers && question.answers.length > 0 ? (
          question.answers.map((ans, index) => (
            <div key={ans._id || index} style={{ 
              borderBottom: index < question.answers.length - 1 ? '1px solid #eee' : 'none',
              paddingBottom: '1rem',
              marginBottom: '1rem'
            }}>
              <p style={{ whiteSpace: 'pre-wrap', marginBottom: '0.5rem' }}>{ans.content}</p>
              <div style={{ fontSize: '0.85rem', color: '#95a5a6' }}>
                <span>Автор: {ans.author?.username || 'Аноним'}</span>
                <span style={{ margin: '0 1rem' }}>|</span>
                <span>{new Date(ans.createdAt).toLocaleDateString('ru-RU')}</span>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#7f8c8d' }}>Ответов пока нет. Будьте первым!</p>
        )}
      </div>

      <div className="card">
        <h3>Ваш ответ</h3>
        <form onSubmit={handleSubmitAnswer}>
          <div className="form-group">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Напишите ваш ответ..."
              rows="6"
            />
          </div>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Отправка...' : 'Отправить ответ'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default QuestionDetail
