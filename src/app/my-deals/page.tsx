'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Navigation } from '@/components/navigation'
import { DealCard } from '@/components/deal-card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { CarDealWithRelations } from '@/types'

type DealsResponse = {
  deals: CarDealWithRelations[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function MyDealsPage() {
  const { data: session, status } = useSession()
  const [deals, setDeals] = useState<CarDealWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, pages: 1, total: 0 })

  const fetchDeals = useCallback(async (reset = false) => {
    try {
      setError(null)
      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const params = new URLSearchParams({
        page: reset ? '1' : String(pagination.page),
        limit: String(pagination.limit),
      })

      const res = await fetch(`/api/my-deals?${params.toString()}`)
      if (!res.ok) {
        throw new Error('Failed to load your deals')
      }
      const data: DealsResponse = await res.json()

      if (reset) {
        setDeals(data.deals)
      } else {
        setDeals(prev => [...prev, ...data.deals])
      }
      setPagination(prev => ({ ...prev, ...data.pagination }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [pagination.page, pagination.limit])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDeals(true)
    }
  }, [status, fetchDeals])

  const loadMore = () => {
    if (pagination.page < pagination.pages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
      fetchDeals()
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-semibold mb-4">Your Deals</h1>
          <p className="text-gray-600 mb-6">Sign in to see and manage your submitted price reports.</p>
          <Button onClick={() => signIn()}>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">My Deals</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading && deals.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center text-gray-600 py-16">
            <p className="mb-4">You haven&apos;t shared any deals yet.</p>
            <Button asChild>
              <Link href="/deals/new">Share Your First Report</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map(deal => (
              <div key={deal.id} className="space-y-2">
                <DealCard deal={deal} />
                <div className="flex justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/deals/${deal.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500"
                    onClick={async () => {
                      if (!confirm('Delete this deal? This cannot be undone.')) return
                      const res = await fetch(`/api/deals/${deal.id}`, { method: 'DELETE' })
                      if (res.ok) {
                        setDeals(prev => prev.filter(d => d.id !== deal.id))
                      } else {
                        const body = await res.json().catch(() => ({}))
                        alert(body.error || 'Failed to delete deal')
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {deals.length > 0 && pagination.page < pagination.pages && (
          <div className="flex justify-center mt-8">
            <Button onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? (
                <span className="inline-flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading...</span>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}


