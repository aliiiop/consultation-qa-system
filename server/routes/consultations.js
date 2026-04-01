import express from 'express'
import Consultation from '../models/Consultation.js'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const publicUserProjection = 'username name role headline expertise reputation location bio'

const canAccessConsultation = (consultation, user) => {
  if (!consultation || !user) {
    return false
  }

  if (user.role === 'admin') {
    return true
  }

  const ownerId = consultation.user?._id?.toString?.() || consultation.user?.toString?.()
  const expertId = consultation.expert?._id?.toString?.() || consultation.expert?.toString?.()

  return ownerId === user._id.toString() || expertId === user._id.toString()
}

router.get('/', async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate('user', publicUserProjection)
      .populate('expert', publicUserProjection)
      .sort({ createdAt: -1 })

    res.json(consultations)
  } catch (error) {
    console.error('Ошибка получения консультаций:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.get('/experts', async (req, res) => {
  try {
    const experts = await User.find({ role: 'expert' })
      .select(publicUserProjection)
      .sort({ reputation: -1, createdAt: 1 })

    res.json(experts)
  } catch (error) {
    console.error('Ошибка получения экспертов:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.get('/my', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'expert'
      ? { $or: [{ user: req.user._id }, { expert: req.user._id }] }
      : { user: req.user._id }

    const consultations = await Consultation.find(filter)
      .populate('user', publicUserProjection)
      .populate('expert', publicUserProjection)
      .sort({ createdAt: -1 })

    res.json(consultations)
  } catch (error) {
    console.error('Ошибка получения консультаций пользователя:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.get('/:id', protect, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('user', publicUserProjection)
      .populate('expert', publicUserProjection)

    if (!consultation) {
      return res.status(404).json({ message: 'Консультация не найдена' })
    }

    if (!canAccessConsultation(consultation, req.user)) {
      return res.status(403).json({ message: 'Недостаточно прав для просмотра консультации' })
    }

    res.json(consultation)
  } catch (error) {
    console.error('Ошибка получения консультации:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.post('/', protect, async (req, res) => {
  try {
    const {
      topic,
      description,
      goal,
      serviceCategory,
      format,
      preferredDate,
      preferredTime,
      mentorId
    } = req.body

    if (!topic || !description || !serviceCategory || !preferredDate || !preferredTime) {
      return res.status(400).json({ message: 'Заполните все обязательные поля' })
    }

    let expert = null

    if (mentorId) {
      expert = await User.findOne({ _id: mentorId, role: 'expert' })

      if (!expert) {
        return res.status(404).json({ message: 'Выбранный ментор не найден' })
      }
    }

    const consultation = await Consultation.create({
      topic,
      description,
      goal,
      serviceCategory,
      format,
      preferredDate,
      preferredTime,
      user: req.user._id,
      expert: expert?._id,
      status: expert ? 'matched' : 'pending'
    })

    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate('user', publicUserProjection)
      .populate('expert', publicUserProjection)

    res.status(201).json(populatedConsultation)
  } catch (error) {
    console.error('Ошибка создания консультации:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.put('/:id', protect, async (req, res) => {
  try {
    const { status, notes, mentorId } = req.body
    const consultation = await Consultation.findById(req.params.id)

    if (!consultation) {
      return res.status(404).json({ message: 'Консультация не найдена' })
    }

    if (!canAccessConsultation(consultation, req.user)) {
      return res.status(403).json({ message: 'Недостаточно прав для изменения консультации' })
    }

    if (mentorId) {
      const expert = await User.findOne({ _id: mentorId, role: 'expert' })

      if (!expert) {
        return res.status(404).json({ message: 'Выбранный ментор не найден' })
      }

      consultation.expert = expert._id
      if (consultation.status === 'pending') {
        consultation.status = 'matched'
      }
    }

    if (status) {
      consultation.status = status
    }

    if (typeof notes === 'string') {
      consultation.notes = notes
    }

    await consultation.save()

    const updatedConsultation = await Consultation.findById(consultation._id)
      .populate('user', publicUserProjection)
      .populate('expert', publicUserProjection)

    res.json(updatedConsultation)
  } catch (error) {
    console.error('Ошибка обновления консультации:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

export default router
