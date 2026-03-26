import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Получение токена из заголовка
      token = req.headers.authorization.split(' ')[1]

      // Верификация токена
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Получение пользователя из токена
      req.user = await User.findById(decoded.id).select('-password')

      next()
    } catch (error) {
      console.error('Ошибка авторизации:', error)
      res.status(401).json({ message: 'Не авторизован, токен недействителен' })
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Не авторизован, токен отсутствует' })
  }
}

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора' })
  }
}

export const expert = (req, res, next) => {
  if (req.user && (req.user.role === 'expert' || req.user.role === 'admin')) {
    next()
  } else {
    res.status(403).json({ message: 'Доступ запрещен. Требуются права эксперта' })
  }
}
