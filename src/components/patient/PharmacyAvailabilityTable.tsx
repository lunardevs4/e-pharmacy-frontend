import React from 'react'
import { Star, MapPin, Check } from 'lucide-react'
import { PharmacyStock } from '@/types'

interface PharmacyAvailabilityTableProps {
  pharmacies: PharmacyStock[]
  onReserve: (pharm: PharmacyStock) => void
  sortBy: string
  onSortChange: (val: string) => void
  onSelectPharmacy?: (pharm: PharmacyStock) => void
  bookmarkedPharmacies?: string[]
  onToggleBookmarkPharmacy?: (pharmId: string) => void
}

export default function PharmacyAvailabilityTable({
  pharmacies,
  onReserve,
  sortBy,
  onSortChange,
  onSelectPharmacy,
  bookmarkedPharmacies = [],
  onToggleBookmarkPharmacy
}: PharmacyAvailabilityTableProps) {

  const renderStockBadge = (status: string, count: number) => {
    switch (status) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
            &bull; High Stock ({count} tabs)
          </span>
        )
      case 'LIMITED':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
            &bull; Limited Stock ({count} tabs)
          </span>
        )
      case 'ALMOST_OUT':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
            &bull; Almost Out ({count} tabs)
          </span>
        )
      case 'OUT_OF_STOCK':
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-gray-500 bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-200">
            &bull; Out of Stock
          </span>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Sorter Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Available Stocks</h3>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-500 font-semibold">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-white border border-gray-300 rounded px-2.5 py-1 text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="proximity">Proximity (Nearest)</option>
            <option value="price">Price (Lowest)</option>
            <option value="stock">Stock (Highest)</option>
            <option value="rating">Rating (Highest)</option>
          </select>
        </div>
      </div>

      {/* Grid wrapper stacked cards on mobile and side elements on desktop */}
      <div className="space-y-3">
        {pharmacies.map((pharm) => {
          const isFav = bookmarkedPharmacies.includes(pharm.pharmacyId)
          return (
            <div
              key={pharm.pharmacyId}
              className={`border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${pharm.isOpen ? 'bg-white border-gray-200 hover:border-emerald-350 shadow-xs' : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
            >
              <div className="space-y-1.5 flex-grow">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h4 className="font-bold text-gray-900 text-sm">{pharm.pharmacyName}</h4>

                  {/* Pharmacy Bookmark Star */}
                  {onToggleBookmarkPharmacy && (
                    <button
                      type="button"
                      onClick={() => onToggleBookmarkPharmacy(pharm.pharmacyId)}
                      className="p-0.5 hover:bg-slate-100 rounded-full transition-colors text-rose-500"
                      title={isFav ? 'Remove Pharmacy Bookmark' : 'Bookmark Pharmacy'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-rose-500' : 'text-gray-300'}`} />
                    </button>
                  )}

                  <div className="flex items-center text-amber-500 text-xs">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold ml-1 text-gray-800">{pharm.rating}</span>
                  </div>
                  {pharm.isOpen ? (
                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-250 uppercase">Open Now</span>
                  ) : (
                    <span className="text-[9px] font-black text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 uppercase">Closed</span>
                  )}
                </div>

                <p
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectPharmacy?.(pharm)
                  }}
                  className="text-xs text-gray-500 flex items-center hover:text-health-primary hover:underline cursor-pointer transition-colors"
                  title="Click to view pharmacy location on Google Map"
                >
                  <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                  <span>{pharm.locationText} &bull; <b>{pharm.distance} km</b> <span className="text-[10px] text-health-primary font-bold ml-1">(Locate on Map)</span></span>
                </p>

                <div className="flex items-center space-x-2.5 pt-1 flex-wrap gap-y-1">
                  {renderStockBadge(pharm.stockStatus, pharm.stock)}
                  <div className="flex gap-1">
                    {pharm.insuranceAccepted.map((ins) => (
                      <span key={ins} className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.25 rounded">
                        {ins} Accepted
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Action button columns */}
              <div className="text-right w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                <div>
                  <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider leading-none">Price per tab</span>
                  <span className="text-base font-black text-gray-950 mt-1 block">{pharm.price} RWF</span>
                </div>
                <button
                  type="button"
                  disabled={!pharm.isOpen || pharm.stock === 0}
                  onClick={() => onReserve(pharm)}
                  className="bg-health-primary hover:bg-health-secondary text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm focus:outline-none disabled:opacity-50"
                >
                  Reserve Medication
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
