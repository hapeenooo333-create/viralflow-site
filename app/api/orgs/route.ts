import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  // list organizations for the calling user
  try {
    const user = req.headers.get('x-user-id') || '' // in production use auth middleware
    if (!user) return NextResponse.json({ error: 'Missing x-user-id header for demo' }, { status: 401 })

    const { data } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .in('id',
        supabaseAdmin
          .from('organization_members')
          .select('organization_id')
          .eq('profile_id', user)
      )

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, owner_id } = body
    if (!name || !owner_id) return NextResponse.json({ error: 'name and owner_id required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('organizations')
      .insert({ name, owner_id })
      .select()
      .single()

    if (error) throw error

    // add owner as member
    await supabaseAdmin.from('organization_members').insert({ organization_id: data.id, profile_id: owner_id, role: 'owner' })

    return NextResponse.json({ organization: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
