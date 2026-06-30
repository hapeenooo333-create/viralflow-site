import { Worker } from 'bullmq'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import { callChatCompletion } from '../../lib/openai'

// Simple worker script to be run on a server with REDIS_URL env var
const REDIS_URL = process.env.REDIS_URL
if (!REDIS_URL) {
  console.error('REDIS_URL not set. This worker requires Redis.')
  process.exit(1)
}

const worker = new Worker('generations', async job => {
  const payload = job.data
  console.log('Processing generation job', payload)

  if (payload.type === 'script') {
    const output = await callChatCompletion(payload.prompt || '')
    await supabaseAdmin.from('generations').update({ status: 'finished', result_text: output, updated_at: new Date() }).eq('id', payload.generation_id)
  }

  // TODO: handle voice/video pipeline, save artifacts to storage
}, { connection: { url: REDIS_URL } })

worker.on('completed', job => {
  console.log('Job completed', job.id)
})

worker.on('failed', (job, err) => {
  console.error('Job failed', job?.id, err)
})
