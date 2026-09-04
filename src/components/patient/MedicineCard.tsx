import React from 'react'
import { CalendarCheck, Star } from 'lucide-react'
import { Medicine } from '@/types'

interface MedicineCardProps {
  medicine: Medicine
  onViewAvailability: (med: Medicine) => void
  onReserve?: (med: Medicine) => void
  isBookmarked?: boolean
  onToggleBookmark?: (medId: string) => void
}

export default function MedicineCard({
  medicine,
  onViewAvailability,
  onReserve,
  isBookmarked = false,
  onToggleBookmark,
}: MedicineCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:border-emerald-350 transition-colors flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2 flex-grow min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <h3 className="font-black text-gray-900 text-base sm:text-lg leading-tight">{medicine.name}</h3>
            {onToggleBookmark && (
              <button type="button" onClick={() => onToggleBookmark(medicine.id)} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-rose-500" title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}>
                <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${isBookmarked ? 'fill-rose-500' : 'text-gray-300'}`} />
              </button>
            )}
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full uppercase border border-emerald-100">{medicine.category}</span>
            {medicine.prescriptionRequired ? (
              <span className="text-[9px] font-black text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase">Rx Required</span>
            ) : (
              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded uppercase">OTC</span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-semibold">Generic: <span className="text-gray-800 font-bold">{medicine.genericName}</span></p>
          <p className="text-xs text-gray-500 font-semibold">Manufacturer: <span className="text-gray-800 font-bold">{medicine.manufacturer}</span></p>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-xl space-y-2.5 w-full sm:w-56 flex-shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Nearby Availability</span>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-gray-700">
              <span className="font-semibold text-gray-900 truncate max-w-[140px]">Kigali National</span>
              <span className="text-gray-400 font-medium flex-shrink-0">1.2 km</span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span className="font-semibold text-gray-900 truncate max-w-[140px]">MedPlus Heights</span>
              <span className="text-gray-400 font-medium flex-shrink-0">0.8 km</span>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button type="button" onClick={() => onViewAvailability(medicine)} className="flex-1 text-center text-xs font-bold text-white bg-health-primary hover:bg-health-secondary py-2 rounded-lg transition-colors">
              Check Inventory
            </button>
            {onReserve && (
              <button type="button" onClick={() => onReserve(medicine)} className="p-2 text-health-primary hover:text-white hover:bg-health-primary border border-health-primary rounded-lg transition-colors flex-shrink-0" title="Reserve this medicine" aria-label={`Reserve ${medicine.name}`}>
                <CalendarCheck className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
