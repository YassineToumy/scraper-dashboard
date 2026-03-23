export interface ContainerStatus {
  status: 'running' | 'exited' | 'paused' | 'not_found' | string
  started_at: string | null
  finished_at: string | null
  exit_code: number | null
}

export interface PriceStats {
  avg: number
  min: number
  max: number
}

export interface ScraperStats {
  key: string
  name: string
  site: string
  country: string
  flag: string
  currency: string
  type: 'api' | 'html' | 'playwright'
  container: ContainerStatus
  raw_count: number
  clean_count: number
  rejected_count: number
  clean_ratio: number
  last_scraped_at: string | null
  last_cleaned_at: string | null
  property_types: Array<{ label: string; count: number }>
  price_stats: PriceStats | null
  top_cities: Array<{ label: string; count: number }>
  furnished_count: number
  mongo_error?: string
}

export interface Overview {
  total_raw: number
  total_clean: number
  total_rejected: number
  total_sites: number
  active_containers: number
  countries: number
  countries_map: Record<string, { name: string; flag: string }>
}

export interface StatsResponse {
  overview: Overview
  scrapers: ScraperStats[]
  by_country: Record<string, ScraperStats[]>
}
