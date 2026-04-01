export const USER_ROLES = ['user', 'expert', 'admin']

export const QUESTION_CATEGORIES = [
  {
    id: 'games',
    label: 'Игры',
    description: 'Сюжеты, кооп, настройки, выбор жанров и игровых сервисов'
  },
  {
    id: 'pc',
    label: 'ПК и сборки',
    description: 'Комплектующие, апгрейд, охлаждение, периферия и настройка'
  },
  {
    id: 'cooking',
    label: 'Готовка',
    description: 'Рецепты, ингредиенты, кухонные лайфхаки и техника'
  },
  {
    id: 'study',
    label: 'Учеба',
    description: 'Подготовка, конспекты, дедлайны и учебные стратегии'
  },
  {
    id: 'career',
    label: 'Карьера',
    description: 'Резюме, портфолио, собеседования и рост в профессии'
  },
  {
    id: 'life',
    label: 'Повседневность',
    description: 'Организация жизни, покупки, привычки и бытовые решения'
  }
]

export const QUESTION_CATEGORY_IDS = QUESTION_CATEGORIES.map(({ id }) => id)

export const CONSULTATION_SERVICES = [
  {
    id: 'pc-plan',
    label: 'Разбор сборки ПК',
    description: 'Подбор комплектующих, апгрейд под бюджет и проверка совместимости'
  },
  {
    id: 'study-roadmap',
    label: 'Учебный маршрут',
    description: 'План подготовки к экзамену, курсу или проекту с контрольными точками'
  },
  {
    id: 'career-review',
    label: 'Карьерный разбор',
    description: 'Ревью резюме, портфолио и подготовка к собеседованию'
  },
  {
    id: 'cooking-session',
    label: 'Кулинарный созвон',
    description: 'Меню на неделю, замены ингредиентов и разбор конкретного блюда'
  },
  {
    id: 'gaming-coach',
    label: 'Игровой коучинг',
    description: 'Подбор игр, настройка кооператива и разбор игровых механик'
  },
  {
    id: 'creator-feedback',
    label: 'Разбор идеи',
    description: 'Структура текста, контента, подачи и упаковки проекта'
  }
]

export const CONSULTATION_SERVICE_IDS = CONSULTATION_SERVICES.map(({ id }) => id)

export const CONSULTATION_FORMATS = ['chat', 'voice', 'video']
export const CONSULTATION_BUDGETS = ['starter', 'standard', 'pro']
export const CONSULTATION_STATUSES = ['pending', 'matched', 'confirmed', 'completed', 'cancelled']
