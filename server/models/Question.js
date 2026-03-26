import mongoose from 'mongoose'

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
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const questionSchema = new mongoose.Schema({
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
    enum: ['programming', 'design', 'marketing', 'business', 'education', 'other']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [answerSchema],
  status: {
    type: String,
    enum: ['open', 'answered', 'closed'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Обновление updatedAt при изменении
questionSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

const Question = mongoose.model('Question', questionSchema)

export default Question
