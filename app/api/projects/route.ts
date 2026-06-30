import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  try {
    const orgId = req.nextUrl.searchParams.get('orgId')
    if (!orgId) return NextResponse.json({ error: 'orgId required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('organization_id', orgId)

    if (error) throw error
    return NextResponse.json({ projects: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { organization_id, name, description, created_by } = body
    if (!organization_id || !name) return NextResponse.json({ error: 'organization_id and name required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({ organization_id, name, description, created_by })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ project: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
