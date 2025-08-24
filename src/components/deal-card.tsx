'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, MapPin, TrendingDown, DollarSign } from 'lucide-react'
import { CarDealWithRelations } from '@/types'
import { formatDistance } from 'date-fns'

interface DealCardProps {
  deal: CarDealWithRelations
}

export function DealCard({ deal }: DealCardProps) {
  const savings = deal.msrp - deal.sellingPrice
  const savingsPercentage = ((savings / deal.msrp) * 100).toFixed(1)
  
  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceInCents / 100)
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">
              {deal.year} {deal.make.name} {deal.model.name}
            </h3>
            {deal.trim && (
              <p className="text-sm text-muted-foreground">{deal.trim}</p>
            )}
          </div>
          {savings > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <TrendingDown className="h-3 w-3 mr-1" />
              {savingsPercentage}% off
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">MSRP</p>
            <p className="font-semibold text-lg">{formatPrice(deal.msrp)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Selling Price</p>
            <p className="font-semibold text-lg text-blue-600">
              {formatPrice(deal.sellingPrice)}
            </p>
          </div>
          {deal.otdPrice && (
            <>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">OTD Price</p>
                <p className="font-semibold">{formatPrice(deal.otdPrice)}</p>
              </div>
            </>
          )}
          {savings > 0 && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Savings</p>
              <p className="font-semibold text-green-600">
                {formatPrice(savings)}
              </p>
            </div>
          )}
        </div>

        {deal.isLeased && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-1 mb-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Lease Deal</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {deal.monthlyPayment && (
                <div>
                  <span className="text-muted-foreground">Monthly: </span>
                  <span className="font-medium">{formatPrice(deal.monthlyPayment)}</span>
                </div>
              )}
              {deal.leaseTermMonths && (
                <div>
                  <span className="text-muted-foreground">Term: </span>
                  <span className="font-medium">{deal.leaseTermMonths} months</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <CalendarDays className="h-4 w-4" />
            <span>{formatDistance(new Date(deal.dealDate), new Date(), { addSuffix: true })}</span>
          </div>
          {deal.dealerLocation && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{deal.dealerLocation}</span>
            </div>
          )}
        </div>

        {deal.dealerName && (
          <div className="text-sm">
            <span className="text-muted-foreground">Dealer: </span>
            <span className="font-medium">{deal.dealerName}</span>
          </div>
        )}

        {deal.notes && (
          <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
            {deal.notes}
          </div>
        )}

        {deal.verified && (
          <Badge variant="outline" className="w-fit">
            ✓ Verified
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
