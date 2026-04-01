import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from './config/db.js'
import User from './models/User.js'
import Question from './models/Question.js'
import Consultation from './models/Consultation.js'

dotenv.config()

const demoUsers = [
  {
    seedKey: 'admin-topichub',
    username: 'topichub_admin',
    name: 'Администратор',
    email: 'admin@topichub.demo',
    password: 'admin1234',
    role: 'admin',
    headline: 'Управление платформой, модерация и контроль контента',
    bio: 'Системный администратор платформы. Используется для модерации и административного доступа.',
    expertise: ['Модерация', 'Управление платформой', 'Администрирование'],
    location: 'Astana IT University',
    reputation: 1500,
    isSeeded: true
  },
  {
    seedKey: 'expert-arsen-pc',
    username: 'arsen_builds',
    name: 'Арсен',
    email: 'arsen@topichub.demo',
    password: 'demo1234',
    role: 'expert',
    headline: 'Собираю ПК без переплат и случайных несовместимостей',
    bio: 'Помогаю выбрать комплектующие под реальный бюджет, а не под маркетинговые лозунги.',
    expertise: ['Сборки ПК', 'Апгрейд', 'Охлаждение'],
    location: 'Астана',
    reputation: 940,
    isSeeded: true
  },
  {
    seedKey: 'expert-aida-cooking',
    username: 'aida_kitchen',
    name: 'Аида',
    email: 'aida@topichub.demo',
    password: 'demo1234',
    role: 'expert',
    headline: 'Упрощаю готовку без потери вкуса',
    bio: 'Разбираю блюда по шагам, подбираю замены ингредиентов и помогаю собрать меню на неделю.',
    expertise: ['Рецепты', 'План питания', 'Домашняя кухня'],
    location: 'Алматы',
    reputation: 870,
    isSeeded: true
  },
  {
    seedKey: 'expert-dana-study',
    username: 'dana_studyflow',
    name: 'Дана',
    email: 'dana@topichub.demo',
    password: 'demo1234',
    role: 'expert',
    headline: 'Строю понятные учебные маршруты без хаоса',
    bio: 'Помогаю упаковать подготовку к экзаменам и курсовым в реалистичный план.',
    expertise: ['Учеба', 'Тайм-менеджмент', 'Проекты'],
    location: 'Шымкент',
    reputation: 910,
    isSeeded: true
  },
  {
    seedKey: 'expert-murat-career',
    username: 'murat_review',
    name: 'Мурат',
    email: 'murat@topichub.demo',
    password: 'demo1234',
    role: 'expert',
    headline: 'Ревью резюме, портфолио и карьерных шагов',
    bio: 'Работаю с позиционированием начинающих специалистов и упаковкой проектов.',
    expertise: ['Карьера', 'Резюме', 'Портфолио'],
    location: 'Караганда',
    reputation: 980,
    isSeeded: true
  },
  {
    seedKey: 'user-sasha',
    username: 'sasha_play',
    name: 'Саша',
    email: 'sasha@topichub.demo',
    password: 'demo1234',
    role: 'user',
    headline: 'Люблю коопы, бюджетные девайсы и быстрые ответы по делу',
    bio: 'Часто спрашиваю про игры, железо и бытовые штуки.',
    expertise: ['Игры', 'Девайсы'],
    location: 'Павлодар',
    reputation: 210,
    isSeeded: true
  },
  {
    seedKey: 'user-lena',
    username: 'lena_home',
    name: 'Лена',
    email: 'lena@topichub.demo',
    password: 'demo1234',
    role: 'user',
    headline: 'Ищу практичные решения без лишней воды',
    bio: 'Спрашиваю про рецепты, планирование и повседневные задачи.',
    expertise: ['Готовка', 'Организация'],
    location: 'Костанай',
    reputation: 175,
    isSeeded: true
  },
  {
    seedKey: 'user-ilya',
    username: 'ilya_notes',
    name: 'Илья',
    email: 'ilya@topichub.demo',
    password: 'demo1234',
    role: 'user',
    headline: 'Учеба, дедлайны и проектные разборы',
    bio: 'Собираю советы по учебе и иногда отвечаю на вопросы по заметкам и планированию.',
    expertise: ['Учеба', 'Конспекты'],
    location: 'Семей',
    reputation: 320,
    isSeeded: true
  },
  {
    seedKey: 'user-nika',
    username: 'nika_frames',
    name: 'Ника',
    email: 'nika@topichub.demo',
    password: 'demo1234',
    role: 'user',
    headline: 'Иногда задаю вопросы, иногда вытаскиваю полезные ответы из хаоса',
    bio: 'Люблю нормальную структуру и короткие списки без кликбейта.',
    expertise: ['Карьера', 'Контент'],
    location: 'Тараз',
    reputation: 285,
    isSeeded: true
  },
  {
    seedKey: 'user-timur',
    username: 'timur_case',
    name: 'Тимур',
    email: 'timur@topichub.demo',
    password: 'demo1234',
    role: 'user',
    headline: 'Задаю бытовые и технические вопросы, когда не хочу искать по десяти форумам',
    bio: 'Обычно спрашиваю по железу, играм и полезным привычкам.',
    expertise: ['ПК', 'Повседневность'],
    location: 'Актобе',
    reputation: 248,
    isSeeded: true
  }
]

