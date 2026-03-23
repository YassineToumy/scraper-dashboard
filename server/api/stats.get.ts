import { getMongo, SCRAPERS, COUNTRIES } from '../utils/mongo'

export default defineEventHandler(async () => {
  const mongo = await getMongo()

  const scraperStats = await Promise.all(
    Object.entries(SCRAPERS).map(async ([key, cfg]) => {
      try {
        const db    = mongo.db(cfg.db)
        const raw   = db.collection('locations')
        const clean = db.collection('locations_clean')

        const [rawCount, cleanCount] = await Promise.all([
          raw.countDocuments({}),
          clean.countDocuments({}),
        ])

        // Last scraped
        const lastDoc = await raw.findOne({}, { sort: { scraped_at: -1 }, projection: { scraped_at: 1 } })
        const lastCleaned = await clean.findOne({}, { sort: { cleaned_at: -1 }, projection: { cleaned_at: 1 } })

        // Property type distribution
        const ptCursor = clean.aggregate([
          { $group: { _id: '$property_type', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ])
        const propertyTypes = await ptCursor.toArray()

        // Price stats
        const priceCursor = clean.aggregate([
          { $match: { price: { $gt: 0 } } },
          { $group: { _id: null, avg: { $avg: '$price' }, min: { $min: '$price' }, max: { $max: '$price' } } },
        ])
        const priceResult = await priceCursor.toArray()

        // Top cities
        const cityCursor = clean.aggregate([
          { $group: { _id: '$city', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ])
        const topCities = await cityCursor.toArray()

        const container = getContainerStatus(cfg.container)

        return {
          key, ...cfg,
          raw_count:       rawCount,
          clean_count:     cleanCount,
          rejected_count:  Math.max(0, rawCount - cleanCount),
          clean_ratio:     rawCount > 0 ? Math.round(cleanCount / rawCount * 1000) / 10 : 0,
          last_scraped_at: lastDoc?.scraped_at ?? null,
          last_cleaned_at: lastCleaned?.cleaned_at ?? null,
          property_types:  propertyTypes.map(p => ({ label: p._id ?? 'unknown', count: p.count })),
          price_stats:     priceResult[0] ? {
            avg: Math.round(priceResult[0].avg),
            min: priceResult[0].min,
            max: priceResult[0].max,
          } : null,
          top_cities: topCities.map(c => ({ label: c._id ?? '—', count: c.count })),
          container,
        }
      } catch (e: any) {
        return {
          key, ...cfg,
          raw_count: 0, clean_count: 0, rejected_count: 0, clean_ratio: 0,
          last_scraped_at: null, last_cleaned_at: null,
          property_types: [], price_stats: null, top_cities: [],
          container: { status: 'unknown' },
          mongo_error: e?.message ?? String(e),
        }
      }
    })
  )

  const totalRaw         = scraperStats.reduce((s, x) => s + x.raw_count, 0)
  const totalClean       = scraperStats.reduce((s, x) => s + x.clean_count, 0)
  const totalRejected    = scraperStats.reduce((s, x) => s + x.rejected_count, 0)
  const activeContainers = scraperStats.filter(x => x.container?.status === 'running').length
  const uniqueCountries  = new Set(scraperStats.map(x => x.country)).size

  const byCountry: Record<string, typeof scraperStats> = {}
  for (const s of scraperStats) {
    if (!byCountry[s.country]) byCountry[s.country] = []
    byCountry[s.country].push(s)
  }

  return {
    overview: {
      total_raw:         totalRaw,
      total_clean:       totalClean,
      total_rejected:    totalRejected,
      total_sites:       scraperStats.length,
      active_containers: activeContainers,
      countries:         uniqueCountries,
      countries_map:     COUNTRIES,
    },
    scrapers:   scraperStats,
    by_country: byCountry,
  }
})

// ── Docker container status via execSync ───────────────────────────────────
function getContainerStatus(name: string): { status: string; started_at?: string | null; exit_code?: number | null } {
  try {
    const { execSync } = require('child_process')
    const fmt = '{{.State.Status}}|{{.State.StartedAt}}|{{.State.ExitCode}}'
    const out = execSync(`docker inspect --format="${fmt}" ${name}`, { timeout: 3000 }).toString().trim()
    const [status, startedAt, exitCode] = out.split('|')
    return {
      status,
      started_at: startedAt !== '0001-01-01T00:00:00Z' ? startedAt : null,
      exit_code:  parseInt(exitCode) || 0,
    }
  } catch {
    return { status: 'not_found', started_at: null, exit_code: null }
  }
}
