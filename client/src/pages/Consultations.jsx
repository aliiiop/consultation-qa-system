import { useState, useEffect } from 'react'
import axios from 'axios'

function Consultations() {
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    preferredDate: '',
    preferredTime: ''
  })

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/consultations')
      setConsultations(response.data)
    } catch (error) {
      console.error('Ошибка загрузки консультаций:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Пожалуйста, войдите в систему')
      return
    }

    try {
      await axios.post('/api/consultations', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      alert('Заявка на консультацию отправлена!')
      setShowForm(false)
      setFormData({ topic: '', description: '', preferredDate: '', preferredTime: '' })
      fetchConsultations()
    } catch (error) {
      console.error('Ошибка при создании консультации:', error)
      alert(error.response?.data?.message || 'Ошибка при создании консультации')
    }
  }

  if (loading) {
    return <div className="loading">Загрузка консультаций...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Консультации</h1>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Отменить' : 'Записаться на консультацию'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>Заявка на консультацию</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="topic">Тема консультации</label>
              <input
                type="text"
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Описание проблемы</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="preferredDate">Предпочтительная дата</label>
              <input
                type="date"
                id="preferredDate"
                value={formData.preferredDate}
                onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="preferredTime">Предпочтительное время</label>
              <input
                type="time"
                id="preferredTime"
                value={formData.preferredTime}
                onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
                required
              />
            </div>

            <button type="submit" className="btn">Отправить заявку</button>
          </form>
        </div>
      )}

      <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Доступные консультации</h2>
      
      {consultations.length === 0 ? (
        <div className="card">
          <p>Консультаций пока нет</p>
        </div>
      ) : (
        consultations.map(consultation => (
          <div key={consultation._id} className="card">
            <h3>{consultation.topic}</h3>
            <p>{consultation.description}</p>
            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#7f8c8d' }}>
              <p>Дата: {new Date(consultation.preferredDate).toLocaleDateString('ru-RU')}</p>
              <p>Время: {consultation.preferredTime}</p>
              <p>Статус: <span style={{ 
                color: consultation.status === 'pending' ? '#f39c12' : 
                       consultation.status === 'confirmed' ? '#27ae60' : '#95a5a6'
              }}>
                {consultation.status === 'pending' ? 'Ожидает подтверждения' :
                 consultation.status === 'confirmed' ? 'Подтверждена' : 'Завершена'}
              </span></p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Consultations
