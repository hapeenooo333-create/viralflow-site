import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import { Queue } from 'bullmq'

export async function POST(req: NextRequest, { params }: any) {
  try {
    const body = await req.json()
    const generationId = params.id
    if (!generationId) return NextResponse.json({ error: 'generation id required' }, { status: 400 })

    // simple retry: reset status and enqueue
    await supabaseAdmin.from('generations').update({ status: 'pending', updated_at: new Date() }).eq('id', generationId)

    const REDIS_URL = process.env.REDIS_URL || ''
    if (REDIS_URL) {
      const queue = new Queue('generations', { connection: { url: REDIS_URL } })
      await queue.add('generate', { generation_id: generationId })
      return NextResponse.json({ enqueued: true })
    }

    // if no redis do nothing; worker will not process
    return NextResponse.json({ enqueued: false })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
