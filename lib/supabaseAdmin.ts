import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const key = process.env.SUPABASE_SERVICE_KEY || ''

if (!url || !key) {
  console.warn('SUPABASE_SERVICE_KEY or NEXT_PUBLIC_SUPABASE_URL is not set')
}

export const supabaseAdmin = createClient(url, key, {
  auth: { persistSession: false }
})
