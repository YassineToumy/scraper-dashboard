<script setup lang="ts">
import type { ScraperStats } from '~/types'

const props = defineProps<{
  scraper: ScraperStats
}>()

const emit = defineEmits<{
  action: [act: string, key: string]
  logs:   [key: string]
}>()

const loading = ref<string | null>(null)

async function doAction(act: string) {
  loading.value = act
  try {
    emit('action', act, props.scraper.key)
    await new Promise(r => setTimeout(r, 1500))
  } finally {
    loading.value = null
  }
}

// Status badge
const statusConfig = computed(() => {
  const s = props.scraper.container.status
  if (s === 'running')   return { label: 'Running',   cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
  if (s === 'exited')    return { label: 'Stopped',   cls: 'bg-red-500/20 text-red-400 border-red-500/30' }
  if (s === 'paused')    return { label: 'Paused',    cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
  if (s === 'not_found') return { label: 'Not Found', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
  return { label: s, cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
})

const typeBadge = computed(() => ({
  api:       'bg-blue-500/20 text-blue-300',
  html:      'bg-orange-500/20 text-orange-300',
  playwright:'bg-purple-500/20 text-purple-300',
}[props.scraper.type] ?? 'bg-gray-500/20 text-gray-300'))

const cleanRatio = computed(() => props.scraper.clean_ratio ?? 0)

const topTypes = computed(() =>
  (props.scraper.property_types ?? []).slice(0, 4)
)

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function fmtPrice(val: number | undefined, currency: string): string {
  if (!val) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val)
}
</script>

<template>
  <div class="rounded-xl border border-gray-700/50 bg-dark-700 p-5 flex flex-col gap-4 hover:border-gray-600 transition-colors">

    <!-- Header -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <span class="text-2xl">{{ scraper.flag }}</span>
        <div>
          <h3 class="font-semibold text-white text-sm">{{ scraper.name }}</h3>
          <a :href="`https://${scraper.site}`" target="_blank"
             class="text-xs text-gray-500 hover:text-blue-400 transition-colors">
            {{ scraper.site }} ↗
          </a>
        </div>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <span class="text-xs px-2 py-0.5 rounded-full border" :class="statusConfig.cls">
          {{ statusConfig.label }}
        </span>
        <span class="text-xs px-2 py-0.5 rounded-full" :class="typeBadge">
          {{ scraper.type }}
        </span>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-dark-600 rounded-lg p-3 text-center">
        <p class="text-xs text-gray-500 mb-1">Brutes</p>
        <p class="text-lg font-bold text-white">{{ scraper.raw_count.toLocaleString() }}</p>
      </div>
      <div class="bg-dark-600 rounded-lg p-3 text-center">
        <p class="text-xs text-gray-500 mb-1">Nettoyées</p>
        <p class="text-lg font-bold text-emerald-400">{{ scraper.clean_count.toLocaleString() }}</p>
      </div>
      <div class="bg-dark-600 rounded-lg p-3 text-center">
        <p class="text-xs text-gray-500 mb-1">Rejetées</p>
        <p class="text-lg font-bold text-red-400">{{ scraper.rejected_count.toLocaleString() }}</p>
      </div>
    </div>

    <!-- Clean Ratio Bar -->
    <div>
      <div class="flex justify-between text-xs text-gray-500 mb-1">
        <span>Taux de nettoyage</span>
        <span class="font-medium" :class="cleanRatio >= 90 ? 'text-emerald-400' : cleanRatio >= 70 ? 'text-yellow-400' : 'text-red-400'">
          {{ cleanRatio }}%
        </span>
      </div>
      <div class="h-1.5 bg-dark-600 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-700"
          :class="cleanRatio >= 90 ? 'bg-emerald-500' : cleanRatio >= 70 ? 'bg-yellow-500' : 'bg-red-500'"
          :style="{ width: `${cleanRatio}%` }"
        />
      </div>
    </div>

    <!-- Price stats -->
    <div v-if="scraper.price_stats" class="grid grid-cols-3 gap-2 text-xs">
      <div class="bg-dark-600 rounded p-2 text-center">
        <p class="text-gray-500">Min</p>
        <p class="text-gray-300 font-medium">{{ fmtPrice(scraper.price_stats.min, scraper.currency) }}</p>
      </div>
      <div class="bg-blue-500/10 rounded p-2 text-center border border-blue-500/20">
        <p class="text-gray-500">Moy.</p>
        <p class="text-blue-300 font-semibold">{{ fmtPrice(scraper.price_stats.avg, scraper.currency) }}</p>
      </div>
      <div class="bg-dark-600 rounded p-2 text-center">
        <p class="text-gray-500">Max</p>
        <p class="text-gray-300 font-medium">{{ fmtPrice(scraper.price_stats.max, scraper.currency) }}</p>
      </div>
    </div>

    <!-- Property types -->
    <div v-if="topTypes.length">
      <p class="text-xs text-gray-500 mb-2">Types de propriété</p>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="pt in topTypes" :key="pt.label"
          class="text-xs bg-dark-600 border border-gray-700/50 rounded-full px-2.5 py-0.5"
        >
          {{ pt.label ?? '—' }}
          <span class="text-gray-400 ml-1">{{ pt.count.toLocaleString() }}</span>
        </span>
      </div>
    </div>

    <!-- Timestamps -->
    <div class="text-xs text-gray-600 space-y-0.5">
      <p>Dernier scraping : <span class="text-gray-400">{{ fmtDate(scraper.last_scraped_at) }}</span></p>
      <p>Dernier nettoyage : <span class="text-gray-400">{{ fmtDate(scraper.last_cleaned_at) }}</span></p>
    </div>

    <!-- MongoDB error -->
    <div v-if="scraper.mongo_error" class="text-xs text-red-400 bg-red-500/10 rounded p-2 border border-red-500/20">
      ⚠ {{ scraper.mongo_error }}
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-2 pt-1 border-t border-gray-700/50">
      <button
        v-if="scraper.container.status !== 'running'"
        @click="doAction('start')"
        :disabled="loading !== null"
        class="flex-1 text-xs py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition disabled:opacity-40"
      >
        {{ loading === 'start' ? '...' : '▶ Start' }}
      </button>

      <button
        v-if="scraper.container.status === 'running'"
        @click="doAction('stop')"
        :disabled="loading !== null"
        class="flex-1 text-xs py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition disabled:opacity-40"
      >
        {{ loading === 'stop' ? '...' : '⏹ Stop' }}
      </button>

      <button
        @click="doAction('restart')"
        :disabled="loading !== null"
        class="flex-1 text-xs py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 transition disabled:opacity-40"
      >
        {{ loading === 'restart' ? '...' : '↺ Restart' }}
      </button>

      <button
        @click="emit('logs', scraper.key)"
        class="px-3 text-xs py-1.5 rounded-lg bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 border border-gray-700/50 transition"
      >
        📋
      </button>
    </div>

  </div>
</template>
