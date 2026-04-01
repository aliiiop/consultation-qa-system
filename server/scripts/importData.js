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
const defaultImportPath = path.resolve(__dirname, '../data-transfer/topichub-export.ejson')
const sourcePath = path.resolve(process.cwd(), process.argv[2] || defaultImportPath)

const importData = async () => {
  try {
    const raw = await fs.readFile(sourcePath, 'utf8')
    const payload = EJSON.parse(raw)

    if (!payload?.collections?.users || !payload?.collections?.questions || !payload?.collections?.consultations) {
      throw new Error('Invalid import file structure')
    }

    await connectDB()

    await Promise.all([
      User.deleteMany({}),
      Question.deleteMany({}),
      Consultation.deleteMany({})
    ])

    if (payload.collections.users.length) {
      await User.collection.insertMany(payload.collections.users, { ordered: true })
    }

    if (payload.collections.questions.length) {
      await Question.collection.insertMany(payload.collections.questions, { ordered: true })
    }

    if (payload.collections.consultations.length) {
      await Consultation.collection.insertMany(payload.collections.consultations, { ordered: true })
    }

    console.log(`Import completed from: ${sourcePath}`)
    console.log(
      `Users: ${payload.collections.users.length}, Questions: ${payload.collections.questions.length}, Consultations: ${payload.collections.consultations.length}`
    )
  } catch (error) {
    console.error(`Import error: ${error.message}`)
    process.exitCode = 1
  } finally {
    await mongoose.connection.close()
  }
}

importData()