const questionSeed = [
  {
    seedKey: 'q-pc-airflow',
    authorKey: 'user-timur',
    title: 'Как собрать тихий ПК для игр и монтажа без переплаты за “премиум” корпус?',
    description: 'Нужен системник примерно под 900 000 тенге. Играю в Cyberpunk и Apex, иногда монтирую ролики в Premiere. Хочу, чтобы корпус не гудел как пылесос, но и не был просто дорогой коробкой. На что смотреть по вентиляторам, башне и расположению блоков?',
    category: 'pc',
    tags: ['корпус', 'охлаждение', 'сборка', 'игры'],
    upvoteKeys: ['expert-arsen-pc', 'user-sasha', 'user-ilya', 'user-nika'],
    downvoteKeys: [],
    views: 182,
    answers: [
      {
        authorKey: 'expert-arsen-pc',
        content: 'Смотри на сетчатый фронт, минимум три вентилятора в комплекте и корпус, куда влезает нормальная башня 160 мм+. Самая частая ошибка: покупают красивый закрытый корпус и потом поднимают обороты, чтобы компенсировать плохой приток воздуха. Если бюджет около 900к, лучше вложиться в тихие вентиляторы и нормальный кулер, чем переплачивать за стекло и RGB.',
        isBestAnswer: true,
        upvoteKeys: ['user-timur', 'user-sasha', 'user-ilya']
      },
      {
        authorKey: 'user-nika',
        content: 'Еще проверь, насколько удобно чистить пылевые фильтры. Если их неудобно снимать, корпус быстро начнет шуметь сильнее просто из-за грязи.',
        isBestAnswer: false,
        upvoteKeys: ['user-lena']
      }
    ]
  },
  {
    seedKey: 'q-games-coop',
    authorKey: 'user-sasha',
    title: 'Посоветуйте кооперативную игру на двоих, чтобы не требовала 100 часов влета',
    description: 'Хочется что-то пройти вдвоем вечером после работы. Важно, чтобы игра не душила десятком систем сразу и давала ощущение прогресса уже в первые 2-3 сессии. Подойдут и сюжетные, и смешные варианты.',
    category: 'games',
    tags: ['кооп', 'steam', 'сюжет', 'вечером'],
    upvoteKeys: ['user-lena', 'user-nika', 'expert-dana-study'],
    downvoteKeys: [],
    views: 143,
    answers: [
      {
        authorKey: 'user-ilya',
        content: 'Если нужен мягкий вход, возьмите It Takes Two. Она буквально построена так, чтобы каждый час подбрасывать новую механику и не утомлять повторением.',
        isBestAnswer: true,
        upvoteKeys: ['user-sasha', 'user-lena', 'expert-murat-career']
      },
      {
        authorKey: 'expert-murat-career',
        content: 'Если хотите меньше платформинга и больше разговоров, попробуйте We Were Here. Там кайф именно в коммуникации и коротких сессиях.',
        isBestAnswer: false,
        upvoteKeys: ['user-timur']
      }
    ]
  },
  {
    seedKey: 'q-cooking-cream',
    authorKey: 'user-lena',
    title: 'Чем заменить сливки в пасте, если хочется легче, но чтобы соус не стал водой?',
    description: 'Готовлю пасту дома, сливки дают вкус, но иногда хочется сделать блюдо менее тяжелым. Пробовала молоко, но получается жидко и вообще не держится на пасте. Чем заменить и как не испортить текстуру?',
    category: 'cooking',
    tags: ['паста', 'соус', 'замены', 'рецепт'],
    upvoteKeys: ['expert-aida-cooking', 'user-nika', 'user-sasha'],
    downvoteKeys: [],
    views: 201,
    answers: [
      {
        authorKey: 'expert-aida-cooking',
        content: 'Самый рабочий вариант: немного греческого йогурта или мягкого творожного сыра плюс вода от пасты. Сначала снизь огонь, иначе кисломолочка может свернуться. Текстуру держит крахмал из воды, а вкус не уходит в пустоту.',
        isBestAnswer: true,
        upvoteKeys: ['user-lena', 'user-ilya', 'user-sasha', 'user-timur']
      }
    ]
  },
  {
    seedKey: 'q-study-kursovoy',
    authorKey: 'user-ilya',
    title: 'Как разложить курсовой проект на этапы, если дедлайн через три недели?',
    description: 'Есть тема, есть примерное понимание стека, но всё ощущается как один огромный ком задач. Нужен не “мотивационный” совет, а рабочая схема: как разбить проект, чтобы к защите не осталась паника и недоделанный интерфейс.',
    category: 'study',
    tags: ['курсовой', 'дедлайн', 'планирование', 'react'],
    upvoteKeys: ['expert-dana-study', 'expert-murat-career', 'user-nika'],
    downvoteKeys: [],
    views: 231,
    answers: [
      {
        authorKey: 'expert-dana-study',
        content: 'Разбей на три контура: база, защита, полировка. Первая неделя: структура, база данных, ключевые страницы и маршруты. Вторая: сценарии пользователя, адаптив, тексты ошибок и наполнение контентом. Третья: визуал, тесты, репетиция демонстрации и скриншоты. Если задача не влияет на показ основного сценария, она не должна съедать начало проекта.',
        isBestAnswer: true,
        upvoteKeys: ['user-ilya', 'user-lena', 'user-sasha']
      },
      {
        authorKey: 'user-nika',
        content: 'Еще сразу выпиши, что показываешь на защите. Очень многие делают наоборот: сначала полируют мелочи, а потом выясняется, что связка “регистрация -> действие -> результат” не готова.',
        isBestAnswer: false,
        upvoteKeys: ['expert-dana-study']
      }
    ]
  },
  {
    seedKey: 'q-career-portfolio',
    authorKey: 'user-nika',
    title: 'Стоит ли класть учебный проект в портфолио, если он выглядит неидеально, но рабочий?',
    description: 'Есть учебный pet-проект на React + Node, без супер-уникальной идеи, но с авторизацией, БД и нормальной структурой. Думаю, оставлять ли его в портфолио или ждать “идеального” кейса. Боюсь, что слабый визуал все испортит.',
    category: 'career',
    tags: ['портфолио', 'react', 'junior', 'резюме'],
    upvoteKeys: ['expert-murat-career', 'expert-dana-study', 'user-ilya'],
    downvoteKeys: [],
    views: 165,
    answers: [
      {
        authorKey: 'expert-murat-career',
        content: 'Оставлять стоит, если ты умеешь его объяснить и показать решения. Рабочий учебный проект лучше пустого портфолио. Но обязательно упакуй его: краткое описание задачи, стек, 3-4 скрина, что реализовано, где сложность и что бы улучшил дальше.',
        isBestAnswer: true,
        upvoteKeys: ['user-nika', 'user-ilya', 'user-lena', 'expert-arsen-pc']
      }
    ]
  },
  {
    seedKey: 'q-life-morning',
    authorKey: 'user-timur',
    title: 'Как сделать утро собраннее, если постоянно начинаю день с телефона и теряю полчаса?',
    description: 'Не ищу супер-систему “измени жизнь за день”. Нужны приземленные штуки, которые реально работают: как убрать автоматическое залипание в ленту и быстрее входить в рабочий ритм.',
    category: 'life',
    tags: ['привычки', 'утро', 'фокус', 'день'],
    upvoteKeys: ['user-lena', 'user-ilya', 'expert-dana-study'],
    downvoteKeys: [],
    views: 119,
    answers: [
      {
        authorKey: 'expert-dana-study',
        content: 'Самый приземленный вариант: телефон не должен быть первой точкой контакта после пробуждения. Перенеси зарядку подальше от кровати и подготовь маленький офлайн-триггер на утро: вода, список из трех дел, одежда. Чем меньше решений утром, тем меньше шанс скатиться в ленту.',
        isBestAnswer: true,
        upvoteKeys: ['user-timur', 'user-sasha']
      }
    ]
  }
]

