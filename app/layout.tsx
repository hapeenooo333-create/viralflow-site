import './styles/globals.css'
import React from 'react'

export const metadata = {
  title: 'ViralFlow AI',
  description: 'AI content generation platform'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-slate-900 text-white">{children}</div>
      </body>
    </html>
  )
}
