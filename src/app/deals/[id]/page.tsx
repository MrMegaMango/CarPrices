'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { DealCard } from '@/components/deal-card'
import { CarDealWithRelations } from '@/types'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export default function DealDetailPage() {
  const params = useParams()
  const [deal, setDeal] = useState<CarDealWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const response = await fetch(`/api/deals/${params.id}`)
        if (!response.ok) {
          throw new Error('Deal not found')
        }
        const dealData = await response.json()
        setDeal(dealData)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load deal')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchDeal()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !deal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Deal Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The deal you&apos;re looking for doesn&apos;t exist or has been removed.'}
          </p>
          <Button asChild>
            <Link href="/deals">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse All Deals
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/deals">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to deals
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {deal.year} {deal.make.name} {deal.model.name}
          </h1>
          <p className="text-gray-600">
            Shared price report from our community
          </p>
        </div>
        
        <DealCard deal={deal} />
        
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Find this helpful? Check out more car price reports from our community!
          </p>
          <Button asChild>
            <Link href="/deals">Browse More Reports</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
