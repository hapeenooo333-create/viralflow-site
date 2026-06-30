import React from 'react'

export function ErrorBox({children}:{children:React.ReactNode}){
  return <div className="p-3 bg-red-700 rounded text-white">{children}</div>
}
