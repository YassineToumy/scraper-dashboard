import { SCRAPERS } from '../../../utils/mongo'
import { execSync } from 'child_process'

export default defineEventHandler((event) => {
  const key = getRouterParam(event, 'key')!
  const cfg = SCRAPERS[key]
  if (!cfg) throw createError({ statusCode: 404, message: `Scraper '${key}' not found` })

  try {
    const logs = execSync(`docker logs --tail=300 --timestamps ${cfg.container}`, {
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return { logs: logs.toString() }
  } catch (e: any) {
    // docker logs writes to stderr — catch it
    const out = e?.stderr?.toString() || e?.stdout?.toString() || e?.message || ''
    return { logs: out || 'No logs available.' }
  }
})
