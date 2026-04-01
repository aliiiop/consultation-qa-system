import { useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { NotificationContext } from '../context/NotificationContext'
import './AIChat.css'

function AIChat() {
  const { error: showError } = useContext(NotificationContext)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Привет. Я встроенный помощник TopicHub. Могу помочь уточнить формулировку вопроса или быстро подсказать по теме.'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    if (!input.trim() || loading) {
      return
    }

    const userMessage = input.trim()
    const nextHistory = [...messages, { role: 'user', content: userMessage }]
    setInput('')
    setMessages(nextHistory)
    setLoading(true)

    try {
      const response = await axios.post('/api/ai/chat', {
        message: userMessage,
        history: nextHistory
      })

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: response.data.response }
      ])
    } catch (error) {
      console.error('Ошибка AI-чата:', error)
      showError(error.response?.data?.message || 'AI-помощник сейчас недоступен')
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
    setMessages([
      {
        role: 'assistant',
        content: 'Чат очищен. Можешь задать новый вопрос.'
      }
    ])
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
              <span className="ai-status">Онлайн</span>
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
              placeholder="Спроси что-то по теме вопроса или формулировке"
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
