import dotenv from 'dotenv'
import Groq from 'groq-sdk'

dotenv.config({ path: './.env' })

const apiKey = process.env.GROQ_API_KEY?.trim() || ''
const model = process.env.GROQ_MODEL?.trim() || 'llama3-70b-8192'

if (!apiKey) {
  console.error('GROQ_API_KEY is empty in server/.env')
  process.exit(1)
}

try {
  const client = new Groq({ apiKey })
  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: 'Reply with: ok' }],
    max_tokens: 8
  })

  console.log(`Groq key is valid. Model: ${completion.model || model}`)
  console.log(`Response: ${completion.choices?.[0]?.message?.content || ''}`)
} catch (error) {
  const status = error?.status || error?.response?.status || 'unknown'
  const message = error?.error?.message || error?.message || String(error)
  console.error(`Groq check failed (${status}): ${message}`)
  process.exit(1)
}
