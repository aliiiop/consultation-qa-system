import mongoose from 'mongoose'

const consultationSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: [true, 'Тема консультации обязательна'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Описание обязательно']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  preferredDate: {
    type: Date,
    required: [true, 'Дата обязательна']
  },
  preferredTime: {
    type: String,
    required: [true, 'Время обязательно']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Consultation = mongoose.model('Consultation', consultationSchema)

export default Consultation
