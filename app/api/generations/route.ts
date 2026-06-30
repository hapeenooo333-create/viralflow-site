import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { callChatCompletion } from '../../../lib/openai'
import { Queue } from 'bullmq'

const REDIS_URL = process.env.REDIS_URL || ''

// helper to enqueue if Redis is available
async function enqueueGeneration(payload: any) {
  if (!REDIS_URL) return null
  const queue = new Queue('generations', { connection: { url: REDIS_URL } })
  await queue.add('generate', payload)
  return true
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { project_id, created_by, type, prompt, model } = body
    if (!project_id || !created_by || !type) return NextResponse.json({ error: 'project_id, created_by and type required' }, { status: 400 })

    // insert generation record
    const { data, error } = await supabaseAdmin
      .from('generations')
      .insert({ project_id, created_by, type, prompt, model, status: 'pending' })
      .select()
      .single()

    if (error) throw error

    const payload = { generation_id: data.id, prompt, model, type, project_id, created_by }

    // enqueue if Redis present else process inline
    const enqueued = await enqueueGeneration(payload)
    if (!enqueued) {
      // inline processing - call OpenAI directly (simple case for scripts)
      const output = await callChatCompletion(prompt || '')
      await supabaseAdmin.from('generations').update({ status: 'finished', result_text: output, updated_at: new Date() }).eq('id', data.id)
    }

    return NextResponse.json({ generation: data, enqueued: !!enqueued })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('generations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ generations: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
