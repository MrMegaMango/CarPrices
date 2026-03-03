'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { DollarSign, Car, MapPin, BarChart3 } from 'lucide-react'

interface StatData {
  totalDeals: number
  avgPrice: number
  uniqueMakes: number
  uniqueLocations: number
  topMakes: Array<{ name: string; count: number }>
  priceByMake: Array<{ name: string; avgPrice: number; minPrice: number; maxPrice: number; count: number }>
  avgPriceByYear: Array<{ year: number; avgPrice: number }>
  dealsByMonth: Array<{ month: string; count: number }>
  topModels: Array<{ vehicle: string; count: number; avgPrice: number }>
  quickFacts: {
    topLocation: string
    topYear: number
    latestDeal: string
    minYear: number
    maxYear: number
    uniqueModels: number
  }
  recentDeals: Array<{
    year: number
    make: string
    model: string
    sellingPrice: number
    dealerLocation: string
    dealDate: string
  }>
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<StatData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/statistics')
        if (!res.ok) throw new Error('Failed to fetch statistics')
        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching statistics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const mostReportedMake = stats.topMakes.length > 0 ? stats.topMakes[0].name : 'N/A'
  const minPrice = stats.recentDeals.length > 0
    ? Math.min(...stats.priceByMake.map(m => m.minPrice))
    : 0
  const maxPrice = stats.recentDeals.length > 0
    ? Math.max(...stats.priceByMake.map(m => m.maxPrice))
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Market Statistics
          </h1>
          <p className="text-gray-600">
            Real-time insights from crowdsourced car deal data
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDeals.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Crowdsourced price reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.avgPrice)}</div>
              <p className="text-xs text-muted-foreground">Across all reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Car Makes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueMakes}</div>
              <p className="text-xs text-muted-foreground">Manufacturers tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueLocations}</div>
              <p className="text-xs text-muted-foreground">Dealer locations</p>
            </CardContent>
          </Card>
        </div>

        {/* Row 1: Deals by Make + Avg Price by Make */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Deals by Make</CardTitle>
              <CardDescription>Number of deals per manufacturer</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={Math.max(300, stats.topMakes.length * 36)}>
                <BarChart data={stats.topMakes} layout="vertical" margin={{ left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={55} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avg. Price by Make</CardTitle>
              <CardDescription>Average selling price (makes with 2+ deals)</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.priceByMake.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(300, stats.priceByMake.length * 36)}>
                  <BarChart data={stats.priceByMake} layout="vertical" margin={{ left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" width={55} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Avg Price']} />
                    <Bar dataKey="avgPrice" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">Need more data (2+ deals per make)</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Deals Timeline + Top Models */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Deals Timeline</CardTitle>
              <CardDescription>Deals submitted by month</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.dealsByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.dealsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884D8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">No timeline data yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Models</CardTitle>
              <CardDescription>Top 10 make + model combos by deal count</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topModels.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(300, stats.topModels.length * 36)}>
                  <BarChart data={stats.topModels} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="vehicle" width={95} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'count') return [value, 'Deals']
                      return [formatCurrency(value as number), 'Avg Price']
                    }} />
                    <Bar dataKey="count" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">No model data yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Avg Price by Year + Quick Facts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Average Price by Year</CardTitle>
              <CardDescription>Average selling price by model year</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.avgPriceByYear.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.avgPriceByYear}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Avg Price']} />
                    <Bar dataKey="avgPrice" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">No data yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Facts</CardTitle>
              <CardDescription>Computed from all deal reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Most reported make</span>
                <span className="font-semibold">{mostReportedMake}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Most popular model year</span>
                <span className="font-semibold">{stats.quickFacts.topYear || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Price range</span>
                <span className="font-semibold">
                  {stats.priceByMake.length > 0
                    ? `${formatCurrency(minPrice)} — ${formatCurrency(maxPrice)}`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Year range</span>
                <span className="font-semibold">
                  {stats.quickFacts.minYear && stats.quickFacts.maxYear
                    ? `${stats.quickFacts.minYear} — ${stats.quickFacts.maxYear}`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Models tracked</span>
                <span className="font-semibold">{stats.quickFacts.uniqueModels}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Most recent report</span>
                <span className="font-semibold">
                  {stats.quickFacts.latestDeal !== 'N/A'
                    ? new Date(stats.quickFacts.latestDeal).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>5 most recently submitted deals</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentDeals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium text-muted-foreground">Vehicle</th>
                      <th className="pb-2 font-medium text-muted-foreground">Price</th>
                      <th className="pb-2 font-medium text-muted-foreground">Location</th>
                      <th className="pb-2 font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentDeals.map((deal, i) => (
                      <tr key={i} className="border-b last:border-b-0">
                        <td className="py-2">{deal.year} {deal.make} {deal.model}</td>
                        <td className="py-2">{formatCurrency(deal.sellingPrice)}</td>
                        <td className="py-2">{deal.dealerLocation}</td>
                        <td className="py-2">
                          {deal.dealDate !== 'N/A'
                            ? new Date(deal.dealDate).toLocaleDateString()
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No deals yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
