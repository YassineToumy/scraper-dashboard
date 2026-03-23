<script setup lang="ts">
import type { ScraperStats, StatsResponse } from '~/types'

const { getStats, action } = useApi()
const { data, refresh, pending, error } = await getStats()

// Auto-refresh every 30 seconds (client-only)
const autoRefresh = ref(true)
let interval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (autoRefresh.value) interval = setInterval(() => refresh(), 30_000)
})

watch(autoRefresh, (val) => {
  if (val) {
    interval = setInterval(() => refresh(), 30_000)
  } else {
    if (interval) { clearInterval(interval); interval = null }
  }
})

onUnmounted(() => { if (interval) clearInterval(interval) })

const lastRefreshed = ref(new Date())
watch(pending, (p) => { if (!p) lastRefreshed.value = new Date() })

const overview = computed(() => data.value?.overview)
const byCountry = computed(() => data.value?.by_country ?? {})

// Logs modal
const logsModal = ref<{ key: string; name: string } | null>(null)

function openLogs(key: string) {
  const s = data.value?.scrapers.find(x => x.key === key)
  if (s) logsModal.value = { key, name: s.name }
}

// Scraper action
const actionLoading = ref<string | null>(null)

async function handleAction(act: string, key: string) {
  actionLoading.value = `${key}-${act}`
  try {
    await action(key, act as any)
    await refresh()
  } catch (e: any) {
    alert(`Erreur : ${e?.data?.error ?? e?.message ?? 'Unknown error'}`)
  } finally {
    actionLoading.value = null
  }
}

// Summary chart data (raw vs clean per scraper)
const chartData = computed(() => {
  const scrapers = data.value?.scrapers ?? []
  return {
    labels: scrapers.map(s => s.name),
    raw:    scrapers.map(s => s.raw_count),
    clean:  scrapers.map(s => s.clean_count),
  }
})

function fmtTime(d: Date) {
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<template>
  <div class="min-h-screen bg-dark-900 text-gray-100">

    <!-- ── Header ── -->
    <header class="border-b border-gray-800 bg-dark-800/80 backdrop-blur sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🌍</span>
          <div>
            <h1 class="text-base font-bold text-white tracking-tight">Scraper Dashboard</h1>
            <p class="text-xs text-gray-500">Real Estate Data Pipeline</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
            <input type="checkbox" v-model="autoRefresh" class="accent-blue-500" />
            Auto-refresh
          </label>
          <span class="text-xs text-gray-600">
            Mis à jour {{ fmtTime(lastRefreshed) }}
          </span>
          <button
            @click="refresh()"
            :disabled="pending"
            class="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1.5 rounded-lg transition disabled:opacity-40"
          >
            <span :class="pending ? 'animate-spin inline-block' : ''">↻</span> Refresh
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8 space-y-10">

      <!-- ── Error ── -->
      <div v-if="error" class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
        ⚠ Impossible de contacter l'API : {{ error.message }}
      </div>

      <!-- ── Overview Stats ── -->
      <section v-if="overview">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            title="Annonces Brutes"
            :value="overview.total_raw"
            icon="📦"
            color="blue"
            sub="total collectées"
          />
          <StatCard
            title="Annonces Nettoyées"
            :value="overview.total_clean"
            icon="✅"
            color="green"
            sub="prêtes à l'utilisation"
          />
          <StatCard
            title="Annonces Rejetées"
            :value="overview.total_rejected"
            icon="🗑"
            color="red"
            sub="prix/ville invalides"
          />
          <StatCard
            title="Scrapers Actifs"
            :value="`${overview.active_containers} / ${overview.total_sites}`"
            icon="⚙️"
            color="yellow"
            sub="containers Docker"
          />
          <StatCard
            title="Pays Couverts"
            :value="overview.countries"
            icon="🌍"
            color="purple"
            sub="marchés immobiliers"
          />
        </div>
      </section>

      <!-- ── Bar Chart ── -->
      <section v-if="chartData.labels.length">
        <h2 class="text-sm font-semibold text-gray-300 mb-4">Vue d'ensemble — Annonces par site</h2>
        <div class="rounded-xl border border-gray-700/50 bg-dark-700 p-6">
          <div class="grid gap-3">
            <div
              v-for="(label, i) in chartData.labels"
              :key="label"
              class="flex items-center gap-3"
            >
              <span class="text-xs text-gray-400 w-28 flex-shrink-0 text-right">{{ label }}</span>
              <div class="flex-1 flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <div class="flex-1 bg-dark-600 rounded-full h-3 overflow-hidden">
                    <div
                      class="h-full bg-blue-500/70 rounded-full transition-all duration-700"
                      :style="{ width: `${Math.min(100, (chartData.raw[i] / Math.max(...chartData.raw)) * 100)}%` }"
                    />
                  </div>
                  <span class="text-xs text-blue-400 w-16 text-right">{{ chartData.raw[i].toLocaleString() }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex-1 bg-dark-600 rounded-full h-3 overflow-hidden">
                    <div
                      class="h-full bg-emerald-500/70 rounded-full transition-all duration-700"
                      :style="{ width: `${Math.min(100, (chartData.clean[i] / Math.max(...chartData.raw)) * 100)}%` }"
                    />
                  </div>
                  <span class="text-xs text-emerald-400 w-16 text-right">{{ chartData.clean[i].toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-4 mt-4 text-xs text-gray-500">
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-blue-500/70 inline-block"/>Brutes</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-500/70 inline-block"/>Nettoyées</span>
          </div>
        </div>
      </section>

      <!-- ── Scrapers by Country ── -->
      <section
        v-for="(scrapers, country) in byCountry"
        :key="country"
      >
        <!-- Country Header -->
        <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">{{ overview?.countries_map?.[country]?.flag ?? '🌐' }}</span>
          <div>
            <h2 class="text-base font-bold text-white">
              {{ overview?.countries_map?.[country]?.name ?? country }}
            </h2>
            <p class="text-xs text-gray-500">
              {{ scrapers.length }} site{{ scrapers.length > 1 ? 's' : '' }} •
              {{ scrapers.reduce((s, x) => s + x.clean_count, 0).toLocaleString() }} annonces nettoyées
            </p>
          </div>
          <div class="flex-1 h-px bg-gray-700/50 ml-4" />
        </div>

        <!-- Scraper Cards Grid -->
        <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          <ScraperCard
            v-for="scraper in scrapers"
            :key="scraper.key"
            :scraper="scraper"
            @action="handleAction"
            @logs="openLogs"
          />
        </div>
      </section>

    </main>

    <!-- ── Logs Modal ── -->
    <LogsModal
      v-if="logsModal"
      :scraper-key="logsModal.key"
      :scraper-name="logsModal.name"
      @close="logsModal = null"
    />

  </div>
</template>
