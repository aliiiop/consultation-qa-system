import mongoose from 'mongoose'

const globalMongoose = globalThis

if (!globalMongoose.__mongooseCache) {
  globalMongoose.__mongooseCache = {
    conn: null,
    promise: null
  }
}

const connectDB = async () => {
  const cache = globalMongoose.__mongooseCache

  if (cache.conn) {
    return cache.conn
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set')
  }

  try {
    if (!cache.promise) {
      cache.promise = mongoose.connect(process.env.MONGODB_URI)
    }

    cache.conn = await cache.promise
    console.log(`MongoDB connected: ${cache.conn.connection.host}/${cache.conn.connection.name}`)
    return cache.conn
  } catch (error) {
    cache.promise = null
    console.error(`MongoDB connection error: ${error.message}`)
    throw error
  }
}

export default connectDB
