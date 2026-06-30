import { supabaseAdmin } from '../../lib/supabaseAdmin'
import { callChatCompletion } from '../../lib/openai'

// Simple worker script to be run on a server with REDIS_URL env var
const REDIS_URL = process.env.REDIS_URL
if (!REDIS_URL) {
  console.error('REDIS_URL not set. This worker requires Redis.')
  process.exit(1)
}

import { Worker } from 'bullmq'

const worker = new Worker('generations', async job => {
  const payload = job.data
  console.log('Processing generation job', payload)

  try {
    if (payload.type === 'script') {
      const output = await callChatCompletion(payload.prompt || '')

      // persist to Supabase Storage
      const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'generations'
      const filePath = `${payload.project_id}/${payload.generation_id}.txt`
      const content = typeof output === 'string' ? output : JSON.stringify(output)

      const up = await supabaseAdmin.storage.from(bucket).upload(filePath, Buffer.from(content, 'utf-8'), { upsert: true })
      if (up.error) {
        console.error('Storage upload failed', up.error)
        await supabaseAdmin.from('generations').update({ status: 'failed', meta: { error: up.error.message }, updated_at: new Date() }).eq('id', payload.generation_id)
        return
      }

      // set public or signed path (store object path)
      const resultUrl = filePath

      await supabaseAdmin.from('generations').update({ status: 'finished', result_text: content, result_url: resultUrl, updated_at: new Date() }).eq('id', payload.generation_id)
    }

    // TODO: handle voice/video pipeline, save artifacts to storage
  } catch (err: any) {
    console.error('Worker error', err)
    await supabaseAdmin.from('generations').update({ status: 'failed', meta: { error: err.message }, updated_at: new Date() }).eq('id', payload.generation_id)
  }
}, { connection: { url: REDIS_URL } })

worker.on('completed', job => {
  console.log('Job completed', job.id)
})

worker.on('failed', (job, err) => {
  console.error('Job failed', job?.id, err)
})
