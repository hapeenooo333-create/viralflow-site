import { NextRequest, NextResponse } from 'next/server'
import { ttsElevenLabs } from '../../../lib/elevenlabs'

export async function POST(req: NextRequest) {
  try {
    const { voiceId, text } = await req.json()
    const audioBuffer = await ttsElevenLabs(voiceId || '21m00Tcm4TlvDq8ikWAM', text || '')
    return new NextResponse(audioBuffer, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
