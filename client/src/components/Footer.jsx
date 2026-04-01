import { Link } from 'react-router-dom'
import { BRAND } from '../data/platform'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <span className="eyebrow">Q&A platform</span>
          <h3>{BRAND.name}</h3>
          <p>
            Публичные вопросы по реальным темам и персональные консультации от менторов.
          </p>
        </div>

        <div>
          <h4>Навигация</h4>
          <div className="footer-links">
            <Link to="/questions">Лента вопросов</Link>
            <Link to="/consultations">Консультации</Link>
            <Link to="/ask">Создать вопрос</Link>
          </div>
        </div>

        <div>
          <h4>О проекте</h4>
          <p>
            В системе есть тематические разделы, ответы пользователей, роли, консультации, уведомления и данные в базе.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
