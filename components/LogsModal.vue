<script setup lang="ts">
const props = defineProps<{
  scraperKey: string
  scraperName: string
}>()

const emit  = defineEmits<{ close: [] }>()
const { getLogs } = useApi()

const logs    = ref('')
const loading = ref(true)
const error   = ref('')

async function load() {
  loading.value = true
  error.value   = ''
  try {
    const res = await getLogs(props.scraperKey)
    logs.value = res.logs
  } catch (e: any) {
    error.value = e?.message ?? 'Erreur lors du chargement des logs.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

// Close on Escape
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') emit('close') }
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

const logLines = computed(() =>
  logs.value.split('\n').filter(Boolean).reverse()
)
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-4xl mx-4 rounded-xl border border-gray-700 bg-dark-800 flex flex-col max-h-[85vh]">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <h2 class="font-semibold text-white">
            📋 Logs — <span class="text-gray-400">{{ scraperName }}</span>
          </h2>
          <div class="flex items-center gap-2">
            <button @click="load" class="text-xs px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition">
              ↻ Refresh
            </button>
            <button @click="emit('close')" class="text-gray-500 hover:text-white transition text-lg leading-none">✕</button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4 font-mono text-xs">
          <div v-if="loading" class="text-gray-500 text-center py-8">Chargement...</div>
          <div v-else-if="error" class="text-red-400">{{ error }}</div>
          <div v-else class="space-y-0.5">
            <div
              v-for="(line, i) in logLines"
              :key="i"
              class="py-0.5 px-2 rounded hover:bg-dark-600 transition-colors"
              :class="{
                'text-red-400':    line.includes('ERROR') || line.includes('❌') || line.includes('failed'),
                'text-yellow-400': line.includes('WARN') || line.includes('⚠'),
                'text-emerald-400':line.includes('✅') || line.includes('done') || line.includes('inserted'),
                'text-blue-400':   line.includes('💾') || line.includes('Starting') || line.includes('🚀'),
                'text-gray-300':   true,
              }"
            >
              {{ line }}
            </div>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>
