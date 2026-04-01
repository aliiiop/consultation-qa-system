import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

// Сохраняем историю для контекста
const conversationHistory = {}

/**
 * НАСТРОЙКА GROQ AI
 *
 * 1. Получить API ключ:
 *    - Перейти на https://console.groq.com
 *    - Создать аккаунт бесплатно (без платежей!)
 *    - Скопировать API ключ
 *
 * 2. Добавить в .env файл:
 *    GROQ_API_KEY=ваш_ключ_от_groq
 *
 * 3. Установить пакет (если еще не установлен):
 *    npm install groq-sdk
 *
 * 4. ВСЕ! ИИ работает!
 */

// Если нет API ключа, используем базу знаний
const USE_GROQ = !!process.env.GROQ_API_KEY

let groq = null

// Пытаемся импортировать groq-sdk если установлен
if (USE_GROQ) {
  try {
    const GroqModule = await import('groq-sdk')
    const Groq = GroqModule.default
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    })
    console.log('✅ Groq AI подключен!')
  } catch (error) {
    console.warn('⚠️ Groq SDK не установлен. Используется база знаний.')
    console.warn('Установите: npm install groq-sdk')
  }
}

// База знаний (для случая без Groq)
const knowledgeBase = {
  'react': 'React - это JavaScript библиотека для создания пользовательских интерфейсов. Основные концепции: компоненты (Components), пропсы (Props), состояние (State), хуки (Hooks - useState, useEffect, useContext)',
  'hooks': 'React Hooks - это функции которые позволяют использовать state и другие возможности React в функциональных компонентах. Основные: useState (состояние), useEffect (побочные эффекты), useContext (глобальное состояние)',
  'node': 'Node.js - это серверная платформа на базе JavaScript. Используется для создания backend приложений, REST API, работы с БД',
  'mongodb': 'MongoDB - это NoSQL база данных, которая хранит данные в формате JSON документов. Очень удобна для JavaScript приложений',
  'javascript': 'JavaScript - язык программирования для браузера и сервера (Node.js). Используется в frontend (React) и backend (Node.js)',
  'программирование': 'Программирование - процесс создания программ. Начните с: переменные, циклы, функции → React/Vue → Node.js/Python → БД',
  'веб-разработка': 'Веб-разработка включает: Frontend (HTML, CSS, JavaScript, React), Backend (Node.js, Express, MongoDB), DevOps (Git, Docker, Deploy)',
  'консультация': 'Вы можете записаться на консультацию через раздел "Консультации". Там вам помогут эксперты',
  'вопрос': 'Вы можете задать вопрос в разделе "Задать вопрос". Ответы дают эксперты и другие пользователи',
  'регистрация': 'Нажмите кнопку "Регистрация" в меню. Введите: имя (3+ символов), email, пароль (6+ символов)',
}

const greetings = ['привет', 'здравствуй', 'добрый', 'hello', 'hi', 'hey']
const thanks = ['спасибо', 'благодарю', 'thanks', 'спс', 'пасиб']

// Функция для использования местной базы знаний
function generateLocalResponse(message) {
  const lowerMessage = message.toLowerCase()

  // Приветствия
  if (greetings.some(g => lowerMessage.includes(g))) {
    return 'Привет! 👋 Я AI-помощник этой платформы. Чем я могу помочь? Могу ответить на вопросы о программировании, React, Node.js, MongoDB или помочь разобраться с функциями сайта.'
  }

  // Благодарности
  if (thanks.some(t => lowerMessage.includes(t))) {
    return 'Пожалуйста! 😊 Рад был помочь. Если есть еще вопросы - спрашивайте!'
  }

  // Поиск в базе знаний
  for (const [keyword, response] of Object.entries(knowledgeBase)) {
    if (lowerMessage.includes(keyword)) {
      return response
    }
  }

  // Общие вопросы
  if (lowerMessage.includes('помощь') || lowerMessage.includes('help')) {
    return 'Я помогу с:\n• Вопросами о программировании\n• React, Node.js, MongoDB\n• Навигацией по сайту\n• Советами для начинающих\n\nЧто именно вас интересует?'
  }

  if ((lowerMessage.includes('как') || lowerMessage.includes('с чего')) &&
      (lowerMessage.includes('начать') || lowerMessage.includes('изучать'))) {
    return 'Рекомендуемый путь обучения:\n1️⃣ HTML и CSS (основы вёрстки)\n2️⃣ JavaScript (язык программирования)\n3️⃣ React (фреймворк для UI)\n4️⃣ Node.js (backend)\n5️⃣ MongoDB (база данных)\n\nЭто путь, который мы использовали в нашем проекте!'
  }

  // Дефолтный ответ
  return 'Интересный вопрос! 🤔 Для детального ответа рекомендую:\n\n1. Задать в разделе "Вопросы" - ответят эксперты\n2. Записаться на консультацию\n3. Переформулировать вопрос\n\nМногие вопросы я смогу ответить если вы дадите больше контекста!'
}

