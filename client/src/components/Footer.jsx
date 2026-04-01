import { Link } from 'react-router-dom'
import { BRAND } from '../data/platform'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <span className="eyebrow">Community hub</span>
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
          <h4>Для защиты проекта</h4>
          <p>
            Есть разделы, ответы, роли пользователей, адаптивный интерфейс, уведомления и сид-данные в БД.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
