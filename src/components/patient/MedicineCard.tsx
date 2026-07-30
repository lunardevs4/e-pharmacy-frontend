import React from 'react'
import { Star } from 'lucide-react'
import { Medicine } from '@/types'

interface MedicineCardProps {
  medicine: Medicine
  onViewAvailability: (med: Medicine) => void
  isBookmarked?: boolean
  onToggleBookmark?: (medId: string) => void
}

export default function MedicineCard({ 
  medicine, 
  onViewAvailability,
  isBookmarked = false,
  onToggleBookmark
}: MedicineCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-emerald-350 transition-colors flex flex-col justify-between space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2 flex-grow">
          <div className="flex items-center flex-wrap gap-2">
            <h3 className="font-black text-gray-900 text-lg leading-tight">{medicine.name}</h3>
            
            {/* Bookmarking toggler icon button */}
            {onToggleBookmark && (
              <button
                type="button"
                onClick={() => onToggleBookmark(medicine.id)}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors text-rose-500"
                title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
              >
                <Star className={`w-5 h-5 ${isBookmarked ? 'fill-rose-500' : 'text-gray-300'}`} />
              </button>
            )}

            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full uppercase border border-emerald-100">
              {medicine.category}
            </span>
            {medicine.prescriptionRequired ? (
              <span className="text-[9px] font-black text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase">
                Prescription Required
              </span>
            ) : (
              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded uppercase">
                Over the Counter
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-500 font-semibold">
            Generic Name: <span className="text-gray-800 font-bold underline">{medicine.genericName}</span>
          </p>
          <p className="text-xs text-gray-500 font-semibold">
            Manufacturer: <span className="text-gray-800 font-bold">{medicine.manufacturer}</span>
          </p>
          {medicine.tradeNames.length > 0 && (
            <p className="text-xs text-gray-400 font-medium">
              Trade Brands: <span className="text-gray-600 font-bold">{medicine.tradeNames.join(', ')}</span>
            </p>
          )}
        </div>

        {/* Nearby preview snippet */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2.5 w-full sm:w-64 flex-shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Nearby Availability</span>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-gray-700">
              <span className="font-semibold text-gray-900 truncate max-w-[130px]">Kigali National</span>
              <span className="text-gray-400 font-medium">1.2 km</span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span className="font-semibold text-gray-900 truncate max-w-[130px]">MedPlus Heights</span>
              <span className="text-gray-400 font-medium">0.8 km</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onViewAvailability(medicine)}
            className="w-full text-center text-xs font-bold text-white bg-health-primary hover:bg-health-secondary py-2 rounded-lg transition-colors mt-2"
          >
            Check Inventory &amp; Map
          </button>
        </div>
      </div>
    </div>
  )
}
