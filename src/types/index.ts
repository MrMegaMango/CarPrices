export type CarMake = {
  id: string
  name: string
  logo: string | null
  createdAt: Date
  updatedAt: Date
}

export type CarModel = {
  id: string
  name: string
  makeId: string
  createdAt: Date
  updatedAt: Date
}

export type UserLite = {
  id: string
  name: string | null
  email: string
}

export type CarDeal = {
  id: string
  userId: string
  makeId: string
  modelId: string
  year: number
  trim: string | null
  color: string | null
  exteriorColor: string | null
  interiorColor: string | null
  msrp: number
  sellingPrice: number
  otdPrice: number | null
  rebates: number | null
  tradeInValue: number | null
  dealerName: string | null
  dealerLocation: string | null
  dealDate: Date
  financingRate: number | null
  financingTerm: number | null
  downPayment: number | null
  monthlyPayment: number | null
  notes: string | null
  isLeased: boolean
  leaseTermMonths: number | null
  mileageAllowance: number | null
  verified: boolean
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export type CarDealWithRelations = CarDeal & {
  make: Pick<CarMake, 'id' | 'name'>
  model: Pick<CarModel, 'id' | 'name'>
  user: UserLite
}

export type CarModelWithMake = CarModel & {
  make: CarMake
}

export type DealFilters = {
  makeId?: string
  modelId?: string
  year?: number
  minPrice?: number
  maxPrice?: number
  state?: string
  sortBy?: 'price' | 'date' | 'savings'
  sortOrder?: 'asc' | 'desc'
}

export type PriceStats = {
  avgMsrp: number
  avgSellingPrice: number
  avgSavings: number
  totalDeals: number
  priceRange: {
    min: number
    max: number
  }
}
