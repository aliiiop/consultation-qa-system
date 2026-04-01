import { useContext } from 'react'
import { NotificationContext } from '../context/NotificationContext'
import './Notification.css'

const iconMap = {
  success: 'fa-solid fa-circle-check',
  error: 'fa-solid fa-circle-xmark',
  warning: 'fa-solid fa-triangle-exclamation',
  info: 'fa-solid fa-circle-info'
}

function Notification() {
  const { notifications, removeNotification } = useContext(NotificationContext)

  return (
    <div className="notifications-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
          role="alert"
        >
          <div className="notification-content">
            <span className="notification-icon">
              <i className={iconMap[notification.type]} />
            </span>
            <div className="notification-message">{notification.message}</div>
          </div>
          <button
            type="button"
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
            aria-label="Закрыть уведомление"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default Notification
