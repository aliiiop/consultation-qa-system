export const formatDate = (value, options = {}) => {
  if (!value) {
    return 'Без даты'
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...options
  }).format(new Date(value))
}

export const formatRelativeTime = (value) => {
  if (!value) {
    return 'только что'
  }

  const target = new Date(value).getTime()
  const diffMs = target - Date.now()
  const diffMinutes = Math.round(diffMs / 60000)
  const rtf = new Intl.RelativeTimeFormat('ru-RU', { numeric: 'auto' })

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minute')
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour')
  }

  const diffDays = Math.round(diffHours / 24)
  return rtf.format(diffDays, 'day')
}

export const getInitials = (user) => {
  const source = user?.name || user?.username || 'TH'
  return source
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

export const getScore = (item) => {
  return (item?.upvotes?.length || 0) - (item?.downvotes?.length || 0)
}

export const getAnswerCountLabel = (count) => {
  if (count === 1) {
    return 'ответ'
  }

  if (count >= 2 && count <= 4) {
    return 'ответа'
  }

  return 'ответов'
}
