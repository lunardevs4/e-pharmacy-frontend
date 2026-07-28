import { Medicine, PharmacyStock, Reservation } from '@/types'
import { INSURANCE_COVERAGE_RATES } from '@/config/insurance-rates'

// Mock Medicines Registry Database (National Catalog)
const MOCK_MEDICINES: Medicine[] = [
  {
    id: 'med-001',
    name: 'Paracetamol 500mg',
    genericName: 'Paracetamol',
    tradeNames: ['Panadol', 'Calpol', 'Crocin'],
    category: 'Analgesics',
    manufacturer: 'GSK plc',
    prescriptionRequired: false,
    uses: 'Used for mild to moderate pain relief, including headache, muscle ache, backache, toothache, and common cold symptoms. Also highly effective for temporary fever reduction.',
    dosage: 'Adults: 1-2 tablets (500mg-1000mg) every 4-6 hours as needed. Do not exceed 8 tablets (4000mg) in any 24-hour period.',
    warnings: 'Severe liver damage may occur if you take more than the maximum daily limit, or consume alcohol while taking this medicine. Check other ingredients for acetaminophen.',
    sideEffects: 'Generally safe at recommended doses. Rarely, skin rash, swelling, or dizziness may occur.',
    interactions: 'Avoid co-administering with other acetaminophen-containing drugs. Warfarin effects may be increased with prolonged daily usage.',
    storage: 'Store below 30°C in a dry place. Keep out of reach of children.'
  },
  {
    id: 'med-002',
    name: 'Amoxicillin 250mg',
    genericName: 'Amoxicillin',
    tradeNames: ['Amoxil', 'Dispermox', 'Moxatag'],
    category: 'Antibiotics',
    manufacturer: 'Novartis AG',
    prescriptionRequired: true,
    uses: 'Treats a wide variety of bacterial infections. Works by stopping the growth of bacteria. Not effective for viral infections like colds or influenza.',
    dosage: 'As directed by your physician. Typical dose is 250mg to 500mg three times a day, or 500mg to 875mg twice a day.',
    warnings: 'Finish the entire prescribed course even if symptoms resolve to prevent antibiotic resistance. Do not use if you are allergic to penicillin.',
    sideEffects: 'Diarrhea, nausea, vomiting, or skin rash. Consult a doctor immediately if a severe allergic reaction occurs.',
    interactions: 'May reduce effectiveness of oral contraceptives. Probenecid can delay kidney excretion of amoxicillin.',
    storage: 'Keep container tightly closed. Store at room temperature away from light and moisture.'
  },
  {
    id: 'med-003',
    name: 'Metformin 500mg',
    genericName: 'Metformin',
    tradeNames: ['Glucophage', 'Fortamet', 'Riomet'],
    category: 'Antidiabetics',
    manufacturer: 'Merck KGaA',
    prescriptionRequired: true,
    uses: 'Prescribed alongside diet and exercise to lower blood glucose levels in patients with Type 2 Diabetes Mellitus. Helps restore the body\'s response to insulin.',
    dosage: 'Initial dose is typically 500mg once or twice daily, taken with meals to minimize gastrointestinal discomfort.',
    warnings: 'A rare but serious side effect is Lactic Acidosis (excessive acid buildup in blood). Avoid excess alcohol intake and seek care if feeling unusually fatigued.',
    sideEffects: 'Nausea, stomach upset, diarrhea, metallic taste, or headache. These usually improve over a few weeks.',
    interactions: 'Contrast dyes containing iodine can trigger kidney failure if co-administered. Cimetidine may increase metformin levels.',
    storage: 'Store between 20°C and 25°C. Protect from high temperatures and direct sunlight.'
  },
  {
    id: 'med-004',
    name: 'Amlodipine 5mg',
    genericName: 'Amlodipine',
    tradeNames: ['Norvasc', 'Amvaz', 'Katerzia'],
    category: 'Antihypertensives',
    manufacturer: 'Pfizer Inc.',
    prescriptionRequired: true,
    uses: 'Belongs to the class of calcium channel blockers. Prescribed to treat hypertension (high blood pressure) and chest pain (angina) by relaxing blood vessels.',
    dosage: 'Starting dose is 5mg once daily. May be increased to 10mg once daily as directed by your physician.',
    warnings: 'Monitor blood pressure regularly. Seek immediate medical attention if you experience severe chest pains or irregular heartbeat.',
    sideEffects: 'Swelling of ankles or feet (peripheral edema), fatigue, dizziness, or flushing.',
    interactions: 'Avoid consuming large quantities of grapefruit juice, which can raise drug blood levels. Simvastatin dosage should be capped when co-prescribed.',
    storage: 'Store in dry light-resistant containers at room temperature.'
  },
  {
    id: 'med-005',
    name: 'Coartem (Artemether 20mg / Lumefantrine 120mg)',
    genericName: 'Artemether-Lumefantrine',
    tradeNames: ['Coartem', 'Riamet'],
    category: 'Antibiotics',
    manufacturer: 'Novartis AG',
    prescriptionRequired: true,
    uses: 'First-line combination therapy for treating acute, uncomplicated malaria infections caused by Plasmodium falciparum. Extremely critical drug in Rwanda health protocols.',
    dosage: 'Standard 3-day course (6 doses total). Initial dose followed by 2nd dose after 8 hours, then twice daily for the next 2 days. Take with fatty foods.',
    warnings: 'Do not use as preventive malaria therapy. Avoid taking if you have severe liver or kidney problems without physician approval.',
    sideEffects: 'Headache, dizziness, loss of appetite, joint/muscle pain, or trouble sleeping.',
    interactions: 'Avoid combination with drugs prolonging QT intervals or strong CYP3A4 inhibitors/inducers.',
    storage: 'Store below 30°C. Protect from light.'
  },
  {
    id: 'med-006',
    name: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen',
    tradeNames: ['Advil', 'Motrin', 'Nurofen'],
    category: 'Analgesics',
    manufacturer: 'Pfizer Inc.',
    prescriptionRequired: false,
    uses: 'Nonsteroidal anti-inflammatory drug (NSAID) used to relieve headaches, dental pain, menstrual cramps, arthritis, or minor muscle aches, and reduce swelling.',
    dosage: 'Adults: 1 tablet (400mg) every 4 to 6 hours as needed. Do not exceed 3 tablets (1200mg) in 24 hours unless directed.',
    warnings: 'May increase the risk of serious stomach bleeding or cardiovascular blood clots, especially if taken for long durations or in high dosages.',
    sideEffects: 'Stomach ache, heartburn, headache, mild dizziness, or fluid retention.',
    interactions: 'Can decrease effectiveness of aspirin taken for heart protection. May interact with blood thinners like warfarin.',
    storage: 'Store in tightly closed original packaging at room temperature.'
  }
]

