import React from 'react'

export function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(4)].map((_,i) => (
        <div key={i} className="animate-pulse bg-slate-800 rounded p-4">
          <div className="h-4 bg-slate-700 w-1/3 mb-2" />
          <div className="h-2 bg-slate-700 w-3/4 mb-2" />
          <div className="h-8 bg-slate-700 w-full" />
        </div>
      ))}
    </div>
  )
}
