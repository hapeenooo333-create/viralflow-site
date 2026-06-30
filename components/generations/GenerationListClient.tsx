'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Generation, StatusBadge } from './types'

type Props = {
  projectId: string
  initial: Generation[]
  initialCursor?: string | null
}

export default function GenerationListClient({ projectId, initial, initialCursor }: Props) {
  const [items, setItems] = useState<Generation[]>(initial || [])
  const [cursor, setCursor] = useState<string | null | undefined>(initialCursor)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(!!initialCursor)
  const observerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Realtime subscription
    const supabase = (window as any).supabase
    if (!supabase) return

    const channel = supabase.channel('public:generations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'generations', filter: `project_id=eq.${projectId}` }, (payload: any) => {
        const ev = payload.eventType
        const newRecord = payload.new
        if (ev === 'INSERT') {
          setItems(prev => [newRecord, ...prev])
        } else if (ev === 'UPDATE') {
          setItems(prev => prev.map(it => it.id === newRecord.id ? newRecord : it))
        } else if (ev === 'DELETE') {
          setItems(prev => prev.filter(it => it.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [projectId])

  useEffect(() => {
    const el = observerRef.current
    if (!el) return

    const obs = new IntersectionObserver(entries => {
      entries.forEach(async entry => {
        if (entry.isIntersecting && hasMore && !loading) {
          setLoading(true)
          try {
            const q = new URL('/api/projects/generations', window.location.origin)
            q.searchParams.set('projectId', projectId)
            q.searchParams.set('limit', '20')
            if (cursor) q.searchParams.set('cursor', cursor)

            const res = await fetch(q.toString())
            const data = await res.json()
            if (data.generations && data.generations.length) {
              setItems(prev => [...prev, ...data.generations])
              setCursor(data.nextCursor)
              setHasMore(!!data.nextCursor)
            } else {
              setHasMore(false)
            }
          } catch (e) {
            console.error(e)
          } finally {
            setLoading(false)
          }
        }
      })
    }, { root: null, rootMargin: '0px', threshold: 1.0 })

    obs.observe(el)
    return () => obs.disconnect()
  }, [observerRef, cursor, hasMore, loading, projectId])

  async function onRetry(id: string) {
    // optimistic update
    setItems(prev => prev.map(it => it.id === id ? { ...it, status: 'queued' } : it))
    try {
      await fetch(`/api/generations/${id}/retry`, { method: 'POST' })
    } catch (e) {
      // revert
      console.error(e)
    }
  }

  async function onDelete(id: string) {
    const confirmed = confirm('Delete this generation?')
    if (!confirmed) return
    // optimistic
    const old = items
    setItems(prev => prev.filter(it => it.id !== id))
    try {
      const res = await fetch(`/api/generations/${id}/delete`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
    } catch (e) {
      alert('Delete failed')
      setItems(old)
    }
  }

  async function onDownload(generation: Generation) {
    if (!generation.result_url) {
      alert('No artifact available')
      return
    }
    try {
      const res = await fetch(`/api/generations/artifact?generationId=${generation.id}`)
      const data = await res.json()
      if (data.url) window.open(data.url, '_blank')
    } catch (e) {
      alert('Download failed')
    }
  }

  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.id} className="bg-slate-800 p-4 rounded flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-300">{new Date(item.created_at).toLocaleString()}</div>
                <div className="text-lg font-semibold mt-1">{item.type} — {item.model || 'default'}</div>
              </div>
              <div className="ml-4"><StatusBadge status={item.status as any} /></div>
            </div>

            <div className="mt-3 text-slate-200 whitespace-pre-wrap">{item.result_text ? item.result_text.slice(0, 400) : item.prompt}</div>

            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1 bg-indigo-600 rounded" onClick={() => onDownload(item)}>Download</button>
              <button className="px-3 py-1 bg-yellow-600 rounded" onClick={() => onRetry(item.id)}>Retry</button>
              <button className="px-3 py-1 bg-red-600 rounded" onClick={() => onDelete(item.id)}>Delete</button>
            </div>
          </div>

          <div style={{ width: 220 }}>
            {/* preview */}
            {item.type === 'script' && item.result_text && (
              <div className="bg-slate-900 p-2 rounded text-xs max-h-48 overflow-auto">{item.result_text}</div>
            )}

            {item.type === 'voice' && item.result_url && (
              <audio controls src={item.result_url} />
            )}

            {item.type === 'video' && item.result_url && (
              <video controls src={item.result_url} className="w-full rounded" />
            )}

            {item.type === 'thumbnail' && item.result_url && (
              <img src={item.result_url} alt="thumb" className="w-full rounded" />
            )}
          </div>
        </div>
      ))}

      <div ref={observerRef as any} className="h-6" />

      {loading && <div className="p-4 bg-slate-800 rounded">Loading more...</div>}
      {!hasMore && <div className="text-center text-slate-400">No more history</div>}
    </div>
  )
}