// Mock Registered Pharmacies in Rwanda
const MOCK_PHARMACIES = [
  { id: 'ph-001', name: 'Kigali National Pharmacy', rating: 4.8, isOpen: true, distance: 1.2, insuranceAccepted: ['RSSB', 'MMI', 'SANLAM', 'Radiant'], lat: -1.9442, lng: 30.0618, locationText: 'Kigali City, Nyarugenge, Sector Kiyovu' },
  { id: 'ph-002', name: 'Remera City Medical', rating: 4.5, isOpen: true, distance: 2.1, insuranceAccepted: ['RSSB', 'Radiant'], lat: -1.9612, lng: 30.1156, locationText: 'Kigali City, Gasabo, Sector Remera' },
  { id: 'ph-003', name: 'Nyarugenge Health Pharmacy', rating: 4.2, isOpen: true, distance: 3.4, insuranceAccepted: ['MMI', 'SANLAM'], lat: -1.9423, lng: 30.0574, locationText: 'Kigali City, Nyarugenge, Sector Muhima' },
  { id: 'ph-004', name: 'Gikondo District Pharmacy', rating: 4.0, isOpen: false, distance: 4.5, insuranceAccepted: [], lat: -1.9745, lng: 30.0825, locationText: 'Kigali City, Kicukiro, Sector Gikondo' },
  { id: 'ph-005', name: 'MedPlus Kigali Heights', rating: 4.9, isOpen: true, distance: 0.8, insuranceAccepted: ['RSSB', 'MMI', 'SANLAM', 'Radiant'], lat: -1.9525, lng: 30.0911, locationText: 'Kigali City, Gasabo, Sector Kacyiru' }
]

