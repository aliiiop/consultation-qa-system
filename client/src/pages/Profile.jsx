import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Profile() {
  const navigate = useNavigate()
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

    const userData = JSON.parse(localStorage.getItem('user'))
    setUser(userData)
    fetchUserData(token)
  }, [])

  const fetchUserData = async (token) => {
    try {
      setLoading(true)
      const [questionsRes, consultationsRes] = await Promise.all([
        axios.get('/api/questions/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('/api/consultations/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])
      
      setMyQuestions(questionsRes.data)
      setMyConsultations(consultationsRes.data)
    } catch (error) {
      console.error('Ошибка загрузки данных профиля:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Загрузка профиля...</div>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Мой профиль</h1>

      <div className="card">
        <h2>Информация о пользователе</h2>
        <p><strong>Имя:</strong> {user?.username}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Дата регистрации:</strong> {new Date(user?.createdAt).toLocaleDateString('ru-RU')}</p>
      </div>

      <div className="card">
        <h2>Мои вопросы ({myQuestions.length})</h2>
        {myQuestions.length === 0 ? (
          <p style={{ color: '#7f8c8d' }}>Вы еще не задавали вопросов</p>
        ) : (
          myQuestions.map(question => (
            <div key={question._id} style={{ 
              borderBottom: '1px solid #eee',
              paddingBottom: '1rem',
              marginBottom: '1rem'
            }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                <a href={`/question/${question._id}`} style={{ color: '#2c3e50', textDecoration: 'none' }}>
                  {question.title}
                </a>
              </h3>
              <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                <span>Ответов: {question.answers?.length || 0}</span>
                <span style={{ margin: '0 1rem' }}>|</span>
                <span>{new Date(question.createdAt).toLocaleDateString('ru-RU')}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h2>Мои консультации ({myConsultations.length})</h2>
        {myConsultations.length === 0 ? (
          <p style={{ color: '#7f8c8d' }}>У вас нет запланированных консультаций</p>
        ) : (
          myConsultations.map(consultation => (
            <div key={consultation._id} style={{ 
              borderBottom: '1px solid #eee',
              paddingBottom: '1rem',
              marginBottom: '1rem'
            }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{consultation.topic}</h3>
              <p style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                Дата: {new Date(consultation.preferredDate).toLocaleDateString('ru-RU')} в {consultation.preferredTime}
              </p>
              <p style={{ fontSize: '0.9rem' }}>
                Статус: <span style={{ 
                  color: consultation.status === 'pending' ? '#f39c12' : 
                         consultation.status === 'confirmed' ? '#27ae60' : '#95a5a6'
                }}>
                  {consultation.status === 'pending' ? 'Ожидает подтверждения' :
                   consultation.status === 'confirmed' ? 'Подтверждена' : 'Завершена'}
                </span>
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Profile
