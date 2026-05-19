import React, { useState } from 'react'
import { apiClient } from '../api/client'

interface UploadResult {
  fileName: string
  status: 'success' | 'error'
  message: string
  inserted?: number
  yearRange?: string
}

export const UploadPage: React.FC = () => {
  const [uploads, setUploads] = useState<UploadResult[]>([])
  const [loading, setLoading] = useState(false)

  const handleFileUpload = async (file: File, uploadType: 'tech-report' | 'ro-list' | 'labor-log') => {
    if (!file.name.endsWith('.xlsx')) {
      setUploads([...uploads, {
        fileName: file.name,
        status: 'error',
        message: 'File must be .xlsx format'
      }])
      return
    }

    setLoading(true)
    try {
      const result = await apiClient.uploadFile(file, uploadType)

      const uploadResult: UploadResult = {
        fileName: file.name,
        status: 'success',
        message: `Imported ${result.inserted} records (${result.year_range})`,
        inserted: result.inserted,
        yearRange: result.year_range
      }

      setUploads([...uploads, uploadResult])

      // Update localStorage for DataSourcesBadge
      const lastUpload = {
        date: new Date().toISOString(),
        sources: uploads.filter(u => u.status === 'success').length + 1
      }
      localStorage.setItem('lastUpload', JSON.stringify(lastUpload))

    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Upload failed'
      setUploads([...uploads, {
        fileName: file.name,
        status: 'error',
        message: errorMsg
      }])
    } finally {
      setLoading(false)
    }
  }

  const UploadZone = ({
    title,
    type,
    description
  }: {
    title: string
    type: 'tech-report' | 'ro-list' | 'labor-log'
    description: string
  }) => {
    const [dragActive, setDragActive] = useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(e.type === 'dragenter' || e.type === 'dragover')
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFileUpload(files[0], type)
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileUpload(e.target.files[0], type)
      }
    }

    return (
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
            : 'border-slate-400 hover:border-blue-400 bg-slate-750'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          onChange={handleChange}
          className="hidden"
          disabled={loading}
        />
        <div className="text-lg font-semibold text-white mb-2">{title}</div>
        <div className="text-sm text-slate-400 mb-4">{description}</div>
        <div className="text-xs text-slate-500">
          {loading ? 'Uploading...' : 'Drag file here or click to browse'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Upload Labor Data</h2>
        <p className="text-slate-400">
          Import labor tracking data from Tekion Excel files to populate the dashboard
        </p>
      </div>

      {/* Upload Zones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UploadZone
          title="Technician Report"
          type="tech-report"
          description="Imports job-level flag hours, pay type, and wage rates (2024-2026)"
        />
        <UploadZone
          title="RO List"
          type="ro-list"
          description="Imports RO-level data and dollar amounts (2023-2026)"
        />
        <UploadZone
          title="Labor Log"
          type="labor-log"
          description="Imports your manual 2026 labor tracking entries"
        />
      </div>

      {/* Upload Results */}
      {uploads.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-bold text-white">Upload History</h3>
          {uploads.map((upload, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${
                upload.status === 'success'
                  ? 'bg-green-900 border-green-700'
                  : 'bg-red-900 border-red-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={`font-semibold ${
                    upload.status === 'success' ? 'text-green-200' : 'text-red-200'
                  }`}>
                    {upload.fileName}
                  </p>
                  <p className={`text-sm mt-1 ${
                    upload.status === 'success' ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {upload.message}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded ${
                  upload.status === 'success'
                    ? 'bg-green-800 text-green-200'
                    : 'bg-red-800 text-red-200'
                }`}>
                  {upload.status === 'success' ? '✓ Success' : '✗ Failed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-slate-750 border border-slate-600 rounded-lg p-6 mt-8">
        <h3 className="font-semibold text-white mb-4">ℹ About the Data</h3>
        <ul className="text-slate-300 space-y-2 text-sm">
          <li>
            <strong>Technician Report:</strong> Primary source for job-level data (flag hours, actual hours, pay type)
          </li>
          <li>
            <strong>RO List:</strong> Used for 2023 data and supplementary RO context
          </li>
          <li>
            <strong>Labor Log:</strong> Your manual 2026 entries cross-referenced with reports
          </li>
          <li className="text-xs text-slate-500 mt-4">
            Files are parsed from your <code className="bg-slate-700 px-2 py-1 rounded">Tekion Labor Downloads</code> folder
          </li>
        </ul>
      </div>
    </div>
  )
}
