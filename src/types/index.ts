import { CarDeal, CarMake, CarModel, User } from '@prisma/client'

export type CarDealWithRelations = CarDeal & {
  make: CarMake
  model: CarModel
  user: Pick<User, 'id' | 'name' | 'email'>
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
