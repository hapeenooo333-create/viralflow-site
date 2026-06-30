import { createClient } from '@supabase/supabase-js'

declare global {
  interface Window { supabase: any }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (typeof window !== 'undefined' && url && key) {
  // attach a client for runtime realtime use in client components
  (window as any).supabase = createClient(url, key)
}
