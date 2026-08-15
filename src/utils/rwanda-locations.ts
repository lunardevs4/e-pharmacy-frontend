import {
  getProvinces,
  getDistricts,
  getSectors,
  getCells,
  getVillages,
  findProvinceByName,
  findDistrictByName,
  findSectorByName,
  findCellByName,
  getLocationPath,
} from 'rwanda-geo-data'

// Define types based on the library's actual structure
export interface Province {
  id: number
  name: string
}

export interface District {
  id: number
  name: string
  provinceId: number
}

export interface Sector {
  id: number
  name: string
  districtId: number
}

export interface Cell {
  id: number
  name: string
  sectorId: number
}

export interface Village {
  id: number
  name: string
  cellId: number
}

export interface LocationPath {
  village?: Village
  cell?: Cell
  sector?: Sector
  district?: District
  province?: Province
}

// Get all provinces
export const getRwandaProvinces = (): any[] => {
  return [...getProvinces()]
}

// Get districts by province ID
export const getDistrictsByProvince = (provinceId: number): any[] => {
  return [...getDistricts(provinceId)]
}

// Get sectors by district ID
export const getSectorsByDistrict = (districtId: number): any[] => {
  return [...getSectors(districtId)]
}

// Get cells by sector ID
export const getCellsBySector = (sectorId: number): any[] => {
  return [...getCells(sectorId)]
}

// Get villages by cell ID
export const getVillagesByCell = (cellId: number): any[] => {
  return [...getVillages(cellId)]
}

// Find province by name (case-insensitive)
export const findProvince = (name: string): any => {
  return findProvinceByName(name)
}

// Find district by name (case-insensitive, optionally scoped to province)
export const findDistrict = (name: string, provinceId?: number): any => {
  return findDistrictByName(name, provinceId)
}

// Find sector by name (case-insensitive, optionally scoped to district)
export const findSector = (name: string, districtId?: number): any => {
  return findSectorByName(name, districtId)
}

// Find cell by name (case-insensitive, optionally scoped to sector)
export const findCell = (name: string, sectorId?: number): any => {
  return findCellByName(name, sectorId)
}

// Get full location path from any ID
export const getLocationHierarchy = (id: number): any => {
  return getLocationPath(id)
}

// Get all districts (unfiltered)
export const getAllDistricts = (): any[] => {
  return [...getDistricts()]
}

// Get all sectors (unfiltered)
export const getAllSectors = (): any[] => {
  return [...getSectors()]
}

// Get all cells (unfiltered)
export const getAllCells = (): any[] => {
  return [...getCells()]
}

// Get all villages (unfiltered)
export const getAllVillages = (): any[] => {
  return [...getVillages()]
}

// Legacy compatibility - provide a nested structure for existing code
export const RWANDA_LOCATIONS = {
  'Kigali City': {
    'Gasabo': {
      'Remera': {
        'Kibagabaga': ['Nyirabwana', 'Karuruma', 'Kibagabaga Cell Village'],
        'Nyarutarama': ['Kamatamu', 'Kangondo', 'Nyarutarama Village'],
      },
      'Kacyiru': {
        'Kamutwa': ['Inyange', 'Amahoro', 'Kamutwa Village'],
        'Kamatamu': ['Umucyo', 'Urugero'],
      },
    },
    'Kicukiro': {
      'Kanombe': {
        'Busanza': ['Gasaraba', 'Karama', 'Busanza Center'],
        'Kabeza': ['Rebero', 'Sangwa', 'Kabeza Center'],
      },
      'Kagarama': {
        'Muyange': ['Muyange I', 'Muyange II'],
        'Kagarama': ['Rugando', 'Ubumwe'],
      },
    },
  },
  'Northern Province': {
    'Musanze': {
      'Muhoza': {
        'Mpenge': ['Mpenge I', 'Mpenge II'],
        'Ruhengeri': ['Kigombe', 'Kabeza Ruhengeri'],
      },
      'Cyuve': {
        'Cyuve Cell': ['Bukane', 'Rwebeya'],
      },
    },
    'Gicumbi': {
      'Byumba': {
        'Kibali': ['Kibali I', 'Kibali II'],
        'Gacurabwenge': ['Gacurabwenge I', 'Gacurabwenge II'],
      },
    },
  },
  'Eastern Province': {
    'Rwamagana': {
      'Kigabiro': {
        'Cyanya': ['Cyanya I', 'Cyanya II'],
        'Sibagire': ['Sibagire I', 'Sibagire II'],
      },
    },
    'Bugesera': {
      'Nyamata': {
        'Nyamata Cell': ['Nyamata I', 'Nyamata II'],
        'Murama': ['Murama I', 'Murama II'],
      },
    },
  },
  'Southern Province': {
    'Huye': {
      'Ngoma': {
        'Butare': ['Butare I', 'Butare II', 'Butare Center'],
        'Ngoma Cell': ['Ngoma I', 'Ngoma II'],
      },
    },
    'Nyanza': {
      'Busasamana': {
        'Kavumu': ['Kavumu I', 'Kavumu II'],
        'Nyanza Cell': ['Nyanza Center', 'Nyanza Village'],
      },
    },
  },
  'Western Province': {
    'Rubavu': {
      'Gisenyi': {
        'Gisenyi Cell': ['Gisenyi I', 'Gisenyi II'],
        'Amahoro': ['Amahoro I', 'Amahoro II'],
      },
    },
    'Karongi': {
      'Rubengera': {
        'Rubengera Cell': ['Rubengera I', 'Rubengera II'],
        'Kibirizi': ['Kibirizi I', 'Kibirizi II'],
      },
    },
  },
}
