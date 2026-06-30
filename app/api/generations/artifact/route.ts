import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const generationId = url.searchParams.get('generationId')
    if (!generationId) return NextResponse.json({ error: 'generationId required' }, { status: 400 })

    const { data } = await supabaseAdmin.from('generations').select('result_url').eq('id', generationId).single()
    if (!data || !data.result_url) return NextResponse.json({ error: 'No artifact' }, { status: 404 })

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'generations'
    const { data: signed } = await supabaseAdmin.storage.from(bucket).createSignedUrl(data.result_url, 60)
    return NextResponse.json({ url: signed?.signedURL })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
