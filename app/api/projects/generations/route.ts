import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: any) {
  try {
    const url = new URL(request.url)
    const projectId = url.searchParams.get('projectId')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const cursor = url.searchParams.get('cursor') || undefined

    if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

    let query = supabaseAdmin.from('generations').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(limit)

    if (cursor) {
      query = query.range(0, limit - 1).lt('created_at', cursor)
    }

    const { data, error } = await query
    if (error) throw error

    // determine next cursor
    const nextCursor = data && data.length ? data[data.length - 1].created_at : null

    return NextResponse.json({ generations: data, nextCursor })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
