import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

const DEFAULT_AI_PROVIDER = 'auto'
const DEFAULT_GROQ_MODEL = 'llama-3.1-8b-instant'
const DEFAULT_OPENROUTER_MODEL = 'meta-llama/llama-3.2-3b-instruct:free'

const normalizeSecret = (value = '') => value.trim().replace(/^["']|["']$/g, '')

const AI_PROVIDER = (process.env.AI_PROVIDER || DEFAULT_AI_PROVIDER).trim().toLowerCase()
const GROQ_MODEL = process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL
const rawGroqApiKey = normalizeSecret(process.env.GROQ_API_KEY || '')
const rawOpenRouterApiKey = normalizeSecret(process.env.OPENROUTER_API_KEY || '')

const isPlaceholderValue = (value = '') => {
  const normalized = value.trim().toLowerCase()

  if (!normalized) {
    return true
  }

  return [
    'your_groq_api_key_here',
    'your_groq_key_here',
    'your_openrouter_api_key_here',
    'your_openrouter_key_here',
    'ваш_ключ_от_groq',
    'ваш_ключ_от_openrouter'
  ].includes(normalized)
}

const providers = {
  groq: {
    configured: !isPlaceholderValue(rawGroqApiKey),
    model: GROQ_MODEL,
    client: null
  },
  openrouter: {
    configured: !isPlaceholderValue(rawOpenRouterApiKey),
    model: OPENROUTER_MODEL
  }
}

const aiRuntime = {
  configured: false,
  ready: false,
  provider: 'knowledge_base',
  model: null,
  reason: 'Не настроен внешний AI-провайдер'
}

const markProviderReady = (providerName, reason) => {
  aiRuntime.configured = true
  aiRuntime.ready = true
  aiRuntime.provider = providerName
  aiRuntime.model = providers[providerName]?.model || null
  aiRuntime.reason = reason
}

const markProviderUnavailable = (providerName, reason) => {
  aiRuntime.configured = providerName !== 'knowledge_base'
  aiRuntime.ready = false
  aiRuntime.provider = providerName
  aiRuntime.model = providers[providerName]?.model || null
  aiRuntime.reason = reason
}

const selectProvider = () => {
  if (AI_PROVIDER === 'groq') {
    return providers.groq.configured ? 'groq' : null
  }

  if (AI_PROVIDER === 'openrouter') {
    return providers.openrouter.configured ? 'openrouter' : null
  }

  if (providers.openrouter.configured) {
    return 'openrouter'
  }

  if (providers.groq.configured) {
    return 'groq'
  }

  return null
}

const selectedProvider = selectProvider()

if (selectedProvider === 'groq') {
  try {
    const GroqModule = await import('groq-sdk')
    const Groq = GroqModule.default

    providers.groq.client = new Groq({
      apiKey: rawGroqApiKey
    })

    markProviderReady('groq', `Используется Groq (${providers.groq.model})`)
  } catch (error) {
    markProviderUnavailable('groq', `Не удалось инициализировать Groq SDK: ${error.message}`)
    console.warn(aiRuntime.reason)
  }
} else if (selectedProvider === 'openrouter') {
  markProviderReady('openrouter', `Используется OpenRouter (${providers.openrouter.model})`)
} else {
  aiRuntime.reason = 'Не задан AI_PROVIDER или отсутствуют валидные API-ключи'
}

const knowledgeBase = {
  react: 'React это библиотека для создания интерфейсов. Основные идеи: компоненты, props, state, эффекты и маршрутизация.',
  hooks: 'React Hooks позволяют использовать состояние и эффекты в функциональных компонентах. Чаще всего используют useState, useEffect и useContext.',
  node: 'Node.js это серверная среда выполнения JavaScript. Ее используют для API, авторизации, работы с файлами и базой данных.',
  mongodb: 'MongoDB это документная NoSQL база данных. В проекте она хранит пользователей, вопросы, ответы и консультации.',
  javascript: 'JavaScript используется и на клиенте, и на сервере. В этом проекте фронтенд сделан на React, а backend на Node.js и Express.',
  консультация: 'Для записи на консультацию открой раздел с консультациями, выбери эксперта, формат и удобное время.',
  вопрос: 'Чтобы задать вопрос, открой страницу создания вопроса, выбери раздел, добавь описание и теги.',
  регистрация: 'Для регистрации нужны username, email и пароль. После входа можно задавать вопросы, отвечать и пользоваться консультациями.'
}

const greetings = ['привет', 'здравствуй', 'добрый день', 'hello', 'hi', 'hey']
const thanks = ['спасибо', 'благодарю', 'thanks', 'спс', 'пасиб']

const buildConversationMessages = (message, history = []) => {
  const conversationMessages = [
    {
      role: 'system',
      content: [
        'Ты AI-помощник платформы TopicHub.',
        'Отвечай на русском языке кратко, понятно и по делу.',
        'Ты помогаешь с темами по React, Node.js, MongoDB, JavaScript и функциям самой платформы.',
        'Если вопрос требует точных шагов, давай их списком без лишней воды.'
      ].join(' ')
    }
  ]

  if (Array.isArray(history) && history.length > 0) {
    history.slice(-6).forEach((item) => {
      if (!item?.content || (item.role !== 'user' && item.role !== 'assistant')) {
        return
      }

      conversationMessages.push({
        role: item.role,
        content: item.content
      })
    })
  }

  conversationMessages.push({
    role: 'user',
    content: message
  })

  return conversationMessages
}

const generateLocalResponse = (message) => {
  const lowerMessage = message.toLowerCase()

  if (greetings.some((item) => lowerMessage.includes(item))) {
    return 'Привет. Я встроенный помощник TopicHub. Могу подсказать по платформе, формулировке вопроса и базовым темам по разработке.'
  }

  if (thanks.some((item) => lowerMessage.includes(item))) {
    return 'Пожалуйста. Если хочешь, уточни вопрос, и я отвечу точнее.'
  }

  for (const [keyword, response] of Object.entries(knowledgeBase)) {
    if (lowerMessage.includes(keyword)) {
      return response
    }
  }

  if (lowerMessage.includes('помощь') || lowerMessage.includes('help')) {
    return 'Я могу помочь с вопросами по React, Node.js, MongoDB, структуре проекта и навигации по платформе.'
  }

  if ((lowerMessage.includes('как') || lowerMessage.includes('с чего')) && lowerMessage.includes('начать')) {
    return 'Начни с HTML и CSS, затем JavaScript, после этого React, Node.js и MongoDB. Это тот же стек, который используется в проекте.'
  }

  return 'Могу помочь лучше, если ты уточнишь тему, стек, ошибку или ожидаемый результат.'
}

const requestGroq = async (message, history) => {
  const completion = await providers.groq.client.chat.completions.create({
    model: providers.groq.model,
    messages: buildConversationMessages(message, history),
    max_tokens: 500,
    temperature: 0.7
  })

  return {
    provider: 'groq',
    model: providers.groq.model,
    response: completion.choices?.[0]?.message?.content?.trim() || 'Не удалось получить содержательный ответ от Groq.'
  }
}

const requestOpenRouter = async (message, history) => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${rawOpenRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'TopicHub'
    },
    body: JSON.stringify({
      model: providers.openrouter.model,
      messages: buildConversationMessages(message, history),
      max_tokens: 500,
      temperature: 0.7
    })
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMessage = payload?.error?.message || response.statusText || 'OpenRouter request failed'
    const error = new Error(errorMessage)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return {
    provider: 'openrouter',
    model: providers.openrouter.model,
    response: payload?.choices?.[0]?.message?.content?.trim() || 'Не удалось получить содержательный ответ от OpenRouter.'
  }
}

router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body || {}

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: 'Сообщение не может быть пустым',
        response: 'Напиши вопрос или описание проблемы.'
      })
    }

    const trimmedMessage = message.trim()
    let result = null
    let fallbackReason = aiRuntime.ready ? null : aiRuntime.reason
    const attemptedProvider = aiRuntime.provider

    try {
      if (aiRuntime.ready && aiRuntime.provider === 'groq') {
        result = await requestGroq(trimmedMessage, history)
      } else if (aiRuntime.ready && aiRuntime.provider === 'openrouter') {
        result = await requestOpenRouter(trimmedMessage, history)
      }
    } catch (providerError) {
      fallbackReason = `${attemptedProvider} request failed${providerError.status ? ` (${providerError.status})` : ''}: ${providerError.message}`

      if (providerError.status === 401 && attemptedProvider !== 'knowledge_base') {
        markProviderUnavailable(attemptedProvider, fallbackReason)
      }

      console.error(fallbackReason)
    }

    if (!result) {
      result = {
        provider: 'knowledge_base',
        model: null,
        response: generateLocalResponse(trimmedMessage)
      }
    }

    res.json({
      response: result.response,
      timestamp: new Date(),
      aiType: result.provider,
      provider: result.provider,
      model: result.model,
      fallbackReason: result.provider === 'knowledge_base' ? fallbackReason : null
    })
  } catch (error) {
    console.error('Ошибка в /api/ai/chat:', error)
    res.status(500).json({
      message: 'Ошибка при обработке запроса',
      response: 'Не удалось получить ответ от AI-помощника.'
    })
  }
})

router.get('/suggestions', (req, res) => {
  res.json({
    suggestions: [
      'Как начать изучать программирование?',
      'В чем разница между React Hooks?',
      'Как работает Node.js?',
      'Что такое MongoDB?',
      'Как лучше сформулировать вопрос на платформе?'
    ]
  })
})

router.get('/status', (req, res) => {
  res.json({
    aiAvailable: aiRuntime.ready,
    configured: aiRuntime.configured,
    provider: aiRuntime.provider,
    model: aiRuntime.model,
    type: aiRuntime.ready ? `${aiRuntime.provider} (${aiRuntime.model})` : 'Knowledge Base (local)',
    message: aiRuntime.reason
  })
})

export default router
