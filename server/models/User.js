import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { USER_ROLES } from '../constants/platform.js'

const userSchema = new mongoose.Schema({
  seedKey: {
    type: String,
    unique: true,
    sparse: true
  },
  isSeeded: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    trim: true,
    default: function() {
      return this.username
    }
  },
  username: {
    type: String,
    required: [true, 'Имя пользователя обязательно'],
    unique: true,
    trim: true,
    minlength: [3, 'Имя должно содержать минимум 3 символа']
  },
  email: {
    type: String,
    required: [true, 'Email обязателен'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Некорректный email']
  },
  password: {
    type: String,
    required: [true, 'Пароль обязателен'],
    minlength: [6, 'Пароль должен содержать минимум 6 символов']
  },
  headline: {
    type: String,
    trim: true,
    default: ''
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  expertise: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    trim: true,
    default: ''
  },
  reputation: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: USER_ROLES,
    default: 'user'
  }
}, {
  timestamps: true
})

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = async function(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
