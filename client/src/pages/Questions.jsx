import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function Questions() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchQuestions()
  }, [filter])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/questions?filter=${filter}`)
      setQuestions(response.data)
    } catch (error) {
      console.error('Ошибка загрузки вопросов:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Загрузка вопросов...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Все вопросы</h1>
        <Link to="/ask" className="btn">Задать вопрос</Link>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ marginRight: '1rem' }}>Фильтр:</label>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ddd' }}
        >
          <option value="all">Все вопросы</option>
          <option value="unanswered">Без ответов</option>
          <option value="answered">С ответами</option>
        </select>
      </div>

      {questions.length === 0 ? (
        <div className="card">
          <p>Вопросов пока нет. Будьте первым!</p>
        </div>
      ) : (
        questions.map(question => (
          <div key={question._id} className="card">
            <h3>
              <Link to={`/question/${question._id}`} style={{ color: '#2c3e50', textDecoration: 'none' }}>
                {question.title}
              </Link>
            </h3>
            <p style={{ color: '#7f8c8d', marginBottom: '1rem' }}>
              {question.description.substring(0, 150)}...
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#95a5a6' }}>
              <span>Автор: {question.author?.username || 'Аноним'}</span>
              <span>Ответов: {question.answers?.length || 0}</span>
              <span>{new Date(question.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Questions
