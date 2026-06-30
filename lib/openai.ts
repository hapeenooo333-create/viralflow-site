import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function callChatCompletion(prompt: string) {
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800
  })

  // attempt to extract text
  const out = res.choices?.[0]?.message?.content
  return out || JSON.stringify(res)
}
