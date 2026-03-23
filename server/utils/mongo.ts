import { MongoClient } from 'mongodb'

let client: MongoClient | null = null

export async function getMongo(): Promise<MongoClient> {
  if (client) return client
  const uri = process.env.MONGODB_URI || 'mongodb://root:root@187.77.168.42:27018/'
  client = new MongoClient(uri)
  await client.connect()
  return client
}

export const SCRAPERS: Record<string, {
  name: string; site: string; country: string; flag: string
  currency: string; db: string; container: string; type: string
}> = {
  centris: {
    name: 'Centris', site: 'centris.ca', country: 'CA', flag: '🇨🇦',
    currency: 'CAD', db: 'centris', container: 'scraper-centris', type: 'html',
  },
  bienici: {
    name: "Bien'ici", site: 'bienici.com', country: 'FR', flag: '🇫🇷',
    currency: 'EUR', db: 'bienici', container: 'scraper-bienici', type: 'api',
  },
  mubawab: {
    name: 'Mubawab', site: 'mubawab.tn', country: 'TN', flag: '🇹🇳',
    currency: 'TND', db: 'mubawab', container: 'scraper-mubawab', type: 'html',
  },
  propertyfinder: {
    name: 'PropertyFinder', site: 'propertyfinder.eg', country: 'EG', flag: '🇪🇬',
    currency: 'EGP', db: 'propertyfinder', container: 'scraper-propertyfinder', type: 'playwright',
  },
}

export const COUNTRIES: Record<string, { name: string; flag: string }> = {
  CA: { name: 'Canada',  flag: '🇨🇦' },
  FR: { name: 'France',  flag: '🇫🇷' },
  TN: { name: 'Tunisie', flag: '🇹🇳' },
  EG: { name: 'Égypte',  flag: '🇪🇬' },
}