const consultationSeed = [
  {
    seedKey: 'c-pc-upgrade',
    userKey: 'user-timur',
    expertKey: 'expert-arsen-pc',
    topic: 'Подобрать апгрейд для 1440p без полной замены сборки',
    description: 'Хочу понять, что выгоднее поменять сейчас: видеокарту, блок питания или охлаждение. Нужен спокойный разбор по бюджету.',
    goal: 'Собрать план апгрейда на ближайшие 3 месяца',
    serviceCategory: 'pc-plan',
    format: 'voice',
    preferredDate: '2026-04-03T00:00:00.000Z',
    preferredTime: '19:00',
    status: 'confirmed',
    notes: 'Подготовить текущую конфигурацию и список игр.'
  },
  {
    seedKey: 'c-study-roadmap',
    userKey: 'user-ilya',
    expertKey: 'expert-dana-study',
    topic: 'Разложить курсовой на рабочие спринты до защиты',
    description: 'Есть тема проекта, стек и часть верстки. Нужен план, чтобы дойти до защиты без хаоса.',
    goal: 'Сделать недельную карту задач и приоритетов',
    serviceCategory: 'study-roadmap',
    format: 'chat',
    preferredDate: '2026-04-02T00:00:00.000Z',
    preferredTime: '17:30',
    status: 'matched',
    notes: 'Собрать ссылки на критерии и текущий репозиторий.'
  },
  {
    seedKey: 'c-cooking-menu',
    userKey: 'user-lena',
    expertKey: 'expert-aida-cooking',
    topic: 'Собрать простое меню на 5 дней без дорогих ингредиентов',
    description: 'Хочу готовить быстрее и перестать каждый вечер думать, что сделать на ужин.',
    goal: 'Получить меню, список покупок и заготовки на неделю',
    serviceCategory: 'cooking-session',
    format: 'video',
    preferredDate: '2026-04-05T00:00:00.000Z',
    preferredTime: '13:00',
    status: 'completed',
    notes: 'Уже есть базовый набор круп и духовка.'
  },
  {
    seedKey: 'c-career-portfolio',
    userKey: 'user-nika',
    expertKey: 'expert-murat-career',
    topic: 'Упаковать учебный проект в портфолио и убрать ощущение “сырости”',
    description: 'Нужно понять, как подать проект так, чтобы он выглядел как осмысленный кейс, а не просто домашка.',
    goal: 'Сделать структуру кейса для резюме и Behance/GitHub',
    serviceCategory: 'career-review',
    format: 'voice',
    preferredDate: '2026-04-06T00:00:00.000Z',
    preferredTime: '20:15',
    status: 'pending',
    notes: 'Нужно принести скриншоты и короткое описание проблемы.'
  }
]

