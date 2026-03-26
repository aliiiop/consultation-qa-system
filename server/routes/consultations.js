import express from 'express'
import Consultation from '../models/Consultation.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/consultations
// @desc    Получить все консультации
// @access  Public
router.get('/', async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate('user', 'username email')
      .populate('expert', 'username email')
      .sort({ createdAt: -1 })

    res.json(consultations)
  } catch (error) {
    console.error('Ошибка получения консультаций:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// @route   GET /api/consultations/:id
// @desc    Получить консультацию по ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('user', 'username email')
      .populate('expert', 'username email')

    if (!consultation) {
      return res.status(404).json({ message: 'Консультация не найдена' })
    }

    res.json(consultation)
  } catch (error) {
    console.error('Ошибка получения консультации:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// @route   POST /api/consultations
// @desc    Создать новую консультацию
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { topic, description, preferredDate, preferredTime } = req.body

    if (!topic || !description || !preferredDate || !preferredTime) {
      return res.status(400).json({ message: 'Заполните все обязательные поля' })
    }

    const consultation = await Consultation.create({
      topic,
      description,
      preferredDate,
      preferredTime,
      user: req.user._id
    })

    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate('user', 'username email')

    res.status(201).json(populatedConsultation)
  } catch (error) {
    console.error('Ошибка создания консультации:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// @route   PUT /api/consultations/:id
// @desc    Обновить статус консультации
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { status, notes } = req.body

    const consultation = await Consultation.findById(req.params.id)

    if (!consultation) {
      return res.status(404).json({ message: 'Консультация не найдена' })
    }

    if (status) consultation.status = status
    if (notes) consultation.notes = notes

    await consultation.save()

    const updatedConsultation = await Consultation.findById(consultation._id)
      .populate('user', 'username email')
      .populate('expert', 'username email')

    res.json(updatedConsultation)
  } catch (error) {
    console.error('Ошибка обновления консультации:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// @route   GET /api/consultations/my
// @desc    Получить консультации текущего пользователя
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const consultations = await Consultation.find({ user: req.user._id })
      .populate('expert', 'username email')
      .sort({ createdAt: -1 })

    res.json(consultations)
  } catch (error) {
    console.error('Ошибка получения консультаций пользователя:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

export default router
