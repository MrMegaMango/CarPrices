export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/navigation'
import { Car, TrendingDown, Users, Search, ArrowRight, PlusCircle } from 'lucide-react'
import { TipButton } from '@/components/tip-button'
import { sql } from '@/lib/db'

async function getStatistics() {
  try {
    // Get total deals count
    const totalDealsResult = await sql`
      select count(*)::int as count
      from car_deals
      where "isPublic" = true
    ` as Array<{ count: number }>
    const totalDeals = totalDealsResult[0]?.count ?? 0

    // Get total savings
    const totalSavingsResult = await sql`
      select coalesce(sum(msrp - "sellingPrice"), 0)::bigint as total
      from car_deals
      where "isPublic" = true and msrp > "sellingPrice"
    ` as Array<{ total: string }>
    const totalSavings = parseInt(totalSavingsResult[0]?.total ?? '0') / 100

    // Get count of unique makes
    const uniqueMakesResult = await sql`
      select count(distinct "makeId")::int as count
      from car_deals
      where "isPublic" = true
    ` as Array<{ count: number }>
    const uniqueMakes = uniqueMakesResult[0]?.count ?? 0

    // Get count of unique states
    const uniqueStatesResult = await sql`
      select count(distinct "dealerLocation")::int as count
      from car_deals
      where "isPublic" = true and "dealerLocation" is not null
    ` as Array<{ count: number }>
    const uniqueStates = uniqueStatesResult[0]?.count ?? 0

    return {
      totalDeals,
      totalSavings: Math.round(totalSavings),
      uniqueMakes,
      uniqueStates,
    }
  } catch (error) {
    console.error('Error loading statistics:', error)
    return {
      totalDeals: 0,
      totalSavings: 0,
      uniqueMakes: 0,
      uniqueStates: 0,
    }
  }
}

export default async function Home() {
  const stats = await getStatistics()
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Real Car Price Reports from
            <span className="text-blue-600 whitespace-nowrap"> Real Buyers</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover what people actually paid for their new cars. Compare MSRP, selling prices, 
            and out-the-door costs to make informed decisions on your next vehicle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-14 text-lg px-10 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none">
              <Link href="/deals">
                <Search className="size-5" />
                Browse Reports
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button asChild size="lg" className="h-14 text-lg px-10 font-semibold bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none">
              <Link href="/deals/new">
                <PlusCircle className="size-5" />
                Share Your Report
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How CarDeals Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get price transparency from real car buyers to make informed purchasing decisions
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Search & Filter</CardTitle>
              <CardDescription>
                Find price reports by make, model, year, price range, and location
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingDown className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Compare Prices</CardTitle>
              <CardDescription>
                See MSRP vs actual selling prices and identify the best savings
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Share Your Report</CardTitle>
              <CardDescription>
                Help others by sharing your car buying experience and pricing data
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Car Buyers
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.totalDeals > 0 ? stats.totalDeals.toLocaleString() : '0'}
              </div>
              <div className="text-gray-600">Price Reports Shared</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.totalSavings > 0 ? `$${(stats.totalSavings / 1000000).toFixed(1)}M` : '$0'}
              </div>
              <div className="text-gray-600">Total Savings Tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.uniqueMakes > 0 ? `${stats.uniqueMakes}+` : '0'}
              </div>
              <div className="text-gray-600">Car Makes & Models</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {stats.uniqueStates > 0 ? stats.uniqueStates : '0'}
              </div>
              <div className="text-gray-600">States Covered</div>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Car className="h-6 w-6 text-blue-400" />
              <span className="font-bold text-xl">CarDeals</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
              <TipButton />
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 Zuo. Made with ❤️ for car buyers.
          </div>
        </div>
      </footer>
    </div>
  )
}
