import React from 'react'

export type Generation = {
  id: string
  project_id: string
  type: string
  prompt?: string
  model?: string
  status: 'pending' | 'queued' | 'processing' | 'finished' | 'failed'
  result_text?: string
  result_url?: string
  meta?: any
  created_at: string
}

export function StatusBadge({ status }: { status: Generation['status'] }) {
  const map: Record<string, string> = {
    pending: 'bg-gray-600',
    queued: 'bg-yellow-500',
    processing: 'bg-indigo-500',
    finished: 'bg-green-500',
    failed: 'bg-red-500'
  }
  return <span className={`px-2 py-1 text-xs rounded ${map[status] || 'bg-gray-500'}`}>{status}</span>
}
