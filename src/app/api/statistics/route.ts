import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    // Total public deals
    const totalDealsResult = await sql`
      select count(*)::int as count
      from car_deals
      where "isPublic" = true
    ` as Array<{ count: number }>
    const totalDeals = totalDealsResult[0]?.count ?? 0

    // Average selling price (cents → dollars)
    const avgPriceResult = await sql`
      select coalesce(avg("sellingPrice"), 0)::numeric as avg
      from car_deals
      where "isPublic" = true
    ` as Array<{ avg: string }>
    const avgPrice = Math.round(parseFloat(avgPriceResult[0]?.avg ?? '0') / 100)

    // Unique makes
    const uniqueMakesResult = await sql`
      select count(distinct "makeId")::int as count
      from car_deals
      where "isPublic" = true
    ` as Array<{ count: number }>
    const uniqueMakes = uniqueMakesResult[0]?.count ?? 0

    // Unique locations
    const uniqueLocationsResult = await sql`
      select count(distinct "dealerLocation")::int as count
      from car_deals
      where "isPublic" = true and "dealerLocation" is not null
    ` as Array<{ count: number }>
    const uniqueLocations = uniqueLocationsResult[0]?.count ?? 0

    // All makes by deal count (no limit)
    const topMakes = await sql`
      select
        m.name,
        count(*)::int as count
      from car_deals d
      join car_makes m on m.id = d."makeId"
      where d."isPublic" = true
      group by m.name
      order by count desc
    ` as Array<{ name: string; count: number }>

    // Average price by make (only makes with 2+ deals)
    const priceByMakeResult = await sql`
      select
        m.name,
        avg(d."sellingPrice")::numeric as "avgPrice",
        min(d."sellingPrice")::bigint as "minPrice",
        max(d."sellingPrice")::bigint as "maxPrice",
        count(*)::int as count
      from car_deals d
      join car_makes m on m.id = d."makeId"
      where d."isPublic" = true
      group by m.name
      having count(*) >= 2
      order by avg(d."sellingPrice") desc
    ` as Array<{ name: string; avgPrice: string; minPrice: string; maxPrice: string; count: number }>

    const priceByMake = priceByMakeResult.map(row => ({
      name: row.name,
      avgPrice: Math.round(parseFloat(row.avgPrice) / 100),
      minPrice: Math.round(parseInt(row.minPrice) / 100),
      maxPrice: Math.round(parseInt(row.maxPrice) / 100),
      count: row.count,
    }))

    // Average price by year
    const avgPriceByYearResult = await sql`
      select
        year,
        avg("sellingPrice")::numeric as "avgPrice"
      from car_deals
      where "isPublic" = true
      group by year
      order by year asc
    ` as Array<{ year: number; avgPrice: string }>

    const avgPriceByYear = avgPriceByYearResult.map(row => ({
      year: row.year,
      avgPrice: Math.round(parseFloat(row.avgPrice) / 100),
    }))

    // Deals by month (from dealDate)
    const dealsByMonth = await sql`
      select
        to_char("dealDate", 'YYYY-MM') as month,
        count(*)::int as count
      from car_deals
      where "isPublic" = true and "dealDate" is not null
      group by month
      order by month asc
    ` as Array<{ month: string; count: number }>

    // Top 10 make+model combos
    const topModelsResult = await sql`
      select
        m.name || ' ' || mo.name as vehicle,
        count(*)::int as count,
        avg(d."sellingPrice")::numeric as "avgPrice"
      from car_deals d
      join car_makes m on m.id = d."makeId"
      join car_models mo on mo.id = d."modelId"
      where d."isPublic" = true
      group by m.name, mo.name
      order by count desc
      limit 10
    ` as Array<{ vehicle: string; count: number; avgPrice: string }>

    const topModels = topModelsResult.map(row => ({
      vehicle: row.vehicle,
      count: row.count,
      avgPrice: Math.round(parseFloat(row.avgPrice) / 100),
    }))

    // Quick facts
    const quickFactsResult = await sql`
      select
        (select "dealerLocation" from car_deals where "isPublic" = true and "dealerLocation" is not null
         group by "dealerLocation" order by count(*) desc limit 1) as "topLocation",
        (select year from car_deals where "isPublic" = true
         group by year order by count(*) desc limit 1) as "topYear",
        (select max("dealDate")::text from car_deals where "isPublic" = true) as "latestDeal",
        (select min(year) from car_deals where "isPublic" = true) as "minYear",
        (select max(year) from car_deals where "isPublic" = true) as "maxYear",
        (select count(distinct "modelId")::int from car_deals where "isPublic" = true) as "uniqueModels"
    ` as Array<{
      topLocation: string | null
      topYear: number | null
      latestDeal: string | null
      minYear: number | null
      maxYear: number | null
      uniqueModels: number
    }>

    const qf = quickFactsResult[0]
    const quickFacts = {
      topLocation: qf?.topLocation ?? 'N/A',
      topYear: qf?.topYear ?? 0,
      latestDeal: qf?.latestDeal ?? 'N/A',
      minYear: qf?.minYear ?? 0,
      maxYear: qf?.maxYear ?? 0,
      uniqueModels: qf?.uniqueModels ?? 0,
    }

    // 5 most recent deals
    const recentDealsResult = await sql`
      select
        d.year,
        m.name as make,
        mo.name as model,
        d."sellingPrice",
        d."dealerLocation",
        d."dealDate"::text as "dealDate"
      from car_deals d
      join car_makes m on m.id = d."makeId"
      join car_models mo on mo.id = d."modelId"
      where d."isPublic" = true
      order by d."createdAt" desc
      limit 5
    ` as Array<{
      year: number
      make: string
      model: string
      sellingPrice: number
      dealerLocation: string | null
      dealDate: string | null
    }>

    const recentDeals = recentDealsResult.map(row => ({
      year: row.year,
      make: row.make,
      model: row.model,
      sellingPrice: Math.round(row.sellingPrice / 100),
      dealerLocation: row.dealerLocation ?? 'N/A',
      dealDate: row.dealDate ?? 'N/A',
    }))

    return NextResponse.json({
      totalDeals,
      avgPrice,
      uniqueMakes,
      uniqueLocations,
      topMakes,
      priceByMake,
      avgPriceByYear,
      dealsByMonth,
      topModels,
      quickFacts,
      recentDeals,
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
