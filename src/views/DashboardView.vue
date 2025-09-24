<template>
  <div class="dashboard-view">
    <!-- This is the main dashboard content that was in App.vue -->
    <!-- We'll move the dashboard content here to keep App.vue clean -->
    
    <!-- Dashboard Grid -->
    <div class="dashboard-grid grid gap-6">
      <!-- Watchlist Section -->
      <div class="watchlist-section">
        <Watchlist @symbol-selected="selectSymbolForChart" />
      </div>

      <!-- Chart Section -->
      <div v-if="showChart" class="chart-section">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Price Chart</h2>
          <button 
            @click="showChart = false"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <PriceChart :symbol="selectedSymbol" />
      </div>

      <!-- Market Overview -->
      <div class="market-overview bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Market Overview</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="market-stat">
            <div class="text-sm text-gray-500 dark:text-gray-400">S&P 500</div>
            <div class="text-lg font-bold text-gray-900 dark:text-white">4,567.89</div>
            <div class="text-sm text-green-500">+1.23%</div>
          </div>
          <div class="market-stat">
            <div class="text-sm text-gray-500 dark:text-gray-400">NASDAQ</div>
            <div class="text-lg font-bold text-gray-900 dark:text-white">14,234.56</div>
            <div class="text-sm text-red-500">-0.45%</div>
          </div>
          <div class="market-stat">
            <div class="text-sm text-gray-500 dark:text-gray-400">BTC</div>
            <div class="text-lg font-bold text-gray-900 dark:text-white">$45,123</div>
            <div class="text-sm text-green-500">+2.34%</div>
          </div>
          <div class="market-stat">
            <div class="text-sm text-gray-500 dark:text-gray-400">ETH</div>
            <div class="text-lg font-bold text-gray-900 dark:text-white">$3,234</div>
            <div class="text-sm text-green-500">+1.87%</div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="quick-stats bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400">Active Connections</span>
            <div class="flex items-center space-x-2">
              <div 
                class="w-2 h-2 rounded-full"
                :class="connectionCount > 0 ? 'bg-green-500' : 'bg-red-500'"
              ></div>
              <span class="text-gray-900 dark:text-white font-medium">{{ connectionCount }} Active</span>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400">Watchlist Items</span>
            <span class="text-gray-900 dark:text-white font-medium">{{ watchlistCount }} Symbols</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400">Last Update</span>
            <span class="text-gray-900 dark:text-white font-medium">{{ lastUpdateTime }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400">Update Interval</span>
            <span class="text-gray-900 dark:text-white font-medium">{{ settingsStore.updateInterval }}ms</span>
          </div>
        </div>
      </div>

      <!-- News & Alerts -->
      <div class="news-alerts bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Market News</h3>
        <div class="space-y-3">
          <div class="news-item border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 class="font-medium text-gray-900 dark:text-white text-sm">Bitcoin Reaches New Monthly High</h4>
            <p class="text-gray-600 dark:text-gray-400 text-xs mt-1">Cryptocurrency market shows strong momentum...</p>
            <span class="text-gray-500 dark:text-gray-500 text-xs">2 hours ago</span>
          </div>
          <div class="news-item border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 class="font-medium text-gray-900 dark:text-white text-sm">Tech Stocks Rally Continues</h4>
            <p class="text-gray-600 dark:text-gray-400 text-xs mt-1">Major technology companies see gains...</p>
            <span class="text-gray-500 dark:text-gray-500 text-xs">4 hours ago</span>
          </div>
          <div class="news-item">
            <h4 class="font-medium text-gray-900 dark:text-white text-sm">Federal Reserve Meeting</h4>
            <p class="text-gray-600 dark:text-gray-400 text-xs mt-1">Upcoming monetary policy decisions...</p>
            <span class="text-gray-500 dark:text-gray-500 text-xs">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { usePriceStore } from '@/stores/priceStore'
import { useWatchlistStore } from '@/stores/watchlistStore'
import Watchlist from '@/components/Watchlist.vue'
import PriceChart from '@/components/charts/PriceChart.vue'

const settingsStore = useSettingsStore()
const priceStore = usePriceStore()
const watchlistStore = useWatchlistStore()

const selectedSymbol = ref('BINANCE:BTCUSDT')
const showChart = ref(true)
const lastUpdate = ref(Date.now())

const selectSymbolForChart = (symbol) => {
  selectedSymbol.value = symbol
  showChart.value = true
}

const connectionCount = computed(() => {
  let count = 0
  if (priceStore.connectionStatus.finnhub) count++
  if (priceStore.connectionStatus.binance) count++
  return count
})

const watchlistCount = computed(() => watchlistStore.symbols.length)

const lastUpdateTime = computed(() => {
  const diff = Date.now() - lastUpdate.value
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
})

let updateInterval = null

onMounted(() => {
  // Update last update time every second
  updateInterval = setInterval(() => {
    lastUpdate.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.dashboard-grid {
  grid-template-columns: 1fr;
  grid-template-areas: 
    "watchlist"
    "chart"
    "market"
    "stats"
    "news";
}

.watchlist-section {
  grid-area: watchlist;
}

.chart-section {
  grid-area: chart;
}

.market-overview {
  grid-area: market;
}

.quick-stats {
  grid-area: stats;
}

.news-alerts {
  grid-area: news;
}

@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 2fr 1fr;
    grid-template-areas: 
      "watchlist stats"
      "chart stats"
      "market news";
  }
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 2fr 1fr 1fr;
    grid-template-areas: 
      "watchlist watchlist stats"
      "chart market news";
  }
}

@media (min-width: 1280px) {
  .dashboard-grid {
    grid-template-columns: 3fr 1fr 1fr;
    grid-template-areas: 
      "watchlist stats news"
      "chart market market";
  }
}

.market-stat {
  text-align: center;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: rgba(0, 0, 0, 0.02);
}

.dark .market-stat {
  background-color: rgba(255, 255, 255, 0.02);
}

.news-item:last-child {
  border-bottom: none !important;
  padding-bottom: 0;
}
</style>
