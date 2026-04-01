import { createContext, useState, useCallback } from 'react'

export const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now()
    const notification = {
      id,
      message,
      type // 'success', 'error', 'warning', 'info'
    }

    setNotifications(prev => [...prev, notification])

    if (duration) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const success = useCallback((message, duration) => {
    addNotification(message, 'success', duration)
  }, [addNotification])

  const error = useCallback((message, duration) => {
    addNotification(message, 'error', duration)
  }, [addNotification])

  const warning = useCallback((message, duration) => {
    addNotification(message, 'warning', duration)
  }, [addNotification])

  const info = useCallback((message, duration) => {
    addNotification(message, 'info', duration)
  }, [addNotification])

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      success,
      error,
      warning,
      info
    }}>
      {children}
    </NotificationContext.Provider>
  )
}
