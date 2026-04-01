import { useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { NotificationContext } from '../context/NotificationContext'
import './AIChat.css'

const INITIAL_ASSISTANT_MESSAGE = {
  role: 'assistant',
  content: 'Привет. Я помощник TopicHub. Могу помочь с вопросом, ответом или консультацией.'
}

function AIChat() {
  const { error: showError } = useContext(NotificationContext)
  const [isOpen, setIsOpen] = useState(false)
  const [aiStatus, setAiStatus] = useState({
    aiAvailable: false,
    configured: false,
    provider: 'knowledge_base',
    model: null,
    message: 'Проверка статуса AI...'
  })
  const [messages, setMessages] = useState([INITIAL_ASSISTANT_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    let isMounted = true

    const fetchStatus = async () => {
      try {
        const response = await axios.get('/api/ai/status')

        if (isMounted) {
          setAiStatus(response.data)
        }
      } catch (error) {
        if (isMounted) {
          setAiStatus({
            aiAvailable: false,
            configured: false,
            provider: 'knowledge_base',
            model: null,
            message: 'Не удалось получить статус AI-сервиса'
          })
        }
      }
    }

    fetchStatus()

    return () => {
      isMounted = false
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!input.trim() || loading) {
      return
    }

    const userMessage = input.trim()
    const nextMessages = [...messages, { role: 'user', content: userMessage }]
    const historyForApi = nextMessages.slice(1)

    setInput('')
    setMessages(nextMessages)
    setLoading(true)

    try {
      const response = await axios.post('/api/ai/chat', {
        message: userMessage,
        history: historyForApi
      })

      setAiStatus((current) => ({
        ...current,
        aiAvailable: response.data.aiType !== 'knowledge_base',
        configured: response.data.aiType !== 'knowledge_base' || current.configured,
        provider: response.data.provider || response.data.aiType || 'knowledge_base',
        model: response.data.model || null,
        message: response.data.aiType !== 'knowledge_base'
          ? `Используется ${response.data.provider || response.data.aiType}${response.data.model ? ` (${response.data.model})` : ''}`
          : (response.data.fallbackReason || current.message)
      }))

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: response.data.response }
      ])
    } catch (error) {
      console.error('Ошибка AI-чата:', error)
      showError(error.response?.data?.message || error.response?.data?.error || 'AI-помощник сейчас недоступен')
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'Не получилось получить ответ. Попробуй переформулировать запрос чуть короче.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([INITIAL_ASSISTANT_MESSAGE])
  }

  return (
    <>
      <button
        type="button"
        className={`ai-chat-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((value) => !value)}
        aria-label="Открыть AI-чат"
      >
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-sparkles'}`} />
      </button>

      {isOpen && (
        <section className="ai-chat-window">
          <header className="ai-chat-header">
            <div>
              <h3>AI-помощник</h3>
              <span className={`ai-status ${aiStatus.aiAvailable ? 'ready' : 'fallback'}`}>
                {aiStatus.aiAvailable
                  ? `${aiStatus.provider}${aiStatus.model ? ` · ${aiStatus.model}` : ''}`
                  : (aiStatus.configured ? 'Локальный режим' : 'AI не настроен')}
              </span>
              <p className="ai-status-note">{aiStatus.message}</p>
            </div>
            <button type="button" className="clear-btn" onClick={clearChat}>
              Очистить
            </button>
          </header>

          <div className="ai-chat-messages">
            {messages.map((message, index) => (
              <article key={`${message.role}-${index}`} className={`message ${message.role}`}>
                <div className="message-avatar">{message.role === 'user' ? 'Вы' : 'AI'}</div>
                <div className="message-content">
                  <p>{message.content}</p>
                </div>
              </article>
            ))}

            {loading && (
              <article className="message assistant">
                <div className="message-avatar">AI</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </article>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="ai-chat-input">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Спроси что-нибудь по вопросу, ответу или консультации"
              rows="2"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="send-btn"
            >
              <i className="fa-solid fa-paper-plane" />
            </button>
          </div>

          <footer className="ai-chat-footer">
            AI может ошибаться, поэтому важные советы лучше перепроверять.
          </footer>
        </section>
      )}
    </>
  )
}

export default AIChat
