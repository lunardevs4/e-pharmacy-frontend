import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Government Badge above Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 uppercase tracking-widest">
          Government of Rwanda
        </span>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 sm:px-10 border border-gray-200 shadow-lg rounded-2xl space-y-6">
          {/* Official Branding Logo */}
          <div className="text-center">
            <img 
              src="/logo.jpg" 
              alt="Rwanda E-Pharmacy Logo" 
              className="mx-auto h-24 w-auto object-contain mb-4" 
            />
            {title && (
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Content */}
          <div className="mt-6">
            {children}
          </div>
        </div>
      </div>

      {/* Trust & Accessibility footer */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mt-8 text-[11px] text-gray-400 space-x-2">
        <span>ISO 27001 Certified</span>
        <span>&bull;</span>
        <span>GDPR Compliant</span>
        <span>&bull;</span>
        <span>MOH Regulated</span>
      </div>
    </div>
  )
}
