export interface InsurancePrices {
  CASH: number
  [insuranceId: string]: number // custom insurance price mapped to InsuranceProvider.id
}

export interface CustomTariff {
  medicineId: string
  covered: boolean
  coveragePercentage: number
  maximumCoveredPrice: number | null // null = no cap limit
}
