<template>
  <div class="price-widget p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800 transition-colors duration-300">
    <div class="flex justify-between items-center">
        <div class="symbol text-lg font-bold text-gray-900 dark:text-white">{{ symbol }}</div>
        <button @click="$emit('remove', symbol)" class="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
    <div class="price text-3xl font-bold my-2" :class="priceClass">
      ${{ formatPrice(currentPrice) }}
    </div>
    <div class="change text-lg" :class="priceClass">
      {{ formatChange(priceChange) }}%
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePriceStore } from '@/stores/priceStore'

const props = defineProps({
    symbol: {
        type: String,
        required: true
    }
})

defineEmits(['remove'])

const priceStore = usePriceStore()

const currentPrice = computed(() => priceStore.getPrice(props.symbol))
const priceChange = computed(() => priceStore.getChange(props.symbol))

const priceClass = computed(() => {
    const value = priceChange.value;
    if (value > 0) return 'text-green-500'
    if (value < 0) return 'text-red-500'
    return 'text-gray-500 dark:text-gray-400'
})

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0.00'
  if (price < 1) return price.toFixed(4);
  return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

const formatChange = (change) => {
  if (typeof change !== 'number') return '0.00'
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}`
}
</script>
