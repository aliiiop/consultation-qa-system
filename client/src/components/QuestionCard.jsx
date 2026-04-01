import { Link } from 'react-router-dom'
import { QUESTION_CATEGORY_MAP } from '../data/platform'
import { formatRelativeTime, getAnswerCountLabel, getScore } from '../utils/formatters'
import UserAvatar from './UserAvatar'

function QuestionCard({ question, compact = false }) {
  const category = QUESTION_CATEGORY_MAP[question.category]
  const score = getScore(question)
  const answersCount = question.answers?.length || 0
  const hasBestAnswer = question.answers?.some((answer) => answer.isBestAnswer)

  return (
    <article className={`question-card ${compact ? 'compact' : ''}`}>
      <div className="question-card-top">
        <span className="category-pill">
          {category?.label || 'Раздел'}
        </span>
        <div className="question-card-stats">
          <span>{score >= 0 ? `+${score}` : score} рейтинг</span>
          <span>{question.views || 0} просмотров</span>
        </div>
      </div>

      <Link to={`/question/${question._id}`} className="question-card-title">
        {question.title}
      </Link>

      <p className="question-card-text">
        {compact ? question.description.slice(0, 140) : question.description.slice(0, 220)}
        {question.description.length > (compact ? 140 : 220) ? '...' : ''}
      </p>

      <div className="question-card-tags">
        {question.tags?.slice(0, compact ? 2 : 4).map((tag) => (
          <span key={tag} className="tag-chip">#{tag}</span>
        ))}
        {hasBestAnswer && <span className="status-pill success">Лучший ответ</span>}
      </div>

      <div className="question-card-footer">
        <div className="inline-user">
          <UserAvatar user={question.author} size="sm" />
          <div>
            <strong>{question.author?.name || question.author?.username || 'Пользователь'}</strong>
            <span>{formatRelativeTime(question.lastActivityAt || question.createdAt)}</span>
          </div>
        </div>

        <div className="question-card-meta">
          <span>{answersCount} {getAnswerCountLabel(answersCount)}</span>
          <Link to={`/question/${question._id}`} className="text-link">
            Открыть
          </Link>
        </div>
      </div>
    </article>
  )
}

export default QuestionCard
