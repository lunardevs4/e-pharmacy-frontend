import React, { useState, useEffect } from 'react'
import {
  getRwandaProvinces,
  getDistrictsByProvince,
  getSectorsByDistrict,
  getCellsBySector,
  getVillagesByCell,
  findProvince,
  findDistrict,
  findSector,
  findCell,
} from '@/utils/rwanda-locations'
import type { Province, District, Sector, Cell, Village } from '@/utils/rwanda-locations'

interface LocationSelectorProps {
  onLocationChange: (location: {
    province: string
    district: string
    sector: string
    cell: string
    village: string
  }) => void
  initialLocation?: {
    province?: string
    district?: string
    sector?: string
    cell?: string
    village?: string
  }
  disabled?: boolean
  required?: boolean
}

export default function LocationSelector({
  onLocationChange,
  initialLocation,
  disabled = false,
  required = false,
}: LocationSelectorProps) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])
  const [cells, setCells] = useState<Cell[]>([])
  const [villages, setVillages] = useState<Village[]>([])

  const [selectedProvince, setSelectedProvince] = useState<string>('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')
  const [selectedSector, setSelectedSector] = useState<string>('')
  const [selectedCell, setSelectedCell] = useState<string>('')
  const [selectedVillage, setSelectedVillage] = useState<string>('')

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    try {
      const provinceList = getRwandaProvinces()
      setProvinces(provinceList)
      
      if (initialLocation?.province) {
        const province = findProvince(initialLocation.province)
        if (province) {
          setSelectedProvince(province.name)
          const districtList = getDistrictsByProvince(province.id)
          setDistricts(districtList)
          
          if (initialLocation?.district) {
            const district = findDistrict(initialLocation.district, province.id)
            if (district) {
              setSelectedDistrict(district.name)
              const sectorList = getSectorsByDistrict(district.id)
              setSectors(sectorList)
              
              if (initialLocation?.sector) {
                const sector = findSector(initialLocation.sector, district.id)
                if (sector) {
                  setSelectedSector(sector.name)
                  const cellList = getCellsBySector(sector.id)
                  setCells(cellList)
                  
                  if (initialLocation?.cell) {
                    const cell = findCell(initialLocation.cell, sector.id)
                    if (cell) {
                      setSelectedCell(cell.name)
                      const villageList = getVillagesByCell(cell.id)
                      setVillages(villageList)
                      
                      if (initialLocation?.village) {
                        setSelectedVillage(initialLocation.village)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading location data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleProvinceChange = (provinceName: string) => {
    setSelectedProvince(provinceName)
    setSelectedDistrict('')
    setSelectedSector('')
    setSelectedCell('')
    setSelectedVillage('')
    setDistricts([])
    setSectors([])
    setCells([])
    setVillages([])

    const province = findProvince(provinceName)
    if (province) {
      const districtList = getDistrictsByProvince(province.id)
      setDistricts(districtList)
    }

    updateLocation({ province: provinceName, district: '', sector: '', cell: '', village: '' })
  }

  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName)
    setSelectedSector('')
    setSelectedCell('')
    setSelectedVillage('')
    setSectors([])
    setCells([])
    setVillages([])

    const province = findProvince(selectedProvince)
    if (province) {
      const district = findDistrict(districtName, province.id)
      if (district) {
        const sectorList = getSectorsByDistrict(district.id)
        setSectors(sectorList)
      }
    }

    updateLocation({ province: selectedProvince, district: districtName, sector: '', cell: '', village: '' })
  }

  const handleSectorChange = (sectorName: string) => {
    setSelectedSector(sectorName)
    setSelectedCell('')
    setSelectedVillage('')
    setCells([])
    setVillages([])

    const province = findProvince(selectedProvince)
    if (province) {
      const district = findDistrict(selectedDistrict, province.id)
      if (district) {
        const sector = findSector(sectorName, district.id)
        if (sector) {
          const cellList = getCellsBySector(sector.id)
          setCells(cellList)
        }
      }
    }

    updateLocation({ province: selectedProvince, district: selectedDistrict, sector: sectorName, cell: '', village: '' })
  }

  const handleCellChange = (cellName: string) => {
    setSelectedCell(cellName)
    setSelectedVillage('')
    setVillages([])

    const province = findProvince(selectedProvince)
    if (province) {
      const district = findDistrict(selectedDistrict, province.id)
      if (district) {
        const sector = findSector(selectedSector, district.id)
        if (sector) {
          const cell = findCell(cellName, sector.id)
          if (cell) {
            const villageList = getVillagesByCell(cell.id)
            setVillages(villageList)
          }
        }
      }
    }

    updateLocation({ province: selectedProvince, district: selectedDistrict, sector: selectedSector, cell: cellName, village: '' })
  }

  const handleVillageChange = (villageName: string) => {
    setSelectedVillage(villageName)
    updateLocation({ province: selectedProvince, district: selectedDistrict, sector: selectedSector, cell: selectedCell, village: villageName })
  }

  const updateLocation = (location: { province: string; district: string; sector: string; cell: string; village: string }) => {
    onLocationChange(location)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
      <div className="space-y-1">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Province {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedProvince}
          onChange={(e) => handleProvinceChange(e.target.value)}
          disabled={disabled}
          required={required}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">Select Province</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.name}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          District {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedDistrict}
          onChange={(e) => handleDistrictChange(e.target.value)}
          disabled={disabled || !selectedProvince}
          required={required}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">Select District</option>
          {districts.map((district) => (
            <option key={district.id} value={district.name}>
              {district.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Sector {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedSector}
          onChange={(e) => handleSectorChange(e.target.value)}
          disabled={disabled || !selectedDistrict}
          required={required}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">Select Sector</option>
          {sectors.map((sector) => (
            <option key={sector.id} value={sector.name}>
              {sector.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Cell {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedCell}
          onChange={(e) => handleCellChange(e.target.value)}
          disabled={disabled || !selectedSector}
          required={required}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">Select Cell</option>
          {cells.map((cell) => (
            <option key={cell.id} value={cell.name}>
              {cell.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Village {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedVillage}
          onChange={(e) => handleVillageChange(e.target.value)}
          disabled={disabled || !selectedCell}
          required={required}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">Select Village</option>
          {villages.map((village) => (
            <option key={village.id} value={village.name}>
              {village.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}