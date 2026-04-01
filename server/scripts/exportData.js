import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { EJSON } from 'bson'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import User from '../models/User.js'
import Question from '../models/Question.js'
import Consultation from '../models/Consultation.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const defaultExportPath = path.resolve(__dirname, '../data-transfer/topichub-export.ejson')
const targetPath = path.resolve(process.cwd(), process.argv[2] || defaultExportPath)

const exportData = async () => {
  try {
    await connectDB()

    const [users, questions, consultations] = await Promise.all([
      User.find({}).lean(),
      Question.find({}).lean(),
      Consultation.find({}).lean()
    ])

    const payload = {
      app: 'TopicHub',
      version: 1,
      database: mongoose.connection.name,
      exportedAt: new Date(),
      counts: {
        users: users.length,
        questions: questions.length,
        consultations: consultations.length
      },
      collections: {
        users,
        questions,
        consultations
      }
    }

    await fs.mkdir(path.dirname(targetPath), { recursive: true })
    await fs.writeFile(targetPath, EJSON.stringify(payload, null, 2), 'utf8')

    console.log(`Export saved: ${targetPath}`)
    console.log(`Users: ${users.length}, Questions: ${questions.length}, Consultations: ${consultations.length}`)
  } catch (error) {
    console.error(`Export error: ${error.message}`)
    process.exitCode = 1
  } finally {
    await mongoose.connection.close()
  }
}

exportData()
