import express from 'express'
import Question from '../models/Question.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/questions
// @desc    Получить все вопросы
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { filter } = req.query
    let query = {}

    if (filter === 'unanswered') {
      query = { 'answers.0': { $exists: false } }
    } else if (filter === 'answered') {
      query = { 'answers.0': { $exists: true } }
    }

    const questions = await Question.find(query)
      .populate('author', 'username email')
      .sort({ createdAt: -1 })

    res.json(questions)
  } catch (error) {
    console.error('Ошибка получения вопросов:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// @route   GET /api/questions/:id
// @desc    Получить вопрос по ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username email')
      .populate('answers.author', 'username email')

    if (!question) {
      return res.status(404).json({ message: 'Вопрос не найден' })
    }

    res.json(question)
  } catch (error) {
    console.error('Ошибка получения вопроса:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// @route   POST /api/questions
// @desc    Создать новый вопрос
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category } = req.body

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Заполните все обязательные поля' })
    }

    const question = await Question.create({
      title,
      description,
      category,
      author: req.user._id
    })

    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'username email')

    res.status(201).json(populatedQuestion)
  } catch (error) {
    console.error('Ошибка создания вопроса:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// @route   POST /api/questions/:id/answers
// @desc    Добавить ответ к вопросу
// @access  Private
router.post('/:id/answers', protect, async (req, res) => {
  try {
    const { content } = req.body

    if (!content) {
      return res.status(400).json({ message: 'Содержание ответа обязательно' })
    }

    const question = await Question.findById(req.params.id)

    if (!question) {
      return res.status(404).json({ message: 'Вопрос не найден' })
    }

    const answer = {
      content,
      author: req.user._id,
      createdAt: new Date()
    }

    question.answers.push(answer)
    question.status = 'answered'
    await question.save()

    const updatedQuestion = await Question.findById(question._id)
      .populate('author', 'username email')
      .populate('answers.author', 'username email')

    res.status(201).json(updatedQuestion)
  } catch (error) {
    console.error('Ошибка добавления ответа:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// @route   GET /api/questions/my
// @desc    Получить вопросы текущего пользователя
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const questions = await Question.find({ author: req.user._id })
      .populate('author', 'username email')
      .sort({ createdAt: -1 })

    res.json(questions)
  } catch (error) {
    console.error('Ошибка получения вопросов пользователя:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

export default router
