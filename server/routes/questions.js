import express from 'express'
import Question from '../models/Question.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const authorProjection = 'username name role headline expertise reputation location'

const sortQuestions = (questions, sort = 'active') => {
  const list = [...questions]

  if (sort === 'latest') {
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  if (sort === 'popular') {
    return list.sort((a, b) => {
      const scoreA = (a.upvotes?.length || 0) - (a.downvotes?.length || 0)
      const scoreB = (b.upvotes?.length || 0) - (b.downvotes?.length || 0)
      const rankA = scoreA * 4 + (a.answers?.length || 0) * 3 + (a.views || 0)
      const rankB = scoreB * 4 + (b.answers?.length || 0) * 3 + (b.views || 0)
      return rankB - rankA
    })
  }

  return list.sort((a, b) => new Date(b.lastActivityAt || b.updatedAt || b.createdAt) - new Date(a.lastActivityAt || a.updatedAt || a.createdAt))
}

const buildSearchQuery = ({ search, category, filter }) => {
  const query = {}

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ]
  }

  if (category && category !== 'all') {
    query.category = category
  }

  if (filter === 'unanswered') {
    query['answers.0'] = { $exists: false }
  }

  if (filter === 'answered') {
    query['answers.0'] = { $exists: true }
  }

  return query
}

router.get('/', async (req, res) => {
  try {
    const { search = '', category = 'all', filter = 'all', sort = 'active' } = req.query
    const query = buildSearchQuery({ search, category, filter })

    const questions = await Question.find(query)
      .populate('author', authorProjection)
      .sort({ createdAt: -1 })
      .lean()

    res.json(sortQuestions(questions, sort).slice(0, 80))
  } catch (error) {
    console.error('Ошибка получения вопросов:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.get('/my', protect, async (req, res) => {
  try {
    const questions = await Question.find({ author: req.user._id })
      .populate('author', authorProjection)
      .sort({ createdAt: -1 })
      .lean()

    res.json(questions)
  } catch (error) {
    console.error('Ошибка получения вопросов пользователя:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const shouldTrackView = req.query.trackView !== 'false'
    const questionQuery = shouldTrackView
      ? Question.findByIdAndUpdate(
        req.params.id,
        { $inc: { views: 1 } },
        { new: true }
      )
      : Question.findById(req.params.id)

    const question = await questionQuery
      .populate('author', authorProjection)
      .populate('answers.author', authorProjection)

    if (!question) {
      return res.status(404).json({ message: 'Вопрос не найден' })
    }

    res.json(question)
  } catch (error) {
    console.error('Ошибка получения вопроса:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, tags = [] } = req.body

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Заполните все обязательные поля' })
    }

    const question = await Question.create({
      title,
      description,
      category,
      tags: Array.isArray(tags)
        ? [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))]
        : [],
      author: req.user._id
    })

    const populatedQuestion = await Question.findById(question._id)
      .populate('author', authorProjection)

    res.status(201).json(populatedQuestion)
  } catch (error) {
    console.error('Ошибка создания вопроса:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.post('/:id/answers', protect, async (req, res) => {
  try {
    const { content } = req.body

    if (!content || content.trim().length < 10) {
      return res.status(400).json({ message: 'Ответ должен содержать минимум 10 символов' })
    }

    const question = await Question.findById(req.params.id)

    if (!question) {
      return res.status(404).json({ message: 'Вопрос не найден' })
    }

    question.answers.push({
      content: content.trim(),
      author: req.user._id,
      createdAt: new Date()
    })
    question.status = 'answered'
    question.lastActivityAt = new Date()

    await question.save()

    const updatedQuestion = await Question.findById(question._id)
      .populate('author', authorProjection)
      .populate('answers.author', authorProjection)

    res.status(201).json(updatedQuestion)
  } catch (error) {
    console.error('Ошибка добавления ответа:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.post('/:id/upvote', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)

    if (!question) {
      return res.status(404).json({ message: 'Вопрос не найден' })
    }

    question.downvotes = question.downvotes.filter(
      (voteId) => voteId.toString() !== req.user._id.toString()
    )

    const upvoteIndex = question.upvotes.findIndex(
      (voteId) => voteId.toString() === req.user._id.toString()
    )

    if (upvoteIndex > -1) {
      question.upvotes.splice(upvoteIndex, 1)
    } else {
      question.upvotes.push(req.user._id)
    }

    await question.save()

    res.json({
      upvotes: question.upvotes.length,
      downvotes: question.downvotes.length
    })
  } catch (error) {
    console.error('Ошибка голосования:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.post('/:id/downvote', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)

    if (!question) {
      return res.status(404).json({ message: 'Вопрос не найден' })
    }

    question.upvotes = question.upvotes.filter(
      (voteId) => voteId.toString() !== req.user._id.toString()
    )

    const downvoteIndex = question.downvotes.findIndex(
      (voteId) => voteId.toString() === req.user._id.toString()
    )

    if (downvoteIndex > -1) {
      question.downvotes.splice(downvoteIndex, 1)
    } else {
      question.downvotes.push(req.user._id)
    }

    await question.save()

    res.json({
      upvotes: question.upvotes.length,
      downvotes: question.downvotes.length
    })
  } catch (error) {
    console.error('Ошибка голосования:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.post('/:questionId/answers/:answerId/upvote', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId)

    if (!question) {
      return res.status(404).json({ message: 'Вопрос не найден' })
    }

    const answer = question.answers.id(req.params.answerId)

    if (!answer) {
      return res.status(404).json({ message: 'Ответ не найден' })
    }

    answer.downvotes = answer.downvotes.filter(
      (voteId) => voteId.toString() !== req.user._id.toString()
    )

    const upvoteIndex = answer.upvotes.findIndex(
      (voteId) => voteId.toString() === req.user._id.toString()
    )

    if (upvoteIndex > -1) {
      answer.upvotes.splice(upvoteIndex, 1)
    } else {
      answer.upvotes.push(req.user._id)
    }

    await question.save()

    res.json({
      upvotes: answer.upvotes.length,
      downvotes: answer.downvotes.length
    })
  } catch (error) {
    console.error('Ошибка голосования:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.post('/:questionId/answers/:answerId/best', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId)

    if (!question) {
      return res.status(404).json({ message: 'Вопрос не найден' })
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Только автор вопроса может выбрать лучший ответ' })
    }

    question.answers.forEach((item) => {
      item.isBestAnswer = false
    })

    const answer = question.answers.id(req.params.answerId)

    if (!answer) {
      return res.status(404).json({ message: 'Ответ не найден' })
    }

    answer.isBestAnswer = true
    question.status = 'answered'

    await question.save()

    const updatedQuestion = await Question.findById(question._id)
      .populate('author', authorProjection)
      .populate('answers.author', authorProjection)

    res.json(updatedQuestion)
  } catch (error) {
    console.error('Ошибка выбора лучшего ответа:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

export default router
