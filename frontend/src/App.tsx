import { useEffect, useState } from 'react'

function App() {
  const [status, setStatus] = useState<string>('Loading...')

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setStatus(data.status || 'Unknown'))
      .catch(() => setStatus('Backend unavailable'))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-white">The Grinding Hour</h1>
          <p className="text-slate-400">Labor and efficiency tracking</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-700 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome</h2>
          <p className="text-slate-300 mb-6">
            The Grinding Hour is starting up. Core infrastructure is being initialized.
          </p>
          <div className="inline-block bg-slate-600 rounded px-4 py-2">
            <p className="text-slate-200">
              Backend Status: <span className="font-semibold text-green-400">{status}</span>
            </p>
          </div>
          <p className="text-slate-400 text-sm mt-8">
            Phase 1 foundation ready. Full labor tracking features coming soon.
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
