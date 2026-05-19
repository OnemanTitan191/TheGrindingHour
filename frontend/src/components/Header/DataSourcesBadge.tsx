import React, { useState, useEffect } from 'react'

interface DataSourcesBadgeProps {
  className?: string
}

export const DataSourcesBadge: React.FC<DataSourcesBadgeProps> = ({ className = '' }) => {
  const [connected, setConnected] = useState(0)
  const [lastUpload, setLastUpload] = useState<string | null>(null)

  useEffect(() => {
    const checkDataSources = () => {
      try {
        const uploadData = localStorage.getItem('lastUpload')
        if (uploadData) {
          const parsed = JSON.parse(uploadData)
          setLastUpload(new Date(parsed.date).toLocaleDateString())
          setConnected(parsed.sources || 1)
        } else {
          setConnected(0)
        }
      } catch (error) {
        setConnected(0)
      }
    }

    checkDataSources()
  }, [])

  return (
    <div className={`flex items-center gap-2 px-3 py-2 bg-slate-700 rounded-full ${className}`}>
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < connected ? 'bg-green-500' : 'bg-slate-500'
            }`}
          ></div>
        ))}
      </div>
      <span className="text-xs text-slate-300">
        {connected} of 3 data sources
        {lastUpload && (
          <span className="block text-xs text-slate-500">Last: {lastUpload}</span>
        )}
      </span>
    </div>
  )
}
