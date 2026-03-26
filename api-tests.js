// Тесты API для системы онлайн-консультаций
// Используйте Postman или любой другой REST клиент

const API_BASE_URL = 'http://localhost:5000/api'

// Примеры запросов для тестирования

// 1. РЕГИСТРАЦИЯ
// POST /api/auth/register
const registerData = {
  username: "testuser",
  email: "test@example.com",
  password: "password123"
}

// 2. ВХОД
// POST /api/auth/login
const loginData = {
  email: "test@example.com",
  password: "password123"
}

// 3. СОЗДАНИЕ ВОПРОСА (требуется токен)
// POST /api/questions
// Headers: Authorization: Bearer <token>
const questionData = {
  title: "Как начать изучать React?",
  description: "Я новичок в веб-разработке и хочу изучить React. С чего мне начать?",
  category: "programming"
}

// 4. ПОЛУЧЕНИЕ ВСЕХ ВОПРОСОВ
// GET /api/questions

// 5. ПОЛУЧЕНИЕ ВОПРОСА ПО ID
// GET /api/questions/:id

// 6. ДОБАВЛЕНИЕ ОТВЕТА (требуется токен)
// POST /api/questions/:id/answers
// Headers: Authorization: Bearer <token>
const answerData = {
  content: "Рекомендую начать с официальной документации React и создать несколько простых проектов."
}

// 7. СОЗДАНИЕ КОНСУЛЬТАЦИИ (требуется токен)
// POST /api/consultations
// Headers: Authorization: Bearer <token>
const consultationData = {
  topic: "Консультация по веб-разработке",
  description: "Нужна помощь с выбором технологий для проекта",
  preferredDate: "2026-04-01",
  preferredTime: "14:00"
}

// 8. ПОЛУЧЕНИЕ МОИХ ВОПРОСОВ (требуется токен)
// GET /api/questions/my
// Headers: Authorization: Bearer <token>

// 9. ПОЛУЧЕНИЕ МОИХ КОНСУЛЬТАЦИЙ (требуется токен)
// GET /api/consultations/my
// Headers: Authorization: Bearer <token>

export {
  API_BASE_URL,
  registerData,
  loginData,
  questionData,
  answerData,
  consultationData
}
