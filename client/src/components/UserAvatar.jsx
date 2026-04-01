import { getInitials } from '../utils/formatters'

function UserAvatar({ user, size = 'md' }) {
  const role = user?.role || 'user'

  return (
    <div className={`user-avatar user-avatar-${size} role-${role}`} aria-hidden="true">
      {getInitials(user)}
    </div>
  )
}

export default UserAvatar
