import mongoose from 'mongoose'
import {
  CONSULTATION_FORMATS,
  CONSULTATION_SERVICE_IDS,
  CONSULTATION_STATUSES
} from '../constants/platform.js'

const consultationSchema = new mongoose.Schema({
  seedKey: {
    type: String,
    unique: true,
    sparse: true
  },
  isSeeded: {
    type: Boolean,
    default: false
  },
  serviceCategory: {
    type: String,
    required: [true, 'Тип консультации обязателен'],
    enum: CONSULTATION_SERVICE_IDS
  },
  topic: {
    type: String,
    required: [true, 'Тема консультации обязательна'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Описание обязательно']
  },
  goal: {
    type: String,
    trim: true,
    default: ''
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
  format: {
    type: String,
    enum: CONSULTATION_FORMATS,
    default: 'chat'
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
    enum: CONSULTATION_STATUSES,
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

const Consultation = mongoose.model('Consultation', consultationSchema)

export default Consultation
