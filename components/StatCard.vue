<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  icon: string
  sub?: string
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'gray'
}>()

const colors = {
  blue:   'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
  green:  'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
  purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
  yellow: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/30 text-yellow-400',
  red:    'from-red-500/20 to-red-600/5 border-red-500/30 text-red-400',
  gray:   'from-gray-500/20 to-gray-600/5 border-gray-500/30 text-gray-400',
}
</script>

<template>
  <div
    class="rounded-xl border bg-gradient-to-br p-4 transition-all hover:scale-[1.02]"
    :class="colors[color ?? 'gray']"
  >
    <div class="flex items-start justify-between">
      <div>
        <p class="text-xs text-gray-400 font-medium mb-1">{{ title }}</p>
        <p class="text-2xl font-bold text-white">{{ value.toLocaleString() }}</p>
        <p v-if="sub" class="text-xs mt-1 opacity-70">{{ sub }}</p>
      </div>
      <span class="text-2xl">{{ icon }}</span>
    </div>
  </div>
</template>
