import { Link } from 'react-router-dom'

function Home() {
  return (
    <div>
      <section className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h1>Добро пожаловать в систему онлайн-консультаций</h1>
        <p style={{ fontSize: '1.2rem', margin: '1.5rem 0' }}>
          Получите профессиональные ответы на ваши вопросы от экспертов
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <Link to="/questions" className="btn">Просмотреть вопросы</Link>
          <Link to="/ask" className="btn btn-secondary">Задать вопрос</Link>
        </div>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Как это работает?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <h3>1. Зарегистрируйтесь</h3>
            <p>Создайте аккаунт, чтобы задавать вопросы и получать консультации</p>
          </div>
          <div className="card">
            <h3>2. Задайте вопрос</h3>
            <p>Опишите вашу проблему или вопрос подробно</p>
          </div>
          <div className="card">
            <h3>3. Получите ответ</h3>
            <p>Эксперты и другие пользователи помогут вам найти решение</p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Популярные категории</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <span className="btn btn-secondary">Программирование</span>
          <span className="btn btn-secondary">Дизайн</span>
          <span className="btn btn-secondary">Маркетинг</span>
          <span className="btn btn-secondary">Бизнес</span>
          <span className="btn btn-secondary">Образование</span>
        </div>
      </section>
    </div>
  )
}

export default Home
