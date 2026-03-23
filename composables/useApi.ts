import type { StatsResponse } from '~/types'

export const useApi = () => {
  // Uses Nuxt built-in server routes — no external backend needed in dev
  const getStats = () =>
    useFetch<StatsResponse>('/api/stats', { server: false })

  const action = (key: string, act: 'start' | 'stop' | 'restart') =>
    $fetch(`/api/scrapers/${key}/${act}`, { method: 'POST' })

  const getLogs = (key: string): Promise<{ logs: string }> =>
    $fetch(`/api/scrapers/${key}/logs`)

  return { getStats, action, getLogs }
}
