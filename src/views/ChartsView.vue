<template>
  <div class="charts-view">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Charts</h1>
      <p class="text-gray-600 dark:text-gray-400">Advanced price charts and technical analysis</p>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Symbol Selector -->
      <div class="lg:col-span-1">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Select Symbol</h3>
          <div class="space-y-3">
            <button 
              v-for="symbol in watchlistStore.symbols" 
              :key="symbol"
              @click="selectedSymbol = symbol"
              class="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              :class="selectedSymbol === symbol ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600' : ''"
            >
              <div class="font-medium text-gray-900 dark:text-white">{{ symbol }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                ${{ formatPrice(priceStore.getPrice(symbol)) }}
                <span :class="priceStore.getChange(symbol) >= 0 ? 'text-green-500' : 'text-red-500'">
                  {{ priceStore.getChange(symbol) >= 0 ? '+' : '' }}{{ priceStore.getChange(symbol).toFixed(2) }}%
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Chart Display -->
      <div class="lg:col-span-2">
        <PriceChart :symbol="selectedSymbol" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWatchlistStore } from '@/stores/watchlistStore'
import { usePriceStore } from '@/stores/priceStore'
import PriceChart from '@/components/charts/PriceChart.vue'

const watchlistStore = useWatchlistStore()
const priceStore = usePriceStore()

const selectedSymbol = ref(watchlistStore.symbols[0] || 'BINANCE:BTCUSDT')

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0.00'
  if (price < 1) return price.toFixed(4)
  return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}
</script>
