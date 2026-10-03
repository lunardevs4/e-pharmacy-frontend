import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'
import { useLanguageStore } from '@/store/languageStore'

export default function NotFound() {
  const navigate = useNavigate()
  const { t } = useLanguageStore()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-150">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">404</h1>
          <h2 className="text-lg font-bold text-gray-800">Page Not Found</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            The page you are looking for does not exist or may have moved. Please check the URL or return to navigation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-health-primary hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Home Page</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