// Local Storage keys for dynamic updates
const RESERVATIONS_STORAGE_KEY = 'epharmacy_reservations_mock'
const PHARMACY_INVENTORIES_KEY = 'epharmacy_pharmacy_inventories_mock'
const CUSTOM_MEDICINES_KEY = 'epharmacy_custom_medicines_mock'

// Hash helper to generate dynamic values deterministically based on medicineId
const getDeterministicHash = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

// Fetch helper from local storage
const getSavedReservations = (): Reservation[] => {
  const data = localStorage.getItem(RESERVATIONS_STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

// Save helper to local storage
const saveReservations = (list: Reservation[]) => {
  localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(list))
}

// Fetch dynamic catalog
const getCustomMedicines = (): Medicine[] => {
  const data = localStorage.getItem(CUSTOM_MEDICINES_KEY)
  return data ? JSON.parse(data) : []
}

// Save to dynamic catalog
const saveCustomMedicine = (med: Medicine) => {
  const list = getCustomMedicines()
  if (!list.some(m => m.id === med.id)) {
    list.push(med)
    localStorage.setItem(CUSTOM_MEDICINES_KEY, JSON.stringify(list))
  }
}

// Fetch dynamic inventory from local storage
interface LocalInventoryRecord {
  pharmacyId: string
  medicineId: string
  price: number
  stock: number
  isOpen?: boolean
}

const getSavedInventories = (): LocalInventoryRecord[] => {
  const data = localStorage.getItem(PHARMACY_INVENTORIES_KEY)
  return data ? JSON.parse(data) : []
}

export const MedicineApi = {
  // Search catalog medicines (both national registry and dynamic custom-added ones)
  searchMedicines: async (
    query: string, 
    category: string, 
    inStockOnly: boolean
  ): Promise<Medicine[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate network latency

    let list = [...MOCK_MEDICINES, ...getCustomMedicines()]

    if (category) {
      list = list.filter((m) => m.category.toLowerCase() === category.toLowerCase())
    }

    if (query.trim()) {
      const q = query.toLowerCase().trim()
      list = list.filter((m) => {
        const matchesGeneric = m.genericName.toLowerCase().includes(q)
        const matchesName = m.name.toLowerCase().includes(q)
        const matchesManufacturer = m.manufacturer.toLowerCase().includes(q)
        const matchesCategory = m.category.toLowerCase().includes(q)
        const matchesTrade = m.tradeNames.some((t) => t.toLowerCase().includes(q))
        return matchesGeneric || matchesName || matchesManufacturer || matchesCategory || matchesTrade
      })
    }

    // Filter stock
    if (inStockOnly) {
      const allAvailabilities = await Promise.all(
        list.map(async (m) => {
          const avail = await MedicineApi.getMedicineAvailability(m.id)
          return { id: m.id, hasStock: avail.some((a) => a.stock > 0 && a.isOpen) }
        })
      )
      const allowedIds = new Set(allAvailabilities.filter(x => x.hasStock).map(x => x.id))
      list = list.filter((m) => allowedIds.has(m.id))
    }

    return list
  },

  // Get medicine details by ID
  getMedicineDetails: async (id: string): Promise<Medicine> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const item = [...MOCK_MEDICINES, ...getCustomMedicines()].find((m) => m.id === id)
    if (!item) {
      throw new Error(`Medicine with ID ${id} not found in the national registry.`)
    }
    return item
  },

  // Add custom medication dynamic record (pharmacist catalog addition)
  addCustomMedicine: async (med: Medicine): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    saveCustomMedicine(med)
  },

  // Resolves pharmacy stock levels dynamically for any medicine ID
  // Merges custom local storage modifications with deterministic seeds
  getMedicineAvailability: async (medicineId: string): Promise<PharmacyStock[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    
    const localInv = getSavedInventories()
    const isCustomMedicine = !MOCK_MEDICINES.some(m => m.id === medicineId)

    return MOCK_PHARMACIES.map((pharm) => {
      // Find if pharmacy owner has updated this inventory in local storage
      const customRecord = localInv.find(
        (r) => r.pharmacyId === pharm.id && r.medicineId === medicineId
      )

      if (customRecord) {
        let status: PharmacyStock['stockStatus'] = 'OUT_OF_STOCK'
        if (customRecord.stock > 30) status = 'HIGH'
        else if (customRecord.stock >= 10) status = 'LIMITED'
        else if (customRecord.stock > 0) status = 'ALMOST_OUT'

        return {
          pharmacyId: pharm.id,
          pharmacyName: pharm.name,
          rating: pharm.rating,
          isOpen: customRecord.isOpen !== undefined ? customRecord.isOpen : pharm.isOpen,
          distance: pharm.distance,
          price: customRecord.price,
          stock: customRecord.stock,
          stockStatus: status,
          insuranceAccepted: pharm.insuranceAccepted,
          lat: pharm.lat,
          lng: pharm.lng,
          locationText: pharm.locationText
        }
      }

      // If it is a dynamic custom added medicine (not in MOCK_MEDICINES catalog),
      // we do not leak fallback stock levels for other pharmacies. They stay 0 (OUT_OF_STOCK).
      if (isCustomMedicine) {
        return {
          pharmacyId: pharm.id,
          pharmacyName: pharm.name,
          rating: pharm.rating,
          isOpen: pharm.isOpen,
          distance: pharm.distance,
          price: 0,
          stock: 0,
          stockStatus: 'OUT_OF_STOCK',
          insuranceAccepted: pharm.insuranceAccepted,
          lat: pharm.lat,
          lng: pharm.lng,
          locationText: pharm.locationText
        }
      }

      // Fallback deterministic seed generation based on IDs
      const seed = getDeterministicHash(medicineId + pharm.id)
      
      const priceOffset = (seed % 5) * 200 // Deterministic price variation
      const price = 1200 + priceOffset

      const stock = seed % 160 // Deterministic stock variation
      let stockStatus: PharmacyStock['stockStatus'] = 'HIGH'
      if (stock === 0) stockStatus = 'OUT_OF_STOCK'
      else if (stock < 10) stockStatus = 'ALMOST_OUT'
      else if (stock < 35) stockStatus = 'LIMITED'

      return {
        pharmacyId: pharm.id,
        pharmacyName: pharm.name,
        rating: pharm.rating,
        isOpen: pharm.isOpen,
        distance: pharm.distance,
        price,
        stock,
        stockStatus,
        insuranceAccepted: pharm.insuranceAccepted,
        lat: pharm.lat,
        lng: pharm.lng,
        locationText: pharm.locationText
      }
    })
  },

  // Update dynamic pharmacy stock levels (for pharmacy manager pages)
  updatePharmacyInventory: async (
    pharmacyId: string,
    medicineId: string,
    price: number,
    stock: number,
    isOpen?: boolean
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const list = getSavedInventories()
    const index = list.findIndex(
      (r) => r.pharmacyId === pharmacyId && r.medicineId === medicineId
    )

    const record = { pharmacyId, medicineId, price, stock, isOpen }
    if (index !== -1) {
      list[index] = record
    } else {
      list.push(record)
    }

    localStorage.setItem(PHARMACY_INVENTORIES_KEY, JSON.stringify(list))
    return true
  },

  // Calculate dynamic insurance cost splits
  calculateInsuranceCoverage: async (
    provider: string, 
    basePrice: number
  ): Promise<{ percent: number; insurancePays: number; patientPays: number }> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const rate = INSURANCE_COVERAGE_RATES[provider] ?? 0.0
    const insurancePays = Math.round(basePrice * rate)
    const patientPays = basePrice - insurancePays

    return {
      percent: Math.round(rate * 100),
      insurancePays,
      patientPays
    }
  },

  // Simulate file upload validation and progress updates
  uploadPrescription: async (
    file: File,
    onProgress: (percent: number) => void
  ): Promise<{ fileUrl: string; fileName: string }> => {
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (!['pdf', 'jpg', 'png', 'jpeg'].includes(ext)) {
      throw new Error('Unsupported file format. Please upload PDF, JPG, or PNG only.')
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Prescription file size exceeds the 10MB national system limit.')
    }

    for (let percent = 10; percent <= 100; percent += 15) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      onProgress(Math.min(100, percent))
    }

    return {
      fileUrl: URL.createObjectURL(file),
      fileName: file.name
    }
  },

  // Create mock pickup reservation
  createReservation: async (data: {
    medicineId: string
    pharmacyId: string
    quantity: number
    insuranceProvider: string
    insuranceId: string
    prescriptionFileName?: string
  }): Promise<Reservation> => {
    await new Promise((resolve) => setTimeout(resolve, 1200))

    const med = [...MOCK_MEDICINES, ...getCustomMedicines()].find((m) => m.id === data.medicineId)
    if (!med) throw new Error('Invalid medicine ID catalog mapping.')

    // Resolve stock levels dynamically to perform checkout validation
    const availabilityList = await MedicineApi.getMedicineAvailability(data.medicineId)
    const stockInfo = availabilityList.find((s) => s.pharmacyId === data.pharmacyId)

    if (!stockInfo) {
      throw new Error('Selected pharmacy mapping inventory not found.')
    }

    if (stockInfo.stock < data.quantity) {
      throw new Error(`Insufficient stock level. The selected pharmacy only has ${stockInfo.stock} units remaining.`)
    }

    const unitPrice = stockInfo.price
    const totalPrice = unitPrice * data.quantity
    const rate = INSURANCE_COVERAGE_RATES[data.insuranceProvider] ?? 0.0
    const insurancePays = Math.round(totalPrice * rate)
    const patientPays = totalPrice - insurancePays

    const refId = `RES-${Math.floor(100000 + Math.random() * 900000)}`
    const codeNum = Math.floor(100000 + Math.random() * 900000)
    
    const newRes: Reservation = {
      id: refId,
      medicineId: med.id,
      medicineName: med.name,
      pharmacyId: stockInfo.pharmacyId,
      pharmacyName: stockInfo.pharmacyName,
      quantity: data.quantity,
      insuranceProvider: data.insuranceProvider || 'None',
      insuranceId: data.insuranceId || '',
      prescriptionFileName: data.prescriptionFileName || undefined,
      totalPrice,
      insurancePays,
      patientPays,
      pickupCode: `EP-${codeNum}`,
      pickupDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('en-US', {
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }), // Tomorrow
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }

    // Deduct stock count by writing back to dynamic pharmacy inventories in localStorage
    const nextStock = Math.max(0, stockInfo.stock - data.quantity)
    await MedicineApi.updatePharmacyInventory(
      data.pharmacyId,
      data.medicineId,
      unitPrice,
      nextStock,
      stockInfo.isOpen
    )

    // Save reservation
    const list = getSavedReservations()
    list.unshift(newRes)
    saveReservations(list)

    return newRes
  },

  // Cancel reservation and reconcile stock counts
  cancelReservation: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const list = getSavedReservations()
    const index = list.findIndex((r) => r.id === id)
    if (index !== -1) {
      const res = list[index]
      if (res.status === 'PENDING' || res.status === 'CONFIRMED') {
        res.status = 'CANCELLED'
        
        // Restore stock
        const availabilityList = await MedicineApi.getMedicineAvailability(res.medicineId)
        const stockInfo = availabilityList.find((s) => s.pharmacyId === res.pharmacyId)
        if (stockInfo) {
          const nextStock = stockInfo.stock + res.quantity
          await MedicineApi.updatePharmacyInventory(
            res.pharmacyId,
            res.medicineId,
            stockInfo.price,
            nextStock,
            stockInfo.isOpen
          )
        }
      }
      saveReservations(list)
      return true
    }
    return false
  },

  // Fetch reservations history
  getReservationHistory: async (): Promise<Reservation[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return getSavedReservations()
  }
}
