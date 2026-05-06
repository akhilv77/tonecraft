import { buildPrompt, type Tone } from './prompt'
import { normalizeText, cleanResponse } from './normalize'

export interface ConvertOptions {
  apiKey: string
  model: string
  text: string
  tone: Tone
  signal?: AbortSignal
}

const MAX_RESPONSE_BYTES = 512 * 1024

export async function convertTone(options: ConvertOptions): Promise<string> {
  const { apiKey, model, tone, signal } = options

  if (!apiKey) throw new Error('No API key configured. Open Settings to add your key.')

  const text = normalizeText(options.text)
  if (!text) throw new Error('No text to convert.')

  const { systemPrompt, userMessage } = buildPrompt(text, tone)

  let response: Response
  try {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://tonecraft.ext',
        'X-Title': 'ToneCraft',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userMessage  },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new Error('Network error — check your connection and try again.')
  }

  const contentLength = response.headers.get('content-length')
  if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_BYTES) {
    throw new Error('Response from API was too large.')
  }

  const rawText = await response.text()

  if (!response.ok) {
    let msg = `Request failed (${response.status}).`
    try {
      const body = JSON.parse(rawText) as { error?: { message?: string } }
      void body
      if (response.status === 401) msg = 'Invalid API key. Check your key in Settings.'
      else if (response.status === 402) msg = 'Insufficient credits on your OpenRouter account.'
      else if (response.status === 429) msg = 'Rate limit reached. Please wait a moment and try again.'
      else if (response.status >= 500) msg = 'OpenRouter is temporarily unavailable. Try again shortly.'
    } catch { /* ignore */ }
    throw new Error(msg)
  }

  if (rawText.length > MAX_RESPONSE_BYTES) throw new Error('Response from API was too large.')

  const data = JSON.parse(rawText) as {
    choices?: Array<{ message?: { content?: string } }>
  }

  const raw = data.choices?.[0]?.message?.content
  if (!raw) throw new Error('Empty response from API.')

  return cleanResponse(raw)
}
