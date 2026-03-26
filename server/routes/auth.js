import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

// Генерация JWT токена
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  })
}

// @route   POST /api/auth/register
// @desc    Регистрация нового пользователя
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Проверка существования пользователя
    const userExists = await User.findOne({ $or: [{ email }, { username }] })

    if (userExists) {
      return res.status(400).json({ 
        message: 'Пользователь с таким email или именем уже существует' 
      })
    }

    // Создание пользователя
    const user = await User.create({
      username,
      email,
      password
    })

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      })
    } else {
      res.status(400).json({ message: 'Некорректные данные пользователя' })
    }
  } catch (error) {
    console.error('Ошибка регистрации:', error)
    res.status(500).json({ message: 'Ошибка сервера при регистрации' })
  }
})

// @route   POST /api/auth/login
// @desc    Вход пользователя
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Поиск пользователя
    const user = await User.findOne({ email })

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      })
    } else {
      res.status(401).json({ message: 'Неверный email или пароль' })
    }
  } catch (error) {
    console.error('Ошибка входа:', error)
    res.status(500).json({ message: 'Ошибка сервера при входе' })
  }
})

export default router
