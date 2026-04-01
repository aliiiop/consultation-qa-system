import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="empty-state surface">
      <span className="eyebrow">404</span>
      <h1>Страница не найдена</h1>
      <p>
        Похоже, ссылка устарела или путь был введен с ошибкой.
      </p>
      <div className="button-row center">
        <Link to="/" className="btn">На главную</Link>
        <Link to="/questions" className="btn btn-ghost">В ленту вопросов</Link>
      </div>
    </section>
  )
}

export default NotFound
