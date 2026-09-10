export interface InsurancePrices {
  CASH: number
  [insuranceId: string]: number 
}

export interface CustomTariff {
  medicineId: string
  covered: boolean
  coveragePercentage: number
  maximumCoveredPrice: number | null 
}
