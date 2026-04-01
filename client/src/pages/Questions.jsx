import { useContext, useDeferredValue, useEffect, useState, startTransition } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import QuestionCard from '../components/QuestionCard'
import { NotificationContext } from '../context/NotificationContext'
import {
  QUESTION_CATEGORIES,
  QUESTION_FILTERS,
  QUESTION_SORTS
} from '../data/platform'

function Questions() {
  const { error: showError } = useContext(NotificationContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all')
  const [sort, setSort] = useState(searchParams.get('sort') || 'active')
  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    const params = {}
    if (category !== 'all') params.category = category
    if (filter !== 'all') params.filter = filter
    if (sort !== 'active') params.sort = sort
    if (deferredSearch.trim()) params.search = deferredSearch.trim()
    setSearchParams(params)
  }, [category, filter, sort, deferredSearch, setSearchParams])

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/api/questions', {
          params: {
            search: deferredSearch.trim(),
            category,
            filter,
            sort
          }
        })
        setQuestions(response.data)
      } catch (error) {
        console.error('Ошибка загрузки вопросов:', error)
        showError('Не удалось загрузить ленту вопросов')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [category, filter, sort, deferredSearch, showError])

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <span className="eyebrow">Community feed</span>
          <h1>Лента вопросов</h1>
          <p>
            Теперь это не абстрактный список, а полноценная лента с разделами,
            поиском, рейтингом и обсуждениями от пользователей из базы.
          </p>
        </div>
        <Link to="/ask" className="btn">Задать вопрос</Link>
      </section>

      <section className="surface filter-shell">
        <div className="search-shell">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              const value = event.target.value
              startTransition(() => setSearch(value))
            }}
            placeholder="Искать по заголовку, описанию или тегам"
          />
        </div>

        <div className="filter-row">
          <div className="chip-group">
            <button
              type="button"
              className={`filter-chip ${category === 'all' ? 'active' : ''}`}
              onClick={() => setCategory('all')}
            >
              Все разделы
            </button>
            {QUESTION_CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`filter-chip ${category === item.id ? 'active' : ''}`}
                onClick={() => setCategory(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="inline-controls">
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              {QUESTION_FILTERS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>

            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              {QUESTION_SORTS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="surface loading-state">Загрузка вопросов...</section>
      ) : questions.length === 0 ? (
        <section className="surface empty-state">
          <h2>Ничего не найдено</h2>
          <p>
            Попробуй сбросить фильтры или сформулировать запрос короче.
          </p>
        </section>
      ) : (
        <section className="question-layout">
          <div className="question-list">
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>

          <aside className="surface sidebar-card">
            <span className="eyebrow">Как лучше спрашивать</span>
            <h3>Чем конкретнее вопрос, тем сильнее ответы</h3>
            <ul className="plain-list">
              <li>Добавь контекст и ограничения</li>
              <li>Укажи, что уже пробовал</li>
              <li>Используй правильный раздел и теги</li>
            </ul>
          </aside>
        </section>
      )}
    </div>
  )
}

export default Questions
