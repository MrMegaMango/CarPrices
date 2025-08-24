'use client'

import { useState, useEffect, useCallback } from 'react'
import { Navigation } from '@/components/navigation'
import { DealFilters } from '@/components/deal-filters'
import { DealCard } from '@/components/deal-card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { CarDealWithRelations } from '@/types'
import { CarMake, CarModel } from '@prisma/client'

interface DealsResponse {
  deals: CarDealWithRelations[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function DealsPage() {
  const [deals, setDeals] = useState<CarDealWithRelations[]>([])
  const [makes, setMakes] = useState<CarMake[]>([])
  const [models, setModels] = useState<CarModel[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })
  const [filters, setFilters] = useState({})

  const fetchMakes = async () => {
    try {
      const response = await fetch('/api/makes')
      const data = await response.json()
      setMakes(data)
    } catch (error) {
      console.error('Error fetching makes:', error)
    }
  }

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      const data = await response.json()
      setModels(data)
    } catch (error) {
      console.error('Error fetching models:', error)
    }
  }

  const fetchDeals = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPagination(prev => ({ ...prev, page: 1 }))
      } else {
        setLoadingMore(true)
      }

      const params = new URLSearchParams({
        page: reset ? '1' : pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters,
      })

      const response = await fetch(`/api/deals?${params}`)
      const data: DealsResponse = await response.json()

      if (reset) {
        setDeals(data.deals)
      } else {
        setDeals(prev => [...prev, ...data.deals])
      }
      
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching deals:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [pagination.page, pagination.limit, filters])

  useEffect(() => {
    fetchMakes()
    fetchModels()
    fetchDeals()
  }, [fetchDeals])

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      fetchDeals(true)
    }
  }, [filters, fetchDeals])

  const loadMore = () => {
    if (pagination.page < pagination.pages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
      fetchDeals()
    }
  }

  const handleFiltersChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters)
  }

  if (loading && deals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Car Deals
          </h1>
          <p className="text-gray-600">
            Browse real car deal prices shared by buyers like you
          </p>
        </div>

        <div className="space-y-6">
          <DealFilters 
            makes={makes} 
            models={models} 
            onFiltersChange={handleFiltersChange}
          />

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {pagination.total} deals found
            </p>
          </div>

          {deals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No deals found matching your criteria.</p>
              <Button onClick={() => setFilters({})}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {deals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>

              {pagination.page < pagination.pages && (
                <div className="text-center pt-8">
                  <Button 
                    onClick={loadMore} 
                    disabled={loadingMore}
                    variant="outline"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