// @route   POST /api/ai/chat
// @desc    Общение с AI помощником
// @access  Public
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body
    const userId = req.body.userId || 'anonymous'

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Сообщение не может быть пустым',
        response: 'Пожалуйста, напишите вопрос 😊'
      })
    }

    let aiResponse = ''

    // Если Groq доступен - используем настоящий ИИ
    if (groq && USE_GROQ) {
      try {
        // Подготавливаем историю для контекста
        const conversationMessages = [
          {
            role: 'system',
            content: `Ты helpful AI-помощник (на русском) на платформе для консультаций и вопросов-ответов о программировании.
            Помогаешь с вопросами о: React, Node.js, JavaScript, MongoDB, веб-разработке.
            Отвечаешь кратко и по существу. Используешь примеры кода когда нужно.
            Знаешь о функциях этой платформы: задавание вопросов, консультации, AI помощник.`
          }
        ]

        // Добавляем историю если есть
        if (history && history.length > 0) {
          history.slice(-5).forEach(msg => { // последние 5 сообщений для контекста
            conversationMessages.push({
              role: msg.role,
              content: msg.content
            })
          })
        }

        // Добавляем текущее сообщение
        conversationMessages.push({
          role: 'user',
          content: message
        })

        // Запрос к Groq API
        const completion = await groq.chat.completions.create({
          messages: conversationMessages,
          model: 'mixtral-8x7b-32768', // бесплатная модель с бесплатными лимитами
          max_tokens: 500,
          temperature: 0.7
        })

        aiResponse = completion.choices[0].message.content
      } catch (groqError) {
        console.error('Ошибка Groq API:', groqError)
        // Если ошибка с API - использем базу знаний
        aiResponse = generateLocalResponse(message)
      }
    } else {
      // Используем местную базу знаний
      aiResponse = generateLocalResponse(message)
    }

    res.json({
      response: aiResponse,
      timestamp: new Date(),
      aiType: USE_GROQ && groq ? 'groq' : 'knowledge_base'
    })
  } catch (error) {
    console.error('Ошибка в /api/ai/chat:', error)
    res.status(500).json({
      error: 'Ошибка при обработке запроса',
      response: '😔 Произошла ошибка. Попробуйте переформулировать вопрос.'
    })
  }
})

// @route   GET /api/ai/suggestions
// @desc    Получить предложенные вопросы
// @access  Public
router.get('/suggestions', (req, res) => {
  const suggestions = [
    'Как начать изучать программирование?',
    'В чем разница между React Hooks?',
    'Как работает Node.js?',
    'Что такое MongoDB и как её использовать?',
    'Как задать вопрос на нашей платформе?'
  ]

  res.json({ suggestions })
})

// @route   GET /api/ai/status
// @desc    Проверить статус ИИ
// @access  Public
router.get('/status', (req, res) => {
  res.json({
    aiAvailable: groq && USE_GROQ ? true : false,
    type: groq && USE_GROQ ? 'Groq AI (mixtral-8x7b-32768)' : 'Knowledge Base (local)',
    message: groq && USE_GROQ
      ? 'Используется настоящий ИИ через Groq API'
      : 'Используется местная база знаний (для полного ИИ добавьте GROQ_API_KEY в .env)'
  })
})

export default router

