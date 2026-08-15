import React from 'react'
import { Upload, FileText, Shield, AlertCircle, Trash2 } from 'lucide-react'

interface PrescriptionUploaderProps {
  uploadedFile: File | null
  filePreviewUrl: string | null
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
  isRequired: boolean
  uploadProgress: number
  error: string | null
}

export default function PrescriptionUploader({
  uploadedFile,
  filePreviewUrl,
  onFileChange,
  onRemove,
  isRequired,
  uploadProgress,
  error
}: PrescriptionUploaderProps) {
  return (
    <div className="space-y-4">
      {isRequired && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start space-x-3 text-amber-800 text-xs">
          <Shield className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-600" />
          <div>
            <span className="font-bold block mb-0.5">Prescription Required</span>
            This medication is regulated by the Ministry of Health. You must upload a valid doctor's prescription (PDF, JPG, or PNG under 10MB) to complete this reservation.
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl p-4 flex items-start space-x-2.5 animate-fadeIn">
          <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {uploadedFile ? (
        <div className="space-y-3">
          <div className="border border-emerald-250 rounded-xl p-4 bg-emerald-50/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-emerald-950 block max-w-[220px] truncate">{uploadedFile.name}</span>
                <span className="text-gray-400 font-bold block mt-0.5">{(uploadedFile.size / 1024).toFixed(1)} KB</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2.5 text-xs">
              {uploadProgress > 0 && uploadProgress < 100 ? (
                <span className="text-emerald-700 font-bold">Uploading {uploadProgress}%...</span>
              ) : (
                <>
                  <label className="font-bold text-health-primary hover:underline cursor-pointer">
                    Replace
                    <input type="file" onChange={onFileChange} className="hidden" />
                  </label>
                  <span className="text-gray-300">|</span>
                  <button type="button" onClick={onRemove} className="font-bold text-rose-600 hover:underline flex items-center">
                    <Trash2 className="w-3.5 h-3.5 mr-0.5" /> Remove
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Progress bar line indicator */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-600 h-1.5 transition-all duration-150" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {filePreviewUrl && (
            <div className="border border-gray-250 rounded-xl overflow-hidden h-36 bg-gray-50 flex items-center justify-center">
              <img src={filePreviewUrl} alt="Prescription preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      ) : (
        <label className="border-2 border-dashed border-gray-300 hover:border-emerald-350 rounded-2xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-colors bg-white">
          <Upload className="w-10 h-10 text-gray-400 mb-3" />
          <span className="text-xs font-bold text-gray-700 block">Click to upload prescription</span>
          <span className="text-[10px] text-gray-400 block mt-1">Supports PDF, PNG, JPG formats up to 10MB</span>
          <input type="file" accept="image/*,application/pdf" onChange={onFileChange} className="hidden" />
        </label>
      )}
    </div>
  )
}
