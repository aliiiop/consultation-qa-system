export const BRAND = {
  name: 'TopicHub',
  subtitle: 'Вопросы, ответы и персональные разборы с менторами'
}

export const QUESTION_CATEGORIES = [
  {
    id: 'games',
    label: 'Игры',
    description: 'Кооп, одиночные проекты, сервисы и игровые настройки',
    icon: 'fa-solid fa-gamepad'
  },
  {
    id: 'pc',
    label: 'ПК и сборки',
    description: 'Комплектующие, апгрейд, периферия и охлаждение',
    icon: 'fa-solid fa-microchip'
  },
  {
    id: 'cooking',
    label: 'Готовка',
    description: 'Рецепты, ингредиенты, меню и кухонные лайфхаки',
    icon: 'fa-solid fa-utensils'
  },
  {
    id: 'study',
    label: 'Учеба',
    description: 'Курсовые, дедлайны, конспекты и стратегия подготовки',
    icon: 'fa-solid fa-book-open'
  },
  {
    id: 'career',
    label: 'Карьера',
    description: 'Резюме, портфолио, рост и собеседования',
    icon: 'fa-solid fa-briefcase'
  },
  {
    id: 'life',
    label: 'Повседневность',
    description: 'Быт, привычки, покупки и организация дня',
    icon: 'fa-solid fa-compass'
  }
]

export const QUESTION_CATEGORY_MAP = Object.fromEntries(
  QUESTION_CATEGORIES.map((category) => [category.id, category])
)

export const QUESTION_FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'answered', label: 'С ответами' },
  { id: 'unanswered', label: 'Без ответов' }
]

export const QUESTION_SORTS = [
  { id: 'active', label: 'Сначала активные' },
  { id: 'popular', label: 'Сначала популярные' },
  { id: 'latest', label: 'Сначала новые' }
]

export const ASK_GUIDES = {
  games: ['Укажи платформу', 'Опиши жанр или похожие игры', 'Скажи, нужен соло или кооп'],
  pc: ['Напиши бюджет', 'Уточни задачи: игры, монтаж, работа', 'Перечисли, что уже есть'],
  cooking: ['Скажи, какие ингредиенты доступны', 'Уточни технику: духовка, плита, мультиварка', 'Напиши, что уже пробовал'],
  study: ['Опиши дедлайн', 'Разбей задачу на результат и ограничения', 'Укажи стек или формат проекта'],
  career: ['Напиши цель: стажировка, junior, смена роли', 'Укажи, что уже есть', 'Покажи ограничения и слабые места'],
  life: ['Опиши контекст', 'Скажи, что уже не сработало', 'Уточни, нужен быстрый или долгосрочный вариант']
}

export const CONSULTATION_SERVICES = [
  {
    id: 'pc-plan',
    label: 'Разбор сборки ПК',
    description: 'Подбор комплектующих, бюджет, апгрейд и совместимость',
    icon: 'fa-solid fa-desktop',
    outcomes: ['План покупки', 'Проверка совместимости', 'Приоритеты апгрейда']
  },
  {
    id: 'study-roadmap',
    label: 'Учебный маршрут',
    description: 'План курсового, подготовки или большого проекта',
    icon: 'fa-solid fa-graduation-cap',
    outcomes: ['Спринты по неделям', 'Приоритеты', 'План демонстрации']
  },
  {
    id: 'career-review',
    label: 'Карьерный разбор',
    description: 'Ревью резюме, портфолио и упаковки проекта',
    icon: 'fa-solid fa-id-card',
    outcomes: ['Фидбек по кейсу', 'Чек-лист улучшений', 'Структура подачи']
  },
  {
    id: 'cooking-session',
    label: 'Кулинарный созвон',
    description: 'Меню на неделю, адаптация рецептов и замены ингредиентов',
    icon: 'fa-solid fa-pepper-hot',
    outcomes: ['Меню', 'Список покупок', 'Упрощенные рецепты']
  },
  {
    id: 'gaming-coach',
    label: 'Игровой коучинг',
    description: 'Подбор игр, настройка коопа и разбор механик',
    icon: 'fa-solid fa-headset',
    outcomes: ['Подборка игр', 'Настройка сессии', 'План входа без перегруза']
  },
  {
    id: 'creator-feedback',
    label: 'Разбор идеи',
    description: 'Структура текста, контента и упаковки проекта',
    icon: 'fa-solid fa-lightbulb',
    outcomes: ['Каркас подачи', 'Слабые места', 'План доработки']
  }
]

export const CONSULTATION_SERVICE_MAP = Object.fromEntries(
  CONSULTATION_SERVICES.map((service) => [service.id, service])
)

export const CONSULTATION_FORMATS = [
  { id: 'chat', label: 'Чат', hint: 'Подходит для коротких разборов и текстового плана' },
  { id: 'voice', label: 'Голос', hint: 'Быстро пройтись по решению и уточнить детали' },
  { id: 'video', label: 'Видео', hint: 'Удобно для экрана, макетов и демонстраций' }
]

export const CONSULTATION_STATUS_MAP = {
  pending: { label: 'Ждет подбора ментора', tone: 'warning' },
  matched: { label: 'Ментор найден', tone: 'info' },
  confirmed: { label: 'Подтверждена', tone: 'success' },
  completed: { label: 'Завершена', tone: 'neutral' },
  cancelled: { label: 'Отменена', tone: 'danger' }
}
