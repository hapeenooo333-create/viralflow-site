import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export async function GET(req: NextRequest, { params }: any) {
  // expects /api/generations/artifact?generationId=...
  try {
    const generationId = req.nextUrl.searchParams.get('generationId')
    if (!generationId) return NextResponse.json({ error: 'generationId required' }, { status: 400 })

    const { data: gen } = await supabaseAdmin.from('generations').select('result_url').eq('id', generationId).single()
    if (!gen || !gen.result_url) return NextResponse.json({ error: 'No artifact' }, { status: 404 })

    // create signed URL
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'public'
    const { data } = await supabaseAdmin.storage.from(bucket).createSignedUrl(gen.result_url, 60)
    return NextResponse.json({ url: data?.signedURL })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
