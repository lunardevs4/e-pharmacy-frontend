import React from 'react'
import { Search, RefreshCw } from 'lucide-react'

interface MedicineSearchBarProps {
  query: string
  category: string
  inStockOnly: boolean
  onQueryChange: (q: string) => void
  onCategoryChange: (c: string) => void
  onInStockChange: (i: boolean) => void
  onSearch: (e?: React.FormEvent) => void
  loading: boolean
  onPopularClick: (term: string) => void
}

export default function MedicineSearchBar({
  query,
  category,
  inStockOnly,
  onQueryChange,
  onCategoryChange,
  onInStockChange,
  onSearch,
  loading,
  onPopularClick
}: MedicineSearchBarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 shadow-sm text-center max-w-3xl mx-auto space-y-6">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
          Government Pharmacy Registry
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 tracking-tight">
          Find any medicine in Rwanda
        </h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto mt-2">
          Verify retail prices, active stock thresholds, insurance eligibility, and reserve for pickup.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={onSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search trade brand or generic drug name..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-900 shadow-sm text-sm font-semibold transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-health-primary hover:bg-health-secondary text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center space-x-2 shadow-sm"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Search Registry</span>}
        </button>
      </form>

      {/* Advanced Filters */}
      <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-gray-500">
        <label className="flex items-center space-x-2 cursor-pointer hover:text-gray-900 transition-colors">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
          />
          <span>In Stock Only</span>
        </label>

        {/* Category Dropdown */}
        <div className="flex items-center space-x-2">
          <span>Category:</span>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1 text-xs text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">All Categories</option>
            <option value="Analgesics">Analgesics</option>
            <option value="Antibiotics">Antibiotics</option>
            <option value="Antidiabetics">Antidiabetics</option>
            <option value="Antihypertensives">Antihypertensives</option>
          </select>
        </div>
      </div>

      {/* Popular Searches */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
        <span className="text-gray-400 font-semibold">Popular searches:</span>
        {['Paracetamol', 'Amoxicillin', 'Metformin'].map((med) => (
          <button
            key={med}
            type="button"
            onClick={() => onPopularClick(med)}
            className="px-3 py-1 bg-gray-50 hover:bg-emerald-50 border border-gray-250 text-gray-600 hover:text-emerald-800 rounded-lg font-bold transition-all"
          >
            {med}
          </button>
        ))}
      </div>
    </div>
  )
}
