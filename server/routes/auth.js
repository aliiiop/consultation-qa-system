import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: '30d'
})

const buildUserPayload = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  name: user.name || user.username,
  role: user.role,
  headline: user.headline,
  bio: user.bio,
  expertise: user.expertise,
  reputation: user.reputation,
  location: user.location,
  createdAt: user.createdAt
})

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    const userExists = await User.findOne({ $or: [{ email }, { username }] })

    if (userExists) {
      if (userExists.email === email) {
        return res.status(409).json({
          message: 'Пользователь с таким email уже существует'
        })
      }

      return res.status(400).json({
        message: 'Пользователь с таким именем уже существует'
      })
    }

    const user = await User.create({
      username,
      email,
      password
    })

    const userPayload = buildUserPayload(user)

    res.status(201).json({
      ...userPayload,
      token: generateToken(user._id),
      user: userPayload
    })
  } catch (error) {
    console.error('Ошибка регистрации:', error)
    res.status(500).json({
      message: 'Ошибка сервера при регистрации',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (user && (await user.matchPassword(password))) {
      return res.json({
        token: generateToken(user._id),
        user: buildUserPayload(user)
      })
    }

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    return res.status(401).json({ message: 'Неверный пароль' })
  } catch (error) {
    console.error('Ошибка входа:', error)
    res.status(500).json({
      message: 'Ошибка сервера при входе',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router
