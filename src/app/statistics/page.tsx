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
  PieChart,
  Pie,
  Cell 
} from 'recharts'
import { TrendingDown, DollarSign, Car, Users } from 'lucide-react'

interface StatData {
  totalDeals: number
  totalSavings: number
  avgSavings: number
  topMakes: Array<{ name: string; count: number }>
  avgPriceByYear: Array<{ year: number; avgPrice: number }>
  savingsDistribution: Array<{ range: string; count: number }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function StatisticsPage() {
  const [stats, setStats] = useState<StatData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from /api/statistics
    // For now, we'll use mock data
    setTimeout(() => {
      setStats({
        totalDeals: 1247,
        totalSavings: 2847592,
        avgSavings: 2284,
        topMakes: [
          { name: 'Toyota', count: 234 },
          { name: 'Honda', count: 198 },
          { name: 'Ford', count: 156 },
          { name: 'Chevrolet', count: 143 },
          { name: 'Nissan', count: 127 },
        ],
        avgPriceByYear: [
          { year: 2024, avgPrice: 42500 },
          { year: 2023, avgPrice: 39800 },
          { year: 2022, avgPrice: 37200 },
          { year: 2021, avgPrice: 35600 },
          { year: 2020, avgPrice: 33900 },
        ],
        savingsDistribution: [
          { range: '$0-$1,000', count: 156 },
          { range: '$1,000-$3,000', count: 298 },
          { range: '$3,000-$5,000', count: 234 },
          { range: '$5,000-$10,000', count: 187 },
          { range: '$10,000+', count: 89 },
        ]
      })
      setLoading(false)
    }, 1000)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

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

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalDeals.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalSavings)}
              </div>
              <p className="text-xs text-muted-foreground">
                Tracked by our community
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Savings</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.avgSavings)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per deal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">
                Contributors
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Top Makes */}
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Makes</CardTitle>
              <CardDescription>
                Number of deals by car manufacturer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topMakes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Price by Year */}
          <Card>
            <CardHeader>
              <CardTitle>Average Price by Year</CardTitle>
              <CardDescription>
                Average selling price trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.avgPriceByYear}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => [formatCurrency(value as number), 'Avg Price']} />
                  <Bar dataKey="avgPrice" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Savings Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Savings Distribution</CardTitle>
              <CardDescription>
                How much buyers are saving
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.savingsDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, percent }) => `${range} (${((percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.savingsDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Best negotiation month</span>
                <span className="font-semibold">December</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Highest avg savings</span>
                <span className="font-semibold">Luxury SUVs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Most active region</span>
                <span className="font-semibold">California</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Peak deal season</span>
                <span className="font-semibold">Q4 2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg time to negotiate</span>
                <span className="font-semibold">3.2 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Best financing rate</span>
                <span className="font-semibold">2.9% APR</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>💡 Smart Buying Tips</CardTitle>
            <CardDescription>
              Based on our community data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">Best Times to Buy</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• End of calendar year (Dec)</li>
                  <li>• End of model year</li>
                  <li>• End of quarter/month</li>
                  <li>• During new model releases</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600">Negotiation Tactics</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Research multiple dealers</li>
                  <li>• Get pre-approved financing</li>
                  <li>• Focus on total price, not monthly payment</li>
                  <li>• Be ready to walk away</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-600">Money-Saving Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Consider certified pre-owned</li>
                  <li>• Look for manufacturer incentives</li>
                  <li>• Compare lease vs buy</li>
                  <li>• Factor in total cost of ownership</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