const userMap = new Map()

const getUserId = (seedKey) => userMap.get(seedKey)?._id

const buildVotes = (keys = []) => keys.map((seedKey) => getUserId(seedKey)).filter(Boolean)

const upsertUser = async (userData) => {
  let user = await User.findOne({ seedKey: userData.seedKey })

  if (!user) {
    user = await User.findOne({ email: userData.email })
  }

  if (!user) {
    user = new User(userData)
  } else {
    Object.assign(user, userData)
  }

  await user.save()
  userMap.set(userData.seedKey, user)
}

const upsertQuestion = async (questionData) => {
  const payload = {
    seedKey: questionData.seedKey,
    isSeeded: true,
    title: questionData.title,
    description: questionData.description,
    category: questionData.category,
    tags: questionData.tags,
    author: getUserId(questionData.authorKey),
    views: questionData.views,
    upvotes: buildVotes(questionData.upvoteKeys),
    downvotes: buildVotes(questionData.downvoteKeys),
    answers: questionData.answers.map((answer) => ({
      content: answer.content,
      author: getUserId(answer.authorKey),
      isBestAnswer: answer.isBestAnswer,
      upvotes: buildVotes(answer.upvoteKeys),
      downvotes: [],
      createdAt: new Date()
    })),
    status: questionData.answers.length ? 'answered' : 'open',
    lastActivityAt: new Date()
  }

  let question = await Question.findOne({ seedKey: questionData.seedKey })

  if (!question) {
    question = new Question(payload)
  } else {
    Object.assign(question, payload)
    question.markModified('answers')
    question.markModified('upvotes')
    question.markModified('downvotes')
  }

  await question.save()
}

const upsertConsultation = async (consultationData) => {
  const payload = {
    seedKey: consultationData.seedKey,
    isSeeded: true,
    topic: consultationData.topic,
    description: consultationData.description,
    goal: consultationData.goal,
    serviceCategory: consultationData.serviceCategory,
    format: consultationData.format,
    preferredDate: consultationData.preferredDate,
    preferredTime: consultationData.preferredTime,
    user: getUserId(consultationData.userKey),
    expert: getUserId(consultationData.expertKey),
    status: consultationData.status,
    notes: consultationData.notes
  }

  let consultation = await Consultation.findOne({ seedKey: consultationData.seedKey })

  if (!consultation) {
    consultation = new Consultation(payload)
  } else {
    Object.assign(consultation, payload)
  }

  await consultation.save()
}

const seed = async () => {
  try {
    await connectDB()

    for (const user of demoUsers) {
      await upsertUser(user)
    }

    for (const question of questionSeed) {
      await upsertQuestion(question)
    }

    for (const consultation of consultationSeed) {
      await upsertConsultation(consultation)
    }

    console.log(`Seed completed: ${demoUsers.length} users, ${questionSeed.length} questions, ${consultationSeed.length} consultations`)
    await mongoose.connection.close()
  } catch (error) {
    console.error('Seed error:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

seed()
