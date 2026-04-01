import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

const normalizeSecret = (value = '') => value.trim().replace(/^["']|["']$/g, '')

const apiKey = normalizeSecret(process.env.OPENROUTER_API_KEY || '')
const model = process.env.OPENROUTER_MODEL?.trim() || 'meta-llama/llama-3.2-3b-instruct:free'

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options)
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(payload?.error?.message || payload?.message || response.statusText)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

if (!apiKey) {
  console.error('OPENROUTER_API_KEY is empty in server/.env')
  process.exit(1)
}

try {
  const keyInfo = await requestJson('https://openrouter.ai/api/v1/key', {
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  })

  console.log(`OpenRouter key accepted. Label: ${keyInfo?.data?.label || 'hidden'}`)

  const completion = await requestJson('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'TopicHub'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: 'Reply with: ok' }],
      max_tokens: 8
    })
  })

  console.log(`Model: ${completion.model || model}`)
  console.log(`Response: ${completion.choices?.[0]?.message?.content || ''}`)
} catch (error) {
  if (error.status === 401) {
    console.error(`OpenRouter auth failed (401): ${error.message}`)
    console.error('OpenRouter rejected the key or did not match it to an active account.')
  } else if (error.status === 429) {
    console.error(`OpenRouter rate limit or provider throttle (429): ${error.message}`)

    if (error.payload?.error?.metadata?.provider_name) {
      console.error(`Provider: ${error.payload.error.metadata.provider_name}`)
    }

    console.error('The key is usually fine here. The selected model or free tier is being limited.')
  } else {
    console.error(`OpenRouter check failed${error.status ? ` (${error.status})` : ''}: ${error.message}`)

    if (error.cause?.code || error.cause?.message) {
      console.error(`Cause: ${error.cause?.code || 'unknown'}${error.cause?.message ? ` - ${error.cause.message}` : ''}`)
    }
  }

  process.exit(1)
}
