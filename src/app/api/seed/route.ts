import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const carData = [
  {
    make: 'Toyota',
    models: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Sienna', 'Tacoma', 'Tundra', 'Avalon', 'Venza']
  },
  {
    make: 'Honda',
    models: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Insight', 'Passport', 'Ridgeline', 'HR-V', 'Odyssey', 'Fit']
  },
  {
    make: 'Ford',
    models: ['F-150', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Expedition', 'Ranger', 'Bronco', 'Maverick', 'Transit']
  },
  {
    make: 'Chevrolet',
    models: ['Silverado', 'Equinox', 'Malibu', 'Tahoe', 'Suburban', 'Traverse', 'Camaro', 'Corvette', 'Colorado', 'Blazer']
  },
  {
    make: 'Nissan',
    models: ['Altima', 'Sentra', 'Rogue', 'Murano', 'Pathfinder', 'Frontier', 'Titan', 'Versa', 'Maxima', 'Armada']
  },
  {
    make: 'BMW',
    models: ['230i', '330i', '430i', '530i', '540i', 'M3', 'M4', 'M5', 'X3 xDrive30i', 'X5 xDrive40i', 'X7 xDrive40i', 'Z4 sDrive30i', 'i4 eDrive40', 'iX xDrive50']
  },
  {
    make: 'Mercedes-Benz',
    models: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS', 'A-Class', 'CLA', 'GLA', 'EQS']
  },
  {
    make: 'Audi',
    models: ['A4', 'A6', 'Q5', 'Q7', 'A3', 'Q3', 'A8', 'Q8', 'e-tron', 'A5']
  },
  {
    make: 'Lexus',
    models: ['ES', 'RX', 'NX', 'GX', 'LX', 'IS', 'LS', 'UX', 'LC', 'RC']
  },
  {
    make: 'Hyundai',
    models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Kona', 'Ioniq', 'Genesis', 'Accent', 'Venue']
  },
  {
    make: 'Kia',
    models: ['Forte', 'Optima', 'Sportage', 'Sorento', 'Telluride', 'Soul', 'Stinger', 'Rio', 'Niro', 'Carnival']
  },
  {
    make: 'Subaru',
    models: ['Outback', 'Forester', 'Crosstrek', 'Impreza', 'Legacy', 'Ascent', 'WRX', 'BRZ', 'Wilderness', 'Solterra']
  },
  {
    make: 'Mazda',
    models: ['Mazda3', 'Mazda6', 'CX-5', 'CX-9', 'CX-30', 'MX-5 Miata', 'CX-50', 'Mazda2', 'CX-3', 'RX-8']
  },
  {
    make: 'Volkswagen',
    models: ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf', 'Arteon', 'ID.4', 'Taos', 'Beetle', 'CC']
  },
  {
    make: 'Jeep',
    models: ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Grand Wagoneer', 'Wagoneer', 'Patriot', 'Liberty']
  },
  {
    make: 'Tesla',
    models: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', 'Roadster']
  },
  {
    make: 'Ram',
    models: ['1500', '2500', '3500', 'ProMaster', 'ProMaster City']
  },
  {
    make: 'GMC',
    models: ['Sierra', 'Terrain', 'Acadia', 'Yukon', 'Canyon', 'Savana', 'Hummer EV']
  },
  {
    make: 'Cadillac',
    models: ['Escalade', 'XT5', 'XT6', 'CT4', 'CT5', 'Lyriq', 'XT4', 'Celestiq']
  },
  {
    make: 'Infiniti',
    models: ['Q50', 'Q60', 'QX50', 'QX60', 'QX80', 'Q70', 'QX30', 'Q30']
  }
]

export async function POST() {
  try {
    console.log('Start seeding production database...')

    for (const { make, models } of carData) {
      const createdMake = await prisma.carMake.upsert({
        where: { name: make },
        update: {},
        create: { name: make },
      })

      for (const modelName of models) {
        await prisma.carModel.upsert({
          where: { 
            name_makeId: {
              name: modelName,
              makeId: createdMake.id
            }
          },
          update: {},
          create: {
            name: modelName,
            makeId: createdMake.id,
          },
        })
      }

      console.log(`Created make: ${make} with ${models.length} models`)
    }

    console.log('Seeding finished.')
    
    return NextResponse.json({ 
      message: 'Database seeded successfully',
      makes: carData.length,
      models: carData.reduce((total, make) => total + make.models.length, 0)
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: error },
      { status: 500 }
    )
  }
}
