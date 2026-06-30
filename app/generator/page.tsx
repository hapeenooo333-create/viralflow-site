import { useState } from 'react'

export default function GeneratorPage() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function onGenerate() {
    if (!prompt) return alert('Enter a prompt')
    setLoading(true)
    setResult('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      setResult(data.output || JSON.stringify(data))
    } catch (e) {
      setResult('Error: ' + (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold">AI Script Generator</h2>
      <textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} className="w-full mt-4 p-3 rounded bg-slate-800" rows={6} />
      <div className="mt-4 flex gap-2">
        <button onClick={onGenerate} className="px-4 py-2 bg-green-500 rounded">{loading? 'Generating...' : 'Generate'}</button>
      </div>
      <pre className="mt-6 whitespace-pre-wrap bg-slate-800 p-4 rounded">{result}</pre>
    </div>
  )
}
