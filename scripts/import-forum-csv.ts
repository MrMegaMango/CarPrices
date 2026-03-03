/**
 * Import forum car price data from CSV into the CarPrices database.
 *
 * Usage:
 *   DATABASE_URL="postgres://..." npx tsx scripts/import-forum-csv.ts <path-to-csv>
 */

import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required.')
  process.exit(1)
}

const csvPath = process.argv[2]
if (!csvPath) {
  console.error('ERROR: CSV file path argument is required.')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

// ---------------------------------------------------------------------------
// Lookup maps – populated from the live database
// ---------------------------------------------------------------------------
const makeIdByName: Record<string, string> = {}
const modelIdByMakeAndName: Record<string, Record<string, string>> = {}

async function loadLookups() {
  const makes = await sql`SELECT id, name FROM car_makes` as Array<{ id: string; name: string }>
  for (const m of makes) {
    makeIdByName[m.name] = m.id
    modelIdByMakeAndName[m.name] = {}
  }

  const models = await sql`
    SELECT mo.id, mo.name, ma.name as "makeName"
    FROM car_models mo
    JOIN car_makes ma ON ma.id = mo."makeId"
  ` as Array<{ id: string; name: string; makeName: string }>
  for (const m of models) {
    if (!modelIdByMakeAndName[m.makeName]) modelIdByMakeAndName[m.makeName] = {}
    modelIdByMakeAndName[m.makeName][m.name] = m.id
  }

  console.log(`Loaded ${makes.length} makes and ${models.length} models from database.`)
}

// ---------------------------------------------------------------------------
// CSV model name → (DB model name, extra trim prefix)
// ---------------------------------------------------------------------------
function resolveModel(
  make: string,
  csvModel: string,
  csvTrim: string
): { modelName: string; trim: string } {
  // Honda "Civic Type R" → model "Civic", trim "Type R <csvTrim>"
  if (make === 'Honda' && csvModel === 'Civic Type R') {
    const trim = csvTrim ? `Type R ${csvTrim}` : 'Type R'
    return { modelName: 'Civic', trim }
  }
  return { modelName: csvModel, trim: csvTrim }
}

// ---------------------------------------------------------------------------
// Parse the CSV (simple parser, no external deps)
// ---------------------------------------------------------------------------
function parseCSV(raw: string): Record<string, string>[] {
  const lines = raw.trim().split('\n')
  const headers = lines[0].split(',')
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const values: string[] = []
    let current = ''
    let inQuotes = false
    for (const ch of line) {
      if (ch === '"') {
        inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        values.push(current)
        current = ''
      } else {
        current += ch
      }
    }
    values.push(current)

    const row: Record<string, string> = {}
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (values[j] ?? '').trim()
    }
    rows.push(row)
  }
  return rows
}

// ---------------------------------------------------------------------------
// Price mapping logic
// ---------------------------------------------------------------------------
function mapPrices(row: Record<string, string>): {
  msrpCents: number
  sellingPriceCents: number
  otdPriceCents: number | null
  rebatesCents: number | null
} {
  const priceValue = parseFloat(row.price_value) || 0
  const msrpValue = parseFloat(row.msrp_value) || 0
  const discountValue = parseFloat(row.discount_value) || 0
  const priceType = row.price_type || ''

  const isOTD = /otd|out.the.door/i.test(priceType)

  let msrp: number
  let sellingPrice: number
  let otdPrice: number | null = null
  let rebates: number | null = null

  if (msrpValue > 0) {
    msrp = msrpValue
    if (discountValue > 0) {
      sellingPrice = msrpValue - discountValue
      rebates = discountValue
    } else {
      sellingPrice = msrpValue
    }
  } else {
    msrp = priceValue
    sellingPrice = priceValue
  }

  if (isOTD) {
    otdPrice = priceValue
  }

  if (priceType === 'selling_price_pre_rebate') {
    sellingPrice = priceValue
  }

  if (!msrpValue && /approx/i.test(priceType)) {
    sellingPrice = priceValue
    if (/otd/i.test(priceType)) {
      otdPrice = priceValue
    }
  }

  return {
    msrpCents: Math.round(msrp * 100),
    sellingPriceCents: Math.round(sellingPrice * 100),
    otdPriceCents: otdPrice != null ? Math.round(otdPrice * 100) : null,
    rebatesCents: rebates != null ? Math.round(rebates * 100) : null,
  }
}

