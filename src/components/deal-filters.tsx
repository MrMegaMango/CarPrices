'use client'

import { useState, useEffect } from 'react'
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
import { Filter, X } from 'lucide-react'
import { CarMake, CarModel } from '@prisma/client'

interface DealFiltersProps {
  makes: CarMake[]
  models: CarModel[]
  onFiltersChange?: (filters: any) => void
}

export function DealFilters({ makes, models, onFiltersChange }: DealFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState({
    makeId: searchParams.get('makeId') || '',
    modelId: searchParams.get('modelId') || '',
    year: searchParams.get('year') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'date',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  })

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
      minPrice: '',
      maxPrice: '',
      sortBy: 'date',
      sortOrder: 'desc',
    }
    setFilters(cleared)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="make">Make</Label>
            <Select value={filters.makeId} onValueChange={(value) => updateFilters({ makeId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select make" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Makes</SelectItem>
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
              onValueChange={(value) => updateFilters({ modelId: value })}
              disabled={!filters.makeId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Models</SelectItem>
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
            <Select value={filters.year} onValueChange={(value) => updateFilters({ year: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minPrice">Min Price</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="$20,000"
              value={filters.minPrice}
              onChange={(e) => updateFilters({ minPrice: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxPrice">Max Price</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="$50,000"
              value={filters.maxPrice}
              onChange={(e) => updateFilters({ maxPrice: e.target.value })}
            />
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
      </CardContent>
    </Card>
  )
}
