import React from 'react'
import GenerationListClient from '../../components/generations/GenerationListClient'
import { supabaseAdmin } from '../../lib/supabaseAdmin'

type Props = { params: { id: string } }

export default async function Page({ params }: Props) {
  const projectId = params.id

  // server-side fetch initial page
  const { data, error } = await supabaseAdmin
    .from('generations')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(12)

  if (error) console.error(error)

  const initial = data || []
  const initialCursor = initial.length ? initial[initial.length - 1].created_at : null

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold">Generation History</h2>
      <p className="text-slate-400 mt-1">All generated assets for this project</p>

      <div className="mt-6">
        {/* Client component handles realtime + infinite scroll */}
        <GenerationListClient projectId={projectId} initial={initial} initialCursor={initialCursor} />
      </div>
    </div>
  )
}
