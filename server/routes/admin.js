import express from 'express'
import User from '../models/User.js'
import Question from '../models/Question.js'
import Consultation from '../models/Consultation.js'
import { admin, protect } from '../middleware/auth.js'
import { CONSULTATION_STATUSES, USER_ROLES } from '../constants/platform.js'

const router = express.Router()

const userProjection = 'username name email role headline expertise reputation location createdAt'
const questionStatuses = ['open', 'answered', 'closed']

router.use(protect, admin)

router.get('/overview', async (req, res) => {
  try {
    const [
      totalUsers,
      experts,
      admins,
      totalQuestions,
      closedQuestions,
      totalConsultations,
      pendingConsultations
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'expert' }),
      User.countDocuments({ role: 'admin' }),
      Question.countDocuments(),
      Question.countDocuments({ status: 'closed' }),
      Consultation.countDocuments(),
      Consultation.countDocuments({ status: { $in: ['pending', 'matched'] } })
    ])

    res.json({
      totalUsers,
      experts,
      admins,
      totalQuestions,
      closedQuestions,
      totalConsultations,
      pendingConsultations
    })
  } catch (error) {
    console.error('Ошибка загрузки admin overview:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select(userProjection)
      .sort({ createdAt: -1 })
      .lean()

    res.json(users)
  } catch (error) {
    console.error('Ошибка получения пользователей:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body

    if (!USER_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Некорректная роль' })
    }

    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Нельзя менять роль самому себе из админ-панели' })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    user.role = role
    await user.save()

    res.json({
      message: 'Роль обновлена',
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        headline: user.headline,
        expertise: user.expertise,
        reputation: user.reputation,
        location: user.location,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error('Ошибка обновления роли:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('author', 'username name role')
      .sort({ createdAt: -1 })
      .lean()

    res.json(questions)
  } catch (error) {
    console.error('Ошибка получения вопросов для админа:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.put('/questions/:id/status', async (req, res) => {
  try {
    const { status } = req.body

    if (!questionStatuses.includes(status)) {
      return res.status(400).json({ message: 'Некорректный статус вопроса' })
    }

    const question = await Question.findById(req.params.id)

    if (!question) {
      return res.status(404).json({ message: 'Вопрос не найден' })
    }

    question.status = status
    question.lastActivityAt = new Date()
    await question.save()

    res.json({ message: 'Статус вопроса обновлен' })
  } catch (error) {
    console.error('Ошибка обновления статуса вопроса:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.get('/consultations', async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate('user', 'username name role')
      .populate('expert', 'username name role')
      .sort({ createdAt: -1 })
      .lean()

    res.json(consultations)
  } catch (error) {
    console.error('Ошибка получения консультаций для админа:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.put('/consultations/:id/status', async (req, res) => {
  try {
    const { status } = req.body

    if (!CONSULTATION_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Некорректный статус консультации' })
    }

    const consultation = await Consultation.findById(req.params.id)

    if (!consultation) {
      return res.status(404).json({ message: 'Консультация не найдена' })
    }

    consultation.status = status
    await consultation.save()

    res.json({ message: 'Статус консультации обновлен' })
  } catch (error) {
    console.error('Ошибка обновления статуса консультации:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

export default router
