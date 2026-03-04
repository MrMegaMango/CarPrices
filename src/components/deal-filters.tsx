'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Filter, X, Search } from 'lucide-react'
import { CarMake, CarModel } from '@/types'

interface DealFiltersProps {
  makes: CarMake[]
  models: CarModel[]
  locations?: string[]
  onFiltersChange?: (filters: Record<string, string>) => void
}

export function DealFilters({ makes, models, locations = [], onFiltersChange }: DealFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState({
    makeId: searchParams.get('makeId') || '',
    modelId: searchParams.get('modelId') || '',
    year: searchParams.get('year') || '',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'date',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  })

  // Local price state — only committed on Apply or Enter
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice)
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice)

  const applyPriceFilters = useCallback(() => {
    updateFilters({ minPrice: localMinPrice, maxPrice: localMaxPrice })
  }, [localMinPrice, localMaxPrice]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') applyPriceFilters()
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 25 }, (_, i) => currentYear - i)

  const filteredModels = models.filter(model => 
    !filters.makeId || model.makeId === filters.makeId
  )

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters }
    
    // Reset model if make changes
    if (newFilters.makeId !== undefined && newFilters.makeId !== filters.makeId) {
      updated.modelId = ''
    }
    
    setFilters(updated)
    onFiltersChange?.(updated)
    
    // Update URL
    const params = new URLSearchParams()
    Object.entries(updated).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    const cleared = {
      makeId: '',
      modelId: '',
      year: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'date',
      sortOrder: 'desc',
    }
    setFilters(cleared)
    setLocalMinPrice('')
    setLocalMaxPrice('')
    onFiltersChange?.(cleared)
    router.push('?', { scroll: false })
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value && value !== 'date' && value !== 'desc'
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </CardTitle>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="space-y-2">
            <Label htmlFor="make">Make</Label>
            <Select value={filters.makeId} onValueChange={(value) => updateFilters({ makeId: value === '__all__' ? '' : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select make" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Makes</SelectItem>
                {makes.map((make) => (
                  <SelectItem key={make.id} value={make.id}>
                    {make.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select 
              value={filters.modelId} 
              onValueChange={(value) => updateFilters({ modelId: value === '__all__' ? '' : value })}
              disabled={!filters.makeId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Models</SelectItem>
                {filteredModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Select value={filters.year} onValueChange={(value) => updateFilters({ year: value === '__all__' ? '' : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {locations.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="location">State</Label>
              <Select value={filters.location} onValueChange={(value) => updateFilters({ location: value === '__all__' ? '' : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All States</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="minPrice">Min Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                id="minPrice"
                type="text"
                inputMode="numeric"
                placeholder="Min"
                className="pl-7"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={handlePriceKeyDown}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxPrice">Max Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                id="maxPrice"
                type="text"
                inputMode="numeric"
                placeholder="Max"
                className="pl-7"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={handlePriceKeyDown}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortBy">Sort By</Label>
            <Select value={`${filters.sortBy}-${filters.sortOrder}`} onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split('-')
              updateFilters({ sortBy, sortOrder })
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="savings-desc">Best Savings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {(localMinPrice || localMaxPrice) && (
          localMinPrice !== filters.minPrice || localMaxPrice !== filters.maxPrice
        ) && (
          <Button onClick={applyPriceFilters} className="mt-4">
            <Search className="h-4 w-4 mr-2" />
            Apply Price Filter
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
