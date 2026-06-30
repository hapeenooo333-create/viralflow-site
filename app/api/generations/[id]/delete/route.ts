import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const generationId = params.id
    if (!generationId) return NextResponse.json({ error: 'generation id required' }, { status: 400 })

    // get generation record
    const { data } = await supabaseAdmin.from('generations').select('result_url, project_id').eq('id', generationId).single()
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // delete artifact from storage if exists
    if (data.result_url) {
      const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'generations'
      await supabaseAdmin.storage.from(bucket).remove([data.result_url])
    }

    await supabaseAdmin.from('generations').delete().eq('id', generationId)
    return NextResponse.json({ deleted: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
