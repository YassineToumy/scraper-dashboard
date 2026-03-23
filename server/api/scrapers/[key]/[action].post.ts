import { SCRAPERS } from '../../../utils/mongo'
import { execSync } from 'child_process'

export default defineEventHandler(async (event) => {
  const key    = getRouterParam(event, 'key')!
  const action = getRouterParam(event, 'action')!

  const cfg = SCRAPERS[key]
  if (!cfg) throw createError({ statusCode: 404, message: `Scraper '${key}' not found` })

  const allowed = ['start', 'stop', 'restart']
  if (!allowed.includes(action)) {
    throw createError({ statusCode: 400, message: `Unknown action '${action}'` })
  }

  try {
    let output = ''
    if (action === 'stop') {
      output = execSync(`docker stop ${cfg.container}`, { timeout: 15000 }).toString()
    } else if (action === 'restart') {
      output = execSync(`docker restart ${cfg.container}`, { timeout: 15000 }).toString()
    } else if (action === 'start') {
      output = execSync(`docker start ${cfg.container}`, { timeout: 15000 }).toString()
    }
    return { success: true, output: output.trim() }
  } catch (e: any) {
    return { success: false, output: e?.message ?? String(e) }
  }
})
