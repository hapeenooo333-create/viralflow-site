import React from 'react'

export function Button({children, ...props}:{children:React.ReactNode} & React.ButtonHTMLAttributes<HTMLButtonElement>){
  return <button {...props} className={`px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 ${props.className || ''}`}>{children}</button>
}
