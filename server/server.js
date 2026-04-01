import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.js'
import questionRoutes from './routes/questions.js'
import consultationRoutes from './routes/consultations.js'
import aiRoutes from './routes/ai.js'
import adminRoutes from './routes/admin.js'

dotenv.config()
connectDB()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/consultations', consultationRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/admin', adminRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'API TopicHub работает' })
})

app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: 'Ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`)
})
