import mongoose from 'mongoose'
import { QUESTION_CATEGORY_IDS } from '../constants/platform.js'

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Содержание ответа обязательно'],
    minlength: [10, 'Ответ должен содержать минимум 10 символов']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isBestAnswer: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true })

const questionSchema = new mongoose.Schema({
  seedKey: {
    type: String,
    unique: true,
    sparse: true
  },
  isSeeded: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: [true, 'Заголовок обязателен'],
    trim: true,
    minlength: [10, 'Заголовок должен содержать минимум 10 символов']
  },
  description: {
    type: String,
    required: [true, 'Описание обязательно'],
    minlength: [20, 'Описание должно содержать минимум 20 символов']
  },
  category: {
    type: String,
    required: [true, 'Категория обязательна'],
    enum: QUESTION_CATEGORY_IDS
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [answerSchema],
  views: {
    type: Number,
    default: 0
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['open', 'answered', 'closed'],
    default: 'open'
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

questionSchema.pre('save', function(next) {
  this.lastActivityAt = Date.now()
  if (this.answers.length > 0 && this.status === 'open') {
    this.status = 'answered'
  }
  next()
})

const Question = mongoose.model('Question', questionSchema)

export default Question
