import React from 'react'
import { Upload, FileText, Shield, AlertCircle, Trash2, RefreshCw, WifiOff, CheckCircle2 } from 'lucide-react'

export interface PrescriptionUploaderProps {
  uploadedFile: File | null
  filePreviewUrl: string | null
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
  isRequired?: boolean
  uploadProgress?: number
  isUploading?: boolean
  error?: string | null
  isNetworkError?: boolean
  onRetry?: () => void
  uploadedSuccess?: boolean
}

export default function PrescriptionUploader({
  uploadedFile,
  filePreviewUrl,
  onFileChange,
  onRemove,
  isRequired = false,
  uploadProgress = 0,
  isUploading = false,
  error = null,
  isNetworkError = false,
  onRetry,
  uploadedSuccess = false,
}: PrescriptionUploaderProps) {
  const isBusy = isUploading || (uploadProgress > 0 && uploadProgress < 100)

  return (
    <div className="space-y-3.5" data-testid="prescription-uploader">
      {isRequired && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-3 text-amber-900 text-xs">
          <Shield className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-600" aria-hidden="true" />
          <div>
            <span className="font-black block mb-0.5 text-amber-950">Prescription Required</span>
            This medication is regulated by the Ministry of Health. You must upload a valid doctor's prescription (PDF, JPG, or PNG under 10MB) to complete this reservation.
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl p-3.5 flex items-start justify-between gap-3 animate-fadeIn"
          data-testid="prescription-error"
        >
          <div className="flex items-start space-x-2.5">
            {isNetworkError ? (
              <WifiOff className="w-4.5 h-4.5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <AlertCircle className="w-4.5 h-4.5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <span className="font-semibold">{error}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              disabled={isBusy}
              onClick={onRetry}
              className="flex items-center space-x-1 px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-[11px] font-bold transition-colors flex-shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isBusy ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {uploadedFile ? (
        <div className="space-y-3">
          <div className={`border rounded-xl p-4 flex items-center justify-between transition-colors ${
            error ? 'border-red-300 bg-red-50/20' : uploadedSuccess ? 'border-emerald-300 bg-emerald-50/20' : 'border-emerald-200 bg-emerald-50/10'
          }`}>
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="text-xs min-w-0">
                <span className="font-bold text-gray-950 block max-w-[220px] truncate" title={uploadedFile.name}>
                  {uploadedFile.name}
                </span>
                <span className="text-gray-400 font-semibold block mt-0.5">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2.5 text-xs flex-shrink-0">
              {isBusy ? (
                <span className="text-emerald-700 font-bold flex items-center space-x-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading {uploadProgress}%...</span>
                </span>
              ) : uploadedSuccess ? (
                <span className="text-emerald-700 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready</span>
                </span>
              ) : (
                <>
                  <label className="font-bold text-health-primary hover:underline cursor-pointer">
                    Replace
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={onFileChange}
                      disabled={isBusy}
                      className="hidden"
                      data-testid="prescription-replace-input"
                    />
                  </label>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={onRemove}
                    disabled={isBusy}
                    className="font-bold text-rose-600 hover:underline flex items-center disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-0.5" /> Remove
                  </button>
                </>
              )}
            </div>
          </div>

          {isBusy && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100}>
              <div 
                className="bg-emerald-600 h-1.5 transition-all duration-150" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {filePreviewUrl && (
            <div className="border border-gray-200 rounded-xl overflow-hidden h-36 bg-gray-50 flex items-center justify-center">
              <img src={filePreviewUrl} alt="Prescription preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      ) : (
        <label
          className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-colors bg-white ${
            error ? 'border-red-300 hover:border-red-400 bg-red-50/10' : 'border-gray-300 hover:border-emerald-400'
          }`}
        >
          <Upload className={`w-10 h-10 mb-3 ${error ? 'text-red-400' : 'text-gray-400'}`} aria-hidden="true" />
          <span className="text-xs font-bold text-gray-800 block">Click to upload prescription</span>
          <span className="text-[10px] text-gray-400 block mt-1">Supports PDF, PNG, JPG formats up to 10MB</span>
          <input
            type="file"
            accept=".pdf,image/jpeg,image/png,image/jpg,application/pdf"
            onChange={onFileChange}
            className="hidden"
            data-testid="prescription-file-input"
          />
        </label>
      )}
    </div>
  )
}
