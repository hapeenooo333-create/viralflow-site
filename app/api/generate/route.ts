import { NextRequest, NextResponse } from 'next/server'
import { callChatCompletion } from '../../../lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const prompt = body.prompt || ''
    const out = await callChatCompletion(prompt)
    return NextResponse.json({ output: out })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