// ---------------------------------------------------------------------------
// Create missing make or model if needed
// ---------------------------------------------------------------------------
async function ensureMake(name: string): Promise<string> {
  if (makeIdByName[name]) return makeIdByName[name]

  const id = randomBytes(16).toString('hex')
  await sql`
    INSERT INTO car_makes (id, name, logo, "createdAt", "updatedAt")
    VALUES (${id}, ${name}, null, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (name) DO NOTHING
  `
  // Re-fetch in case ON CONFLICT hit
  const rows = await sql`SELECT id FROM car_makes WHERE name = ${name}` as Array<{ id: string }>
  const finalId = rows[0]?.id ?? id
  makeIdByName[name] = finalId
  modelIdByMakeAndName[name] = modelIdByMakeAndName[name] || {}
  console.log(`  Created make: ${name} (${finalId})`)
  return finalId
}

async function ensureModel(makeName: string, makeId: string, modelName: string): Promise<string> {
  if (modelIdByMakeAndName[makeName]?.[modelName]) {
    return modelIdByMakeAndName[makeName][modelName]
  }

  const id = randomBytes(16).toString('hex')
  await sql`
    INSERT INTO car_models (id, name, "makeId", "createdAt", "updatedAt")
    VALUES (${id}, ${modelName}, ${makeId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `
  if (!modelIdByMakeAndName[makeName]) modelIdByMakeAndName[makeName] = {}
  modelIdByMakeAndName[makeName][modelName] = id
  console.log(`  Created model: ${makeName} ${modelName} (${id})`)
  return id
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const raw = readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(raw)
  console.log(`Parsed ${rows.length} rows from CSV.`)

  // Load existing makes and models from the live database
  await loadLookups()

  // Ensure the guest user exists
  await sql`
    INSERT INTO users (id, email, name, image, "updatedAt")
    VALUES ('guest', 'guest@anon.local', 'Guest', null, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO UPDATE SET "updatedAt" = CURRENT_TIMESTAMP
  `
  console.log('Ensured guest user exists.')

  // Ensure extra columns exist
  await sql`ALTER TABLE car_deals ADD COLUMN IF NOT EXISTS "exteriorColor" text`
  await sql`ALTER TABLE car_deals ADD COLUMN IF NOT EXISTS "interiorColor" text`
  await sql`ALTER TABLE car_deals ADD COLUMN IF NOT EXISTS "guestId" text`
  await sql`ALTER TABLE car_deals ADD COLUMN IF NOT EXISTS "guestIpHash" text`

  let imported = 0
  let skipped = 0

  for (const row of rows) {
    const makeName = row.make
    const makeId = await ensureMake(makeName)

    const resolved = resolveModel(makeName, row.model, row.trim)
    const modelId = await ensureModel(makeName, makeId, resolved.modelName)

    const prices = mapPrices(row)
    const dealId = `forum_${row.id}`
    const dealDate = new Date(row.date_posted)
    const location = [row.location, row.state_or_region].filter(Boolean).join(', ') || null

    const noteParts: string[] = []
    if (row.notes) noteParts.push(row.notes)
    if (row.source_site) noteParts.push(`Source: ${row.source_site}`)
    if (row.source_url) noteParts.push(row.source_url)
    const notes = noteParts.join('\n') || null

    try {
      await sql`
        INSERT INTO car_deals (
          id, "userId", "makeId", "modelId", year, "trim", color,
          "exteriorColor", "interiorColor",
          msrp, "sellingPrice", "otdPrice", rebates,
          "tradeInValue", "dealerName", "dealerLocation", "dealDate",
          "financingRate", "financingTerm", "downPayment", "monthlyPayment",
          notes, "isLeased", "leaseTermMonths", "mileageAllowance",
          verified, "isPublic", "guestId", "guestIpHash",
          "createdAt", "updatedAt"
        ) VALUES (
          ${dealId}, 'guest', ${makeId}, ${modelId}, ${parseInt(row.vehicle_year)},
          ${resolved.trim || null}, ${null},
          ${null}, ${null},
          ${prices.msrpCents}, ${prices.sellingPriceCents},
          ${prices.otdPriceCents}, ${prices.rebatesCents},
          ${null}, ${null}, ${location}, ${dealDate},
          ${null}, ${null}, ${null}, ${null},
          ${notes}, ${false}, ${null}, ${null},
          ${false}, ${true}, ${'forum-import'}, ${null},
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        ON CONFLICT (id) DO NOTHING
      `
      imported++
      console.log(`  OK: ${row.vehicle_year} ${makeName} ${resolved.modelName} ${resolved.trim || ''} — $${row.price_value}`)
    } catch (err) {
      console.error(`  ERROR inserting row ${row.id}:`, err)
      skipped++
    }
  }

  console.log(`\nDone. Imported: ${imported}, Skipped: ${skipped}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
