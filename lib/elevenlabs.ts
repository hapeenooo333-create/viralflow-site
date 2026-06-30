import axios from 'axios'

export async function ttsElevenLabs(voiceId: string, text: string) {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) throw new Error('ELEVENLABS_API_KEY missing')

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`
  const res = await axios.post(url, { text }, { headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, responseType: 'arraybuffer' })
  return res.data // raw audio buffer
}
