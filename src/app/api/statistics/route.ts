import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    // Get total deals count
    const totalDealsResult = await sql`
      select count(*)::int as count
      from car_deals
      where "isPublic" = true
    ` as Array<{ count: number }>
    const totalDeals = totalDealsResult[0]?.count ?? 0

    // Get total savings (sum of msrp - sellingPrice where msrp > sellingPrice)
    const totalSavingsResult = await sql`
      select coalesce(sum(msrp - "sellingPrice"), 0)::bigint as total
      from car_deals
      where "isPublic" = true and msrp > "sellingPrice"
    ` as Array<{ total: string }>
    const totalSavings = parseInt(totalSavingsResult[0]?.total ?? '0') / 100 // Convert cents to dollars

    // Get average savings
    const avgSavingsResult = await sql`
      select coalesce(avg(msrp - "sellingPrice"), 0)::numeric as avg
      from car_deals
      where "isPublic" = true and msrp > "sellingPrice"
    ` as Array<{ avg: string }>
    const avgSavings = parseFloat(avgSavingsResult[0]?.avg ?? '0') / 100 // Convert cents to dollars

    // Get count of unique makes
    const uniqueMakesResult = await sql`
      select count(distinct "makeId")::int as count
      from car_deals
      where "isPublic" = true
    ` as Array<{ count: number }>
    const uniqueMakes = uniqueMakesResult[0]?.count ?? 0

    // Get count of unique states (extract from dealerLocation)
    const uniqueStatesResult = await sql`
      select count(distinct "dealerLocation")::int as count
      from car_deals
      where "isPublic" = true and "dealerLocation" is not null
    ` as Array<{ count: number }>
    const uniqueStates = uniqueStatesResult[0]?.count ?? 0

    // Get top 5 makes by count
    const topMakesResult = await sql`
      select
        m.name,
        count(*)::int as count
      from car_deals d
      join car_makes m on m.id = d."makeId"
      where d."isPublic" = true
      group by m.name
      order by count desc
      limit 5
    ` as Array<{ name: string; count: number }>

    // Get average price by year (last 5 years)
    const avgPriceByYearResult = await sql`
      select
        year,
        avg("sellingPrice")::numeric as "avgPrice"
      from car_deals
      where "isPublic" = true
      group by year
      order by year desc
      limit 5
    ` as Array<{ year: number; avgPrice: string }>

    const avgPriceByYear = avgPriceByYearResult.map(row => ({
      year: row.year,
      avgPrice: Math.round(parseFloat(row.avgPrice) / 100) // Convert cents to dollars
    }))

    // Get savings distribution
    const savingsDistributionResult = await sql`
      select
        case
          when (msrp - "sellingPrice") <= 100000 then '$0-$1,000'
          when (msrp - "sellingPrice") <= 300000 then '$1,000-$3,000'
          when (msrp - "sellingPrice") <= 500000 then '$3,000-$5,000'
          when (msrp - "sellingPrice") <= 1000000 then '$5,000-$10,000'
          else '$10,000+'
        end as range,
        count(*)::int as count
      from car_deals
      where "isPublic" = true and msrp > "sellingPrice"
      group by range
      order by
        case
          when (msrp - "sellingPrice") <= 100000 then 1
          when (msrp - "sellingPrice") <= 300000 then 2
          when (msrp - "sellingPrice") <= 500000 then 3
          when (msrp - "sellingPrice") <= 1000000 then 4
          else 5
        end
    ` as Array<{ range: string; count: number }>

    // Get active users count (users who have posted deals)
    const activeUsersResult = await sql`
      select count(distinct "userId")::int as count
      from car_deals
      where "isPublic" = true
    ` as Array<{ count: number }>
    const activeUsers = activeUsersResult[0]?.count ?? 0

    return NextResponse.json({
      totalDeals,
      totalSavings: Math.round(totalSavings),
      avgSavings: Math.round(avgSavings),
      uniqueMakes,
      uniqueStates,
      topMakes: topMakesResult,
      avgPriceByYear,
      savingsDistribution: savingsDistributionResult,
      activeUsers,
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
